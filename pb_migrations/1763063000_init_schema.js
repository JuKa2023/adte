/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    // 1. Try to delete existing collection if it exists (to resolve name conflict)
    try {
        const existing = app.findCollectionByNameOrId("postcards");
        if (existing) {
            app.delete(existing);
        }
    } catch (e) {
        // Ignore error if collection doesn't exist
    }


    const collection = new Collection({
        name: "postcards",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        fields: [
            {
                name: "front_image",
                type: "file",
                required: true,
                options: {
                    maxSelect: 1,
                    maxSize: 5242880,
                    mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"],
                }
            },
            {
                name: "audio",
                type: "file",
                required: false,
                options: {
                    maxSelect: 1,
                    maxSize: 5242880,
                    mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg"],
                }
            },
            {
                name: "message",
                type: "text",
                required: false,
            },
            {
                name: "sender_name",
                type: "text",
                required: false,
            },
            {
                name: "sender_handle",
                type: "text",
                required: false,
            },
            {
                name: "elements",
                type: "json",
                required: false,
            },
            {
                name: "is_public",
                type: "bool",
                required: false,
            }
        ]
    });

    return app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("postcards");
        return app.delete(collection);
    } catch (e) {
        // already deleted
    }
})
