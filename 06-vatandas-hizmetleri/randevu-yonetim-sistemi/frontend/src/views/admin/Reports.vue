<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Raporlar</h1>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="primary">mdi-calendar-check</v-icon>
            <h2 class="text-h4 mt-2">{{ stats.total || 0 }}</h2>
            <p>Toplam Randevu</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="success">mdi-check-circle</v-icon>
            <h2 class="text-h4 mt-2">{{ stats.completed || 0 }}</h2>
            <p>Tamamlanan</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="warning">mdi-clock</v-icon>
            <h2 class="text-h4 mt-2">{{ stats.scheduled || 0 }}</h2>
            <p>Bekleyen</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="error">mdi-cancel</v-icon>
            <h2 class="text-h4 mt-2">{{ stats.cancelled || 0 }}</h2>
            <p>İptal Edilen</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Departman Bazlı Randevular</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th>Departman</th>
                    <th>Randevu Sayısı</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dept in departmentStats" :key="dept._id">
                    <td>{{ dept.name }}</td>
                    <td>{{ dept.count }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

export default {
  name: 'AdminReports',
  setup() {
    const stats = ref({})
    const departmentStats = ref([])
    
    onMounted(async () => {
      try {
        const response = await api.get('/reports/statistics')
        
        // Process status stats
        const statusStats = response.data.statusStats.reduce((acc, item) => {
          acc[item._id] = item.count
          acc.total = (acc.total || 0) + item.count
          return acc
        }, {})
        
        stats.value = statusStats
        departmentStats.value = response.data.departmentStats
      } catch (error) {
        console.error('Error fetching reports:', error)
      }
    })
    
    return {
      stats,
      departmentStats
    }
  }
}
</script>