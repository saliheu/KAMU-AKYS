import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    user: null,
    token: localStorage.getItem('token')
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await api.post('/auth/login', credentials)
        const { user, token } = response.data
        
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        
        return { success: true }
      } catch (error) {
        dispatch('showSnackbar', {
          text: error.response?.data?.message || 'Giriş başarısız',
          color: 'error'
        }, { root: true })
        return { success: false }
      }
    },
    
    async register({ commit, dispatch }, userData) {
      try {
        const response = await api.post('/auth/register', userData)
        const { user, token } = response.data
        
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        
        dispatch('showSnackbar', {
          text: 'Kayıt başarılı',
          color: 'success'
        }, { root: true })
        
        return { success: true }
      } catch (error) {
        dispatch('showSnackbar', {
          text: error.response?.data?.message || 'Kayıt başarısız',
          color: 'error'
        }, { root: true })
        return { success: false }
      }
    },
    
    async fetchCurrentUser({ commit }) {
      try {
        const response = await api.get('/auth/me')
        commit('SET_USER', response.data.user)
      } catch (error) {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      }
    },
    
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    user: state => state.user,
    userRole: state => state.user?.role,
    userFullName: state => state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
  }
}