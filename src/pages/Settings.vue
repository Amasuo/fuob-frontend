<template>
  <v-container class="py-8 px-6" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <h1 class="text-h4 font-weight-bold mb-6">{{ $t('app.settings') }}</h1>

        <v-card flat border class="rounded-lg mb-6 pa-6">
          <h2 class="text-h6 mb-4">{{ $t('app.language') }}</h2>
          <v-select
            v-model="user!.language_id"
            :items="languageStore.languages"
            item-title="name"
            item-value="id"
            variant="outlined"
            prepend-inner-icon="mdi-translate"
            hide-details
            @update:model-value="handleLanguageChange"
          ></v-select>
        </v-card>

        <v-card flat border class="rounded-lg mb-6 pa-6">
          <h2 class="text-h6 mb-4">{{ $t('app.security') }}</h2>
          <v-form ref="passwordForm" v-model="formValid">
            <v-text-field
              v-model="passwordData.current_password"
              :label="$t('app.current_password')"
              type="password"
              variant="outlined"
              :rules="[(v) => !!v || $t('app.required')]"
            ></v-text-field>

            <v-text-field
              v-model="passwordData.new_password"
              :label="$t('app.new_password')"
              type="password"
              variant="outlined"
              :rules="[
                (v) => !!v || $t('app.required'),
                (v) => v.length >= 8 || $t('app.password_min_length'),
              ]"
            ></v-text-field>

            <v-text-field
              v-model="passwordData.new_password_confirmation"
              :label="$t('app.confirm_new_password')"
              type="password"
              variant="outlined"
              :rules="[
                (v) => !!v || $t('app.required'),
                (v) => v === passwordData.new_password || $t('app.password_mismatch'),
              ]"
            ></v-text-field>

            <v-btn color="black" @click="updatePassword" :disabled="!formValid">
              {{ $t('app.update_password') }}
            </v-btn>
          </v-form>
        </v-card>

        <v-card flat border class="rounded-lg pa-6">
          <h2 class="text-h6 mb-4">{{ $t('app.profile_picture') }}</h2>
          <div class="d-flex align-center">
            <v-avatar size="80" class="mr-6 border">
              <v-img :src="imagePreview || user?.profile_image" cover></v-img>
            </v-avatar>
            <v-file-input
              :label="$t('app.upload_photo')"
              variant="outlined"
              density="comfortable"
              prepend-icon="mdi-camera"
              @change="onFileSelected"
            ></v-file-input>
          </div>
          <v-btn color="black" class="mt-4" @click="uploadImage">
            {{ $t('app.save_photo') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const { user } = storeToRefs(authStore)
const { locale } = useI18n()

const formValid = ref(false)
const passwordData = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

onMounted(async () => {
  await languageStore.fetchLanguages()
})

const handleLanguageChange = async (newId: number) => {
  const lang = languageStore.languages.find((l) => l.id === newId)
  if (lang) {
    // 1. Persist to Backend
    await authStore.updateLanguage(lang.id, lang.code)
    // 2. Update i18n
    locale.value = lang.code
    // 3. Persist to LocalStorage for persistence across sessions
    localStorage.setItem('user-locale', lang.code)
  }
}

const onFileSelected = (event: any) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

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
