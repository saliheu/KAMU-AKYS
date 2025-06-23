<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Ziyaretçi Kayıt</h1>
    
    <div class="bg-white p-6 rounded-lg shadow mb-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ziyaretçi Ad Soyad *
            </label>
            <input
              v-model="form.ad_soyad"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              v-model="form.telefon"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Aranan Kişi *
            </label>
            <input
              v-model="form.aranan_kisi"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          Kaydet
        </button>
      </form>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <h2 class="text-lg font-semibold p-4 border-b">Son Ziyaretçiler</h2>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ziyaretçi
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aranan Kişi
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarih/Saat
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="ziyaretci in ziyaretciler" :key="ziyaretci.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ ziyaretci.ad_soyad }}</div>
              <div class="text-sm text-gray-500">{{ ziyaretci.telefon }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ ziyaretci.aranan_kisi }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDateTime(ziyaretci.ziyaret_tarihi) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  ziyaretci.bulundu_mu
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ ziyaretci.bulundu_mu ? 'Bulundu' : 'Bulunamadı' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const form = ref({
  ad_soyad: '',
  telefon: '',
  aranan_kisi: ''
})

const ziyaretciler = ref([])
const loading = ref(false)

onMounted(() => {
  fetchZiyaretciler()
})

const fetchZiyaretciler = async () => {
  try {
    const response = await axios.get('/api/ziyaretci/')
    ziyaretciler.value = response.data
  } catch (error) {
    console.error('Ziyaretçiler yüklenemedi:', error)
  }
}

const handleSubmit = async () => {
  loading.value = true
  
  try {
    await axios.post('/api/ziyaretci/', form.value)
    form.value = { ad_soyad: '', telefon: '', aranan_kisi: '' }
    await fetchZiyaretciler()
  } catch (error) {
    console.error('Kayıt hatası:', error)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('tr-TR')
}
</script>