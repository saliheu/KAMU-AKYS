import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    appointments: [],
    currentAppointment: null,
    availableSlots: []
  },
  mutations: {
    SET_APPOINTMENTS(state, appointments) {
      state.appointments = appointments
    },
    SET_CURRENT_APPOINTMENT(state, appointment) {
      state.currentAppointment = appointment
    },
    SET_AVAILABLE_SLOTS(state, slots) {
      state.availableSlots = slots
    }
  },
  actions: {
    async fetchMyAppointments({ commit }) {
      try {
        const response = await api.get('/appointments/my-appointments')
        commit('SET_APPOINTMENTS', response.data)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    },
    
    async fetchAppointmentById({ commit }, id) {
      try {
        const response = await api.get(`/appointments/${id}`)
        commit('SET_CURRENT_APPOINTMENT', response.data)
      } catch (error) {
        console.error('Error fetching appointment:', error)
      }
    },
    
    async fetchAvailableSlots({ commit }, { departmentId, serviceId, date }) {
      try {
        const response = await api.get('/appointments/available-slots', {
          params: { departmentId, serviceId, date }
        })
        commit('SET_AVAILABLE_SLOTS', response.data)
      } catch (error) {
        console.error('Error fetching available slots:', error)
      }
    },
    
    async createAppointment({ dispatch }, appointmentData) {
      try {
        await api.post('/appointments', appointmentData)
        dispatch('showSnackbar', {
          text: 'Randevu başarıyla oluşturuldu',
          color: 'success'
        }, { root: true })
        return { success: true }
      } catch (error) {
        dispatch('showSnackbar', {
          text: error.response?.data?.message || 'Randevu oluşturulamadı',
          color: 'error'
        }, { root: true })
        return { success: false }
      }
    },
    
    async cancelAppointment({ dispatch }, { id, reason }) {
      try {
        await api.put(`/appointments/${id}/cancel`, { reason })
        dispatch('showSnackbar', {
          text: 'Randevu başarıyla iptal edildi',
          color: 'success'
        }, { root: true })
        return { success: true }
      } catch (error) {
        dispatch('showSnackbar', {
          text: error.response?.data?.message || 'Randevu iptal edilemedi',
          color: 'error'
        }, { root: true })
        return { success: false }
      }
    }
  }
}