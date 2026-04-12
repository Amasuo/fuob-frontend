<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.leave_profiles.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ $t('app.leave_profiles.subtitle') }}</p>
        </div>
        <div class="d-flex align-center ga-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :label="$t('app.leave_profiles.search_placeholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            width="300"
            @input="onSearchInput"
          ></v-text-field>
          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            {{ $t('app.leave_profiles.add_new') }}
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="leaveProfileStore.leaveProfiles"
            :items-length="leaveProfileStore.totalItems"
            :loading="leaveProfileStore.loading"
            hover
            class="bg-transparent cursor-pointer"
            @update:options="loadItems"
            @click:row="(_e, { item }) => editLeaveProfile(item)"
          >
            <template #[`item.name`]="{ item }">
              <div class="d-flex align-center py-2">
                <div>
                  <div class="font-weight-bold py-2">{{ item.name }}</div>
                  <div class="text-caption text-grey text-uppercase font-weight-black">{{ item.code }}</div>
                </div>
              </div>
            </template>

            <template #[`item.rules_summary`]="{ item }">
              <div class="d-flex flex-wrap ga-2">
                <template v-for="(rule, idx) in item.rules" :key="idx">
                  <template v-if="rule.leave_type">
                    
                    <v-chip v-if="rule.base_quota !== null" size="small" variant="tonal" color="blue-darken-2" class="font-weight-bold">
                      <v-icon start size="14">mdi-calendar-check</v-icon>
                      {{ rule.base_quota }}{{ $t('app.leave_profiles.summary.days') }} {{ $t('app.leave_profiles.summary.base') }}
                    </v-chip>

                    <v-chip v-if="rule.seniority_gain" size="small" variant="tonal" color="orange-darken-3" class="font-weight-bold">
                      <v-icon start size="14">mdi-trending-up</v-icon>
                      +{{ rule.seniority_gain }}{{ $t('app.leave_profiles.summary.days') }} /
                      {{ rule.seniority_cycle }} {{ $t('app.leave_profiles.summary.years', rule.seniority_cycle) }}
                    </v-chip>

                    <v-chip v-if="rule.carryover_limit !== null" size="small" variant="tonal" color="green-darken-2" class="font-weight-bold">
                      <v-icon start size="14">mdi-fast-forward</v-icon>
                      {{ $t('app.leave_profiles.summary.max_report') }} {{ rule.carryover_limit }}{{ $t('app.leave_profiles.summary.days') }}
                    </v-chip>
                  </template>
                </template>

                <span
                  v-if="!item.rules || item.rules.length === 0"
                  class="text-caption text-grey-lighten-1 font-italic"
                >
                  {{ $t('app.leave_profiles.no_rules') }}
                </span>
              </div>
            </template>

            <template #[`item.is_active`]="{ item }">
              <v-chip size="small" :color="item.is_active ? 'green' : 'grey'" variant="tonal">
                {{ item.is_active ? $t('app.leave_profiles.status_active') : $t('app.leave_profiles.status_inactive') }}
              </v-chip>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-end">
                <v-btn icon variant="text" size="small" color="blue-darken-2" @click.stop="editLeaveProfile(item)">
                  <v-icon size="20">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small" color="red-lighten-1" @click.stop="confirmDelete(item)">
                  <v-icon size="20">mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="750px" persistent scrollable>
      <v-card class="rounded-lg pa-2">
        <v-card-title class="font-weight-bold px-4 pt-4">
          {{ isEdit ? $t('app.leave_profiles.edit') : $t('app.leave_profiles.new') }}
        </v-card-title>

        <v-card-text class="px-4">
          <v-form ref="formRef">
            <v-alert
              v-if="editedItem.is_default"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-4 text-caption"
              icon="mdi-lock"
            >
              {{ $t('app.leave_profiles.default_locked_warning') }}
            </v-alert>

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.code"
                  :label="$t('app.leave_profiles.code')"
                  variant="outlined"
                  class="mb-2"
                  :readonly="isEdit || editedItem.is_default"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.name"
                  :label="$t('app.leave_profiles.name')"
                  variant="outlined"
                  class="mb-2"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  :label="$t('app.leave_profiles.description')"
                  variant="outlined"
                  rows="2"
                  auto-grow
                ></v-textarea>
              </v-col>
            </v-row>

            <div class="d-flex align-center justify-space-between mb-4 mt-2">
              <p class="text-caption font-weight-black text-grey-darken-1 text-uppercase mb-0">
                {{ $t('app.leave_profiles.rules_config') }}
              </p>
              <v-chip size="x-small" color="grey-lighten-3" variant="flat" class="font-weight-bold">
                {{ editedItem.rules.length }} {{ $t('app.leave_profiles.types_configured', editedItem.rules.length) }}
              </v-chip>
            </div>

            <v-menu v-if="availableLeaveTypes.length > 0" transition="scale-transition">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props" 
                  block 
                  height="64" 
                  variant="outlined" 
                  class="border-dashed border-md rounded-lg mb-6 text-none text-subtitle-1 font-weight-bold text-blue-grey-darken-3"
                >
                  <v-icon start>mdi-plus</v-icon>
                  {{ $t('app.leave_profiles.add_specific_type') }}
                </v-btn>
              </template>
              <v-list density="compact" class="rounded-lg">
                <v-list-item v-for="type in availableLeaveTypes" :key="type.id" @click="addRule(type)">
                  <template v-slot:prepend>
                    <v-icon :color="type.color" size="20">mdi-rhombus-outline</v-icon>
                  </template>
                  <v-list-item-title class="ml-2">{{ type.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <div v-for="(rule, index) in editedItem.rules" :key="index">
              <v-card
                border
                flat
                class="mb-4 rounded-lg overflow-hidden"
                :class="rule.leave_type?.is_annual ? 'bg-blue-grey-lighten-5' : 'bg-white'"
              >
                <div class="d-flex align-center pa-4">
                  <v-avatar :color="rule.leave_type?.color || '#64748B'" size="36" class="mr-4">
                    <v-icon color="white" size="20">
                      {{ rule.leave_type?.is_annual ? 'mdi-shield-check' : 'mdi-file-document-outline' }}
                    </v-icon>
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div
                      class="font-weight-bold text-body-1"
                      :class="{ 'text-blue-darken-4': rule.leave_type?.is_annual }"
                    >
                      {{ rule.leave_type?.name }}
                    </div>
                    <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">
                      {{ rule.leave_type?.is_annual ? $t('app.leave_profiles.main_type_mandatory') : $t('app.leave_profiles.additional_rule') }}
                    </div>
                  </div>

                  <v-icon v-if="rule.leave_type?.is_annual" color="blue-grey-lighten-2">mdi-lock-outline</v-icon>
                  <v-btn
                    v-else
                    icon="mdi-trash-can-outline"
                    variant="text"
                    size="small"
                    color="red-lighten-2"
                    @click="removeRule(index)"
                  ></v-btn>
                </div>

                <v-divider></v-divider>

                <v-card-text class="pa-4 bg-white">
                  <div class="mb-4">
                    <v-sheet
                      v-if="rule.leave_type?.lock_day_count_method"
                      border
                      rounded="lg"
                      class="pa-3 bg-blue-grey-lighten-5 d-flex align-center"
                    >
                      <v-icon color="blue-grey-lighten-2" class="mr-3">mdi-lock-outline</v-icon>
                      <span class="text-body-2 font-weight-medium">
                        {{ $t('app.leave_profiles.locked_on') }}:
                        <strong>{{ getDayCountMethodLabel(rule.leave_type?.day_count_method) }}</strong>
                      </span>
                    </v-sheet>

                    <v-select
                      v-else
                      v-model="rule.day_count_method"
                      :items="dayCountOptions"
                      item-title="title"
                      item-value="value"
                      :label="$t('app.leave_profiles.calculation_method')"
                      variant="outlined"
                      density="comfortable"
                      bg-color="white"
                      prepend-inner-icon="mdi-calculator-variant-outline"
                      hide-details
                    ></v-select>
                  </div>

                  <v-row v-if="rule.leave_type?.is_annual" dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="rule.base_quota"
                        :label="$t('app.leave_profiles.base_quota')"
                        type="number"
                        variant="outlined"
                        :suffix="$t('app.generic.days', rule.base_quota || 0)"
                        density="comfortable"
                        min="1"
                        :rules="rulesMin1"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="rule.carryover_limit"
                        :label="$t('app.leave_profiles.carryover_limit')"
                        type="number"
                        variant="outlined"
                        :suffix="$t('app.generic.days', rule.carryover_limit || 0)"
                        density="comfortable"
                        min="0"
                        :rules="rulesMin0"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-sheet border rounded="lg" class="pa-4 bg-grey-lighten-5">
                        <p class="text-caption font-weight-black text-uppercase mb-3">
                          {{ $t('app.leave_profiles.seniority_bonus') }}
                        </p>
                        <v-row dense>
                          <v-col cols="4">
                            <v-text-field
                              v-model.number="rule.seniority_cycle"
                              :label="$t('app.leave_profiles.seniority_cycle')"
                              variant="outlined"
                              density="compact"
                              bg-color="white"
                              type="number"
                              :rules="rulesMin1"
                              min="1"
                              :suffix="$t('app.generic.years', rule.seniority_cycle || 0)"
                              hide-details
                            ></v-text-field>
                          </v-col>
                          <v-col cols="4">
                            <v-text-field
                              v-model.number="rule.seniority_gain"
                              :label="$t('app.leave_profiles.seniority_gain')"
                              variant="outlined"
                              density="compact"
                              bg-color="white"
                              type="number"
                              min="1"
                              :rules="rulesMin1"
                              :suffix="$t('app.generic.days', rule.seniority_gain || 0)"
                              hide-details
                            ></v-text-field>
                          </v-col>
                          <v-col cols="4">
                            <v-text-field
                              v-model.number="rule.seniority_max"
                              :label="$t('app.leave_profiles.seniority_max')"
                              variant="outlined"
                              density="compact"
                              bg-color="white"
                              type="number"
                              min="1"
                              :rules="rulesMin1"
                              :suffix="$t('app.generic.days', rule.seniority_max || 0)"
                              hide-details
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-sheet>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>

            <v-switch
              v-model="editedItem.is_active"
              :label="editedItem.is_active ? $t('app.leave_profiles.status_active') : $t('app.leave_profiles.status_inactive')"
              color="green"
              inset
              hide-details
              :disabled="editedItem.is_default"
              class="mt-4"
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">{{ $t('app.generic.cancel') }}</v-btn>
          <v-btn color="black" :loading="leaveProfileStore.saving" @click="handleSave">
            {{ $t('app.generic.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLeaveProfileStore } from '@/stores/leave-profile'
import { useLeaveTypeStore } from '@/stores/leave-type'
import type { LeaveProfile } from '@/stores/leave-profile'

const { t } = useI18n()
const leaveProfileStore = useLeaveProfileStore()
const leaveTypeStore = useLeaveTypeStore()

const dialog = ref(false)
const isEdit = ref(false)
const formRef = ref()
const itemsPerPage = ref(10)
const currentPage = ref(1)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const rulesMin1 = [
  (v: any) => (v !== null && v !== '') || t('app.generic.required'),
  (v: any) => v >= 1 || t('app.validation.must_be_at_least_1'),
]

const rulesMin0 = [
  (v: any) => (v !== null && v !== '') || t('app.generic.required'),
  (v: any) => v >= 0 || t('app.validation.must_be_positive'),
]

const dayCountOptions = computed(() => [
  { title: t('app.leave_profiles.day_count.default_system'), value: null },
  { title: t('app.leave_profiles.day_count.working'), value: 'working' },
  { title: t('app.leave_profiles.day_count.business'), value: 'business' },
  { title: t('app.leave_profiles.day_count.calendar'), value: 'calendar' },
])

const editedItem = reactive<LeaveProfile>({
  id: null,
  code: '',
  name: '',
  description: null,
  is_active: true,
  is_default: false,
  rules: [],
})

const headers = computed(() => [
  { title: t('app.leave_profiles.table.name'), key: 'name' },
  { title: t('app.leave_profiles.table.rules'), key: 'rules_summary', sortable: false },
  { title: t('app.leave_profiles.table.status'), key: 'is_active', align: 'center' as const },
  { title: t('app.leave_profiles.table.actions'), key: 'actions', align: 'end' as const, sortable: false },
])

const availableLeaveTypes = computed(() => {
  const selectedIds = editedItem.rules.map(r => r.leave_type_id)
  return leaveTypeStore.leaveTypes.filter(
    type => !type.is_annual && type.is_active && !selectedIds.includes(type.id)
  )
})

onMounted(async () => {
  await leaveTypeStore.fetchLeaveTypes({ page: 1, per_page: 100 })
  await leaveProfileStore.fetchLeaveProfiles({ page: 1, per_page: 10 })
})

const loadItems = (options?: any) => {
  if (options) {
    currentPage.value = options.page
    itemsPerPage.value = options.itemsPerPage
  }
  leaveProfileStore.fetchLeaveProfiles({
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

const getDayCountMethodLabel = (method: string | null | undefined) => {
  if (!method) return t('app.leave_profiles.day_count.default_system')
  const option = dayCountOptions.value.find(opt => opt.value === method)
  return option ? option.title : method
}

const openAddModal = () => {
  isEdit.value = false
  const rules = leaveTypeStore.leaveTypes
    .filter(type => type.is_annual)
    .map(type => ({
      leave_type_id: type.id,
      enabled: true,
      day_count_method: null,
      base_quota: 0,
      carryover_limit: 0,
      seniority_cycle: 0,
      seniority_gain: 0,
      seniority_max: 0,
      leave_type: type,
    }))

  Object.assign(editedItem, {
    id: null,
    code: '',
    name: '',
    description: null,
    is_active: true,
    is_default: false,
    rules,
  })
  
  dialog.value = true
  nextTick(() => formRef.value?.resetValidation())
}

const addRule = (type: any) => {
  editedItem.rules.unshift({
    leave_type_id: type.id,
    enabled: true,
    day_count_method: null,
    base_quota: null,
    carryover_limit: null,
    seniority_cycle: null,
    seniority_gain: null,
    seniority_max: null,
    leave_type: type,
  })
}

const removeRule = (index: number) => {
  editedItem.rules.splice(index, 1)
}

const editLeaveProfile = (item: LeaveProfile) => {
  isEdit.value = true
  const profileCopy = JSON.parse(JSON.stringify(item))

  const annualTypes = leaveTypeStore.leaveTypes.filter(type => type.is_annual)
  
  const rules = [...profileCopy.rules].map(r => {
    const type = leaveTypeStore.leaveTypes.find(t => t.id === r.leave_type_id)
    return { ...r, leave_type: type }
  })

  annualTypes.forEach(type => {
    if (!rules.find(r => r.leave_type_id === type.id)) {
      rules.push({
        leave_type_id: type.id,
        enabled: true,
        day_count_method: null,
        base_quota: 0,
        carryover_limit: 0,
        seniority_cycle: 1,
        seniority_gain: 0,
        seniority_max: 0,
        leave_type: type,
      })
    }
  })

  Object.assign(editedItem, {
    ...profileCopy,
    rules: rules
  })
  
  dialog.value = true
  nextTick(() => formRef.value?.resetValidation())
}

const handleSave = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return
  
  try {
    await leaveProfileStore.saveLeaveProfile(editedItem, isEdit.value)
    dialog.value = false
    loadItems()
  } catch (error) {
    console.error("Save error:", error)
  }
}

const confirmDelete = async (item: LeaveProfile) => {
  if (confirm(t('app.leave_profiles.delete_confirm', { name: item.name }))) {
    await leaveProfileStore.deleteLeaveProfile(item.id!)
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