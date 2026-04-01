import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CityData {
  name: string
  lat: number
  lon: number
  country: string
}

export interface WeatherBlockData {
  id: string
  city: CityData | null
  period: 'day' | 'week'
  viewMode: 'day' | 'night'
}

export const useWeatherBlocksStore = defineStore('weatherBlocks', () => {
  const MAX_BLOCKS = 5

  const blocks = ref<WeatherBlockData[]>([
    { id: 'block-1', city: null, period: 'day', viewMode: 'day' },
  ])

  const canAddBlock = computed(() => blocks.value.length < MAX_BLOCKS)

  function addBlock() {
    if (blocks.value.length >= MAX_BLOCKS) return
    blocks.value.push({
      id: `block-${Date.now()}`,
      city: null,
      period: 'day',
      viewMode: 'day',
    })
  }

  function removeBlock(id: string) {
    blocks.value = blocks.value.filter((b) => b.id !== id)
    if (blocks.value.length === 0) {
      blocks.value.push({ id: `block-${Date.now()}`, city: null, period: 'day', viewMode: 'day' })
    }
  }

  function setCity(id: string, city: CityData | null) {
    const block = blocks.value.find((b) => b.id === id)
    if (block) block.city = city
  }

  function setPeriod(id: string, period: 'day' | 'week') {
    const block = blocks.value.find((b) => b.id === id)
    if (block) block.period = period
  }

  function setViewMode(id: string, mode: 'day' | 'night') {
    const block = blocks.value.find((b) => b.id === id)
    if (block) block.viewMode = mode
  }

  return { blocks, MAX_BLOCKS, canAddBlock, addBlock, removeBlock, setCity, setPeriod, setViewMode }
})
