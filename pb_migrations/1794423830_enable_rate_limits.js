/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const settings = app.settings()
  settings.rateLimits.enabled = true
  return app.save(settings)
}, (app) => {
  const settings = app.settings()
  settings.rateLimits.enabled = false
  return app.save(settings)
})
