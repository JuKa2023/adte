/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("postcards")
    if (!collection) return

    const existing = collection.fields.getByName("recipient_email")
    if (!existing) {
      collection.fields.add(new Field({
        "id": "text_recipient_email",
        "name": "recipient_email",
        "type": "text",
        "required": false,
        "presentable": false,
        "system": false,
        "hidden": false,
        "primaryKey": false,
        "unique": false,
        "options": {
          "max": 0,
          "min": 0,
          "pattern": ""
        }
      }))
    }

    return app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("postcards")
    if (!collection) return

    const field = collection.fields.getByName("recipient_email")
    if (field) {
      collection.fields.removeById(field.id)
    }
    return app.save(collection)
  }
)
