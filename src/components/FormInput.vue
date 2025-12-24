<template>
  <div>
    <label v-if="label" :for="id" class="block">
      <span
        v-if="label"
        class="mb-1 block text-xs font-[var(--font-sans)] text-[var(--color-font)]"
      >
        {{ label }} <span v-if="required" class="text-[var(--color-highlight)]">*</span>
      </span>
    </label>

    <div class="relative">
      <input
        v-bind="$attrs"
        :id="id"
        :type="actualInputType"
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder"
        class="w-full h-11 rounded-full bg-[var(--color-dropin-field)] border-[1.5px] border-[var(--color-highlight)] border-solid font-[var(--font-sans)] text-[var(--color-font)] placeholder:text-[var(--color-font)]/50 focus:border-[var(--color-highlight)] focus:ring-2 focus:ring-[var(--color-highlight)]/40 outline-none px-3 pr-10 transition-shadow"
      />

      <button
        v-if="type === 'password'"
        type="button"
        @click="togglePasswordVisibility"
        class="absolute inset-y-0 right-2 my-auto h-7 px-2 rounded text-[var(--color-font)]/70 hover:text-[var(--color-font)] transition-colors"
        :aria-label="showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
      >
        <svg
          v-if="!showPassword"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      </button>

      <button
        v-else-if="showClear && modelValue"
        type="button"
        @click="$emit('update:modelValue', '')"
        class="absolute inset-y-0 right-2 my-auto h-7 px-2 rounded text-xs text-[var(--color-font)]/70 hover:text-[var(--color-font)]"
      >
        ✕
      </button>
    </div>

    <p v-if="error" class="mt-1 text-xs text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  id: { type: String, required: false },
  label: { type: String, required: false },
  modelValue: { type: String, required: false },
  placeholder: { type: String, required: false },

  error: { type: String, required: false },
  required: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  showClear: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

const actualInputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement | null)?.value ?? ''
  emit('update:modelValue', value)
}
</script>
