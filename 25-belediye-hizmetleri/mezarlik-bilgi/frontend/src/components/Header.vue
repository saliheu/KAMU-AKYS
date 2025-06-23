<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-gray-900">Mezarlık Bilgi Sistemi</h1>
        </div>
        
        <nav class="hidden md:flex space-x-8">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            active-class="text-primary-600 border-b-2 border-primary-600"
          >
            <i :class="item.icon" class="mr-2"></i>
            {{ item.name }}
          </router-link>
        </nav>
        
        <div class="flex items-center space-x-4">
          <button
            @click="logout"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
          >
            <i class="pi pi-sign-out mr-2"></i>
            Çıkış
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', to: '/', icon: 'pi pi-home' },
  { name: 'Mezarlıklar', to: '/mezarlik', icon: 'pi pi-map' },
  { name: 'Defin İşlemleri', to: '/defin', icon: 'pi pi-plus' },
  { name: 'Arama', to: '/arama', icon: 'pi pi-search' },
  { name: 'Ziyaretçi', to: '/ziyaretci', icon: 'pi pi-users' },
  { name: 'Harita', to: '/harita', icon: 'pi pi-map-marker' },
  { name: 'Raporlar', to: '/raporlar', icon: 'pi pi-chart-bar' }
]

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>