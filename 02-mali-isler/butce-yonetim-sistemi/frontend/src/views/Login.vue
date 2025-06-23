<template>
  <v-container fluid class="fill-height bg-grey-lighten-4">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="12">
          <v-card-title class="text-h4 text-center py-8">
            <v-icon size="48" color="primary" class="mb-4">mdi-calculator</v-icon>
            <br>
            Bütçe Yönetim Sistemi
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin" v-model="valid">
              <v-text-field
                v-model="form.username"
                label="Kullanıcı Adı"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required]"
                class="mb-3"
              />

              <v-text-field
                v-model="form.password"
                label="Şifre"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required]"
                class="mb-3"
              />

              <v-checkbox
                v-model="rememberMe"
                label="Beni hatırla"
                color="primary"
              />

              <v-btn
                type="submit"
                block
                size="large"
                color="primary"
                :loading="authStore.loading"
                :disabled="!valid"
              >
                Giriş Yap
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center pb-4">
            <v-btn variant="text" size="small">
              Şifremi Unuttum
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const valid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const form = ref({
  username: '',
  password: ''
})

const rules = {
  required: v => !!v || 'Bu alan zorunludur'
}

const handleLogin = async () => {
  if (!valid.value) return

  try {
    await authStore.login(form.value)
    router.push('/')
  } catch (error) {
    // Error is handled in the store
  }
}
</script>