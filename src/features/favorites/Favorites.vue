<script setup lang="ts">
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useI18n } from '@/shared/composables/useI18n'
import WeatherBlock from '@/features/weather/components/WeatherBlock.vue'

const favStore = useFavoritesStore()
const { t } = useI18n()
</script>

<template>
  <main class="favorites">
    <div class="container">
      <div v-if="!favStore.favorites.length" class="empty">
        <svg viewBox="0 0 24 24" width="52" height="52" stroke="currentColor" fill="none" stroke-width="1.2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p>{{ t('favorites.empty') }}</p>
      </div>

      <div v-else class="grid">
        <WeatherBlock
          v-for="city in favStore.favorites"
          :key="`${city.lat},${city.lon}`"
          :fixedCity="city"
          mode="favorite"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.favorites {
  padding: 24px 16px;
  min-height: calc(100vh - 58px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 100px 20px;
  color: var(--text-secondary);
  text-align: center;
}

.empty p {
  font-size: 15px;
  max-width: 320px;
  line-height: 1.6;
}

@media (max-width: 360px) {
  .favorites {
    padding: 16px 8px;
  }
}
</style>
