import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const locale = ref<'en' | 'uk'>('en')
  const isDark = ref(false)
  const activeTab = ref<'weather' | 'favorites'>('weather')

  function init() {
    const savedLocale = localStorage.getItem('app:locale') as 'en' | 'uk' | null
    if (savedLocale && ['en', 'uk'].includes(savedLocale)) locale.value = savedLocale

    const savedDark = localStorage.getItem('app:dark')
    if (savedDark !== null) isDark.value = savedDark === 'true'

    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  function setLocale(lang: 'en' | 'uk') {
    locale.value = lang
    localStorage.setItem('app:locale', lang)
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('app:dark', String(isDark.value))
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  function setTab(tab: 'weather' | 'favorites') {
    activeTab.value = tab
  }

  return { locale, isDark, activeTab, init, setLocale, toggleTheme, setTab }
})
