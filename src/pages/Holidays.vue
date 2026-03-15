<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ $t('app.holidays.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ $t('app.holidays.subtitle') }}</p>
        </div>

        <div class="d-flex align-center" style="gap: 16px">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :label="$t('app.generic.search')"
            variant="outlined"
            density="comfortable"
            hide-details
            style="width: 250px"
            @input="onSearchInput"
          ></v-text-field>

          <v-btn-toggle v-model="viewType" density="comfortable" mandatory color="grey-darken-4">
            <v-btn value="calendar" icon="mdi-calendar-month"></v-btn>
            <v-btn value="list" icon="mdi-format-list-bulleted"></v-btn>
          </v-btn-toggle>

          <v-btn color="grey-darken-4" prepend-icon="mdi-plus" height="48" @click="openAddModal">
            {{ $t('app.holidays.add_holiday') }}
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" :md="viewType === 'calendar' ? 9 : 12">
        <v-card flat border class="rounded-lg" :loading="holidayStore.loading">

          <template v-if="viewType === 'calendar'">
            <v-toolbar color="transparent" flat border class="border-bottom">
              <v-btn icon @click="prevMonth"><v-icon>mdi-chevron-left</v-icon></v-btn>
              <v-spacer></v-spacer>
              <v-toolbar-title class="text-center font-weight-bold">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="nextMonth"><v-icon>mdi-chevron-right</v-icon></v-btn>
            </v-toolbar>

            <v-card-text class="pa-0">
              <v-row no-gutters class="bg-grey-lighten-5 border-bottom">
                <v-col v-for="day in daysOfWeek" :key="day" class="text-center py-2 border-end">
                  <span class="text-caption font-weight-black text-grey-darken-1">{{ day }}</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  v-for="n in blankDays"
                  :key="'blank-' + n"
                  style="flex: 0 0 14.28%; max-width: 14.28%"
                  class="border-end border-bottom bg-grey-lighten-5"
                >
                  <v-responsive :aspect-ratio="1"></v-responsive>
                </v-col>

                <v-col
                  v-for="date in daysInMonth"
                  :key="date"
                  style="flex: 0 0 14.28%; max-width: 14.28%"
                  class="border-end border-bottom day-cell"
                  @click="handleDateClick(date)"
                >
                  <v-responsive :aspect-ratio="1" class="pa-2">
                    <v-avatar size="28" :color="isToday(date) ? 'red-lighten-4' : 'transparent'">
                      <span
                        class="text-body-2"
                        :class="isToday(date) ? 'text-red-darken-4 font-weight-bold' : ''"
                      >{{ date }}</span>
                    </v-avatar>
                    <v-chip
                      v-if="hasHoliday(date)"
                      size="x-small"
                      color="indigo-darken-2"
                      variant="flat"
                      class="mt-1 w-100 px-1 rounded-sm"
                    >
                      <span class="text-truncate" style="font-size: 10px">
                        {{ getHoliday(date)?.name }}
                      </span>
                    </v-chip>
                  </v-responsive>
                </v-col>
              </v-row>
            </v-card-text>
          </template>

          <template v-else>
            <v-data-table
              :headers="headers"
              :items="filteredHolidays"
              hover
              class="bg-transparent"
            >
              <template #[`item.date`]="{ item }">
                <div class="font-weight-bold text-body-2">
                  {{ new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                </div>
              </template>
              <template #[`item.actions`]="{ item }">
                <div class="d-flex justify-end">
                  <v-btn icon variant="text" size="small" color="blue-darken-2" class="mr-2" @click.stop="editHoliday(item)">
                    <v-icon size="20">mdi-pencil-outline</v-icon>
                  </v-btn>
                  <v-btn icon variant="text" size="small" color="red-lighten-1" @click.stop="confirmDelete(item)">
                    <v-icon size="20">mdi-trash-can-outline</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </template>
        </v-card>
      </v-col>

      <v-col v-if="viewType === 'calendar'" cols="12" md="3">
        <v-card flat border class="rounded-lg h-100">
          <v-list lines="two">
            <v-list-subheader class="font-weight-bold text-indigo-darken-4">
              {{ $t('app.holidays.month_events') }}
            </v-list-subheader>
            <v-divider></v-divider>
            <v-list-item v-for="h in holidaysInMonth" :key="h.id">
              <template #prepend>
                <v-chip color="indigo" variant="tonal" size="small" class="font-weight-bold mr-2">
                  {{ h.day }}
                </v-chip>
              </template>
              <v-list-item-title class="text-body-2 font-weight-bold">{{ h.name }}</v-list-item-title>
              <template #append>
                <v-btn
                  icon="mdi-trash-can-outline"
                  variant="text"
                  size="x-small"
                  color="red-lighten-1"
                  @click.stop="confirmDelete(h)"
                ></v-btn>
              </template>
            </v-list-item>
            <v-list-item v-if="holidaysInMonth.length === 0">
              <v-list-item-title class="text-caption text-grey text-center">
                {{ $t('app.holidays.no_holiday') }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="rounded-lg pa-4">
        <v-card-title class="font-weight-bold">
          {{ isEdit ? $t('app.holidays.edit_holiday') : $t('app.holidays.add_holiday') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.date"
                  :label="$t('app.holidays.date')"
                  type="date"
                  variant="outlined"
                  :readonly="isEdit"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  :label="$t('app.holidays.name')"
                  variant="outlined"
                  :rules="[(v) => !!v || $t('app.generic.required')]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">{{ $t('app.generic.cancel') }}</v-btn>
          <v-btn color="black" :loading="holidayStore.saving" @click="handleSave">
            {{ $t('app.generic.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHolidayStore } from '@/stores/holiday'
import type { Holiday } from '@/stores/holiday'

const { t } = useI18n()
const holidayStore = useHolidayStore()

const viewType     = ref('calendar')
const dialog       = ref(false)
const isEdit       = ref(false)
const searchQuery  = ref('')
const formRef      = ref<any>(null)
let   searchTimeout: any = null

const daysOfWeek = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const now = new Date()
const currentMonth = ref(now.getMonth())
const currentYear  = ref(now.getFullYear())

const editedItem = reactive<Partial<Holiday>>({ id: undefined, date: '', name: '' })

const headers = [
  { title: t('app.holidays.date'),   key: 'date' },
  { title: t('app.holidays.name'),   key: 'name' },
  { title: t('app.generic.actions'), key: 'actions', align: 'end' as const, sortable: false },
]

const filteredHolidays = computed(() =>
  holidayStore.holidays.filter(h =>
    h.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const reload = () => holidayStore.fetchHolidays()

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {}, 400)
}

const daysInMonth = computed(() =>
  new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
)

const blankDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
})

const holidaysInMonth = computed(() =>
  holidayStore.holidays
    .filter(h => {
      const d = new Date(h.date)
      return d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value
    })
    .map(h => ({ ...h, day: new Date(h.date).getDate() }))
    .sort((a, b) => a.day - b.day)
)

const formatDate = (day: number) => {
  const m = String(currentMonth.value + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${currentYear.value}-${m}-${d}`
}

const hasHoliday = (day: number) =>
  holidayStore.holidays.some(h => h.date === formatDate(day))

const getHoliday = (day: number) =>
  holidayStore.holidays.find(h => h.date === formatDate(day))

const isToday = (day: number) => {
  const d = new Date()
  return d.getDate() === day && d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value
}

const prevMonth = () => {
  currentMonth.value === 0
    ? (currentMonth.value = 11, currentYear.value--)
    : currentMonth.value--
}

const nextMonth = () => {
  currentMonth.value === 11
    ? (currentMonth.value = 0, currentYear.value++)
    : currentMonth.value++
}

const openAddModal = () => {
  isEdit.value = false
  Object.assign(editedItem, { id: undefined, date: new Date().toISOString().split('T')[0], name: '' })
  dialog.value = true
}

const editHoliday = (item: Holiday) => {
  isEdit.value = true
  Object.assign(editedItem, { ...item })
  dialog.value = true
}

const handleDateClick = (day: number) => {
  const existing = getHoliday(day)
  if (existing) editHoliday(existing)
  else {
    isEdit.value = false
    Object.assign(editedItem, { id: undefined, date: formatDate(day), name: '' })
    dialog.value = true
  }
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const ok = await holidayStore.saveHoliday(editedItem as Holiday, isEdit.value)
  if (ok) {
    await reload()
    dialog.value = false
  }
}

const confirmDelete = async (h: Holiday) => {
  if (confirm(t('app.holidays.delete_confirm', { name: h.name }))) {
    const ok = await holidayStore.deleteHoliday(h.id)
    if (ok) await reload()
  }
}

onMounted(reload)
</script>

<style scoped>
.day-cell { cursor: pointer; transition: background 0.2s; position: relative; }
.day-cell:hover { background-color: #f8f9fa; }
.border-bottom { border-bottom: 1px solid #e0e0e0 !important; }
.border-end { border-right: 1px solid #e0e0e0 !important; }
</style>