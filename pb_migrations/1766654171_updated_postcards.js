/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "file1762179070",
    "maxSelect": 99,
    "maxSize": 10485760,
    "mimeTypes": [],
    "name": "element_images",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // remove field
  collection.fields.removeById("file1762179070")

  return app.save(collection)
})
