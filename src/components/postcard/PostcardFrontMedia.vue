<template>
  <div class="absolute inset-0">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      class="w-full h-full object-cover"
      alt="Postkarten Vorderseite"
    />
    <div v-else class="absolute inset-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  imageUrl?: string | null
}>()
</script>
