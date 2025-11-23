/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("postcards")
    if (!collection) return

    const senderNameField = collection.fields.getByName("sender_name")
    const senderHandleField = collection.fields.getByName("sender_handle")

    if (senderNameField) collection.fields.removeById(senderNameField.id)
    if (senderHandleField) collection.fields.removeById(senderHandleField.id)

    return app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("postcards")
    if (!collection) return

    // Re-add with the original definitions in case of rollback.
    collection.fields.add(new Field({
      "id": "text_sender_name",
      "name": "sender_name",
      "type": "text",
      "required": false,
      "presentable": false,
      "system": false,
      "hidden": false,
      "primaryKey": false,
      "unique": false,
      "options": {}
    }))

    collection.fields.add(new Field({
      "id": "text_sender_handle",
      "name": "sender_handle",
      "type": "text",
      "required": false,
      "presentable": false,
      "system": false,
      "hidden": false,
      "primaryKey": false,
      "unique": false,
      "options": {}
    }))

    return app.save(collection)
  }
)
