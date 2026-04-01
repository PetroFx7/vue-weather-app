<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  title?: string
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--loading': loading }]"
    :disabled="disabled || loading"
    :title="title"
    :type="type"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="btn__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: var(--transition);
  outline: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn:focus-visible {
  box-shadow: 0 0 0 2px var(--accent);
}

.btn--sm { padding: 4px 10px; font-size: 12px; }
.btn--md { padding: 8px 16px; font-size: 14px; }
.btn--lg { padding: 11px 24px; font-size: 15px; }

.btn--icon {
  padding: 6px;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1;
  width: 32px;
  height: 32px;
}
.btn--icon:hover:not(:disabled) {
  background: var(--border);
  color: var(--text-primary);
}

.btn--primary {
  background: var(--accent);
  color: #fff;
}
.btn--primary:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.35);
}

.btn--secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1.5px solid var(--border);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--border);
}

.btn--danger {
  background: var(--danger);
  color: #fff;
}
.btn--danger:hover:not(:disabled) {
  filter: brightness(0.9);
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--border);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
</style>
