import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CityData } from './weatherBlocksStore'

const STORAGE_KEY = 'weather:favorites'
export const MAX_FAVORITES = 5

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<CityData[]>([])

  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) favorites.value = JSON.parse(saved)
    } catch {
      favorites.value = []
    }
  }

  function _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
  }

  function isFavorite(city: CityData): boolean {
    return favorites.value.some(
      (f) => Math.abs(f.lat - city.lat) < 0.01 && Math.abs(f.lon - city.lon) < 0.01,
    )
  }

  function addFavorite(city: CityData): boolean {
    if (favorites.value.length >= MAX_FAVORITES) return false
    if (!isFavorite(city)) {
      favorites.value.push({ ...city })
      _save()
    }
    return true
  }

  function removeFavorite(city: CityData) {
    favorites.value = favorites.value.filter(
      (f) => !(Math.abs(f.lat - city.lat) < 0.01 && Math.abs(f.lon - city.lon) < 0.01),
    )
    _save()
  }

  return { favorites, MAX_FAVORITES, init, isFavorite, addFavorite, removeFavorite }
})
