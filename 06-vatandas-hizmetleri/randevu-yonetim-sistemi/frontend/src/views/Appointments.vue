<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Randevularım</h1>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="tab">
          <v-tab value="upcoming">Yaklaşan</v-tab>
          <v-tab value="past">Geçmiş</v-tab>
          <v-tab value="cancelled">İptal Edilen</v-tab>
        </v-tabs>
        
        <v-window v-model="tab">
          <v-window-item value="upcoming">
            <v-card v-for="appointment in upcomingAppointments" :key="appointment._id" class="mb-3 mt-4">
              <v-card-text>
                <v-row align="center">
                  <v-col cols="12" sm="4">
                    <div class="text-h6">{{ appointment.service?.name }}</div>
                    <div class="text-subtitle-2">{{ appointment.department?.name }}</div>
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-icon left>mdi-calendar</v-icon>
                    {{ formatDate(appointment.date) }}
                    <br>
                    <v-icon left>mdi-clock</v-icon>
                    {{ appointment.timeSlot?.start }}
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-chip :color="getStatusColor(appointment.status)" text-color="white">
                      {{ getStatusText(appointment.status) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="2">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      @click="viewAppointment(appointment._id)"
                    >
                      Detay
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-window-item>
          
          <v-window-item value="past">
            <v-card v-for="appointment in pastAppointments" :key="appointment._id" class="mb-3 mt-4">
              <v-card-text>
                <v-row align="center">
                  <v-col cols="12" sm="6">
                    <div class="text-h6">{{ appointment.service?.name }}</div>
                    <div class="text-subtitle-2">{{ appointment.department?.name }}</div>
                  </v-col>
                  <v-col cols="12" sm="4">
                    {{ formatDate(appointment.date) }} - {{ appointment.timeSlot?.start }}
                  </v-col>
                  <v-col cols="12" sm="2">
                    <v-btn
                      color="primary"
                      variant="text"
                      @click="viewAppointment(appointment._id)"
                    >
                      Detay
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-window-item>
          
          <v-window-item value="cancelled">
            <v-card v-for="appointment in cancelledAppointments" :key="appointment._id" class="mb-3 mt-4">
              <v-card-text>
                <v-row align="center">
                  <v-col cols="12" sm="6">
                    <div class="text-h6">{{ appointment.service?.name }}</div>
                    <div class="text-subtitle-2">{{ appointment.department?.name }}</div>
                  </v-col>
                  <v-col cols="12" sm="4">
                    {{ formatDate(appointment.date) }} - {{ appointment.timeSlot?.start }}
                  </v-col>
                  <v-col cols="12" sm="2">
                    <v-chip color="error">İptal</v-chip>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Appointments',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const tab = ref('upcoming')
    
    onMounted(() => {
      store.dispatch('appointments/fetchMyAppointments')
    })
    
    const appointments = computed(() => store.state.appointments.appointments)
    
    const upcomingAppointments = computed(() => {
      return appointments.value.filter(a => 
        ['scheduled', 'confirmed'].includes(a.status) &&
        new Date(a.date) >= new Date()
      )
    })
    
    const pastAppointments = computed(() => {
      return appointments.value.filter(a => 
        a.status === 'completed' || new Date(a.date) < new Date()
      )
    })
    
    const cancelledAppointments = computed(() => {
      return appointments.value.filter(a => a.status === 'cancelled')
    })
    
    const getStatusColor = (status) => {
      const colors = {
        scheduled: 'info',
        confirmed: 'success',
        completed: 'grey',
        cancelled: 'error'
      }
      return colors[status] || 'grey'
    }
    
    const getStatusText = (status) => {
      const texts = {
        scheduled: 'Planlandı',
        confirmed: 'Onaylandı',
        completed: 'Tamamlandı',
        cancelled: 'İptal Edildi'
      }
      return texts[status] || status
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('tr-TR')
    }
    
    const viewAppointment = (id) => {
      router.push(`/appointment/${id}`)
    }
    
    return {
      tab,
      upcomingAppointments,
      pastAppointments,
      cancelledAppointments,
      getStatusColor,
      getStatusText,
      formatDate,
      viewAppointment
    }
  }
}
</script>