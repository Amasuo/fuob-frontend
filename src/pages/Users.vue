<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">User Management</h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            Strongly typed directory with modular role management.
          </p>
        </div>
        <div class="d-flex align-center" style="gap: 16px">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search users..."
            variant="outlined"
            density="comfortable"
            hide-details
            style="width: 300px"
            @input="onSearchInput"
          ></v-text-field>

          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            Add User
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="userStore.users"
            :items-length="userStore.totalItems"
            :loading="userStore.loading"
            :search="search"
            hover
            class="bg-transparent cursor-pointer"
            @update:options="loadItems"
            @click:row="(_e, { item }) => editUser(item as User)"
          >
            <template #[`item.firstname`]="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar
                  size="40"
                  :color="item.profile_image ? 'transparent' : 'orange-lighten-4'"
                  :class="{ 'border-avatar': item.profile_image }"
                  class="mr-3"
                >
                  <v-img
                    v-if="item.profile_image"
                    :src="item.profile_image"
                    alt="avatar"
                    cover
                  ></v-img>
                  <span v-else class="text-caption font-weight-bold text-orange-darken-4">
                    {{ item.firstname[0] }}{{ item.lastname[0] }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ (item as User).fullname }}</div>
                  <div class="text-caption text-grey">{{ (item as User).email }}</div>
                </div>
              </div>
            </template>

            <template #[`item.role`]="{ item }">
              <v-chip size="x-small" variant="flat" color="grey-lighten-3" class="pr-2">
                <v-icon start size="14" class="mr-1">
                  {{ getRoleIcon(getUserRole(item as User)) }}
                </v-icon>
                {{ formatRoleName(getUserRole(item as User)) }}
              </v-chip>
            </template>

            <template #[`item.is_active`]="{ item }">
              <v-chip
                size="small"
                :color="(item as User).is_active ? 'green' : 'grey'"
                variant="tonal"
              >
                {{ (item as User).is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="blue-darken-2"
                  class="mr-2"
                  @click.stop="editUser(item as User)"
                >
                  <v-icon size="20">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="red-lighten-1"
                  @click.stop="confirmDelete(item as User)"
                >
                  <v-icon size="20">mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card class="rounded-lg pa-4">
        <v-card-title class="font-weight-bold">
          {{ isEdit ? 'Edit User' : 'New User' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row dense>
              <v-col cols="12" class="d-flex justify-center mb-6">
                <div class="text-center">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-avatar
                      size="100"
                      color="grey-lighten-4"
                      class="position-relative cursor-pointer border-avatar"
                      v-bind="props"
                      @click="triggerFileInput"
                    >
                      <v-img v-if="imagePreview" :src="imagePreview" cover></v-img>
                      <v-icon v-else size="40" color="grey">mdi-camera</v-icon>

                      <v-overlay
                        :model-value="isHovering"
                        contained
                        scrim="black"
                        class="align-center justify-center"
                      >
                        <v-icon color="white">mdi-upload</v-icon>
                      </v-overlay>
                    </v-avatar>
                  </v-hover>
                  <input
                    type="file"
                    ref="fileInput"
                    class="d-none"
                    accept="image/*"
                    @change="onFileSelected"
                  />
                  <div class="text-caption mt-2 text-grey">Click to upload photo</div>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.firstname"
                  label="First Name"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.lastname"
                  label="Last Name"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" :sm="isEdit ? 12 : 6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                ></v-text-field>
              </v-col>
              <v-col v-if="!isEdit" cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.password"
                  label="Password"
                  variant="outlined"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) => (v && v.length >= 8) || 'Min 8 characters',
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-select
                  v-model="currentRole"
                  :items="roleStore.roles"
                  :item-title="(item) => formatRoleName(item.name)"
                  item-value="name"
                  label="Role"
                  variant="outlined"
                  :loading="roleStore.loading"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :prepend-icon="item.raw.icon"></v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.employee_number"
                  label="Employee Number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="d-flex align-center px-4">
                <v-switch
                  v-model="editedItem.is_active"
                  :label="editedItem.is_active ? 'Status: Active' : 'Status: Inactive'"
                  color="green"
                  inset
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.birth_date"
                  label="Birth Date"
                  type="date"
                  variant="outlined"
                  persistent-placeholder
                  :rules="[validateBirthDate]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.hire_date"
                  label="Hire Date"
                  type="date"
                  variant="outlined"
                  persistent-placeholder
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.cycle_start_date"
                  label="Cycle Start Date"
                  type="date"
                  variant="outlined"
                  persistent-placeholder
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="black" :loading="userStore.saving" @click="handleSave">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoleStore } from '@/stores/role'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'

const userStore = useUserStore()
const roleStore = useRoleStore()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const dialog = ref(false)
const isEdit = ref(false)
const showPassword = ref(false)
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const searchQuery = ref('')
const search = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const headers = [
  { title: 'User', key: 'firstname' },
  { title: 'ID Number', key: 'employee_number' },
  { title: 'Role', key: 'role', sortable: false },
  { title: 'Status', key: 'is_active', align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const editedItem = reactive<User & { password?: string; profile_image?: string }>({
  id: null,
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  employee_number: '',
  is_active: true,
  hire_date: '',
  birth_date: '',
  cycle_start_date: '',
  is_admin: false,
  is_hr: false,
  is_validator: false,
  is_employee: true,
  is_simple: false,
  profile_image: '',
})

const currentRole = ref('employee')

onMounted(() => {
  roleStore.fetchRoles()
})

const triggerFileInput = () => fileInput.value?.click()

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

const formatRoleName = (name: string) => {
  if (!name) return ''
  const clean = name.toLowerCase()
  return clean === 'hr' ? 'HR' : clean.charAt(0).toUpperCase() + clean.slice(1)
}

const getRoleIcon = (roleName: string) => {
  const role = roleStore.roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase())
  return role?.icon || 'mdi-account-outline'
}

const validateBirthDate = (value: string) => {
  if (!value) return true
  const selectedDate = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate < today || 'Birth date must be in the past'
}

const getUserRole = (u: User) => {
  if (u.is_admin) return 'admin'
  if (u.is_hr) return 'hr'
  if (u.is_validator) return 'validator'
  if (u.is_employee) return 'employee'
  return 'simple'
}

const loadItems = (options: { page: number; itemsPerPage: number; search?: string }) => {
  currentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  userStore.fetchUsers({
    page: options.page,
    per_page: options.itemsPerPage,
    search: search.value,
  })
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    search.value = searchQuery.value
    currentPage.value = 1
  }, 600)
}

const openAddModal = () => {
  isEdit.value = false
  showPassword.value = false
  imagePreview.value = null
  selectedFile.value = null
  Object.assign(editedItem, {
    id: null, firstname: '', lastname: '', email: '', password: '',
    is_active: true, employee_number: '', hire_date: '', birth_date: '',
    cycle_start_date: '', is_admin: false, is_hr: false,
    is_validator: false, is_employee: true, is_simple: false, profile_image: ''
  })
  currentRole.value = 'employee'
  dialog.value = true
}

const editUser = (item: User) => {
  isEdit.value = true
  currentRole.value = getUserRole(item)
  imagePreview.value = item.profile_image || null
  selectedFile.value = null
  Object.assign(editedItem, {
    ...item,
    password: '',
    hire_date: item.hire_date ? item.hire_date.split('T')[0] : '',
    birth_date: item.birth_date ? item.birth_date.split('T')[0] : '',
    cycle_start_date: item.cycle_start_date ? item.cycle_start_date.split('T')[0] : '',
  })
  dialog.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const authStore = useAuthStore()

  const roleName = currentRole.value.toLowerCase()
  const payload = {
    ...editedItem,
    is_admin: roleName === 'admin',
    is_hr: roleName === 'hr',
    is_validator: roleName === 'validator',
    is_employee: roleName === 'employee',
    is_simple: roleName === 'simple',
  }

  // Handle image upload if a file was selected
  if (selectedFile.value) {
    (payload as any).image_file = selectedFile.value
  }

  // Remove password from payload if not provided during edit
  if (isEdit.value && !payload.password) delete payload.password

  // 1. Perform the save operation
  await userStore.saveUser(payload as any, isEdit.value)

  // 2. If the user being edited is the current user, refresh the global auth state
  // This triggers a request to /api/user/current to get fresh profile data
  if (authStore.user && authStore.user.id === editedItem.id) {
    await authStore.getCurrentUser()
  }

  // 3. Refresh the users table to show the latest data
  await userStore.fetchUsers({
    search: search.value,
    page: currentPage.value,
    per_page: itemsPerPage.value,
  })

  dialog.value = false
}

const confirmDelete = async (item: User) => {
  if (item.id && confirm(`Delete ${item.firstname} ${item.lastname}?`)) {
    await userStore.deleteUser(item.id)
    await userStore.fetchUsers({
      search: search.value,
      page: currentPage.value,
      per_page: itemsPerPage.value,
    })
  }
}
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}
/* Updated border style for the avatars */
.border-avatar {
  border: 1px solid #e0e0e0 !important;
}
</style>
