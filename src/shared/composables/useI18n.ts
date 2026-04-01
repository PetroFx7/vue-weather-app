import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import en from '@/locales/en'
import uk from '@/locales/uk'

const locales = { en, uk }

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}

export function useI18n() {
  const appStore = useAppStore()

  const t = (key: string, params?: Record<string, string>): string => {
    const messages = locales[appStore.locale] ?? locales.en
    let value = getNestedValue(messages as unknown as Record<string, unknown>, key)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v)
      })
    }
    return value
  }

  const locale = computed(() => appStore.locale)

  return { t, locale }
}
