<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Raporlar</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Genel Durum</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>Toplam Mezarlık:</span>
            <span class="font-semibold">{{ genelDurum.toplam_mezarlik || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span>Toplam Mezar:</span>
            <span class="font-semibold">{{ genelDurum.toplam_mezar || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span>Dolu Mezar:</span>
            <span class="font-semibold">{{ genelDurum.dolu_mezar || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span>Boş Mezar:</span>
            <span class="font-semibold">{{ genelDurum.bos_mezar || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span>Doluluk Oranı:</span>
            <span class="font-semibold">%{{ genelDurum.doluluk_orani || 0 }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Defin İstatistikleri</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>Bu Ay:</span>
            <span class="font-semibold">{{ definStats.bu_ay_defin || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span>Bu Yıl:</span>
            <span class="font-semibold">{{ definStats.bu_yil_defin || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const genelDurum = ref({})
const definStats = ref({})

onMounted(async () => {
  await fetchGenelDurum()
  await fetchDefinStats()
})

const fetchGenelDurum = async () => {
  try {
    const response = await axios.get('/api/raporlar/genel-durum')
    genelDurum.value = response.data
  } catch (error) {
    console.error('Genel durum yüklenemedi:', error)
  }
}

const fetchDefinStats = async () => {
  try {
    const response = await axios.get('/api/raporlar/defin-istatistikleri')
    definStats.value = response.data
  } catch (error) {
    console.error('Defin istatistikleri yüklenemedi:', error)
  }
}
</script>