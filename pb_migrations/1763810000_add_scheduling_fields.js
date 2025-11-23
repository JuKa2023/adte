/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("postcards")

  // add sent field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "bool_sent",
    "name": "sent",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add scheduled_time field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "date_scheduled_time",
    "max": "",
    "min": "",
    "name": "scheduled_time",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("postcards")

  // remove sent field
  collection.fields.removeById("bool_sent")

  // remove scheduled_time field
  collection.fields.removeById("date_scheduled_time")

  return app.save(collection)
})
