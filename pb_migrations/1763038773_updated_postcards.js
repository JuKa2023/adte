/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // remove field
  collection.fields.removeById("url52587622")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4103711093")

  // add field
  collection.fields.addAt(5, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url52587622",
    "name": "link_token_link",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
})
