<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useWeatherBlocksStore } from '@/stores/weatherBlocksStore'
import type { CityData } from '@/stores/weatherBlocksStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useI18n } from '@/shared/composables/useI18n'
import { getCurrentWeather, getForecast } from '@/api/weatherApi'
import type { CurrentWeatherData, ForecastData } from '@/api/weatherApi'
import CitySearch from './CitySearch.vue'
import WeatherCard from './WeatherCard.vue'
import TemperatureChart from './TemperatureChart.vue'
import VModal from '@/shared/components/VModal.vue'
import VButton from '@/shared/components/VButton.vue'
import VPreloader from '@/shared/components/VPreloader.vue'

interface Props {
  blockId?: string
  fixedCity?: CityData | null
  mode?: 'home' | 'favorite'
}

const props = withDefaults(defineProps<Props>(), { fixedCity: null, mode: 'home' })

const { t, locale } = useI18n()
const blocksStore = useWeatherBlocksStore()
const favStore = useFavoritesStore()

const block = computed(() =>
  props.blockId ? blocksStore.blocks.find((b) => b.id === props.blockId) : null,
)
const city = computed<CityData | null>(() => props.fixedCity ?? block.value?.city ?? null)

const localPeriod = ref<'day' | 'week'>('day')
const localViewMode = ref<'day' | 'night'>('day')

const period = computed(() =>
  props.mode === 'favorite' ? localPeriod.value : (block.value?.period ?? 'day'),
)
const viewMode = computed(() =>
  props.mode === 'favorite' ? localViewMode.value : (block.value?.viewMode ?? 'day'),
)

const currentWeather = ref<CurrentWeatherData | null>(null)
const forecastData = ref<ForecastData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const showFavLimitModal = ref(false)

const isFavorite = computed(() => (city.value ? favStore.isFavorite(city.value) : false))
const forecastList = computed(() => forecastData.value?.list ?? [])

async function fetchWeather() {
  if (!city.value) return
  loading.value = true
  error.value = null
  try {
    const [cw, fc] = await Promise.all([
      getCurrentWeather(city.value.lat, city.value.lon, locale.value),
      getForecast(city.value.lat, city.value.lon, locale.value),
    ])
    currentWeather.value = cw
    forecastData.value = fc
  } catch {
    error.value = t('weather.error')
    currentWeather.value = null
    forecastData.value = null
  } finally {
    loading.value = false
  }
}

watch(city, (val) => { if (val) fetchWeather() })
watch(locale, () => { if (city.value) fetchWeather() })
onMounted(() => { if (city.value) fetchWeather() })

function setCity(c: CityData | null) {
  if (props.blockId) blocksStore.setCity(props.blockId, c)
}

function setPeriod(p: 'day' | 'week') {
  if (props.mode === 'favorite') localPeriod.value = p
  else if (props.blockId) blocksStore.setPeriod(props.blockId, p)
}

function setViewMode(m: 'day' | 'night') {
  if (props.mode === 'favorite') localViewMode.value = m
  else if (props.blockId) blocksStore.setViewMode(props.blockId, m)
}

function toggleFavorite() {
  if (!city.value) return
  if (isFavorite.value) {
    favStore.removeFavorite(city.value)
  } else {
    const ok = favStore.addFavorite(city.value)
    if (!ok) showFavLimitModal.value = true
  }
}

function confirmDelete() {
  if (props.blockId) blocksStore.removeBlock(props.blockId)
  showDeleteModal.value = false
}
</script>

