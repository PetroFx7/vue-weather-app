<script setup lang="ts">
import { computed } from 'vue'
import type { CurrentWeatherData, ForecastData, ForecastItem } from '@/api/weatherApi'
import { useI18n } from '@/shared/composables/useI18n'

interface DaySummary {
  date: string
  label: string
  icon: string
  description: string
  avgTemp: number
  minTemp: number
  maxTemp: number
  humidity: number
}

interface Props {
  weather: CurrentWeatherData
  forecast: ForecastData | null
  period: 'day' | 'week'
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

const timezone = computed(() => props.forecast?.city.timezone ?? props.weather.timezone ?? 0)

function toLocalDateStr(dt: number, tz: number): string {
  const local = new Date((dt + tz) * 1000)
  const y = local.getUTCFullYear()
  const m = String(local.getUTCMonth() + 1).padStart(2, '0')
  const d = String(local.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const weekDays = computed<DaySummary[]>(() => {
  if (!props.forecast) return []

  const grouped: Record<string, ForecastItem[]> = {}
  for (const item of props.forecast.list) {
    const key = toLocalDateStr(item.dt, timezone.value)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }

  const lang = locale.value === 'uk' ? 'uk-UA' : 'en-US'

  return Object.keys(grouped)
    .sort()
    .slice(0, 5)
    .map((date) => {
      const items = grouped[date]
      const temps = items.map((i) => i.main.temp)
      const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
      const minTemp = Math.round(Math.min(...items.map((i) => i.main.temp_min)))
      const maxTemp = Math.round(Math.max(...items.map((i) => i.main.temp_max)))
      const humidity = Math.round(
        items.reduce((a, b) => a + b.main.humidity, 0) / items.length,
      )
      const mid = items.find((i) => i.dt_txt.includes('12:00:00')) ?? items[Math.floor(items.length / 2)]
      const d = new Date(date + 'T12:00:00Z')
      const label = d.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' })
      return {
        date,
        label,
        icon: mid.weather[0].icon.replace('n', 'd'),
        description: mid.weather[0].description,
        avgTemp,
        minTemp,
        maxTemp,
        humidity,
      }
    })
})

function iconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

function formatTime(ts: number, tz: number): string {
  const d = new Date((ts + tz) * 1000)
  const h = d.getUTCHours().toString().padStart(2, '0')
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function windDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}
</script>

<template>
  <div v-if="period === 'day'" class="wcard">
    <div class="wcard__main">
      <img
        :src="iconUrl(weather.weather[0].icon)"
        :alt="weather.weather[0].description"
        class="wcard__icon"
      />
      <div class="wcard__temp">
        {{ Math.round(weather.main.temp) }}<span class="wcard__unit">°C</span>
      </div>
    </div>

    <div class="wcard__desc">{{ weather.weather[0].description }}</div>
    <div class="wcard__range">
      ↓ {{ Math.round(weather.main.temp_min) }}° &nbsp;↑ {{ Math.round(weather.main.temp_max) }}°
    </div>

    <div class="wcard__stats">
      <div class="wcard__stat">
        <span class="wcard__stat-label">{{ t('weather.feelsLike') }}</span>
        <span class="wcard__stat-val">{{ Math.round(weather.main.feels_like) }}°C</span>
      </div>
      <div class="wcard__stat">
        <span class="wcard__stat-label">{{ t('weather.humidity') }}</span>
        <span class="wcard__stat-val">{{ weather.main.humidity }}%</span>
      </div>
      <div class="wcard__stat">
        <span class="wcard__stat-label">{{ t('weather.wind') }}</span>
        <span class="wcard__stat-val">
          {{ weather.wind.speed.toFixed(1) }} m/s {{ windDir(weather.wind.deg) }}
        </span>
      </div>
      <div class="wcard__stat">
        <span class="wcard__stat-label">{{ t('weather.pressure') }}</span>
        <span class="wcard__stat-val">{{ weather.main.pressure }} hPa</span>
      </div>
      <div class="wcard__stat">
        <span class="wcard__stat-label">{{ t('weather.visibility') }}</span>
        <span class="wcard__stat-val">{{ (weather.visibility / 1000).toFixed(1) }} km</span>
      </div>
      <div class="wcard__stat">
        <span class="wcard__stat-label">{{ t('weather.sunrise') }}</span>
        <span class="wcard__stat-val">{{ formatTime(weather.sys.sunrise, timezone) }}</span>
      </div>
      <div class="wcard__stat">
        <span class="wcard__stat-label">{{ t('weather.sunset') }}</span>
        <span class="wcard__stat-val">{{ formatTime(weather.sys.sunset, timezone) }}</span>
      </div>
    </div>
  </div>

  <div v-else class="fc">
    <div
      v-for="day in weekDays"
      :key="day.date"
      class="fc__row"
    >
      <span class="fc__day">{{ day.label }}</span>
      <img :src="iconUrl(day.icon)" :alt="day.description" class="fc__icon" />
      <span class="fc__desc">{{ day.description }}</span>
      <div class="fc__temps">
        <span class="fc__avg">{{ day.avgTemp }}°</span>
        <span class="fc__range">{{ day.minTemp }}° / {{ day.maxTemp }}°</span>
      </div>
      <span class="fc__hum">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        {{ day.humidity }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.wcard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.wcard__main {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wcard__icon {
  width: 72px;
  height: 72px;
}

.wcard__temp {
  font-size: 3.8rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-primary);
}

.wcard__unit {
  font-size: 1.6rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.wcard__desc {
  font-size: 1rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  margin-top: 2px;
}

.wcard__range {
  font-size: 0.8rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
}

.wcard__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  width: 100%;
  margin-top: 8px;
}

.wcard__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
}

.wcard__stat-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.wcard__stat-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.fc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.fc__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  transition: background 0.15s;
}

.fc__row:hover {
  background: var(--border);
}

.fc__day {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  width: 80px;
  flex-shrink: 0;
  white-space: nowrap;
}

.fc__icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.fc__desc {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: capitalize;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fc__temps {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.fc__avg {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.fc__range {
  font-size: 11px;
  color: var(--text-secondary);
}

.fc__hum {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 36px;
  justify-content: flex-end;
}
</style>
