<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Defin Arama</h1>
    
    <div class="bg-white p-6 rounded-lg shadow mb-6">
      <form @submit.prevent="search" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Ad Soyad veya TC Kimlik No
          </label>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Arama yapın..."
            required
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full md:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          <i class="pi pi-search mr-2"></i>
          Ara
        </button>
      </form>
    </div>

    <div v-if="results.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ad Soyad
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doğum Tarihi
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ölüm Tarihi
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mezar Bilgisi
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="defin in results" :key="defin.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ defin.ad_soyad }}</div>
              <div class="text-sm text-gray-500">{{ defin.baba_adi }} - {{ defin.anne_adi }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(defin.dogum_tarihi) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(defin.olum_tarihi) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Mezar No: {{ defin.mezar_id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="showDetails(defin)"
                class="text-primary-600 hover:text-primary-900"
              >
                Detay
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="searched && !loading" class="text-center py-8 text-gray-500">
      Kayıt bulunamadı.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

const search = async () => {
  loading.value = true
  searched.value = true
  
  try {
    const response = await axios.get('/api/defin/ara', {
      params: { q: searchQuery.value }
    })
    results.value = response.data
  } catch (error) {
    console.error('Arama hatası:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR')
}

const showDetails = (defin) => {
  // TODO: Implement detail modal
  console.log('Defin details:', defin)
}
</script>