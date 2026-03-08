<template>
  <v-container fluid class="pa-0 fill-height d-flex align-center justify-center bg-grey-lighten-4">
    <v-card flat width="400" class="pa-8">
      <h2 class="text-h5 font-weight-bold mb-6">{{ $t('app.update_password') }}</h2>

      <v-form v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.password"
          type="password"
          :label="$t('app.new_password')"
          variant="outlined"
          density="comfortable"
          :rules="[
            (v) => !!v || $t('app.generic.required'),
            (v) => v.length >= 8 || $t('app.password_min_length'),
          ]"
        ></v-text-field>

        <v-text-field
          v-model="form.password_confirmation"
          type="password"
          :label="$t('app.confirm_new_password')"
          variant="outlined"
          density="comfortable"
          :rules="[
            (v) => !!v || $t('app.generic.required'),
            (v) => v === form.password || $t('app.password_mismatch'),
          ]"
        ></v-text-field>

        <v-btn
          block
          color="orange-darken-2"
          size="large"
          type="submit"
          class="mt-4"
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ $t('app.update_password') }}
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const isFormValid = ref(false)

const form = reactive({
  email: route.query.email as string,
  token: route.query.token as string,
  password: '',
  password_confirmation: '',
})

const handleSubmit = async () => {
  if (!isFormValid.value) return
  loading.value = true

  const success = await authStore.resetPassword(form)
  if (success) {
    router.push('/login')
  }
  loading.value = false
}
</script>

<route lang="yaml">
meta:
  layout: blank
</route>
