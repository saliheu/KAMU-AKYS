<template>
  <v-app>
    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-item :title="userFullName" :subtitle="userRole">
          <template v-slot:prepend>
            <v-avatar color="primary">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.route"
          :prepend-icon="item.icon"
          :title="item.title"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon
        v-if="isAuthenticated"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Randevu Yönetim Sistemi</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-if="isAuthenticated"
        icon
        @click="logout"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const router = useRouter()
    const drawer = ref(true)

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const userFullName = computed(() => store.getters['auth/userFullName'])
    const userRole = computed(() => {
      const role = store.getters['auth/userRole']
      const roles = {
        citizen: 'Vatandaş',
        staff: 'Personel',
        admin: 'Yönetici'
      }
      return roles[role] || role
    })

    const snackbar = computed(() => store.state.snackbar)

    const navigationItems = computed(() => {
      const role = store.getters['auth/userRole']
      const items = [
        { title: 'Ana Sayfa', icon: 'mdi-home', route: '/' },
        { title: 'Randevularım', icon: 'mdi-calendar', route: '/appointments' },
        { title: 'Yeni Randevu', icon: 'mdi-calendar-plus', route: '/new-appointment' },
        { title: 'Profilim', icon: 'mdi-account', route: '/profile' }
      ]

      if (role === 'admin' || role === 'staff') {
        items.push(
          { title: 'Randevu Yönetimi', icon: 'mdi-calendar-edit', route: '/admin/appointments' },
          { title: 'Raporlar', icon: 'mdi-chart-bar', route: '/admin/reports' }
        )
      }

      if (role === 'admin') {
        items.push(
          { title: 'Departmanlar', icon: 'mdi-office-building', route: '/admin/departments' },
          { title: 'Hizmetler', icon: 'mdi-room-service', route: '/admin/services' },
          { title: 'Kullanıcılar', icon: 'mdi-account-group', route: '/admin/users' }
        )
      }

      return items
    })

    const logout = async () => {
      await store.dispatch('auth/logout')
      router.push('/login')
    }

    return {
      drawer,
      isAuthenticated,
      userFullName,
      userRole,
      snackbar,
      navigationItems,
      logout
    }
  }
}
</script>