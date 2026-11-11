/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("postcards")

  // Owners manage their own postcards; everyone else needs the share token.
  collection.listRule = "user = @request.auth.id"
  collection.viewRule = "user = @request.auth.id || (share_token != '' && share_token = @request.query.token)"
  collection.createRule = "@request.auth.id != '' && @request.body.user = @request.auth.id"
  // Ownership and email delivery fields are fixed after creation, so sent cards can't be re-sent.
  collection.updateRule = "user = @request.auth.id && @request.body.user:changed = false && @request.body.recipient_email:changed = false && @request.body.scheduled_time:changed = false && @request.body.sent:changed = false"
  collection.deleteRule = "user = @request.auth.id"

  // Deleting an account removes its postcards.
  const userField = collection.fields.getByName("user")
  userField.cascadeDelete = true

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("postcards")

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = ""
  collection.updateRule = ""
  collection.deleteRule = ""
  collection.fields.getByName("user").cascadeDelete = false

  return app.save(collection)
})
