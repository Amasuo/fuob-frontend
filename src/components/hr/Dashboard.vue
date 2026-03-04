<template>
  <v-container fluid class="pa-8">
    <h1 class="text-h4 font-weight-bold mb-6">Admin Overview</h1>

    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
        <v-card border flat class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-icon :color="stat.color" :icon="stat.icon" class="mr-2"></v-icon>
            <span class="text-overline text-grey-darken-1">{{ stat.title }}</span>
          </div>
          <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const stats = [
  { title: 'Pending Approval', value: '12', icon: 'mdi-clock-outline', color: 'orange' },
  { title: 'On Leave Today', value: '5', icon: 'mdi-account-arrow-right', color: 'blue' },
  { title: 'Teams Available', value: '88%', icon: 'mdi-trending-up', color: 'success' },
  { title: 'Total Users', value: '42', icon: 'mdi-account-group', color: 'grey' },
]
</script>
