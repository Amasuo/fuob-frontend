<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.units.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ $t('app.units.subtitle') }}</p>
        </div>
        <div class="d-flex align-center" style="gap: 16px">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :label="$t('app.units.search_placeholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            style="width: 300px"
            @input="onSearchInput"
          ></v-text-field>
          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            {{ $t('app.units.add_unit') }}
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="unitStore.units"
            :items-length="unitStore.totalItems"
            :loading="unitStore.loading"
            hover
            class="bg-transparent cursor-pointer"
            @update:options="loadItems"
            @click:row="(event, row) => editUnit(row.item)"
          >
            <template #[`item.name`]="{ item }">
              <div class="font-weight-bold py-2">{{ item.name }}</div>
            </template>

            <template #[`item.parent`]="{ item }">
              <v-chip v-if="item.parent" size="small" variant="tonal" color="blue">
                {{ item.parent.name }}
              </v-chip>
              <span v-else class="text-grey text-caption italic">Root</span>
            </template>

            <template #[`item.validator`]="{ item }">
              <div v-if="item.validator" class="d-flex align-center">
                <v-avatar
                  size="32"
                  :color="item.validator.profile_image ? 'transparent' : 'orange-lighten-4'"
                  class="mr-2"
                >
                  <v-img
                    v-if="item.validator.profile_image"
                    :src="item.validator.profile_image"
                    cover
                  />
                  <span v-else class="text-caption font-weight-bold text-orange-darken-4">
                    {{ item.validator.firstname?.charAt(0).toUpperCase()
                    }}{{ item.validator.lastname?.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                {{ item.validator.fullname }}
              </div>
              <span v-else class="text-grey text-caption italic">{{
                $t('app.units.no_validator')
              }}</span>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="blue-darken-2"
                  @click.stop="editUnit(item)"
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

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="rounded-lg pa-4">
        <v-card-title class="font-weight-bold">
          {{ isEdit ? $t('app.units.edit_unit') : $t('app.units.new_unit') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field
              v-model="editedItem.name"
              :label="$t('app.units.name')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            <v-select
              v-model="editedItem.parent_id"
              :items="unitStore.units"
              item-title="name"
              item-value="id"
              :label="$t('app.units.parent')"
              variant="outlined"
              clearable
              class="mb-4"
            ></v-select>

            <v-select
              v-model="editedItem.validator_id"
              :items="validatorUsers"
              item-title="fullname"
              item-value="id"
              :label="$t('app.units.validator')"
              variant="outlined"
              clearable
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.fullname">
                  <template #prepend>
                    <v-avatar
                      size="32"
                      :color="item.raw.profile_image ? 'transparent' : 'orange-lighten-4'"
                    >
                      <v-img v-if="item.raw.profile_image" :src="item.raw.profile_image" cover />
                      <span v-else class="text-caption font-weight-bold text-orange-darken-4">
                        {{ item.raw.firstname?.charAt(0).toUpperCase()
                        }}{{ item.raw.lastname?.charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">{{ $t('app.generic.cancel') }}</v-btn>
          <v-btn color="black" :loading="unitStore.saving" @click="handleSave">
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
import { useUnitStore } from '@/stores/unit'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const unitStore = useUnitStore()
const userStore = useUserStore()

const dialog = ref(false)
const isEdit = ref(false)
const formRef = ref()
const itemsPerPage = ref(10)
const currentPage = ref(1)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const editedItem = reactive({
  id: null as number | null,
  name: '',
  parent_id: null as number | null,
  validator_id: null as number | null,
})

const validatorUsers = computed(() => {
  return userStore.users.filter((user) => user.is_validator === true)
})

const headers = computed(() => [
  { title: t('app.units.table.name'), key: 'name' },
  { title: t('app.units.table.parent'), key: 'parent' },
  { title: t('app.units.table.validator'), key: 'validator' },
  { title: t('app.units.table.actions'), key: 'actions', align: 'end' },
])

onMounted(() => {
  userStore.fetchUsers({ page: 1, per_page: 100 })
})

const loadItems = (options?: any) => {
  if (options) {
    currentPage.value = options.page
    itemsPerPage.value = options.itemsPerPage
  }
  unitStore.fetchUnits({
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
  editedItem.id = null
  editedItem.name = ''
  editedItem.parent_id = null
  editedItem.validator_id = null
  dialog.value = true
}

const editUnit = (item: any) => {
  isEdit.value = true
  editedItem.id = item.id
  editedItem.name = item.name
  editedItem.parent_id = item.parent?.id || null
  editedItem.validator_id = item.validator?.id || null
  dialog.value = true
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  await unitStore.saveUnit(editedItem, isEdit.value)
  dialog.value = false
  loadItems()
}

const confirmDelete = async (item: any) => {
  if (confirm(t('app.units.delete_confirm', { name: item.name }))) {
    await unitStore.deleteUnit(item.id)
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
