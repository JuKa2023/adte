<template>
  <div
    class="flex items-center gap-3 select-none opacity-80 hover:opacity-100 transition-opacity cursor-help"
    title="Digitaler Poststempel"
  >
    <!-- Circular Stamp Graphic -->
    <div
      class="relative w-12 h-12 flex items-center justify-center border-2 border-gray-800 rounded-full rotate-[-12deg]"
    >
      <div
        class="absolute inset-0 border border-gray-800 rounded-full m-0.5 border-dashed opacity-50"
      ></div>
      <span class="material-icons text-xl text-gray-800">near_me</span>
    </div>

    <!-- Text Info -->
    <div class="flex flex-col">
      <div v-if="loading" class="text-xs font-mono text-gray-500 animate-pulse">LOCATING...</div>
      <div v-else-if="error" class="text-xs font-mono text-red-400">OFF GRID</div>
      <template v-else>
        <div class="text-xs font-bold tracking-widest uppercase text-gray-900 leading-none mb-1">
          {{ city || 'UNKNOWN' }}
        </div>
        <div class="text-[10px] font-mono text-gray-600 flex items-center gap-2">
          <span>{{ date }}</span>
          <span v-if="weather" class="w-px h-3 bg-gray-400"></span>
          <span v-if="weather">{{ weather }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  locationData?: { city: string; weather: string } | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:location', data: { city: string; weather: string }): void
}>()

const loading = ref(true)
const error = ref(false)
const city = ref<string | null>(props.locationData?.city || null)
const weather = ref<string | null>(props.locationData?.weather || null)
const date = new Date().toLocaleDateString('de-CH', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})

onMounted(async () => {
  // If we have initial data, use it and don't fetch
  if (props.locationData) {
    loading.value = false
    return
  }

  // If readonly and no data, show off-grid (error state basically)
  if (props.readonly && !props.locationData) {
    error.value = true
    loading.value = false
    return
  }

  if (!navigator.geolocation) {
    error.value = true
    loading.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      try {
        // 1. Get City (Reverse Geo)
        // Using BigDataCloud free client API (no key needed for client side)
        const cityRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`,
        )
        const cityData = await cityRes.json()
        city.value = cityData.city || cityData.locality || 'EARTH'

        // 2. Get Weather (Open-Meteo)
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`,
        )
        const weatherData = await weatherRes.json()
        const temp = Math.round(weatherData.current.temperature_2m)
        const code = weatherData.current.weather_code
        const condition = getWeatherCondition(code)

        const weatherStr = `${temp}°C • ${condition}`
        weather.value = weatherStr

        emit('update:location', {
          city: city.value || 'Unknown',
          weather: weatherStr,
        })
      } catch (e) {
        console.error('Failed to fetch vibe data', e)
        // Fallback
        city.value = 'Digitale Welt'
        weather.value = 'Online'
      } finally {
        loading.value = false
      }
    },
    (err) => {
      console.warn(err)
      error.value = true
      loading.value = false
    },
  )
})

// WMO Weather interpretation codes (http://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
function getWeatherCondition(wmoCode: number) {
  if (wmoCode === 0) return 'KLAR'
  if (wmoCode >= 1 && wmoCode <= 3) return 'WOLKIG'
  if (wmoCode >= 45 && wmoCode <= 48) return 'NEBEL'
  if (wmoCode >= 51 && wmoCode <= 55) return 'NIESEL'
  if (wmoCode >= 61 && wmoCode <= 65) return 'REGEN'
  if (wmoCode >= 71 && wmoCode <= 77) return 'SCHNEE'
  if (wmoCode >= 80 && wmoCode <= 82) return 'SCHAUER'
  if (wmoCode >= 95) return 'GEWITTER'
  return 'WETTER'
}
</script>
