<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchCities } from '@/api/weatherApi'
import type { GeoCity } from '@/api/weatherApi'
import type { CityData } from '@/stores/weatherBlocksStore'
import { useI18n } from '@/shared/composables/useI18n'
import { useClickOutside } from '@/shared/composables/useClickOutside'

interface Props {
  modelValue: CityData | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { disabled: false })
const emit = defineEmits<{ 'update:modelValue': [city: CityData | null] }>()

const { t } = useI18n()
const query = ref(props.modelValue ? `${props.modelValue.name}, ${props.modelValue.country}` : '')
const results = ref<GeoCity[]>([])
const isOpen = ref(false)
const searching = ref(false)
const wrapper = ref<HTMLElement | null>(null)

useClickOutside(wrapper, () => {
  isOpen.value = false
  if (props.modelValue && !results.value.length) {
    query.value = `${props.modelValue.name}, ${props.modelValue.country}`
  }
})

let debounceTimer: ReturnType<typeof setTimeout>

async function onInput() {
  const q = query.value.trim()
  clearTimeout(debounceTimer)
  if (!q) {
    results.value = []
    isOpen.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    searching.value = true
    try {
      results.value = await searchCities(q)
      isOpen.value = true
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

function selectCity(geo: GeoCity) {
  const city: CityData = { name: geo.name, lat: geo.lat, lon: geo.lon, country: geo.country }
  emit('update:modelValue', city)
  query.value = `${geo.name}, ${geo.country}`
  results.value = []
  isOpen.value = false
}

watch(
  () => props.modelValue,
  (val) => {
    query.value = val ? `${val.name}, ${val.country}` : ''
  },
)
</script>

<template>
  <div class="cs" ref="wrapper">
    <div class="cs__wrap">
      <VueFeather type="search" size="15" class="cs__icon"/>
      <input
        v-model="query"
        :placeholder="t('search.placeholder')"
        :disabled="disabled"
        class="cs__input"
        autocomplete="off"
        @input="onInput"
        @focus="isOpen = results.length > 0"
      />
      <div v-if="searching" class="cs__spinner" />
    </div>

    <ul v-if="isOpen && results.length" class="cs__dropdown">
      <li
        v-for="geo in results"
        :key="`${geo.lat},${geo.lon}`"
        class="cs__item"
        @mousedown.prevent="selectCity(geo)"
      >
        <span class="cs__item-name">{{ geo.name }}</span>
        <span class="cs__item-meta">{{ geo.state ? `${geo.state}, ` : '' }}{{ geo.country }}</span>
      </li>
    </ul>
    <div v-else-if="isOpen && !results.length && !searching" class="cs__dropdown cs__empty">
      {{ t('search.noResults') }}
    </div>
  </div>
</template>

<style scoped>
.cs {
  position: relative;
  width: 100%;
}

.cs__wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.cs__icon {
  position: absolute;
  left: 11px;
  color: var(--text-secondary);
  pointer-events: none;
  flex-shrink: 0;
}

.cs__input {
  width: 100%;
  padding: 9px 34px 9px 34px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: var(--transition);
}

.cs__input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.cs__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
}

.cs__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cs__spinner {
  position: absolute;
  right: 11px;
  width: 15px;
  height: 15px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: cs-spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes cs-spin {
  to { transform: rotate(360deg); }
}

.cs__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px var(--shadow);
  z-index: 300;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  max-height: 220px;
  overflow-y: auto;
}

.cs__item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 9px 14px;
  cursor: pointer;
  gap: 8px;
  transition: background 0.12s;
}

.cs__item:hover {
  background: var(--bg-primary);
}

.cs__item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cs__item-meta {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.cs__empty {
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text-secondary);
  list-style: none;
}
</style>
