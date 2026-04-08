<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.workflows.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ $t('app.workflows.subtitle') }}</p>
        </div>
        <div class="d-flex align-center" style="gap: 16px">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('app.workflows.search_placeholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            style="width: 300px"
            @input="onSearchInput"
          ></v-text-field>
          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            {{ $t('app.workflows.add_new') }}
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="workflowStore.workflows"
            :items-length="workflowStore.totalItems"
            :loading="workflowStore.loading"
            hover
            class="bg-transparent cursor-pointer"
            @update:options="loadItems"
            @click:row="(event, { item }) => editWorkflow(item)"
          >
            <template #[`item.name`]="{ item }">
              <div class="font-weight-bold py-2">{{ item.name }}</div>
            </template>

            <template #[`item.steps`]="{ item }">
              <div class="d-flex align-center py-2" style="gap: 8px">
                <v-chip v-for="(step, idx) in item.steps" :key="idx" size="small" variant="flat" color="grey-lighten-3">
                  {{ idx + 1 }}. {{ step.user_name }}
                </v-chip>
                <v-icon size="16" color="grey-lighten-1">mdi-arrow-right</v-icon>
                <v-chip size="small" variant="flat" color="indigo-lighten-4" class="text-indigo-darken-3">
                  {{ $t('app.workflows.hr_dept') }}
                </v-chip>
              </div>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-end">
                <v-btn icon variant="text" size="small" color="blue-darken-2" @click.stop="editWorkflow(item)">
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

    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="rounded-lg pa-4">
        <v-card-title class="font-weight-bold">
          {{ isEdit ? $t('app.workflows.edit_title') : $t('app.workflows.add_new') }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field 
              v-model="editedItem.name" 
              :label="$t('app.workflows.name_label')" 
              variant="outlined"
              class="mb-6"
              :placeholder="$t('app.workflows.name_placeholder')"
              :rules="[(v) => !!v || $t('app.workflows.validation.name_required')]"
            ></v-text-field>

            <div class="d-flex align-center justify-space-between mb-2">
              <p class="text-caption font-weight-bold text-grey-darken-1 text-uppercase">{{ $t('app.workflows.structure') }}</p>
              <v-chip size="x-small" variant="flat" :color="editedItem.steps.length >= 2 ? 'orange-lighten-4' : 'grey-lighten-3'">
                {{ $t('app.workflows.steps_count', { count: editedItem.steps.length }) }}
              </v-chip>
            </div>

            <v-card flat border class="pa-3 rounded-lg bg-grey-lighten-5">
              <div v-for="(step, index) in editedItem.steps" :key="index" class="mb-3">
                <v-card flat border class="rounded-lg overflow-hidden bg-white elevation-1">
                  <div class="d-flex align-center pa-3">
                    <v-avatar size="28" color="grey-darken-4" class="text-caption white--text mr-3">
                      {{ index + 1 }}
                    </v-avatar>
                    
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-bold">{{ step.user_name }}</div>
                      <div class="text-caption text-grey">{{ $t('app.workflows.step_type_specific') }}</div>
                    </div>

                    <div class="d-flex align-center">
                      <v-btn 
                        variant="text" 
                        size="small" 
                        color="indigo-darken-2" 
                        prepend-icon="mdi-account-clock"
                        @click="openSecondaryModal(index)"
                      >
                        {{ step.secondary_user_id ? $t('app.workflows.manage_replacement') : $t('app.workflows.add_replacement') }}
                      </v-btn>
                      <v-btn icon="mdi-close" variant="text" size="small" color="red-lighten-2" @click="removeStep(index)"></v-btn>
                    </div>
                  </div>

                  <v-divider v-if="step.secondary_user_id"></v-divider>
                  <div v-if="step.secondary_user_id" class="pa-2 px-4 bg-grey-lighten-4 d-flex align-center justify-space-between">
                    <div class="text-caption">
                      <v-icon size="14" class="mr-1">mdi-subdirectory-arrow-right</v-icon>
                      <strong>{{ step.secondary_user_name }}</strong> 
                      <span class="mx-2 text-grey-lighten-1">|</span>
                      {{ formatDate(step.start_date) }} — {{ formatDate(step.end_date) }}
                    </div>
                    <v-btn icon="mdi-trash-can-outline" variant="text" size="x-small" color="grey" @click="removeSecondary(index)"></v-btn>
                  </div>
                </v-card>
              </div>

              <v-btn
                v-if="editedItem.steps.length < 2"
                block
                variant="outlined"
                class="mt-2 mb-4 text-none bg-white"
                style="border-style: dashed !important; border-color: #bdbdbd !important;"
                prepend-icon="mdi-plus"
                height="50"
                @click="openAddStepModal"
              >
                {{ $t('app.workflows.add_step') }}
              </v-btn>

              <div class="d-flex align-center my-4 px-2">
                <v-divider></v-divider>
                <v-icon color="grey-lighten-1" class="mx-2">mdi-chevron-double-down</v-icon>
                <v-divider></v-divider>
              </div>

              <v-card flat border class="rounded-lg bg-indigo-lighten-5 border-indigo-lighten-4">
                <div class="d-flex align-center pa-3">
                  <v-avatar size="28" color="indigo-darken-2" class="text-caption white--text mr-3">
                    <v-icon size="16">mdi-shield-check</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-bold text-indigo-darken-4">{{ $t('app.workflows.hr_dept') }}</div>
                    <div class="text-caption text-indigo-darken-2">{{ $t('app.workflows.final_validation') }}</div>
                  </div>
                  <v-icon color="indigo-lighten-3" size="20">mdi-lock-outline</v-icon>
                </div>
              </v-card>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">{{ $t('app.generic.cancel') }}</v-btn>
          <v-btn color="black" width="120" :loading="workflowStore.saving" @click="saveWorkflow">{{ $t('app.generic.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="stepDialog" max-width="400px">
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-body-1 font-weight-bold">{{ $t('app.workflows.add_step') }}</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedUser"
            :items="availableUsers"
            item-title="fullname"
            item-value="id"
            :label="$t('app.workflows.validation.select_user')"
            variant="outlined"
            return-object
            :no-data-text="$t('app.workflows.no_users_available')"
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-btn color="black" block height="45" @click="confirmAddStep" :disabled="!selectedUser">{{ $t('app.generic.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="secondaryDialog" max-width="450px">
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-body-1 font-weight-bold">{{ $t('app.workflows.temp_replacement') }}</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="secondaryForm.user"
            :items="availableSecondaryUsers"
            item-title="fullname"
            item-value="id"
            :label="$t('app.workflows.replacement_user')"
            variant="outlined"
            return-object
            class="mb-4"
          ></v-autocomplete>
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="secondaryForm.start_date" :label="$t('app.workflows.start_date')" type="date" variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="secondaryForm.end_date" :label="$t('app.workflows.end_date')" type="date" variant="outlined" density="comfortable"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="black" block height="45" @click="confirmSecondary" :disabled="!secondaryForm.user">{{ $t('app.workflows.apply') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWorkflowStore } from '@/stores/workflow'
import { useUserStore } from '@/stores/user'
import type { Workflow } from '@/types/workflow'

const { t } = useI18n()
const workflowStore = useWorkflowStore()
const userStore = useUserStore()

const dialog = ref(false)
const stepDialog = ref(false)
const secondaryDialog = ref(false)
const isEdit = ref(false)
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const activeStepIndex = ref<number | null>(null)
const formRef = ref<any>(null)
let searchTimeout: any = null

const availableUsers = computed(() => {
  const selectedUserIds = editedItem.steps.map(s => s.user_id)
  return userStore.users.filter(u => !selectedUserIds.includes(u.id))
})

const availableSecondaryUsers = computed(() => {
  if (activeStepIndex.value === null) return userStore.users
  const currentStepUserId = editedItem.steps[activeStepIndex.value].user_id
  return userStore.users.filter(u => u.id !== currentStepUserId)
})

const headers = computed(() => [
  { title: t('app.workflows.table.name'), key: 'name' },
  { title: t('app.workflows.table.circuit'), key: 'steps', sortable: false },
  { title: t('app.generic.actions'), key: 'actions', align: 'end', sortable: false },
])

const editedItem = reactive<Workflow>({
  id: null,
  name: '',
  steps: [],
})

const selectedUser = ref<any>(null)
const secondaryForm = reactive({
  user: null as any,
  start_date: '',
  end_date: '',
})

onMounted(() => {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
  userStore.fetchUsers({ page: 1, per_page: 100 })
})

const loadItems = (options: { page: number; itemsPerPage: number }) => {
  currentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  workflowStore.fetchWorkflows({
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
  editedItem.id = null
  editedItem.name = ''
  editedItem.steps = []
  dialog.value = true
}

const editWorkflow = (item: Workflow) => {
  isEdit.value = true
  editedItem.id = item.id
  editedItem.name = item.name
  editedItem.steps = JSON.parse(JSON.stringify(item.steps))
  dialog.value = true
}

const openAddStepModal = () => {
  selectedUser.value = null
  stepDialog.value = true
}

const confirmAddStep = () => {
  editedItem.steps.push({
    id: undefined,
    step_order: editedItem.steps.length + 1,
    user_id: selectedUser.value.id,
    user_name: selectedUser.value.fullname,
    secondary_user_id: null,
    secondary_user_name: null,
    start_date: null,
    end_date: null,
  })
  stepDialog.value = false
}

const removeStep = (index: number) => {
  editedItem.steps.splice(index, 1)
  editedItem.steps.forEach((s, i) => s.step_order = i + 1)
}

const openSecondaryModal = (index: number) => {
  activeStepIndex.value = index
  const step = editedItem.steps[index]
  if (step.secondary_user_id) {
    secondaryForm.user = { id: step.secondary_user_id, fullname: step.secondary_user_name }
    secondaryForm.start_date = step.start_date || ''
    secondaryForm.end_date = step.end_date || ''
  } else {
    secondaryForm.user = null
    secondaryForm.start_date = ''
    secondaryForm.end_date = ''
  }
  secondaryDialog.value = true
}

const confirmSecondary = () => {
  if (activeStepIndex.value === null) return
  const step = editedItem.steps[activeStepIndex.value]
  step.secondary_user_id = secondaryForm.user.id
  step.secondary_user_name = secondaryForm.user.fullname
  step.start_date = secondaryForm.start_date
  step.end_date = secondaryForm.end_date
  secondaryDialog.value = false
}

const removeSecondary = (index: number) => {
  const step = editedItem.steps[index]
  step.secondary_user_id = null
  step.secondary_user_name = null
  step.start_date = null
  step.end_date = null
}

const formatDate = (date: string | null) => {
  if (!date) return ''
  return date.split('-').reverse().join('/')
}

const saveWorkflow = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const payload = {
    name: editedItem.name,
    steps: editedItem.steps.map(step => ({
      user_id: step.user_id,
      secondary_user_id: step.secondary_user_id,
      start_date: step.start_date,
      end_date: step.end_date,
    })),
  }

  await workflowStore.saveWorkflow(payload, editedItem.id)
  loadItems({ page: currentPage.value, itemsPerPage: itemsPerPage.value })
  dialog.value = false
}

const confirmDelete = async (item: Workflow) => {
  if (confirm(t('app.workflows.delete_confirm', { name: item.name }))) {
    await workflowStore.deleteWorkflow(item.id!)
    loadItems({ page: currentPage.value, itemsPerPage: itemsPerPage.value })
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