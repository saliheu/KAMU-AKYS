<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      color="grey-darken-4"
      dark
    >
      <v-list>
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
          :title="user?.fullName || 'Kullanıcı'"
          :subtitle="user?.role || 'Rol'"
        />
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          v-show="!item.permission || authStore.hasPermission(item.permission)"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Bütçe Yönetim Sistemi</v-toolbar-title>
      
      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item to="/profile">
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>
          <v-list-item to="/settings">
            <v-list-item-title>Ayarlar</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="handleLogout">
            <v-list-item-title>Çıkış Yap</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const drawer = ref(true)
const user = computed(() => authStore.user)

const navigationItems = [
  { icon: 'mdi-view-dashboard', title: 'Dashboard', to: '/' },
  { icon: 'mdi-calculator', title: 'Bütçeler', to: '/budgets', permission: 'budget.create' },
  { icon: 'mdi-cash-minus', title: 'Giderler', to: '/expenses', permission: 'expense.create' },
  { icon: 'mdi-cash-plus', title: 'Gelirler', to: '/revenues', permission: 'revenue.create' },
  { icon: 'mdi-chart-line', title: 'Raporlar', to: '/reports', permission: 'report.view' },
  { icon: 'mdi-cog', title: 'Ayarlar', to: '/settings' }
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>