<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Hoş Geldiniz</h1>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-calendar-check</v-icon>
            Aktif Randevular
          </v-card-title>
          <v-card-text>
            <v-chip color="primary" text-color="white">
              {{ activeAppointments }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" @click="$router.push('/appointments')">
              Görüntüle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-calendar-plus</v-icon>
            Yeni Randevu
          </v-card-title>
          <v-card-text>
            Hızlı ve kolay randevu alın
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" @click="$router.push('/new-appointment')">
              Randevu Al
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-account</v-icon>
            Profil
          </v-card-title>
          <v-card-text>
            Bilgilerinizi güncelleyin
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" @click="$router.push('/profile')">
              Profili Görüntüle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Yaklaşan Randevular</h2>
        <v-card v-for="appointment in upcomingAppointments" :key="appointment._id" class="mb-3">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="6">
                <div class="text-h6">{{ appointment.service?.name }}</div>
                <div class="text-subtitle-2">{{ appointment.department?.name }}</div>
              </v-col>
              <v-col cols="12" sm="3">
                <v-icon left>mdi-calendar</v-icon>
                {{ formatDate(appointment.date) }}
              </v-col>
              <v-col cols="12" sm="3">
                <v-icon left>mdi-clock</v-icon>
                {{ appointment.timeSlot?.start }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Home',
  setup() {
    const store = useStore()
    
    onMounted(() => {
      store.dispatch('appointments/fetchMyAppointments')
    })
    
    const appointments = computed(() => store.state.appointments.appointments)
    
    const activeAppointments = computed(() => {
      return appointments.value.filter(a => 
        ['scheduled', 'confirmed'].includes(a.status)
      ).length
    })
    
    const upcomingAppointments = computed(() => {
      return appointments.value
        .filter(a => ['scheduled', 'confirmed'].includes(a.status))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
    })
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('tr-TR')
    }
    
    return {
      activeAppointments,
      upcomingAppointments,
      formatDate
    }
  }
}
</script>