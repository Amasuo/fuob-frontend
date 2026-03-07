<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.languages.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ $t('app.languages.description') }}
          </p>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table
            :headers="translatedHeaders"
            :items="languageStore.languages"
            :loading="languageStore.loading"
            hover
            class="bg-transparent"
          >
            <template #[`item.code`]="{ item }">
              <v-chip size="small" variant="flat" color="grey-lighten-3" class="font-weight-bold">
                {{ item.code.toUpperCase() }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

const { t } = useI18n()
const languageStore = useLanguageStore()

// Headers must be computed so they react to language changes
const translatedHeaders = computed(() => [
  { title: t('app.languages.name_header'), key: 'name' },
  { title: t('app.languages.code_header'), key: 'code', align: 'center' as const },
])

onMounted(() => {
  languageStore.fetchLanguages()
})
</script>
