/// <reference path="../pb_data/types.d.ts" />

// Runs every minute to send scheduled postcards.
cronAdd("sendScheduledPostcards", "*/1 * * * *", async () => {
  const appUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173"
  const collection = "postcards"
  const nowIso = new Date().toISOString()

  $app.logger().debug("Cron sendScheduledPostcards tick", "now", nowIso)

  const scheduled = await $app.findRecordsByFilter(
    collection,
    'sent = false && scheduled_time != null && scheduled_time <= {:now}',
    null,
    50,
    0,
    { now: nowIso },
  )

  if (!scheduled?.length) {
    $app.logger().info("No scheduled postcards to send", "now", nowIso)
    return
  }

  const mailer = $app.newMailClient()

  $app.logger().info("Scheduled postcards found", "count", scheduled.length)

  for (const record of scheduled) {
    try {
      const toAddress = record.get("recipient_email")
      const userId = record.get("user")
      if (!toAddress || !userId) {
        $app.logger().debug("Skipping postcard (missing recipient/user)", "postcardId", record.id)
        continue
      }

      const user = await $app.findRecordById("_pb_users_auth_", userId)

      const shareToken = record.get("share_token")
      const shareLink = shareToken
        ? `${appUrl}/share/${record.get("id")}?token=${shareToken}`
        : appUrl
      $app.logger().debug("Sending postcard email", "postcardId", record.id)

      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name: $app.settings().meta.senderName,
        },
        to: [{ address: toAddress }],
        subject: "Eine Postkarte wartet auf dich",
        html: `
          <p>Hallo,</p>
          <p>Du hast eine Postkarte erhalten. Du kannst sie hier ansehen:</p>
          <p><a href="${shareLink}">${shareLink}</a></p>
          <p>Viel Spass!<br/>PostcardCreator</p>
        `,
      })

      await mailer.send(message)

      record.set("sent", true)
      await $app.save(record)

      $app.logger().info("Postcard marked as sent", "postcardId", record.id)
    } catch (err) {
      $app.logger().debug(
        "Failed to send scheduled postcard",
        "postcardId",
        record.id,
        "error",
        err?.message || err,
      )
    }
  }
})
