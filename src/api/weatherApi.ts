import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE = 'https://api.openweathermap.org'

export interface GeoCity {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country: string
  state?: string
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface CurrentWeatherData {
  weather: WeatherCondition[]
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  visibility: number
  wind: { speed: number; deg: number }
  sys: { sunrise: number; sunset: number; country: string }
  name: string
  dt: number
  timezone: number
}

export interface ForecastItem {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: WeatherCondition[]
  wind: { speed: number; deg: number }
  visibility: number
  dt_txt: string
  sys?: { pod: string }
  pop?: number
}

export interface ForecastData {
  list: ForecastItem[]
  city: {
    name: string
    country: string
    sunrise: number
    sunset: number
    timezone: number
  }
}

export async function searchCities(query: string, limit = 5): Promise<GeoCity[]> {
  if (!query.trim()) return []
  const { data } = await axios.get<GeoCity[]>(`${BASE}/geo/1.0/direct`, {
    params: { q: query, limit, appid: API_KEY },
  })
  return data
}

export async function getCurrentWeather(
  lat: number,
  lon: number,
  lang = 'en',
): Promise<CurrentWeatherData> {
  const { data } = await axios.get<CurrentWeatherData>(`${BASE}/data/2.5/weather`, {
    params: { lat, lon, appid: API_KEY, units: 'metric', lang },
  })
  return data
}

export async function getForecast(
  lat: number,
  lon: number,
  lang = 'en',
): Promise<ForecastData> {
  const { data } = await axios.get<ForecastData>(`${BASE}/data/2.5/forecast`, {
    params: { lat, lon, appid: API_KEY, units: 'metric', lang },
  })
  return data
}

export async function getLocationByIP(): Promise<{
  lat: number
  lon: number
  city: string
  country: string
} | null> {
  try {
    const { data } = await axios.get('https://ipapi.co/json/', { timeout: 5000 })
    if (!data.latitude || !data.city) return null
    return {
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country_code,
    }
  } catch {
    return null
  }
}
