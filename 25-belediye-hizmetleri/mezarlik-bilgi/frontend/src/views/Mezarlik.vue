<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Mezarlık Yönetimi</h1>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <i class="pi pi-plus mr-2"></i>
        Yeni Mezarlık
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mezarlık Adı
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İl/İlçe
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kapasite
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doluluk
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="mezarlik in mezarliklar" :key="mezarlik.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ mezarlik.ad }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ mezarlik.il }} / {{ mezarlik.ilce }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ mezarlik.kapasite || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ mezarlik.dolu_sayisi || 0 }}</div>
              <div class="text-sm text-gray-500">
                %{{ calculateOccupancy(mezarlik) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewDetails(mezarlik)"
                class="text-primary-600 hover:text-primary-900"
              >
                Detay
              </button>
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

const mezarliklar = ref([])
const showAddModal = ref(false)

onMounted(() => {
  fetchMezarliklar()
})

const fetchMezarliklar = async () => {
  try {
    const response = await axios.get('/api/mezarlik/')
    mezarliklar.value = response.data
  } catch (error) {
    console.error('Mezarlıklar yüklenemedi:', error)
  }
}

const calculateOccupancy = (mezarlik) => {
  if (!mezarlik.kapasite) return 0
  return Math.round((mezarlik.dolu_sayisi / mezarlik.kapasite) * 100)
}

const viewDetails = (mezarlik) => {
  // TODO: Implement detail view
  console.log('Mezarlık details:', mezarlik)
}
</script>