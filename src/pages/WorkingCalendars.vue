<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.working_calendars.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ $t('app.working_calendars.subtitle') }}
          </p>
        </div>
        <div class="d-flex align-center" style="gap: 16px">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :label="$t('app.working_calendars.search_placeholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            style="width: 300px"
            @input="onSearchInput"
          ></v-text-field>

          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            {{ $t('app.working_calendars.add_calendar') }}
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card flat border class="rounded-lg">
          <v-data-table
            :headers="headers"
            :items="calendarStore.calendars"
            :loading="calendarStore.loading"
            hover
            class="bg-transparent cursor-pointer"
            @click:row="(_e, { item }) => editCalendar(item)"
          >
            <template #[`item.cycle_duration`]="{ item }">
              <v-chip
                size="small"
                variant="flat"
                color="blue-lighten-5"
                class="text-blue-darken-3 font-weight-bold"
              >
                {{ item.cycle_duration }} {{ $t('app.working_calendars.grid.day').toLowerCase() }}s
              </v-chip>
            </template>

            <template #[`item.cycle_start_date`]="{ item }">
              {{
                item.cycle_start_date
                  ? item.cycle_start_date.split('T')[0].split('-').reverse().join('-')
                  : '-'
              }}
            </template>

            <template #[`item.is_active`]="{ item }">
              <v-chip size="small" :color="item.is_active ? 'green' : 'grey'" variant="tonal">
                {{
                  item.is_active
                    ? $t('app.working_calendars.active')
                    : $t('app.working_calendars.inactive')
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
                  @click.stop="editCalendar(item)"
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
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="1200px" persistent scrollable>
      <v-card class="rounded-lg">
        <v-toolbar color="white" border-bottom>
          <v-toolbar-title class="font-weight-bold">
            {{
              isEdit
                ? $t('app.working_calendars.edit_calendar')
                : $t('app.working_calendars.new_calendar')
            }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.name"
                  :label="$t('app.working_calendars.name')"
                  variant="outlined"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>

                <v-select
                  v-model="editedItem.cycle_duration"
                  :items="[7, 14, 21, 28]"
                  :label="$t('app.working_calendars.duration')"
                  variant="outlined"
                  @update:model-value="syncDaysCount"
                ></v-select>

                <v-text-field
                  v-model="editedItem.cycle_start_date"
                  :label="$t('app.working_calendars.start_date')"
                  type="date"
                  variant="outlined"
                  persistent-placeholder
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>

                <v-textarea
                  v-model="editedItem.description"
                  :label="$t('app.working_calendars.description')"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
                <v-switch
                  v-model="editedItem.is_active"
                  :label="$t('app.working_calendars.active_status')"
                  color="green"
                  inset
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12" md="8">
                <v-sheet border class="rounded-lg overflow-hidden">
                  <v-table density="compact" fixed-header height="500px">
                    <thead>
                      <tr class="bg-grey-lighten-4">
                        <th width="200">{{ $t('app.working_calendars.grid.label') }}</th>
                        <th width="100">{{ $t('app.working_calendars.grid.working') }}</th>
                        <th width="140">{{ $t('app.working_calendars.grid.start') }}</th>
                        <th width="140">{{ $t('app.working_calendars.grid.end') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(day, index) in editedItem.days" :key="index">
                        <td>
                          <v-text-field
                            v-model="day.day_label"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="my-1"
                            placeholder="e.g. Morning Shift"
                          ></v-text-field>
                        </td>
                        <td>
                          <v-checkbox-btn
                            v-model="day.is_working"
                            color="primary"
                            @update:model-value="clearTimesIfRestDay(day)"
                          ></v-checkbox-btn>
                        </td>
                        <td>
                          <v-text-field
                            v-model="day.start_time"
                            :disabled="!day.is_working"
                            type="time"
                            density="compact"
                            variant="outlined"
                            class="my-1"
                            :rules="day.is_working ? [(v) => !!v || 'Req'] : []"
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            v-model="day.end_time"
                            :disabled="!day.is_working"
                            type="time"
                            density="compact"
                            variant="outlined"
                            class="my-1"
                            :rules="day.is_working ? [(v) => !!v || 'Req'] : []"
                          ></v-text-field>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-sheet>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">{{ $t('app.generic.cancel') }}</v-btn>
          <v-btn color="black" :loading="calendarStore.saving" @click="handleSave">
            {{ $t('app.generic.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useWorkingCalendarStore, type WorkingCalendar } from '@/stores/working-calendar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const calendarStore = useWorkingCalendarStore()
const dialog = ref(false)
const isEdit = ref(false)
const formRef = ref<any>(null)
const searchQuery = ref('')
let searchTimeout: any = null

const headers = computed(() => [
  { title: t('app.working_calendars.headers.name'), key: 'name' },
  { title: t('app.working_calendars.headers.duration'), key: 'cycle_duration' },
  { title: t('app.working_calendars.headers.start_date'), key: 'cycle_start_date' },
  { title: t('app.working_calendars.headers.status'), key: 'is_active', align: 'center' as const },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
])

const editedItem = reactive<WorkingCalendar>({
  id: null,
  name: '',
  cycle_duration: 7,
  description: '',
  is_active: true,
  cycle_start_date: '',
  days: [],
})

onMounted(() => calendarStore.fetchCalendars({}))

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    calendarStore.fetchCalendars({ search: searchQuery.value })
  }, 600)
}

const syncDaysCount = () => {
  const count = editedItem.cycle_duration
  if (editedItem.days.length > count) {
    editedItem.days = editedItem.days.slice(0, count)
  } else {
    while (editedItem.days.length < count) {
      const num = editedItem.days.length
      editedItem.days.push({
        day_number: num,
        is_working: true,
        day_label: `Day ${num + 1}`,
        start_time: '08:00',
        end_time: '16:00',
      })
    }
  }
}

const openAddModal = () => {
  isEdit.value = false
  Object.assign(editedItem, {
    id: null,
    name: '',
    cycle_duration: 7,
    description: '',
    is_active: true,
    cycle_start_date: new Date().toISOString().substr(0, 10),
    days: [],
  })
  syncDaysCount()
  dialog.value = true
}

const editCalendar = (item: any) => {
  isEdit.value = true
  const data = JSON.parse(JSON.stringify(item))
  if (data.cycle_start_date) data.cycle_start_date = data.cycle_start_date.split('T')[0]
  data.is_active = !!data.is_active
  Object.assign(editedItem, data)
  dialog.value = true
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  await calendarStore.saveCalendar(editedItem, isEdit.value)
  await calendarStore.fetchCalendars({ search: searchQuery.value })
  dialog.value = false
}

const confirmDelete = async (item: any) => {
  if (confirm(t('app.working_calendars.delete_confirm', { name: item.name }))) {
    await calendarStore.deleteCalendar(item.id)
    await calendarStore.fetchCalendars({ search: searchQuery.value })
  }
}
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}
</style>
