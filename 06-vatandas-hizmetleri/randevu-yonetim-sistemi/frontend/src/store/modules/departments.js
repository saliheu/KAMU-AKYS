import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    departments: [],
    services: []
  },
  mutations: {
    SET_DEPARTMENTS(state, departments) {
      state.departments = departments
    },
    SET_SERVICES(state, services) {
      state.services = services
    }
  },
  actions: {
    async fetchDepartments({ commit }) {
      try {
        const response = await api.get('/departments')
        commit('SET_DEPARTMENTS', response.data)
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    },
    
    async fetchServices({ commit }, departmentId) {
      try {
        const params = departmentId ? { departmentId } : {}
        const response = await api.get('/services', { params })
        commit('SET_SERVICES', response.data)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
  }
}