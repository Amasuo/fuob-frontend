<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.users.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ $t('app.users.subtitle') }}</p>
        </div>
        <div class="d-flex align-center" style="gap: 16px">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :label="$t('app.users.search_placeholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            style="width: 300px"
            @input="onSearchInput"
          ></v-text-field>

          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            {{ $t('app.users.add_user') }}
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
            hover
            class="bg-transparent cursor-pointer"
            @update:options="loadItems"
            @click:row="(_e, { item }) => editUser(item as User)"
          >
            <template #[`item.name`]="{ item }">
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

            <template #[`item.unit_name`]="{ item }">
              <span class="text-body-2">{{
                (item as User).unit_name || '-'
              }}</span>
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
                {{
                  (item as User).is_active
                    ? $t('app.users.status_active')
                    : $t('app.users.status_inactive')
                }}
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
          {{ isEdit ? $t('app.users.edit_user') : $t('app.users.new_user') }}
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
                  <div class="text-caption mt-2 text-grey">{{ $t('app.users.upload_hint') }}</div>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.firstname"
                  :label="$t('app.users.firstname')"
                  variant="outlined"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.lastname"
                  :label="$t('app.users.lastname')"
                  variant="outlined"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" :sm="isEdit ? 12 : 6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  variant="outlined"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
              <v-col v-if="!isEdit" cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.password"
                  :label="$t('app.users.password')"
                  variant="outlined"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  :rules="[
                    (v) => !!v || $t('app.generic.required'),
                    (v) => (v && v.length >= 8) || $t('app.users.min_8'),
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-select
                  v-model="currentRole"
                  :items="roleStore.roles"
                  :item-title="(item) => formatRoleName(item.name)"
                  item-value="name"
                  :label="$t('app.users.role')"
                  variant="outlined"
                  :loading="roleStore.loading"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :prepend-icon="item.raw.icon"></v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col
                v-if="currentRole === 'validator' || currentRole === 'employee'"
                cols="12"
                sm="4"
              >
                <v-autocomplete
                  v-model="editedItem.unit_id"
                  :items="unitStore.units"
                  item-title="name"
                  item-value="id"
                  :label="$t('app.users.unit')"
                  variant="outlined"
                  :loading="unitStore.loading"
                  clearable
                  @focus="onUnitFocus"
                  @update:search="onUnitSearch"
                >
                  <template #no-data>
                    <v-list-item>
                      <v-list-item-title>{{ $t('app.generic.no_data') }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.employee_number"
                  :label="$t('app.users.employee_number')"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.birth_date"
                  :label="$t('app.users.birth_date')"
                  type="date"
                  variant="outlined"
                  persistent-placeholder
                  :rules="[validateBirthDate]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.hire_date"
                  :label="$t('app.users.hire_date')"
                  type="date"
                  variant="outlined"
                  persistent-placeholder
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="d-flex align-center px-4 mt-2">
                <v-switch
                  v-model="editedItem.is_active"
                  :label="
                    editedItem.is_active
                      ? $t('app.users.status_active')
                      : $t('app.users.status_inactive')
                  "
                  color="green"
                  inset
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">{{ $t('app.generic.cancel') }}</v-btn>
          <v-btn color="black" :loading="userStore.saving" @click="handleSave">
            {{ $t('app.generic.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoleStore } from '@/stores/role'
import { useAuthStore } from '@/stores/auth'
import { useUnitStore } from '@/stores/unit'
import { useI18n } from 'vue-i18n'
import type { User } from '@/types/user'

const { t } = useI18n()
const userStore = useUserStore()
const roleStore = useRoleStore()
const unitStore = useUnitStore()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const dialog = ref(false)
const isEdit = ref(false)
const showPassword = ref(false)
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let unitSearchTimeout: ReturnType<typeof setTimeout> | null = null

const hasLoadedUnits = ref(false)

const headers = computed(() => [
  { title: t('app.users.table.user'), key: 'name' },
  { title: t('app.users.table.unit'), key: 'unit_name' },
  { title: t('app.users.table.id_number'), key: 'employee_number' },
  { title: t('app.users.table.role'), key: 'role', sortable: false },
  { title: t('app.users.table.status'), key: 'is_active', align: 'center' as const },
  { title: t('app.users.table.actions'), key: 'actions', sortable: false, align: 'end' as const },
])

const editedItem = reactive<
  User & {
    password?: string
    profile_image?: string
    unit_id?: number | null
  }
>({
  id: null,
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  employee_number: '',
  is_active: true,
  hire_date: '',
  birth_date: '',
  is_admin: false,
  is_hr: false,
  is_validator: false,
  is_employee: true,
  is_simple: false,
  profile_image: '',
  language_id: null,
  language_code: '',
  unit_id: null,
  unit_name: '',
})

const currentRole = ref('employee')

onMounted(() => {
  roleStore.fetchRoles()
  unitStore.fetchUnits({ page: 1, per_page: 10 })
})

const onUnitFocus = () => {
  if (!hasLoadedUnits.value) {
    unitStore.fetchUnits({ page: 1, per_page: 10, search: '' })
    hasLoadedUnits.value = true
  }
}

const onValidatorSearch = (val: string) => {
  if (val === null || val.length >= 2) {
    if (validatorSearchTimeout) clearTimeout(validatorSearchTimeout)
    validatorSearchTimeout = setTimeout(() => {
      userStore.fetchUsers({ page: 1, per_page: 20, search: val || '', is_validator: true })
      hasLoadedValidators.value = true
    }, 600)
  }
}
const onUnitSearch = (val: string) => {

  if (val === null || val.length >= 2) {
    if (unitSearchTimeout) clearTimeout(unitSearchTimeout)
    unitSearchTimeout = setTimeout(() => {
      unitStore.fetchUnits({ page: 1, per_page: 20, search: val || '' })
      hasLoadedUnits.value = true
    }, 600)
  }
}

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
  return selectedDate < today || t('app.users.birth_date_error')
}

const getUserRole = (u: User) => {
  if (u.is_admin) return 'admin'
  if (u.is_hr) return 'hr'
  if (u.is_validator) return 'validator'
  if (u.is_employee) return 'employee'
  return 'simple'
}

const loadItems = (options: { page: number; itemsPerPage: number }) => {
  currentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  userStore.fetchUsers({
    page: options.page,
    per_page: options.itemsPerPage,
    search: searchQuery.value,
  })
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
  }, 600)
}

const openAddModal = () => {
  isEdit.value = false
  hasLoadedUnits.value = false
  showPassword.value = false
  imagePreview.value = null
  selectedFile.value = null
  Object.assign(editedItem, {
    id: null,
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    is_active: true,
    employee_number: '',
    hire_date: '',
    birth_date: '',
    is_admin: false,
    is_hr: false,
    is_validator: false,
    is_employee: true,
    is_simple: false,
    profile_image: '',
    unit_id: null,
  })
  currentRole.value = 'employee'
  dialog.value = true
}

const editUser = (item: User) => {
  isEdit.value = true
  hasLoadedUnits.value = false
  currentRole.value = getUserRole(item)
  imagePreview.value = item.profile_image || null
  selectedFile.value = null
  Object.assign(editedItem, {
    ...item,
    password: '',
    hire_date: item.hire_date ? item.hire_date.split('T')[0] : '',
    birth_date: item.birth_date ? item.birth_date.split('T')[0] : '',
    unit_id: item.unit_id || null,
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
  if (selectedFile.value) (payload as any).image_file = selectedFile.value
  if (isEdit.value && !payload.password) delete payload.password
  await userStore.saveUser(payload as any, isEdit.value)
  if (authStore.user && authStore.user.id === editedItem.id) await authStore.getCurrentUser()
  await userStore.fetchUsers({
    search: searchQuery.value,
    page: currentPage.value,
    per_page: itemsPerPage.value,
  })
  dialog.value = false
}

const confirmDelete = async (item: User) => {
  if (
    item.id &&
    confirm(t('app.users.delete_confirm', { name: `${item.firstname} ${item.lastname}` }))
  ) {
    await userStore.deleteUser(item.id)
    await userStore.fetchUsers({
      search: searchQuery.value,
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

.border-avatar {
  border: 1px solid #e0e0e0 !important;
}
</style>
