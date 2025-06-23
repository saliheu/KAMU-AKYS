<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Check if user is already logged in
  const token = localStorage.getItem('token')
  if (token) {
    authStore.checkAuth()
  }
})
</script>