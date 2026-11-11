/// <reference path="../pb_data/types.d.ts" />

// Caps how many postcards a user can send by email per day to prevent abuse.
onRecordCreateRequest((e) => {
  const maxEmailsPerDay = 10

  if (!e.record.get("recipient_email") || e.hasSuperuserAuth()) {
    return e.next()
  }

  const userId = e.auth?.id
  if (!userId) {
    throw new UnauthorizedError("Anmeldung erforderlich.")
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().replace("T", " ")
  const sentToday = $app.countRecords(
    "postcards",
    $dbx.exp("user = {:user} AND recipient_email != '' AND created >= {:since}", {
      user: userId,
      since: since,
    }),
  )

  if (sentToday >= maxEmailsPerDay) {
    throw new TooManyRequestsError(
      `Du kannst maximal ${maxEmailsPerDay} Postkarten pro Tag per E-Mail versenden.`,
    )
  }

  return e.next()
}, "postcards")
