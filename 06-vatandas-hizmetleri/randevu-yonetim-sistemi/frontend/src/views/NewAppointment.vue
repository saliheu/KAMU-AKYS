<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Yeni Randevu</h1>
      </v-col>
    </v-row>
    
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-item :complete="step > 1" value="1">
          Departman Seçimi
        </v-stepper-item>
        <v-divider></v-divider>
        <v-stepper-item :complete="step > 2" value="2">
          Hizmet Seçimi
        </v-stepper-item>
        <v-divider></v-divider>
        <v-stepper-item :complete="step > 3" value="3">
          Tarih ve Saat
        </v-stepper-item>
        <v-divider></v-divider>
        <v-stepper-item value="4">
          Onay
        </v-stepper-item>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item value="1">
          <v-card flat>
            <v-card-text>
              <v-row>
                <v-col v-for="dept in departments" :key="dept._id" cols="12" sm="6" md="4">
                  <v-card
                    :color="selectedDepartment?._id === dept._id ? 'primary' : ''"
                    @click="selectDepartment(dept)"
                    style="cursor: pointer"
                  >
                    <v-card-title>{{ dept.name }}</v-card-title>
                    <v-card-subtitle>{{ dept.description }}</v-card-subtitle>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item value="2">
          <v-card flat>
            <v-card-text>
              <v-row>
                <v-col v-for="service in services" :key="service._id" cols="12" sm="6">
                  <v-card
                    :color="selectedService?._id === service._id ? 'primary' : ''"
                    @click="selectService(service)"
                    style="cursor: pointer"
                  >
                    <v-card-title>{{ service.name }}</v-card-title>
                    <v-card-subtitle>{{ service.description }}</v-card-subtitle>
                    <v-card-text>
                      <v-chip size="small">{{ service.duration }} dakika</v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item value="3">
          <v-card flat>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-date-picker
                    v-model="selectedDate"
                    :min="minDate"
                    :max="maxDate"
                    @update:model-value="fetchSlots"
                  ></v-date-picker>
                </v-col>
                <v-col cols="12" md="6">
                  <h3 class="mb-4">Uygun Saatler</h3>
                  <v-chip-group v-model="selectedSlot" column>
                    <v-chip
                      v-for="(slot, index) in availableSlots"
                      :key="index"
                      :value="slot"
                      color="primary"
                      filter
                    >
                      {{ slot.start }}
                    </v-chip>
                  </v-chip-group>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item value="4">
          <v-card flat>
            <v-card-title>Randevu Özeti</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <v-list-item-title>Departman</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedDepartment?.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Hizmet</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedService?.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Tarih</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedDate) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Saat</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSlot?.start }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-textarea
                v-model="notes"
                label="Notlar (İsteğe bağlı)"
                rows="3"
                variant="outlined"
                class="mt-4"
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-card-actions>
        <v-btn v-if="step > 1" @click="step--">Geri</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="step < 4"
          color="primary"
          @click="nextStep"
          :disabled="!canProceed"
        >
          İleri
        </v-btn>
        <v-btn
          v-if="step === 4"
          color="success"
          @click="createAppointment"
          :loading="loading"
        >
          Randevu Oluştur
        </v-btn>
      </v-card-actions>
    </v-stepper>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'NewAppointment',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const step = ref(1)
    const selectedDepartment = ref(null)
    const selectedService = ref(null)
    const selectedDate = ref(null)
    const selectedSlot = ref(null)
    const notes = ref('')
    const loading = ref(false)
    
    const departments = computed(() => store.state.departments.departments)
    const services = computed(() => store.state.departments.services)
    const availableSlots = computed(() => store.state.appointments.availableSlots)
    
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + 1)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    
    onMounted(() => {
      store.dispatch('departments/fetchDepartments')
    })
    
    const selectDepartment = (dept) => {
      selectedDepartment.value = dept
      store.dispatch('departments/fetchServices', dept._id)
    }
    
    const selectService = (service) => {
      selectedService.value = service
    }
    
    const fetchSlots = () => {
      if (selectedDepartment.value && selectedService.value && selectedDate.value) {
        store.dispatch('appointments/fetchAvailableSlots', {
          departmentId: selectedDepartment.value._id,
          serviceId: selectedService.value._id,
          date: selectedDate.value
        })
      }
    }
    
    const canProceed = computed(() => {
      switch (step.value) {
        case 1: return !!selectedDepartment.value
        case 2: return !!selectedService.value
        case 3: return !!selectedDate.value && !!selectedSlot.value
        default: return true
      }
    })
    
    const nextStep = () => {
      if (canProceed.value) {
        step.value++
      }
    }
    
    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('tr-TR') : ''
    }
    
    const createAppointment = async () => {
      loading.value = true
      const result = await store.dispatch('appointments/createAppointment', {
        departmentId: selectedDepartment.value._id,
        serviceId: selectedService.value._id,
        date: selectedDate.value,
        timeSlot: selectedSlot.value,
        notes: notes.value
      })
      loading.value = false
      
      if (result.success) {
        router.push('/appointments')
      }
    }
    
    return {
      step,
      selectedDepartment,
      selectedService,
      selectedDate,
      selectedSlot,
      notes,
      loading,
      departments,
      services,
      availableSlots,
      minDate,
      maxDate,
      selectDepartment,
      selectService,
      fetchSlots,
      canProceed,
      nextStep,
      formatDate,
      createAppointment
    }
  }
}
</script>