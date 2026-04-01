<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from '@/shared/composables/useI18n'
import { useAppStore } from '@/stores/appStore'
import VButton from '@/shared/components/VButton.vue'


const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__brand">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
        </svg>
        <span>WeatherApp</span>
      </div>

      <nav class="header__nav">
        <router-link to="/" class="nav-link" :class="{ 'nav-link--active': route.name === 'home' }">
          {{ t('tabs.weather') }}
        </router-link>
        <router-link
          to="/favorites"
          class="nav-link"
          :class="{ 'nav-link--active': route.name === 'favorite' }"
        >
          {{ t('tabs.favorites') }}
        </router-link>
      </nav>

      <div class="header__actions">
        <div class="toggle-group">
          <VButton
            :class="['toggle-btn', { 'toggle-btn--active': locale === 'en' }]"
            @click="appStore.setLocale('en')"
          >EN</VButton>
          <VButton
            :class="['toggle-btn', { 'toggle-btn--active': locale === 'uk' }]"
            @click="appStore.setLocale('uk')"
          >UK</VButton>
        </div>

        <button
          class="icon-btn"
          :title="appStore.isDark ? t('theme.light') : t('theme.dark')"
          @click="appStore.toggleTheme"
        >
          <VueFeather v-if="appStore.isDark" type="moon" size="18"/>
          <VueFeather v-else type="sun" size="18"/>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 8px var(--shadow);
}

.header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 58px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1rem;
  color: var(--accent);
  white-space: nowrap;
  text-decoration: none;
  flex-shrink: 0;
}

.header__nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition);
}

.nav-link:hover,
.nav-link--active {
  color: var(--accent);
  background: rgba(33, 150, 243, 0.1);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toggle-group {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.toggle-btn {
  padding: 5px 11px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;
}

.toggle-btn--active {
  background: var(--accent);
  color: #fff;
}

.toggle-btn:not(.toggle-btn--active):hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.icon-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .header__inner {
    padding: 0 12px;
    gap: 10px;
  }

  .header__brand span {
    display: none;
  }
}
</style>
