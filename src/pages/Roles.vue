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
            hide-default-footer
            class="bg-transparent cursor-pointer"
            @click:row="(_e, { item }) => openEditDialog(item)"
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

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-end">
                <v-btn icon variant="text" size="small" @click.stop="openEditDialog(item)">
                  <v-icon color="blue-darken-2">mdi-pencil-outline</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editDialog" max-width="400px" persistent>
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="font-weight-bold text-h5 mb-2">
          {{ $t('app.roles.edit_role', { name: roleForm.display_name }) }}
        </v-card-title>

        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <p class="text-subtitle-2 mb-2 text-grey-darken-1">
                {{ $t('app.roles.select_icon') }}
              </p>
              <IconPicker v-model="roleForm.icon" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="d-flex flex-nowrap pt-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">{{ $t('app.cancel') }}</v-btn>
          <v-btn color="black" variant="flat" :loading="isSaving" @click="saveRole">
            {{ $t('app.save_changes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoleStore } from '@/stores/role'
import IconPicker from '@/components/IconPicker.vue'

const { t } = useI18n()
const roleStore = useRoleStore()
const editDialog = ref(false)
const isSaving = ref(false)

const roleForm = reactive({
  id: null,
  display_name: '',
  icon: '',
})

const translatedHeaders = computed(() => [
  { title: t('app.roles.headers.name'), key: 'name', width: '200px' },
  {
    title: t('app.roles.headers.description'),
    key: 'description',
    width: '250px',
    sortable: false,
  },
  { title: t('app.roles.headers.permissions'), key: 'permissions', sortable: false },
  { title: t('app.roles.headers.actions'), key: 'actions', align: 'end' as const, sortable: false },
])

onMounted(() => roleStore.fetchRoles())

const openEditDialog = (item: any) => {
  Object.assign(roleForm, {
    id: item.id,
    display_name: item.display_name,
    icon: item.icon || 'mdi-account',
  })
  editDialog.value = true
}

const saveRole = async () => {
  if (!roleForm.id) return

  isSaving.value = true
  try {
    await roleStore.updateRole(roleForm.id, { icon: roleForm.icon })
    await roleStore.fetchRoles()
    editDialog.value = false
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}
</style>
