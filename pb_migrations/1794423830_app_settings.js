/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const settings = app.settings()

  settings.meta.appName = "adte"
  settings.meta.senderName = "adte"
  if (process.env.PUBLIC_APP_URL) {
    settings.meta.appURL = process.env.PUBLIC_APP_URL
  }
  settings.rateLimits.enabled = true

  return app.save(settings)
}, (app) => {
  const settings = app.settings()
  settings.rateLimits.enabled = false
  return app.save(settings)
})
