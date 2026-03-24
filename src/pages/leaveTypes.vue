<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.leave_types.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ $t('app.leave_types.subtitle') }}</p>
        </div>
        <div class="d-flex align-center" style="gap: 16px">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :label="$t('app.leave_types.search_placeholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            style="width: 300px"
            @input="onSearchInput"
          ></v-text-field>
          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            {{ $t('app.leave_types.add_new') }}
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="leaveTypeStore.leaveTypes"
            :items-length="leaveTypeStore.totalItems"
            :loading="leaveTypeStore.loading"
            hover
            class="bg-transparent cursor-pointer"
            @update:options="loadItems"
            @click:row="(_e, { item }) => editLeaveType(item)"
          >
            <template #[`item.name`]="{ item }">
              <div class="d-flex align-center py-2">
                <v-sheet :color="item.color" width="4" height="32" class="rounded-pill mr-3"></v-sheet>
                <div>
                  <div class="font-weight-bold py-2">{{ item.name }}</div>
                  <div class="text-caption text-grey text-uppercase font-weight-black">{{ item.code }}</div>
                </div>
              </div>
            </template>

            <template #[`item.rules`]="{ item }">
              <div class="d-flex" style="gap: 8px">
                <v-icon :color="item.is_paid ? 'blue' : 'grey-lighten-2'" size="20">mdi-cash-check</v-icon>
                <v-icon :color="item.has_balance ? 'blue' : 'grey-lighten-2'" size="20">mdi-counter</v-icon>
                <v-icon :color="item.requires_doc ? 'blue' : 'grey-lighten-2'" size="20">mdi-file-document-outline</v-icon>
                <v-icon :color="item.validation_rh_only ? 'blue' : 'grey-lighten-2'" size="20">mdi-shield-account</v-icon>
              </div>
            </template>

            <template #[`item.is_active`]="{ item }">
              <v-chip
                size="small"
                :color="item.is_active ? 'green' : 'grey'"
                variant="tonal"
              >
                {{ item.is_active ? $t('app.leave_types.status_active') : $t('app.leave_types.status_inactive') }}
              </v-chip>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="blue-darken-2"
                  @click.stop="editLeaveType(item)"
                >
                  <v-icon size="20">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="red-lighten-1"
                  @click.stop="confirmDelete(item)"
                >
                  <v-icon size="20">mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="rounded-lg pa-4">
        <v-card-title class="font-weight-bold">
          {{ isEdit ? $t('app.leave_types.edit') : $t('app.leave_types.new') }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field 
                  v-model="editedItem.code" 
                  :label="$t('app.leave_types.code')" 
                  variant="outlined"
                  class="mb-2"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field 
                  v-model="editedItem.name" 
                  :label="$t('app.leave_types.name')" 
                  variant="outlined"
                  class="mb-2"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <p class="text-caption font-weight-bold text-grey-darken-1 text-uppercase mb-2">
                  {{ $t('app.leave_types.color_label') }}
                </p>
                <div class="d-flex flex-wrap align-center mb-4" style="gap: 8px">
                  <v-avatar
                    v-for="color in presetColors"
                    :key="color"
                    :color="color"
                    size="32"
                    class="cursor-pointer elevation-1"
                    @click="editedItem.color = color"
                  >
                    <v-icon v-if="editedItem.color === color" color="white" size="small">mdi-check</v-icon>
                  </v-avatar>
                  <v-divider vertical class="mx-2" length="24"></v-divider>
                  <input 
                    type="color" 
                    v-model="editedItem.color" 
                    style="width: 32px; height: 32px; cursor: pointer; border: none; background: none;"
                  >
                </div>
              </v-col>

              <v-col cols="12">
                 <v-card flat border class="pa-0 overflow-hidden mb-4">
                  <v-sheet color="grey-lighten-4" class="pa-2 px-4 text-caption font-weight-bold text-uppercase">
                    {{ $t('app.leave_types.policies_config') }}
                  </v-sheet>
                  <v-divider></v-divider>
                  <v-list lines="two" class="pa-0">
                    <v-list-item v-for="(policy, index) in policies" :key="index" class="px-2">
                      <template v-slot:prepend>
                        <v-checkbox-btn v-model="editedItem[policy.model]" color="indigo"></v-checkbox-btn>
                      </template>
                      <v-list-item-title class="font-weight-bold text-body-2">{{ $t(policy.title) }}</v-list-item-title>
                      <v-list-item-subtitle class="text-caption">{{ $t(policy.desc) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="editedItem.is_active"
                  :label="editedItem.is_active ? $t('app.leave_types.status_active') : $t('app.leave_types.status_inactive')"
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
          <v-btn color="black" :loading="leaveTypeStore.saving" @click="handleSave">
            {{ $t('app.generic.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLeaveTypeStore } from '@/stores/leave-type'

const { t } = useI18n()
const leaveTypeStore = useLeaveTypeStore()

const dialog = ref(false)
const isEdit = ref(false)
const formRef = ref()
const itemsPerPage = ref(10)
const currentPage = ref(1)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const presetColors = ['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B']

const policies = [
  { model: 'is_paid', title: 'app.leave_types.rules.is_paid', desc: 'app.leave_types.rules.is_paid_desc' },
  { model: 'has_balance', title: 'app.leave_types.rules.has_balance', desc: 'app.leave_types.rules.has_balance_desc' },
  { model: 'requires_doc', title: 'app.leave_types.rules.requires_doc', desc: 'app.leave_types.rules.requires_doc_desc' },
  { model: 'validation_rh_only', title: 'app.leave_types.rules.rh_only_check', desc: 'app.leave_types.rules.rh_only_check_desc' },
]

const editedItem = reactive({
  id: null as number | null,
  code: '',
  name: '',
  color: '#4F46E5',
  is_paid: true,
  has_balance: true,
  requires_doc: false,
  validation_rh_only: false,
  is_active: true,
})

const headers = computed(() => [
  { title: t('app.leave_types.table.name'), key: 'name' },
  { title: t('app.leave_types.table.rules'), key: 'rules', sortable: false },
  { title: t('app.leave_types.table.status'), key: 'is_active', align: 'center' as const },
  { title: t('app.leave_types.table.actions'), key: 'actions', align: 'end' as const, sortable: false },
])

onMounted(() => {
  leaveTypeStore.fetchLeaveTypes({ page: 1, per_page: 10 })
})

const loadItems = (options?: any) => {
  if (options) {
    currentPage.value = options.page
    itemsPerPage.value = options.itemsPerPage
  }
  leaveTypeStore.fetchLeaveTypes({
    page: currentPage.value,
    per_page: itemsPerPage.value,
    search: searchQuery.value,
  })
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadItems()
  }, 600)
}

const openAddModal = () => {
  isEdit.value = false
  Object.assign(editedItem, {
    id: null,
    code: '',
    name: '',
    color: '#4F46E5',
    is_paid: false,
    has_balance: false,
    requires_doc: false,
    validation_rh_only: false,
    is_active: true,
  })
  dialog.value = true
}

const editLeaveType = (item: any) => {
  isEdit.value = true
  Object.assign(editedItem, item)
  dialog.value = true
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  await leaveTypeStore.saveLeaveType(editedItem, isEdit.value)
  dialog.value = false
  loadItems()
}

const confirmDelete = async (item: any) => {
  if (confirm(t('app.leave_types.delete_confirm', { name: item.name }))) {
    await leaveTypeStore.deleteLeaveType(item.id)
    loadItems()
  }
}
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cursor-pointer :deep(tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>