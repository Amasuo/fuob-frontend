<template>
  <v-card flat border class="rounded-lg">
    <v-card-text>
      <v-text-field
        v-model="search"
        label="Search Icons"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-4"
      ></v-text-field>

      <v-item-group v-model="selectedIcon" mandatory @update:model-value="emitIcon">
        <v-row dense style="max-height: 300px; overflow-y: auto">
          <v-col v-for="icon in filteredIcons" :key="icon" cols="2" class="d-flex justify-center">
            <v-item :value="icon" v-slot="{ isSelected, toggle }">
              <v-btn
                icon
                variant="text"
                :color="isSelected ? 'orange-darken-2' : 'grey-darken-1'"
                :class="{ 'bg-orange-lighten-5': isSelected }"
                @click="toggle"
              >
                <v-icon>{{ icon }}</v-icon>
                <v-tooltip activator="parent" location="top">{{ icon }}</v-tooltip>
              </v-btn>
            </v-item>
          </v-col>
        </v-row>
      </v-item-group>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(['update:modelValue']);

const search = ref('');
const selectedIcon = ref(props.modelValue || 'mdi-file-outline');

// A subset of common icons to keep the UI snappy
const commonIcons = [
  'mdi-view-dashboard-outline', 'mdi-account-group-outline', 'mdi-file-document-outline',
  'mdi-shield-crown-outline', 'mdi-account-tie-outline', 'mdi-clipboard-check-outline',
  'mdi-account-outline', 'mdi-cog-outline', 'mdi-calendar-check', 'mdi-briefcase-outline',
  'mdi-chart-bar', 'mdi-bell-outline', 'mdi-email-outline', 'mdi-folder-outline',
  'mdi-lock-outline', 'mdi-star-outline', 'mdi-check-circle-outline', 'mdi-alert-circle-outline'
];

const filteredIcons = computed(() => {
  if (!search.value) return commonIcons;
  return commonIcons.filter(icon => icon.toLowerCase().includes(search.value.toLowerCase()));
});

const emitIcon = (val: any) => {
  emit('update:modelValue', val);
};
</script>
