<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-h5 text-center">
            Kayıt Ol
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister" ref="form">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.firstName"
                    label="Ad"
                    :rules="[rules.required]"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.lastName"
                    label="Soyad"
                    :rules="[rules.required]"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-text-field
                v-model="form.tcNo"
                label="TC Kimlik No"
                :rules="[rules.required, rules.tcNo]"
                variant="outlined"
                class="mb-2"
              ></v-text-field>
              
              <v-text-field
                v-model="form.email"
                label="E-posta"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                class="mb-2"
              ></v-text-field>
              
              <v-text-field
                v-model="form.phone"
                label="Telefon"
                :rules="[rules.required, rules.phone]"
                variant="outlined"
                class="mb-2"
              ></v-text-field>
              
              <v-text-field
                v-model="form.password"
                label="Şifre"
                :rules="[rules.required, rules.password]"
                :type="showPassword ? 'text' : 'password'"
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
                Kayıt Ol
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="$router.push('/login')">
              Zaten hesabınız var mı? Giriş yapın
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
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const form = ref({
      firstName: '',
      lastName: '',
      tcNo: '',
      email: '',
      phone: '',
      password: ''
    })
    
    const showPassword = ref(false)
    const loading = ref(false)
    
    const rules = {
      required: v => !!v || 'Bu alan zorunludur',
      tcNo: v => /^[0-9]{11}$/.test(v) || 'Geçerli bir TC Kimlik No giriniz',
      email: v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta adresi giriniz',
      phone: v => /^[0-9]{10}$/.test(v) || 'Telefon numarası 10 haneli olmalıdır',
      password: v => v.length >= 6 || 'Şifre en az 6 karakter olmalıdır'
    }
    
    const handleRegister = async () => {
      loading.value = true
      const result = await store.dispatch('auth/register', form.value)
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
      handleRegister
    }
  }
}
</script>