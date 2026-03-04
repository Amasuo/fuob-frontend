<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-row align="center" justify="center" class="text-center">
      <v-col cols="12" sm="8" md="6">
        <div class="mb-8">
          <v-icon
            icon="mdi-shield-lock-outline"
            size="120"
            color="orange-darken-2"
            class="mb-4"
          ></v-icon>
        </div>

        <h1 class="text-h3 font-weight-bold mb-4" style="color: #2c3e50;">
          Access Denied
        </h1>
        <p class="text-h6 text-grey-darken-1 mb-8">
          Oops! It looks like you don't have the permissions required to view this page.
          Please contact your HR administrator if you believe this is a mistake.
        </p>

        <div class="d-flex justify-center gap-4">
          <v-btn
            color="orange-darken-2"
            variant="outlined"
            size="large"
            class="text-none px-8"
            prepend-icon="mdi-home-outline"
            to="/"
          >
            Return Home
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
/**
 * This page is triggered by the router guard when
 * an employee attempts to access admin-only routes.
 */
</script>

<style scoped>
.fill-height {
  min-height: 80vh;
}

/* Subtle animation for the icon */
.v-icon {
  animation: lock-nudge 2s ease-in-out infinite;
}

@keyframes lock-nudge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>

<route lang="yaml">
meta:
  layout: blank
</route>
