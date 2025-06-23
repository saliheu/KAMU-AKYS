<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Aylık Defin İstatistikleri</h2>
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Ziyaretçi İstatistikleri</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Bugün:</span>
            <span class="font-semibold">{{ ziyaretciStats.bugun_ziyaretci || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Bu Hafta:</span>
            <span class="font-semibold">{{ ziyaretciStats.hafta_ziyaretci || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Toplam:</span>
            <span class="font-semibold">{{ ziyaretciStats.toplam_ziyaretci || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Başarı Oranı:</span>
            <span class="font-semibold">%{{ ziyaretciStats.basari_orani || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import StatCard from '../components/StatCard.vue'

Chart.register(...registerables)

const stats = ref([
  { title: 'Toplam Mezarlık', value: 0, icon: 'pi pi-map', color: 'bg-blue-500' },
  { title: 'Toplam Mezar', value: 0, icon: 'pi pi-th-large', color: 'bg-green-500' },
  { title: 'Dolu Mezar', value: 0, icon: 'pi pi-users', color: 'bg-orange-500' },
  { title: 'Boş Mezar', value: 0, icon: 'pi pi-inbox', color: 'bg-purple-500' }
])

const ziyaretciStats = ref({})
const chartCanvas = ref(null)

onMounted(async () => {
  await fetchStats()
  await fetchZiyaretciStats()
  await fetchDefinStats()
})

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/raporlar/genel-durum')
    const data = response.data
    
    stats.value[0].value = data.toplam_mezarlik
    stats.value[1].value = data.toplam_mezar
    stats.value[2].value = data.dolu_mezar
    stats.value[3].value = data.bos_mezar
  } catch (error) {
    console.error('İstatistikler yüklenemedi:', error)
  }
}

const fetchZiyaretciStats = async () => {
  try {
    const response = await axios.get('/api/ziyaretci/istatistik')
    ziyaretciStats.value = response.data
  } catch (error) {
    console.error('Ziyaretçi istatistikleri yüklenemedi:', error)
  }
}

const fetchDefinStats = async () => {
  try {
    const response = await axios.get('/api/raporlar/defin-istatistikleri')
    const data = response.data
    
    if (chartCanvas.value) {
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      const chartData = new Array(12).fill(0)
      
      data.aylik_dagilim.forEach(item => {
        chartData[item.ay - 1] = item.sayi
      })
      
      new Chart(chartCanvas.value, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Defin Sayısı',
            data: chartData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Defin istatistikleri yüklenemedi:', error)
  }
}
</script>