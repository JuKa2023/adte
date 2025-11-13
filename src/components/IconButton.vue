<template>
    <button
      type="button"
      class="flex flex-col items-center justify-center border border-pink-500 rounded-md py-3 bg-white shadow-sm hover:bg-pink-50 transition"
    >
      <span class="material-icons mb-1 text-base">
        {{ icon }}
      </span>
      <span class="text-[11px] text-gray-800 text-center leading-tight">
        {{ label }}
      </span>
    </button>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    icon: string;
    label: string;
  }>();
  </script>