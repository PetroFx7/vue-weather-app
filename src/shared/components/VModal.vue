<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import VButton from './VButton.vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: [] }>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.addEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div :class="['modal', `modal--${size}`]" role="dialog" aria-modal="true">
          <div class="modal__header">
            <h3 v-if="title" class="modal__title">{{ title }}</h3>
            <VButton variant="icon" size="sm" title="Close" @click="close">✕</VButton>
          </div>
          <div class="modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.modal--sm { max-width: 380px; }
.modal--lg { max-width: 640px; }

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}

.modal__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal__body {
  padding: 20px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.modal__footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
