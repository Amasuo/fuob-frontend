<template>
  <v-container class="py-8 px-6" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <h1 class="text-h4 font-weight-bold mb-6">Account Settings</h1>

        <v-card flat border class="rounded-lg mb-6 pa-6">
          <h2 class="text-h6 mb-4">Security</h2>
          <v-form ref="passwordForm" v-model="formValid">
            <v-text-field
              v-model="passwordData.current_password"
              label="Current Password"
              type="password"
              variant="outlined"
              :rules="[(v) => !!v || 'Required']"
            ></v-text-field>

            <v-text-field
              v-model="passwordData.new_password"
              label="New Password"
              type="password"
              variant="outlined"
              :rules="[
                (v) => !!v || 'Required',
                (v) => v.length >= 8 || 'Must be at least 8 characters',
              ]"
            ></v-text-field>

            <v-text-field
              v-model="passwordData.new_password_confirmation"
              label="Confirm New Password"
              type="password"
              variant="outlined"
              :rules="[
                (v) => !!v || 'Required',
                (v) => v === passwordData.new_password || 'Passwords do not match',
              ]"
            ></v-text-field>

            <v-btn color="black" @click="updatePassword" :disabled="!formValid">
              Update Password
            </v-btn>
          </v-form>
        </v-card>

        <v-card flat border class="rounded-lg pa-6">
          <h2 class="text-h6 mb-4">Profile Picture</h2>
          <div class="d-flex align-center">
            <v-avatar size="80" class="mr-6 border">
              <v-img :src="imagePreview || user?.profile_image" cover></v-img>
            </v-avatar>
            <v-file-input
              label="Upload new photo"
              variant="outlined"
              density="comfortable"
              prepend-icon="mdi-camera"
              @change="onFileSelected"
            ></v-file-input>
          </div>
          <v-btn color="black" class="mt-4" @click="uploadImage">Save Photo</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const formValid = ref(false)
const passwordData = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const onFileSelected = (event: any) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// In Settings.vue
const updatePassword = async () => {
  const result = await authStore.updatePassword(passwordData)
  if (result.success) {
    passwordData.current_password = ''
    passwordData.new_password = ''
    passwordData.new_password_confirmation = ''
  }
}

const uploadImage = async () => {
  if (selectedFile.value) {
    await authStore.updateProfileImage(selectedFile.value)
    imagePreview.value = null
  }
}
</script>
