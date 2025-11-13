<!-- FormInput.vue -->
<template>
  <div>
    <label v-if="label" :for="id" class="block">
      <span v-if="label" class="mb-1 block text-sm font-medium font-[var(--font-sans)] text-[var(--color-font)]">
        {{ label }} <span v-if="required" class="text-[var(--color-highlight)]">*</span>
      </span>
    </label>

    <div class="relative">
      <input
        v-bind="$attrs"
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="w-full h-11 rounded-full bg-[var(--color-dropin-field)] border-[1.5px] border-[var(--color-highlight)] border-solid font-[var(--font-sans) text-[var(--color-font)] placeholder:text-[var(--color-font)]/50 focus:border-[var(--color-highlight)] focus:ring-2 focus:ring-[var(--color-highlight)]/40 outline-none px-3 pr-10 transition-shadow"
      />

      <button
        v-if="showClear && modelValue"
        type="button"
        @click="$emit('update:modelValue', '')"
        class="absolute inset-y-0 right-2 my-auto h-7 px-2 rounded text-xs text-[var(--color-font)]/70 hover:text-[var(--color-font)]"
      >
        ✕
      </button>
    </div>

    <p v-if="hint" class="mt-1 text-xs text-gray-500">
      {{ hint }}
    </p>

    <p v-if="error" class="mt-1 text-xs text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  id: { type: String, required: false },
  label: { type: String, required: false },
  modelValue: { type: String, required: false },
  placeholder: { type: String, required: false },
  hint: { type: String, required: false },
  error: { type: String, required: false },
  required: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  showClear: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])
</script>
