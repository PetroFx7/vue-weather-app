<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  type?: string
  autocomplete?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string]
  focus: []
  blur: []
  keydown: [event: KeyboardEvent]
}>()
</script>

<template>
  <div class="input-wrap" :class="{ 'input-wrap--error': error }">
    <label v-if="label" class="input__label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="base-input"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value),
        emit('input', ($event.target as HTMLInputElement).value)
      "
      @focus="emit('focus')"
      @blur="emit('blur')"
      @keydown="emit('keydown', $event)"
    />
    <span v-if="error" class="input__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.input__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.base-input {
  width: 100%;
  padding: 9px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  transition: var(--transition);
  outline: none;
  box-sizing: border-box;
}

.base-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.base-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
}

.base-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-wrap--error .base-input {
  border-color: var(--danger);
}

.input__error {
  font-size: 12px;
  color: var(--danger);
}
</style>
