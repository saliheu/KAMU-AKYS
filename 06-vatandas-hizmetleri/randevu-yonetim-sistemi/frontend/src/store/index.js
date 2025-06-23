import { createStore } from 'vuex'
import auth from './modules/auth'
import appointments from './modules/appointments'
import departments from './modules/departments'

export default createStore({
  state: {
    snackbar: {
      show: false,
      text: '',
      color: 'success'
    }
  },
  mutations: {
    SHOW_SNACKBAR(state, { text, color = 'success' }) {
      state.snackbar = {
        show: true,
        text,
        color
      }
    }
  },
  actions: {
    showSnackbar({ commit }, payload) {
      commit('SHOW_SNACKBAR', payload)
    }
  },
  modules: {
    auth,
    appointments,
    departments
  }
})