<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn icon @click="$router.back()" class="mb-4">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4 mb-6">Randevu Detayı</h1>
      </v-col>
    </v-row>
    
    <v-row v-if="appointment">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            Randevu Bilgileri
            <v-spacer></v-spacer>
            <v-chip :color="getStatusColor(appointment.status)" text-color="white">
              {{ getStatusText(appointment.status) }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Randevu Numarası</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.appointmentNumber }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-title>Departman</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.department?.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-title>Hizmet</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.service?.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-title>Tarih ve Saat</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(appointment.date) }} - {{ appointment.timeSlot?.start }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item v-if="appointment.userNotes">
                <v-list-item-title>Notlarınız</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.userNotes }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions v-if="canCancel">
            <v-btn color="error" @click="cancelDialog = true">
              Randevuyu İptal Et
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Lokasyon Bilgileri</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-if="appointment.department?.location?.building">
                <v-list-item-title>Bina</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.department.location.building }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="appointment.department?.location?.floor">
                <v-list-item-title>Kat</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.department.location.floor }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="appointment.department?.location?.room">
                <v-list-item-title>Oda</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.department.location.room }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        
        <v-card class="mt-4">
          <v-card-title>İletişim</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-if="appointment.department?.contactInfo?.phone">
                <v-list-item-title>Telefon</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.department.contactInfo.phone }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="appointment.department?.contactInfo?.email">
                <v-list-item-title>E-posta</v-list-item-title>
                <v-list-item-subtitle>{{ appointment.department.contactInfo.email }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-dialog v-model="cancelDialog" max-width="500">
      <v-card>
        <v-card-title>Randevu İptali</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="cancelReason"
            label="İptal nedeni (isteğe bağlı)"
            rows="3"
            variant="outlined"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancelDialog = false">Vazgeç</v-btn>
          <v-btn color="error" @click="cancelAppointment" :loading="cancelLoading">
            İptal Et
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'AppointmentDetail',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    const cancelDialog = ref(false)
    const cancelReason = ref('')
    const cancelLoading = ref(false)
    
    const appointment = computed(() => store.state.appointments.currentAppointment)
    
    onMounted(() => {
      store.dispatch('appointments/fetchAppointmentById', route.params.id)
    })
    
    const canCancel = computed(() => {
      if (!appointment.value) return false
      if (!['scheduled', 'confirmed'].includes(appointment.value.status)) return false
      
      const appointmentDate = new Date(appointment.value.date)
      const now = new Date()
      const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)
      
      return hoursDiff >= 24
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
      return new Date(date).toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const cancelAppointment = async () => {
      cancelLoading.value = true
      const result = await store.dispatch('appointments/cancelAppointment', {
        id: appointment.value._id,
        reason: cancelReason.value
      })
      cancelLoading.value = false
      
      if (result.success) {
        cancelDialog.value = false
        router.push('/appointments')
      }
    }
    
    return {
      appointment,
      cancelDialog,
      cancelReason,
      cancelLoading,
      canCancel,
      getStatusColor,
      getStatusText,
      formatDate,
      cancelAppointment
    }
  }
}
</script>