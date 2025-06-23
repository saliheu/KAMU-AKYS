<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Mezarlık Haritası</h1>
    
    <div class="bg-white rounded-lg shadow">
      <div id="map" class="h-[600px] rounded-lg"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import axios from 'axios'

let map = null
const mezarliklar = ref([])

onMounted(async () => {
  initMap()
  await loadMezarliklar()
})

const initMap = () => {
  map = L.map('map').setView([39.925533, 32.866287], 6) // Türkiye merkezi
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
}

const loadMezarliklar = async () => {
  try {
    const response = await axios.get('/api/mezarlik/')
    mezarliklar.value = response.data
    
    mezarliklar.value.forEach(mezarlik => {
      if (mezarlik.latitude && mezarlik.longitude) {
        const marker = L.marker([mezarlik.latitude, mezarlik.longitude])
          .addTo(map)
          .bindPopup(`
            <div>
              <h3 class="font-bold">${mezarlik.ad}</h3>
              <p>Kapasite: ${mezarlik.kapasite || 0}</p>
              <p>Doluluk: ${mezarlik.dolu_sayisi || 0}</p>
              <p>Adres: ${mezarlik.adres || ''}</p>
            </div>
          `)
      }
    })
  } catch (error) {
    console.error('Mezarlıklar yüklenemedi:', error)
  }
}
</script>

<style>
/* Fix for Leaflet marker icons */
.leaflet-default-icon-path {
  background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
}
</style>