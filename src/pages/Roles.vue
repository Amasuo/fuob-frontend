<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.roles.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ $t('app.roles.description') }}
          </p>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table
            :headers="translatedHeaders"
            :items="roleStore.roles"
            :loading="roleStore.loading"
            hover
            class="bg-transparent"
          >
            <template #[`item.name`]="{ item }">
              <div class="d-flex align-center py-3">
                <v-avatar size="36" color="grey-lighten-4" class="mr-4">
                  <v-icon color="grey-darken-3">{{ item.icon || 'mdi-account' }}</v-icon>
                </v-avatar>
                <span
                  class="font-weight-bold text-uppercase text-body-2"
                  style="letter-spacing: 0.5px"
                >
                  {{ item.display_name }}
                </span>
              </div>
            </template>

            <template #[`item.description`]="{ item }">
              <span class="text-body-2 text-grey-darken-1">
                {{ item.description || $t('app.roles.no_description') }}
              </span>
            </template>

            <template #[`item.permissions`]="{ item }">
              <div class="d-flex flex-wrap py-2" style="gap: 4px; max-width: 450px">
                <v-chip
                  v-for="perm in item.permissions"
                  :key="perm.id"
                  size="x-small"
                  variant="tonal"
                  color="orange-darken-2"
                  class="font-weight-bold"
                >
                  {{ perm.name.toUpperCase().replace(/-/g, ' ') }}
                  <v-tooltip activator="parent" location="top" open-delay="200" max-width="250">
                    <div class="text-caption">
                      {{ perm.description || $t('app.roles.no_permission_desc') }}
                    </div>
                  </v-tooltip>
                </v-chip>
              </div>
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
import { useRoleStore } from '@/stores/role'

const { t } = useI18n()
const roleStore = useRoleStore()

const translatedHeaders = computed(() => [
  { title: t('app.roles.headers.name'), key: 'name', width: '200px' },
  {
    title: t('app.roles.headers.description'),
    key: 'description',
    width: '250px',
    sortable: false,
  },
  { title: t('app.roles.headers.permissions'), key: 'permissions', sortable: false },
])

onMounted(() => {
  roleStore.fetchRoles()
})
</script>
