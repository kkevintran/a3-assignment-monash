<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()

// Hide NavBar on dashboard routes
const shouldShowNavBar = computed(() => {
  const dashboardRoutes = ['/dashboard', '/admin']
  return !dashboardRoutes.some(routePath => route.path.startsWith(routePath))
})
</script>

<template>
  <NavBar v-if="shouldShowNavBar" />
  <router-view />
</template>
