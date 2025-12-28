/// <reference path="../pb_data/types.d.ts" />

cronAdd("sendScheduledPostcards", "*/1 * * * *", async () => {
  const appUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173"
  const collection = "postcards"
  const nowIso = new Date().toISOString().replace('T', ' ')

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
      if (!toAddress) {
        $app.logger().debug("Skipping postcard (missing recipient email)", "postcardId", record.id)
        continue
      }

      let senderName = null
      let senderEmail = null
      if (userId) {
        try {
          const sender = await $app.findRecordById("users", userId)
          senderName = sender.get("name")
          senderEmail = sender.get("email")
        } catch (e) {
          $app.logger().debug("Could not fetch sender", "userId", userId)
        }
      }

      const senderDisplay = senderName || (senderEmail ? senderEmail.split('@')[0] : null)
      const hasKnownSender = !!senderDisplay

      const shareToken = record.get("share_token")
      const shareLink = shareToken
        ? `${appUrl}/share/${record.get("id")}?token=${shareToken}`
        : appUrl
      $app.logger().debug("Sending postcard email", "postcardId", record.id, "sender", senderDisplay)

      const subject = hasKnownSender
        ? `📬 ${senderDisplay} hat dir eine Postkarte geschickt!`
        : "📬 Eine Postkarte wartet auf dich!"

      const headline = hasKnownSender
        ? `${senderDisplay} hat dir eine Postkarte geschickt!`
        : "Du hast Post!"

      const description = hasKnownSender
        ? `<strong>${senderDisplay}</strong> hat sich die Zeit genommen, dir eine ganz besondere digitale Postkarte zu gestalten.`
        : "Jemand hat sich die Zeit genommen, dir eine ganz besondere digitale Postkarte zu gestalten."

      const footerNote = hasKnownSender
        ? `Du erhältst diese E-Mail, weil <strong>${senderDisplay}</strong>${senderEmail ? ` (${senderEmail})` : ''} dir eine Postkarte über adte geschickt hat.`
        : "Du erhältst diese E-Mail, weil dir jemand eine Postkarte geschickt hat."

      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name: hasKnownSender ? `${senderDisplay} via adte` : $app.settings().meta.senderName,
        },
        to: [{ address: toAddress }],
        subject: subject,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f7f7fb 0%, #eef1f8 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: #ffffff; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); overflow: hidden;">

          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <a href="${appUrl}" style="text-decoration: none;">
                <h1 style="margin: 0; font-family: 'Architects Daughter', cursive; font-size: 48px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  adte
                </h1>
              </a>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 1px;">
                DIGITALE POSTKARTEN MIT HERZ
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0; margin-top: -30px; position: relative;">
              <div style="background: #ffffff; width: 80px; height: 80px; border-radius: 20px; margin: -40px auto 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">💌</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <h2 style="margin: 0 0 15px; font-size: 26px; color: #0a0e15; font-weight: 600;">
                ${headline}
              </h2>
              <p style="margin: 0; font-size: 17px; color: #6b7280; line-height: 1.6;">
                ${description}
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px 40px 35px;">
              <a href="${shareLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); transition: transform 0.2s;">
                ✨ Postkarte ansehen
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent);"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 25px 40px 30px; text-align: center;">
              <p style="margin: 0 0 15px; font-size: 14px; color: #9ca3af;">
                Erstellt mit viel ❤️ auf
              </p>
              <a href="${appUrl}" style="text-decoration: none;">
                <img src="${appUrl}/adtepng.png" alt="adte" width="80" style="display: inline-block; border: none;">
              </a>
            </td>
          </tr>

        </table>

        <p style="margin: 30px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
          ${footerNote}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
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
