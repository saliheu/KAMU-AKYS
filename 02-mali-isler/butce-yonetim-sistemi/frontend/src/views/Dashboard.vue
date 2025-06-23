<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row>
      <v-col v-for="card in summaryCards" :key="card.title" cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-grey-darken-1 mb-1">{{ card.title }}</p>
                <p class="text-h5 font-weight-bold">{{ formatCurrency(card.value) }}</p>
                <p class="text-caption" :class="card.trend > 0 ? 'text-success' : 'text-error'">
                  <v-icon size="small">{{ card.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
                  {{ Math.abs(card.trend) }}%
                </p>
              </div>
              <v-avatar :color="card.color" size="48">
                <v-icon color="white">{{ card.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Aylık Bütçe Kullanımı</v-card-title>
          <v-card-text>
            <div style="height: 300px;" class="d-flex align-center justify-center">
              <p class="text-grey">Grafik yükleniyor...</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Kategori Dağılımı</v-card-title>
          <v-card-text>
            <div style="height: 300px;" class="d-flex align-center justify-center">
              <p class="text-grey">Grafik yükleniyor...</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activities -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Son İşlemler</v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item v-for="activity in recentActivities" :key="activity.id">
                <template v-slot:prepend>
                  <v-avatar :color="activity.color">
                    <v-icon>{{ activity.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ activity.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ activity.description }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-list-item-subtitle>{{ activity.time }}</v-list-item-subtitle>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const summaryCards = ref([
  {
    title: 'Toplam Bütçe',
    value: 5000000,
    trend: 12,
    icon: 'mdi-calculator',
    color: 'primary'
  },
  {
    title: 'Toplam Gider',
    value: 3250000,
    trend: -5,
    icon: 'mdi-cash-minus',
    color: 'error'
  },
  {
    title: 'Toplam Gelir',
    value: 4800000,
    trend: 8,
    icon: 'mdi-cash-plus',
    color: 'success'
  },
  {
    title: 'Bütçe Kullanımı',
    value: 65,
    trend: 3,
    icon: 'mdi-percent',
    color: 'warning'
  }
])

const recentActivities = ref([
  {
    id: 1,
    title: 'Yeni bütçe onaylandı',
    description: 'IT Departmanı 2024 Q1 bütçesi onaylandı',
    time: '2 saat önce',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    id: 2,
    title: 'Gider kaydı eklendi',
    description: 'Ofis malzemeleri alımı - 15,000 TL',
    time: '5 saat önce',
    icon: 'mdi-cash-minus',
    color: 'error'
  },
  {
    id: 3,
    title: 'Gelir kaydı eklendi',
    description: 'Hizmet geliri - 50,000 TL',
    time: '1 gün önce',
    icon: 'mdi-cash-plus',
    color: 'success'
  }
])

const formatCurrency = (value) => {
  if (typeof value === 'number' && value >= 100) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(value)
  }
  return value + '%'
}
</script>