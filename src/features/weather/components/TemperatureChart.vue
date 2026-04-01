<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import type { ForecastItem } from '@/api/weatherApi'
import { useI18n } from '@/shared/composables/useI18n'
import { useAppStore } from '@/stores/appStore'

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface Props {
  forecastList: ForecastItem[]
  period: 'day' | 'week'
  viewMode: 'day' | 'night'
  timezone: number
}

const props = withDefaults(defineProps<Props>(), { timezone: 0 })
const { t, locale } = useI18n()
const appStore = useAppStore()

const canvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

interface ChartPoint { label: string; temp: number }

function localDate(dt: number): string {
  const d = new Date((dt + props.timezone) * 1000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function localTime(dt: number): string {
  const d = new Date((dt + props.timezone) * 1000)
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
}

function localHour(dt: number): number {
  return new Date((dt + props.timezone) * 1000).getUTCHours()
}

const chartPoints = computed<ChartPoint[]>(() => {
  if (!props.forecastList.length) return []

  const lang = locale.value === 'uk' ? 'uk-UA' : 'en-US'

  if (props.period === 'day') {
    const todayStr = localDate(Math.floor(Date.now() / 1000))
    let items = props.forecastList.filter((i) => localDate(i.dt) === todayStr)

    const windowed = items.filter((i) => {
      const h = localHour(i.dt)
      return props.viewMode === 'day' ? h >= 6 && h < 21 : h >= 20 || h < 7
    })
    if (windowed.length) items = windowed

    if (!items.length) items = props.forecastList.slice(0, 8)

    return items.map((i) => ({ label: localTime(i.dt), temp: Math.round(i.main.temp) }))
  }

  const grouped: Record<string, number[]> = {}
  for (const item of props.forecastList) {
    const date = localDate(item.dt)
    const h = localHour(item.dt)
    const daytime = h >= 6 && h < 21
    if (props.viewMode === 'day' && !daytime) continue
    if (props.viewMode === 'night' && daytime) continue
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(item.main.temp)
  }

  return Object.keys(grouped)
    .sort()
    .slice(0, 5)
    .map((date) => {
      const temps = grouped[date]
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length
      const d = new Date(date + 'T12:00:00Z')
      const label = d.toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' })
      return { label, temp: Math.round(avg) }
    })
})

function getColors() {
  const dark = appStore.isDark
  if (props.viewMode === 'night') {
    return {
      line:  dark ? '#a78bfa' : '#7c3aed',
      grad0: dark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.22)',
      grid:  dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      tick:  dark ? '#94a3b8' : '#64748b',
    }
  }
  return {
    line:  dark ? '#60a5fa' : '#2196f3',
    grad0: dark ? 'rgba(96,165,250,0.35)' : 'rgba(33,150,243,0.22)',
    grid:  dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    tick:  dark ? '#94a3b8' : '#64748b',
  }
}

function buildChart() {
  chartInstance?.destroy()
  chartInstance = null

  if (!canvas.value || !chartPoints.value.length) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const colors = getColors()
  const h = canvas.value.clientHeight || 180
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, colors.grad0)
  grad.addColorStop(1, 'rgba(0,0,0,0)')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartPoints.value.map((p) => p.label),
      datasets: [
        {
          label: t('chart.temperature'),
          data: chartPoints.value.map((p) => p.temp),
          borderColor: colors.line,
          backgroundColor: grad,
          borderWidth: 2,
          pointBackgroundColor: colors.line,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${c.parsed.y}°C` } },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.tick, font: { size: 11 }, maxRotation: 0 },
          border: { display: false },
        },
        y: {
          grid: { color: colors.grid },
          ticks: { color: colors.tick, font: { size: 11 }, callback: (v) => `${v}°` },
          border: { display: false },
        },
      },
    },
  })
}

watch(
  () => ({
    points: chartPoints.value,
    dark: appStore.isDark,
  }),
  () => nextTick(buildChart),
  { deep: true, flush: 'post' },
)

onMounted(() => nextTick(buildChart))
onUnmounted(() => chartInstance?.destroy())
</script>

<template>
  <div class="chart">
    <div v-if="!chartPoints.length" class="chart__empty">
      {{ t('chart.noData') }}
    </div>
    <canvas v-else ref="canvas" class="chart__canvas" />
  </div>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 180px;
  position: relative;
}

.chart__canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
