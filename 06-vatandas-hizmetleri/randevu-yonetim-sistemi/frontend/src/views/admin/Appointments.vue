<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Randevu Yönetimi</h1>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.departmentId"
                  :items="departments"
                  item-title="name"
                  item-value="_id"
                  label="Departman"
                  clearable
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.date"
                  label="Tarih"
                  type="date"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.status"
                  :items="statusOptions"
                  label="Durum"
                  clearable
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-btn color="primary" @click="fetchAppointments">
              Filtrele
            </v-btn>
          </v-card-text>
        </v-card>
        
        <v-data-table
          :headers="headers"
          :items="appointments"
          :loading="loading"
          class="mt-4"
        >
          <template v-slot:item.user="{ item }">
            {{ item.user?.firstName }} {{ item.user?.lastName }}
          </template>
          <template v-slot:item.date="{ item }">
            {{ formatDate(item.date) }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" text-color="white" size="small">
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" @click="updateStatus(item, 'confirmed')">
              <v-icon>mdi-check</v-icon>
            </v-btn>
            <v-btn icon size="small" @click="updateStatus(item, 'cancelled')">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import api from '@/services/api'

export default {
  name: 'AdminAppointments',
  setup() {
    const store = useStore()
    
    const appointments = ref([])
    const departments = ref([])
    const loading = ref(false)
    
    const filters = ref({
      departmentId: null,
      date: null,
      status: null
    })
    
    const statusOptions = [
      { title: 'Planlandı', value: 'scheduled' },
      { title: 'Onaylandı', value: 'confirmed' },
      { title: 'Tamamlandı', value: 'completed' },
      { title: 'İptal Edildi', value: 'cancelled' }
    ]
    
    const headers = [
      { title: 'Randevu No', key: 'appointmentNumber' },
      { title: 'Vatandaş', key: 'user' },
      { title: 'Departman', key: 'department.name' },
      { title: 'Hizmet', key: 'service.name' },
      { title: 'Tarih', key: 'date' },
      { title: 'Saat', key: 'timeSlot.start' },
      { title: 'Durum', key: 'status' },
      { title: 'İşlemler', key: 'actions', sortable: false }
    ]
    
    onMounted(async () => {
      await store.dispatch('departments/fetchDepartments')
      departments.value = store.state.departments.departments
      fetchAppointments()
    })
    
    const fetchAppointments = async () => {
      loading.value = true
      try {
        const response = await api.get('/appointments/admin/all', {
          params: filters.value
        })
        appointments.value = response.data
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
      loading.value = false
    }
    
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
    
    const updateStatus = async (appointment, newStatus) => {
      // Implementation for status update
      console.log('Update status:', appointment._id, newStatus)
    }
    
    return {
      appointments,
      departments,
      loading,
      filters,
      statusOptions,
      headers,
      fetchAppointments,
      getStatusColor,
      getStatusText,
      formatDate,
      updateStatus
    }
  }
}
</script>