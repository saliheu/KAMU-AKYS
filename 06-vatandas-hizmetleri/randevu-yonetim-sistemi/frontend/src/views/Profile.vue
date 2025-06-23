<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Profilim</h1>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Kişisel Bilgiler</v-card-title>
          <v-card-text>
            <v-form ref="profileForm">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.firstName"
                    label="Ad"
                    variant="outlined"
                    :disabled="!editMode"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.lastName"
                    label="Soyad"
                    variant="outlined"
                    :disabled="!editMode"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-text-field
                v-model="form.tcNo"
                label="TC Kimlik No"
                variant="outlined"
                disabled
              ></v-text-field>
              
              <v-text-field
                v-model="form.email"
                label="E-posta"
                variant="outlined"
                :disabled="!editMode"
              ></v-text-field>
              
              <v-text-field
                v-model="form.phone"
                label="Telefon"
                variant="outlined"
                :disabled="!editMode"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              v-if="!editMode"
              color="primary"
              @click="editMode = true"
            >
              Düzenle
            </v-btn>
            <template v-else>
              <v-btn @click="cancelEdit">İptal</v-btn>
              <v-btn color="success" @click="saveProfile" :loading="loading">
                Kaydet
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
        
        <v-card class="mt-4">
          <v-card-title>Şifre Değiştir</v-card-title>
          <v-card-text>
            <v-form ref="passwordForm">
              <v-text-field
                v-model="passwordForm.currentPassword"
                label="Mevcut Şifre"
                type="password"
                variant="outlined"
              ></v-text-field>
              
              <v-text-field
                v-model="passwordForm.newPassword"
                label="Yeni Şifre"
                type="password"
                variant="outlined"
              ></v-text-field>
              
              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Yeni Şifre (Tekrar)"
                type="password"
                variant="outlined"
                :rules="[passwordMatch]"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="changePassword" :loading="passwordLoading">
              Şifreyi Değiştir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Hesap Durumu</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>E-posta Doğrulama</v-list-item-title>
                <template v-slot:append>
                  <v-icon :color="user?.emailVerified ? 'success' : 'error'">
                    {{ user?.emailVerified ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Telefon Doğrulama</v-list-item-title>
                <template v-slot:append>
                  <v-icon :color="user?.phoneVerified ? 'success' : 'error'">
                    {{ user?.phoneVerified ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import api from '@/services/api'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    
    const editMode = ref(false)
    const loading = ref(false)
    const passwordLoading = ref(false)
    
    const user = computed(() => store.state.auth.user)
    
    const form = ref({
      firstName: '',
      lastName: '',
      tcNo: '',
      email: '',
      phone: ''
    })
    
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    onMounted(() => {
      if (user.value) {
        form.value = {
          firstName: user.value.firstName,
          lastName: user.value.lastName,
          tcNo: user.value.tcNo,
          email: user.value.email,
          phone: user.value.phone
        }
      }
    })
    
    const passwordMatch = () => {
      return passwordForm.value.newPassword === passwordForm.value.confirmPassword || 'Şifreler eşleşmiyor'
    }
    
    const cancelEdit = () => {
      editMode.value = false
      form.value = {
        firstName: user.value.firstName,
        lastName: user.value.lastName,
        tcNo: user.value.tcNo,
        email: user.value.email,
        phone: user.value.phone
      }
    }
    
    const saveProfile = async () => {
      loading.value = true
      try {
        await api.put('/users/profile', form.value)
        await store.dispatch('auth/fetchCurrentUser')
        editMode.value = false
        store.dispatch('showSnackbar', {
          text: 'Profil başarıyla güncellendi',
          color: 'success'
        })
      } catch (error) {
        store.dispatch('showSnackbar', {
          text: 'Profil güncellenemedi',
          color: 'error'
        })
      }
      loading.value = false
    }
    
    const changePassword = async () => {
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        return
      }
      
      passwordLoading.value = true
      try {
        await api.put('/users/change-password', {
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        })
        
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        
        store.dispatch('showSnackbar', {
          text: 'Şifre başarıyla değiştirildi',
          color: 'success'
        })
      } catch (error) {
        store.dispatch('showSnackbar', {
          text: error.response?.data?.message || 'Şifre değiştirilemedi',
          color: 'error'
        })
      }
      passwordLoading.value = false
    }
    
    return {
      editMode,
      loading,
      passwordLoading,
      user,
      form,
      passwordForm,
      passwordMatch,
      cancelEdit,
      saveProfile,
      changePassword
    }
  }
}
</script>