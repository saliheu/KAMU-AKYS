import api from './api'

export default {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },

  register(data) {
    return api.post('/auth/register', data)
  },

  getProfile() {
    return api.get('/auth/profile')
  },

  updateProfile(data) {
    return api.put('/auth/profile', data)
  },

  changePassword(data) {
    return api.post('/auth/change-password', data)
  }
}