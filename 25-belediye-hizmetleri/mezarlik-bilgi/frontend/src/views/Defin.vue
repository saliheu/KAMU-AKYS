<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Defin İşlemleri</h1>
    
    <div class="bg-white p-6 rounded-lg shadow">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              TC Kimlik No
            </label>
            <input
              v-model="form.tc_no"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad *
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
              Baba Adı
            </label>
            <input
              v-model="form.baba_adi"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Anne Adı
            </label>
            <input
              v-model="form.anne_adi"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Doğum Tarihi
            </label>
            <input
              v-model="form.dogum_tarihi"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ölüm Tarihi *
            </label>
            <input
              v-model="form.olum_tarihi"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Defin Tarihi *
            </label>
            <input
              v-model="form.defin_tarihi"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mezar Seçimi *
            </label>
            <select
              v-model="form.mezar_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seçiniz</option>
              <option v-for="mezar in bosMezarlar" :key="mezar.id" :value="mezar.id">
                Ada: {{ mezar.ada_id }} - Mezar No: {{ mezar.mezar_no }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Yakın Ad Soyad
            </label>
            <input
              v-model="form.yakin_ad_soyad"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Yakın Telefon
            </label>
            <input
              v-model="form.yakin_telefon"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Notlar
          </label>
          <textarea
            v-model="form.notlar"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>
        
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const bosMezarlar = ref([])

const form = ref({
  tc_no: '',
  ad_soyad: '',
  baba_adi: '',
  anne_adi: '',
  dogum_tarihi: '',
  olum_tarihi: '',
  defin_tarihi: '',
  olum_nedeni: '',
  memleket: '',
  yakin_ad_soyad: '',
  yakin_telefon: '',
  yakin_adres: '',
  notlar: '',
  mezar_id: ''
})

onMounted(() => {
  fetchBosMezarlar()
})

const fetchBosMezarlar = async () => {
  try {
    // TODO: Get cemetery ID dynamically
    const response = await axios.get('/api/mezarlik/mezar/bos?mezarlik_id=1')
    bosMezarlar.value = response.data
  } catch (error) {
    console.error('Boş mezarlar yüklenemedi:', error)
  }
}

const handleSubmit = async () => {
  loading.value = true
  
  try {
    await axios.post('/api/defin/', form.value)
    alert('Defin kaydı başarıyla oluşturuldu')
    router.push('/arama')
  } catch (error) {
    console.error('Kayıt hatası:', error)
    alert('Bir hata oluştu')
  } finally {
    loading.value = false
  }
}
</script>