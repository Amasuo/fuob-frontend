<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card class="pa-4">
      <v-card-title>{{ $t('app.login.forgot_password_title') }}</v-card-title>
      <v-card-text>
        <p class="mb-4 text-body-2 text-grey-darken-1">
          {{ $t('app.login.forgot_password_instructions') }}
        </p>
        <v-text-field
          v-model="email"
          :label="$t('app.login.email')"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => /.+@.+\..+/.test(v) || $t('app.login.email_invalid')]"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" @click="dialog = false">{{ $t('app.generic.cancel') }}</v-btn>
        <v-btn color="orange-darken-2" :loading="loading" @click="submit">
          {{ $t('app.login.send_link') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const dialog = ref(false)
const email = ref('')
const loading = ref(false)
const authStore = useAuthStore()

const submit = async () => {
  // Simple validation check before calling store
  if (!/.+@.+\..+/.test(email.value)) return

  loading.value = true
  const success = await authStore.forgotPassword(email.value)
  if (success) dialog.value = false
  loading.value = false
}

defineExpose({ open: () => (dialog.value = true) })
</script>
