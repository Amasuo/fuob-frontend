<template>
  <v-container fluid class="pa-8 text-center">
    <v-avatar size="100" color="orange-lighten-4" class="mb-6">
      <v-icon size="50" color="orange-darken-2">mdi-account</v-icon>
    </v-avatar>
    <h1 class="text-h4 font-weight-bold mb-2">Welcome Back Employee!</h1>
    <p class="text-grey-darken-1 mb-8">Ready to plan your next break?</p>

    <v-row justify="center">
      <v-col cols="12" md="4">
        <v-card border flat class="pa-6 text-center">
          <div class="text-overline mb-2">Remaining Days</div>
          <div class="text-h3 font-weight-bold text-orange-darken-2">15</div>
          <v-btn color="grey-darken-4" class="mt-6 text-none" block size="large">
            Request New Leave
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
