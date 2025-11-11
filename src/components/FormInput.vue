<!-- FormInput.vue -->
<template>
  <label class="block">
    <!-- Top label -->
    <span v-if="label" class="mb-1 block text-sm font-medium text-[--color-font]">
      {{ label }} <span v-if="required" class="text-[--color-highlight]">*</span>
    </span>

    <div class="relative" :class="disabled ? 'opacity-60 cursor-not-allowed' : ''">
      <!-- Input -->
      <input
        ref="inputEl"
        :id="id"
        :name="name"
        :type="nativeType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocompleteAttr"
        :inputmode="inputModeAttr"
        :spellcheck="spellcheckAttr"
        :aria-invalid="hasError || undefined"
        :aria-describedby="describedById"
        class="w-full h-11 rounded-lg bg-[--color-dropin-field]
              border-[1.5px] border-[--color-highlight] border-solid
              text-[--color-font] placeholder:text-[--color-font]/50
              focus:border-[--color-highlight]
              focus:ring-2 focus:ring-[--color-highlight]/40
              outline-none px-3 pr-10 transition-shadow"
        @input="onInput"
        @change="emit('change', $event)"
        @focus="emit('focus', $event)"
        @blur="onBlur"
      />

      <!-- Password show/hide -->
      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-2 my-auto h-7 px-2 rounded text-xs
               text-[--color-font]/70 hover:text-[--color-font]"
        :aria-pressed="showPassword ? 'true' : 'false'"
        @click="togglePassword"
        :disabled="disabled"
      >
        {{ showPassword ? 'Hide' : 'Show' }}
      </button>
    </div>

    <!-- Password strength (optional display) -->
    <div v-if="type === 'password' && modelValue" class="mt-1">
      <div class="h-1 w-full rounded bg-[--fi-border,#e5e7eb] overflow-hidden">
        <div
          class="h-full"
          :class="[
            strengthScore >= 3 ? 'bg-green-500' :
            strengthScore === 2 ? 'bg-yellow-500' : 'bg-red-500'
          ]"
          :style="{ width: (Math.min(4, strengthScore) / 4) * 100 + '%' }"
        ></div>
      </div>
      <p class="mt-1 text-xs text-[#111827]/70">
        {{ strengthLabel }}
      </p>
    </div>

    <!-- Helper / Error -->
    <p
      v-if="helperText || firstError"
      :id="describedById"
      class="mt-1 text-xs"
      :class="firstError ? 'text-red-600' : 'text-[#111827]/70'"
    >
      {{ firstError || helperText }}
    </p>
  </label>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Supported logical types:
 *  - 'name' (maps to text with proper autocomplete, inputmode, etc.)
 *  - 'email'
 *  - 'password'
 *  - 'text' (fallback)
 */
type LogicalType = 'name' | 'email' | 'password' | 'text'

const props = withDefaults(defineProps<{
  modelValue?: string
  type?: LogicalType
  id?: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  minLength?: number
  maxLength?: number
  helperText?: string
  /** show live validation on 'input' instead of 'blur' */
  validateOn?: 'blur' | 'input'
}>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  validateOn: 'blur',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'focus', ev: FocusEvent): void
  (e: 'blur', ev: FocusEvent): void
  (e: 'change', ev: Event): void
}>()

const inputEl = ref<HTMLInputElement | null>(null)

/** Native input type derived from logical type */
const nativeType = computed<'text' | 'email' | 'password'>(() => {
  if (props.type === 'email') return 'email'
  if (props.type === 'password') return 'password'
  return 'text'
})

/** Per-type accessibility & UX hints */
const autocompleteAttr = computed(() => {
  if (props.type === 'email') return 'email'
  if (props.type === 'password') return 'current-password'
  if (props.type === 'name') return 'name'
  return 'on'
})
const inputModeAttr = computed(() => {
  if (props.type === 'email') return 'email'
  return undefined
})
const spellcheckAttr = computed(() => {
  if (props.type === 'password') return false
  if (props.type === 'email') return false
  return true
})

/** Validation */
const touched = ref(false)

const errors = computed(() => {
  const value = props.modelValue ?? ''
  const out: string[] = []

  if (props.required && !value.trim()) {
    out.push('This field is required.')
    return out
  }

  if (props.minLength && value.length < props.minLength) {
    out.push(`Must be at least ${props.minLength} characters.`)
  }
  if (props.maxLength && value.length > props.maxLength) {
    out.push(`Must be at most ${props.maxLength} characters.`)
  }

  if (value) {
    if (props.type === 'email' && !isValidEmail(value)) {
      out.push('Enter a valid email address.')
    }
    if (props.type === 'name' && !isLikelyName(value)) {
      out.push('Use letters, spaces, apostrophes or hyphens.')
    }
    if (props.type === 'password') {
      const pwdErrs = passwordErrors(value)
      out.push(...pwdErrs)
    }
  }

  return out
})
const hasError = computed(() => touched.value && errors.value.length > 0)
const firstError = computed(() => (hasError.value ? errors.value[0] : ''))

/** Password strength (0–4) + label */
const strengthScore = computed(() => (props.type === 'password' ? passwordScore(props.modelValue) : 0))
const strengthLabel = computed(() => {
  if (props.type !== 'password' || !props.modelValue) return ''
  return ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'][Math.min(4, strengthScore.value)]
})

/** Toggle password visibility */
const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
function togglePassword() {
  if (!isPassword.value) return
  showPassword.value = !showPassword.value
  const el = inputEl.value
  if (el) el.type = showPassword.value ? 'text' : 'password'
}

/** Handlers */
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:modelValue', v)
  if (props.validateOn === 'input') touched.value = true
}
function onBlur(e: FocusEvent) {
  touched.value = true
  emit('blur', e)
}

/** Helper functions */
function isValidEmail(v: string): boolean {
  // simple practical pattern
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}
function isLikelyName(v: string): boolean {
  // letters (unicode), spaces, apostrophes, hyphens; at least 2 letters
  const ok = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u.test(v.trim())
  return ok && v.replace(/[^a-zA-Z]/g, '').length >= 2
}
function passwordErrors(v: string): string[] {
  const out: string[] = []
  if (v.length < 8) out.push('Use 8 or more characters.')
  if (!/[a-z]/.test(v)) out.push('Add a lowercase letter.')
  if (!/[A-Z]/.test(v)) out.push('Add an uppercase letter.')
  if (!/[0-9]/.test(v)) out.push('Add a number.')
  return out
}
function passwordScore(v: string): number {
  // 0..4 crude score
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v)) s++
  if (/[a-z]/.test(v)) s++
  if (/[0-9]/.test(v)) s++
  return s
}

/** For aria-describedby id when helper/error exists */
const describedById = computed(() => {
  const hasDesc = props.helperText || firstError.value
  if (!hasDesc) return undefined
  return (props.id || props.name || 'input') + '-desc'
})
</script>
