/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // remove field
  collection.fields.removeById("text2928148801")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2928148801",
    "max": 0,
    "min": 0,
    "name": "signature",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
