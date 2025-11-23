/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("postcards")

  // add share_token field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "text_share_token",
    "max": 0,
    "min": 0,
    "name": "share_token",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("postcards")

  // remove share_token field
  collection.fields.removeById("text_share_token")

  return app.save(collection)
})
