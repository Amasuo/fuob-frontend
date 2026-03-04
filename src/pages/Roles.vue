<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Role Management</h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            View access levels, specific system permissions and manage icons and descriptions.
          </p>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table
            :headers="headers"
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
                  {{ formatRoleName(item.name) }}
                </span>
              </div>
            </template>

            <template #[`item.description`]="{ item }">
              <span class="text-body-2 text-grey-darken-1">
                {{ item.description || 'No description set.' }}
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
                      {{ perm.description || 'No description available for this permission.' }}
                    </div>
                  </v-tooltip>
                </v-chip>

                <span
                  v-if="!item.permissions?.length"
                  class="text-caption text-grey-lighten-1 italic"
                >
                  No permissions assigned
                </span>
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

    <v-dialog v-model="editDialog" max-width="600px" persistent>
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="font-weight-bold text-h5 mb-2">
          Edit Role: {{ formatRoleName(roleForm.name) }}
        </v-card-title>

        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-textarea
                v-model="roleForm.description"
                label="Access Description"
                variant="outlined"
                rows="3"
                auto-grow
                prepend-inner-icon="mdi-text-subject"
                class="mb-4"
                hide-details
              ></v-textarea>
            </v-col>

            <v-col cols="12">
              <p class="text-subtitle-2 mb-2 text-grey-darken-1">Select Display Icon</p>
              <IconPicker v-model="roleForm.icon" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="black" variant="flat" :loading="isSaving" @click="saveRole">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoleStore } from '@/stores/role'
import IconPicker from '@/components/IconPicker.vue'

const roleStore = useRoleStore()
const editDialog = ref(false)
const isSaving = ref(false)

const roleForm = reactive({
  id: null,
  name: '',
  icon: '',
  description: '',
})

const headers = [
  { title: 'Role Name', key: 'name', width: '200px' },
  { title: 'Description', key: 'description', width: '250px', sortable: false },
  { title: 'Permissions', key: 'permissions', sortable: false },
  { title: 'Actions', key: 'actions', align: 'end' as const, sortable: false },
]

onMounted(() => roleStore.fetchRoles())

const formatRoleName = (name: string) => {
  if (!name) return ''
  const val = name.toLowerCase()
  return val === 'hr' ? 'HR' : val.charAt(0).toUpperCase() + val.slice(1)
}

const openEditDialog = (item: any) => {
  Object.assign(roleForm, {
    id: item.id,
    name: item.name,
    icon: item.icon || 'mdi-account',
    description: item.description || '',
  })
  editDialog.value = true
}

const saveRole = async () => {
  if (!roleForm.id) return

  isSaving.value = true
  try {
    await roleStore.updateRole(roleForm.id, {
      icon: roleForm.icon,
      description: roleForm.description,
    })

    // Refresh the API to reflect changes in the table
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
