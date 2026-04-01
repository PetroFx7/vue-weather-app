import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useClickOutside(elementRef: Ref<HTMLElement | null>, callback: () => void) {
  function handleClick(event: MouseEvent) {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      callback()
    }
  }
  onMounted(() => document.addEventListener('mousedown', handleClick))
  onUnmounted(() => document.removeEventListener('mousedown', handleClick))
}
