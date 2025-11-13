<template>
    <div class="">
      <div
        class=" "
      >
        <article class="px-6 pt-6 pb-3">
          <h1 class="text-lg font-semibold text-gray-900 truncate">
            Postkarte erstellen
            <span v-if="isFront"> Vorderseite</span>
            <span v-else> Rückseite</span>
          </h1>
  
          <button
            type="button"
            class="mt-3 text-sm text-pink-600 flex items-center gap-1 hover:underline"
          >
            <span class="text-lg leading-none">&gt;</span>
            <span>Startseite</span>
          </button>
        </article>
  
        <main class="flex-1 overflow-y-auto px-6 pb-6">
          <p class="text-sm text-gray-800 leading-snug mb-4">
            Füge passende Elemente zu deiner Postkarte hinzu und platziere diese.
          </p>
  
          <div v-if="isFront" class="mb-4">
            <button
              type="button"
              class="px-4 py-1 text-xs rounded-full border border-pink-500 text-pink-600 font-medium bg-white shadow-sm"
            >
              Hochformat
            </button>
          </div>
  
          <section
            class="mb-5 bg-gray-200 rounded-md flex items-center justify-center relative w-full h-48"
          >
            <div class="text-center text-sm text-gray-500 px-4">
              <template v-if="isFront">
                <p>Füge eine Mediendatei hinzu</p>
              </template>
  
              <template v-else>
                <div class="space-y-2">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-[2px] bg-gray-400 w-40 mx-auto"
                  ></div>
                  <p class="mt-2 text-xs text-gray-600">
                    Füge eine Adresse oder Nachricht hinzu.
                  </p>
                </div>
              </template>
            </div>
  
            <button
              v-if="!isFront"
              type="button"
              class="absolute left-2 bottom-2 flex items-center gap-1 text-[11px] text-gray-700 border border-gray-400 rounded-full px-2 py-1 bg-white/90"
            >
              <span class="material-icons text-xs">audiotrack</span>
              <span>Füge eine Audiodatei hinzu</span>
            </button>
          </section>
  
          <section class="grid grid-cols-3 gap-3 mb-5">
            <EditorActionButton
              icon="edit"
              label="Text hinzufügen"
              @click="onAddText"
            />
            <EditorActionButton
              icon="font_download"
              label="Schriftart ändern"
              @click="onChangeFont"
            />
            <EditorActionButton
              icon="emoji_emotions"
              label="Sticker hinzufügen"
              @click="onAddSticker"
            />
          </section>
  
          <section class="flex justify-between mb-10">
            <Button
              type="button"
              class=""
              @click="onOpenMoodTemplates"
            >
              Mood Vorlagen
            </Button>
            <Button
              type="button"
              class=""
              @click="onMorePhotos"
            >
              Weitere Fotos
            </Button>
          </section>
        </main>
  
        <footer class="px-6 pb-6 flex justify-between">
          <Button
            type="button"
            class=" "
            @click="toggleSide"
          >
            <span v-if="isFront">Rückseite</span>
            <span v-else>Vorderseite</span>
        </Button>
  
          <Button
            type="button"
            variant="primary"
            class=" "
            @click="onFinish"
          >
            Fertig
        </Button>
        </footer>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import Button from "./components/Button.vue"
  import EditorActionButton from "./components/IconButton.vue";

  const isFront = ref(true);
  
  const toggleSide = () => {
    isFront.value = !isFront.value;
  };
  
  const onAddText = () => {
    console.log("Add text");
  };
  const onChangeFont = () => {
    console.log("Change font");
  };
  const onAddSticker = () => {
    console.log("Add sticker");
  };
  const onOpenMoodTemplates = () => {
    console.log("Open mood templates");
  };
  const onMorePhotos = () => {
    console.log("More photos");
  };
  const onFinish = () => {
    console.log("Finish postcard");
  };
  </script>