<template>
  <div class="block" :class="[`block--${viewMode}`, `block--${mode}`]">
    <div class="block__top">
      <CitySearch
        v-if="mode === 'home'"
        :modelValue="city"
        class="block__search"
        @update:modelValue="setCity"
      />
      <div v-else class="block__city-label">
        <VueFeather type="map-pin" size="14"/>
        {{ city?.name }}, {{ city?.country }}
      </div>

      <div class="block__actions">
        <div class="tg">
          <button :class="['tg__btn', { 'tg__btn--on': period === 'day' }]" @click="setPeriod('day')">
            {{ t('period.day') }}
          </button>
          <button :class="['tg__btn', { 'tg__btn--on': period === 'week' }]" @click="setPeriod('week')">
            {{ t('period.week') }}
          </button>
        </div>
        <button
          v-if="city || mode === 'favorite'"
          :class="['icon-btn', { 'icon-btn--fav': isFavorite }]"
          :title="isFavorite ? t('favorites.remove') : t('favorites.add')"
          @click="toggleFavorite"
        >
          <VueFeather type="star" size="16"/>
        </button>

        <button
          v-if="mode === 'home'"
          class="icon-btn icon-btn--del"
          :title="t('buttons.delete')"
          @click="showDeleteModal = true"
        >
          <VueFeather type="trash-2" size="16"/>
        </button>
      </div>
    </div>

    <div v-if="mode === 'home' && city" class="block__loc">
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
      {{ city.name }}, {{ city.country }}
    </div>

    <VPreloader v-if="loading" :text="t('weather.loading')" />

    <div v-else-if="error" class="block__error">
      <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="!city" class="block__empty">
      <svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" fill="none" stroke-width="1.2">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
      </svg>
      <p>{{ t('weather.selectCity') }}</p>
    </div>

    <template v-else-if="currentWeather && !loading">
      <WeatherCard :weather="currentWeather" :forecast="forecastData" :period="period" />
      <TemperatureChart
        :forecastList="forecastList"
        :period="period"
        :viewMode="viewMode"
        :timezone="forecastData?.city.timezone ?? 0"
      />
    </template>

    <VModal v-model="showDeleteModal" :title="t('modal.deleteTitle')" size="sm">
      <p>{{ t('modal.deleteMessage') }}</p>
      <template #footer>
        <VButton variant="ghost" @click="showDeleteModal = false">{{ t('modal.cancel') }}</VButton>
        <VButton variant="danger" @click="confirmDelete">{{ t('modal.confirm') }}</VButton>
      </template>
    </VModal>

    <VModal v-model="showFavLimitModal" :title="t('favorites.limitTitle')" size="sm">
      <p>{{ t('favorites.limitMessage') }}</p>
      <ul class="fav-list">
        <li v-for="fav in favStore.favorites" :key="`${fav.lat},${fav.lon}`">
          {{ fav.name }}, {{ fav.country }}
        </li>
      </ul>
      <template #footer>
        <VButton variant="primary" @click="showFavLimitModal = false">OK</VButton>
      </template>
    </VModal>
  </div>
</template>

<style scoped>
.block {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px var(--shadow);
  flex: 1 1 320px;
  min-width: 280px;
  max-width: 420px;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
}

.block--night {
  border-color: rgba(124, 58, 237, 0.25);
  background: linear-gradient(160deg, var(--bg-card) 0%, rgba(124, 58, 237, 0.04) 100%);
}

.block__top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.block__search {
  flex: 1;
  min-width: 150px;
}

.block__city-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.block__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.block__loc {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: -6px;
}

.tg {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.tg__btn {
  padding: 4px 9px;
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;
  white-space: nowrap;
}

.tg__btn--icon {
  padding: 5px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tg__btn--on {
  background: var(--accent);
  color: #fff;
}

.tg__btn:not(.tg__btn--on):hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.icon-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.icon-btn--fav {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
}

.icon-btn--fav:hover {
  background: rgba(239, 68, 68, 0.08);
}

.icon-btn--del:hover {
  color: var(--danger);
  border-color: var(--danger);
  background: rgba(239, 68, 68, 0.08);
}

.block__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 0;
  color: var(--danger);
  font-size: 13px;
  text-align: center;
}

.block__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 0;
  color: var(--text-secondary);
  text-align: center;
}

.block__empty p {
  font-size: 13px;
  max-width: 200px;
}

.fav-list {
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.8;
}
</style>
