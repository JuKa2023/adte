/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3948562705")

  // update collection data
  unmarshal({
    "name": "postcard_images"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3948562705")

  // update collection data
  unmarshal({
    "name": "postcard_front_images"
  }, collection)

  return app.save(collection)
})
