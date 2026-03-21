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

          <v-btn
            color="grey-darken-4"
            prepend-icon="mdi-plus"
            height="48"
            class="rounded-lg px-6"
            @click="openAddModal"
          >
            {{ $t('app.working_calendars.add_calendar') }}
          </v-btn>
        </div>
      </v-col>

      <v-col
        v-for="calendar in calendarStore.calendars"
        :key="calendar.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card
          flat
          border
          class="rounded-lg pa-5 mb-2"
          hover
          @click="editCalendar(calendar)"
        >
          <div class="d-flex justify-space-between align-start mb-6">
            <v-avatar size="36" color="grey-lighten-4" class="rounded-lg">
              <v-icon color="grey-darken-3" size="22">mdi-calendar-clock</v-icon>
            </v-avatar>

            <v-chip
              size="x-small"
              :color="calendar.is_active ? 'green-darken-1' : 'grey-darken-1'"
              variant="tonal"
              class="font-weight-bold px-3 text-uppercase"
            >
              {{ calendar.is_active ? $t('app.working_calendars.active') : $t('app.working_calendars.inactive') }}
            </v-chip>
          </div>

          <h3
            class="font-weight-bold text-uppercase text-body-2 mb-4 text-truncate"
            style="letter-spacing: 0.5px"
          >
            {{ calendar.name }}
          </h3>

          <div class="text-body-2 mb-4">
            <div class="d-flex align-center mb-2">
              <v-icon size="16" color="grey-darken-1" class="mr-3">mdi-refresh</v-icon>
              <span class="text-grey-darken-1">{{ $t('app.working_calendars.duration') }}</span>
              <strong class="ml-1 text-grey-darken-4">{{ calendar.cycle_duration }} {{ $t('app.working_calendars.grid.day') }}s</strong>
            </div>
            <div class="d-flex align-center">
              <v-icon size="16" color="grey-darken-1" class="mr-3">mdi-play-outline</v-icon>
              <span class="text-grey-darken-1">{{ $t('app.working_calendars.start_date') }}</span>
              <strong class="ml-1 text-grey-darken-4">{{ formatDate(calendar.cycle_start_date) }}</strong>
            </div>
          </div>

          <v-divider class="mb-3" opacity="0.1"></v-divider>

          <div class="d-flex justify-end">
            <v-btn
              icon="mdi-pencil-outline"
              variant="text"
              size="small"
              color="blue-darken-2"
              @click.stop="editCalendar(calendar)"
            ></v-btn>
            <v-btn
              icon="mdi-trash-can-outline"
              variant="text"
              size="small"
              color="red-lighten-1"
              @click.stop="confirmDelete(calendar)"
            ></v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="1200px" persistent scrollable>
      <v-card class="rounded-lg">
        <v-toolbar color="white" border="b">
          <v-toolbar-title class="font-weight-bold">
            {{ isEdit ? $t('app.working_calendars.edit_calendar') : $t('app.working_calendars.new_calendar') }}
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
                <v-row dense>
                  <v-col v-for="(day, index) in editedItem.days" :key="index" cols="12" sm="6">
                    <v-card flat border class="pa-4 rounded-lg mb-2">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="font-weight-bold text-uppercase text-caption text-grey">
                          {{ $t('app.working_calendars.grid.day') }} {{ index + 1 }}
                        </span>
                        <v-checkbox-btn
                          v-model="day.is_working"
                          color="primary"
                          density="compact"
                        ></v-checkbox-btn>
                      </div>

                      <v-row dense>
                        <v-col cols="6">
                          <v-text-field
                            v-model="day.start_time"
                            :disabled="!day.is_working"
                            type="time"
                            density="compact"
                            variant="outlined"
                            :label="$t('app.working_calendars.grid.start')"
                            hide-details
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model="day.end_time"
                            :disabled="!day.is_working"
                            type="time"
                            density="compact"
                            variant="outlined"
                            :label="$t('app.working_calendars.grid.end')"
                            hide-details
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">
            {{ $t('app.generic.cancel') }}
          </v-btn>
          <v-btn
            color="grey-darken-4"
            :loading="calendarStore.saving"
            @click="handleSave"
            class="px-6"
          >
            {{ $t('app.generic.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useWorkingCalendarStore, type WorkingCalendar } from '@/stores/working-calendar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const calendarStore = useWorkingCalendarStore()
const dialog = ref(false)
const isEdit = ref(false)
const formRef = ref<any>(null)
const searchQuery = ref('')
let searchTimeout: any = null

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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr.split('T')[0].split('-').reverse().join('-')
}

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
        day_label: '',
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