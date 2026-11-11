/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Behind a reverse proxy (e.g. Cloudflare), read the client IP from the given header
  // so realtime subscriptions (used by the OAuth2 popup) and rate limits see the real IP.
  const proxyHeader = process.env.TRUSTED_PROXY_HEADER
  if (proxyHeader) {
    const settings = app.settings()
    settings.trustedProxy.headers = [proxyHeader]
    settings.trustedProxy.useLeftmostIP = false
    app.save(settings)
  }

  // Login alert emails go through SMTP, which isn't available on every host.
  const users = app.findCollectionByNameOrId("users")
  users.authAlert.enabled = false
  return app.save(users)
}, (app) => {
  const settings = app.settings()
  settings.trustedProxy.headers = []
  app.save(settings)

  const users = app.findCollectionByNameOrId("users")
  users.authAlert.enabled = true
  return app.save(users)
})
