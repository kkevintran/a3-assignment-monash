<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const { user, logout, loading } = useFirebaseAuth()

// Redirect to login if not authenticated
watch([user, loading], ([newUser, isLoading]) => {
  if (!isLoading && !newUser) {
    router.push('/')
  }
}, { immediate: true })

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <p class="text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
  <div v-else-if="user" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
          >
            Sign Out
          </button>
        </div>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-400">
            Welcome to your dashboard!
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500">
            Signed in as: <strong class="text-gray-900 dark:text-white">{{ user.email }}</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

