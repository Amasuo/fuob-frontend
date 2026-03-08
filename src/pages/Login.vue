<template>
  <v-container fluid class="pa-0 fill-height">
    <v-row density="compact" class="fill-height ma-0">
      <v-col
        cols="12"
        md="6"
        class="bg-grey-lighten-4 d-none d-md-flex flex-column align-center pa-0"
      >
        <div class="flex-grow-1 d-flex align-center justify-center w-100 px-12">
          <v-img
            src="/login.jpg"
            max-height="450"
            width="100%"
            contain
            alt="Leave Management Illustration"
          ></v-img>
        </div>

        <div class="text-center px-12 pb-12">
          <h2 class="text-h4 font-weight-bold mb-4" style="color: #2c3e50">
            {{ $t('app.login.title') }}
          </h2>
          <p
            class="text-subtitle-1 text-grey-darken-1 mx-auto"
            style="max-width: 480px; line-height: 1.6"
          >
            {{ $t('app.login.subtitle') }}
          </p>

          <div class="d-flex justify-center mt-8">
            <div class="dot active"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6" class="d-flex align-center justify-center bg-white">
        <v-card flat width="420" class="pa-6">
          <div class="text-center mb-10">
            <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.login.welcome') }}</h1>
            <p class="text-body-2 text-grey-darken-1">{{ $t('app.login.credentials_prompt') }}</p>
          </div>

          <v-form v-model="isFormValid" @submit.prevent="handleLogin">
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-bold mb-1 d-block">{{
                $t('app.login.email')
              }}</label>
              <v-text-field
                v-model="form.email"
                :placeholder="$t('app.login.email_placeholder')"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                color="orange-darken-2"
                :rules="[
                  (v) => !!v || $t('app.login.email_required'),
                  (v) => /.+@.+\..+/.test(v) || $t('app.login.email_invalid'),
                ]"
                required
              ></v-text-field>
            </div>

            <div class="mb-2">
              <label class="text-subtitle-2 font-weight-bold mb-1 d-block">{{
                $t('app.login.password')
              }}</label>
              <v-text-field
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                color="orange-darken-2"
                :rules="[(v) => !!v || $t('app.login.password_required')]"
                required
              ></v-text-field>
            </div>

            <div class="d-flex align-center justify-space-between mb-8">
              <v-checkbox
                :label="$t('app.login.remember_me')"
                hide-details
                density="compact"
                color="orange-darken-2"
              ></v-checkbox>
              <a
                href="#"
                class="text-caption text-decoration-none text-grey-darken-2 font-weight-medium"
              >
                {{ $t('app.login.forgot_password') }}
              </a>
            </div>

            <v-btn
              block
              color="grey-darken-4"
              size="x-large"
              type="submit"
              class="text-none font-weight-bold"
              elevation="0"
              :loading="loading"
              :disabled="!isFormValid"
            >
              {{ $t('app.login.action') }}
              <v-icon end icon="mdi-arrow-right" size="small"></v-icon>
            </v-btn>

            <v-alert
              v-if="authStore.loginFailed"
              type="error"
              variant="tonal"
              class="mt-4"
              density="compact"
            >
              {{ $t('app.login.error_invalid') }}
            </v-alert>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const isFormValid = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  if (!isFormValid.value) return
  loading.value = true
  try {
    // Calling the authStore action
    await authStore.login({ value: form })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
  min-height: 650px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #d1d1d1;
  border-radius: 50%;
  margin: 0 6px;
}

.dot.active {
  width: 28px;
  background-color: #f4511e;
  border-radius: 10px;
}

.ma-0 {
  margin: 0 !important;
}
</style>

<route lang="yaml">
meta:
  layout: blank
</route>
