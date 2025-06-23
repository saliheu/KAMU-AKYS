<template>
  <div id="app">
    <Header v-if="!isLoginPage" />
    <main class="min-h-screen bg-gray-50">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>