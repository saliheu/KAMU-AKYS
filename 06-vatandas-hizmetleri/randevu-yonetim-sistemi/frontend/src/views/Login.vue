<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-h5 text-center">
            Giriş Yap
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="form.tcNo"
                label="TC Kimlik No"
                :rules="[rules.required, rules.tcNo]"
                prepend-icon="mdi-card-account-details"
                variant="outlined"
                class="mb-2"
              ></v-text-field>
              
              <v-text-field
                v-model="form.password"
                label="Şifre"
                :rules="[rules.required]"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                variant="outlined"
              ></v-text-field>
              
              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
                class="mt-4"
              >
                Giriş Yap
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="$router.push('/register')">
              Hesabınız yok mu? Kayıt olun
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const form = ref({
      tcNo: '',
      password: ''
    })
    
    const showPassword = ref(false)
    const loading = ref(false)
    
    const rules = {
      required: v => !!v || 'Bu alan zorunludur',
      tcNo: v => /^[0-9]{11}$/.test(v) || 'Geçerli bir TC Kimlik No giriniz'
    }
    
    const handleLogin = async () => {
      loading.value = true
      const result = await store.dispatch('auth/login', form.value)
      loading.value = false
      
      if (result.success) {
        router.push('/')
      }
    }
    
    return {
      form,
      showPassword,
      loading,
      rules,
      handleLogin
    }
  }
}
</script>