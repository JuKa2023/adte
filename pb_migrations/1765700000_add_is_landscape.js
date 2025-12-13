/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("postcards")
    if (!collection) return

    const existing = collection.fields.getByName("is_landscape")
    if (!existing) {
      collection.fields.add(new Field({
        "id": "bool_is_landscape",
        "name": "is_landscape",
        "type": "bool",
        "required": false,
        "presentable": false,
        "system": false,
        "hidden": false
      }))
    }

    return app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("postcards")
    if (!collection) return

    const field = collection.fields.getByName("is_landscape")
    if (field) {
      collection.fields.removeById(field.id)
    }

    return app.save(collection)
  }
)

