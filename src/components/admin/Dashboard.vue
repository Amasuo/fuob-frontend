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

    <v-card border flat class="mt-8">
      <v-card-title class="pa-4 font-weight-bold">Pending Leave Requests</v-card-title>
      <v-divider></v-divider>
      <v-table>
        <thead>
        <tr>
          <th class="text-left">Employee</th>
          <th class="text-left">Type</th>
          <th class="text-left">Dates</th>
          <th class="text-right">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="request in pendingRequests" :key="request.id">
          <td>
            <div class="d-flex align-center py-2">
              <v-avatar size="32" color="grey-lighten-2" class="mr-3">
                <v-icon size="small">mdi-account</v-icon>
              </v-avatar>
              {{ request.employeeName }}
            </div>
          </td>
          <td><v-chip size="small" variant="tonal" color="blue">{{ request.type }}</v-chip></td>
          <td class="text-caption">{{ request.range }}</td>
          <td class="text-right">
            <v-btn icon="mdi-check" variant="text" color="success" density="comfortable"></v-btn>
            <v-btn icon="mdi-close" variant="text" color="error" density="comfortable"></v-btn>
          </td>
        </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const stats = [
  { title: 'Pending Approval', value: '12', icon: 'mdi-clock-outline', color: 'orange' },
  { title: 'On Leave Today', value: '5', icon: 'mdi-account-arrow-right', color: 'blue' },
  { title: 'Teams Available', value: '88%', icon: 'mdi-trending-up', color: 'success' },
  { title: 'Total Users', value: '42', icon: 'mdi-account-group', color: 'grey' },
]

const pendingRequests = [
  { id: 1, employeeName: 'Alice Johnson', type: 'Sick Leave', range: 'Mar 05 - Mar 07' },
  { id: 2, employeeName: 'Bob Smith', type: 'Annual Leave', range: 'Mar 10 - Mar 15' },
]
</script>
