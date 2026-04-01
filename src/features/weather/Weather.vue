<script setup lang="ts">
import { onMounted } from 'vue'
import WeatherBlock from './components/WeatherBlock.vue'
import VButton from '@/shared/components/VButton.vue'
import { useWeatherBlocksStore } from '@/stores/weatherBlocksStore'
import { useI18n } from '@/shared/composables/useI18n'
import { getLocationByIP } from '@/api/weatherApi'

const { t } = useI18n()
const blocksStore = useWeatherBlocksStore()

onMounted(async () => {
  const firstBlock = blocksStore.blocks[0]
  if (firstBlock && !firstBlock.city) {
    const loc = await getLocationByIP()
    if (loc) {
      blocksStore.setCity(firstBlock.id, {
        name: loc.city,
        lat: loc.lat,
        lon: loc.lon,
        country: loc.country,
      })
    }
  }
})
</script>

<template>
  <main class="home">
    <div class="container">
      <div class="grid">
        <WeatherBlock
          v-for="block in blocksStore.blocks"
          :key="block.id"
          :blockId="block.id"
          mode="home"
        />
      </div>

      <div class="add-row">
        <VButton
          v-if="blocksStore.canAddBlock"
          variant="secondary"
          @click="blocksStore.addBlock()"
        >{{ t('buttons.addBlock') }}</VButton>
        <p v-else class="max-note">{{ t('maxBlocks') }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home {
  padding: 24px 16px;
  min-height: calc(100vh - 58px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.add-row {
  display: flex;
  justify-content: center;
}

.max-note {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 360px) {
  .home { padding: 16px 8px; }
}
</style>
