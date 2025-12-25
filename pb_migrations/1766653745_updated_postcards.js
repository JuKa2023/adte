/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "file2164390294",
    "maxSelect": 0,
    "maxSize": 10485760,
    "mimeTypes": [],
    "name": "front_image",
    "presentable": false,
    "protected": false,
    "required": true,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file410859157",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "audio",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "file2164390294",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "front_image",
    "presentable": false,
    "protected": false,
    "required": true,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file410859157",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "audio",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
})
