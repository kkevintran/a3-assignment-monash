<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const { user, userRole, logout, loading } = useFirebaseAuth()

// Redirect if not admin
watch([user, userRole, loading], ([newUser, role, isLoading]) => {
  if (!isLoading) {
    if (!newUser) {
      router.push('/signin')
    } else if (role !== 'admin') {
      router.push('/dashboard')
    }
  }
}, { immediate: true })

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <p class="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
    <div v-else-if="user && userRole === 'admin'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Signed in as: <strong class="text-gray-900 dark:text-white">{{ user.email }}</strong>
            </p>
          </div>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
          >
            Sign Out
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <!-- Seed Jobs Card -->
          <router-link
            to="/admin/seed"
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div class="flex items-center mb-4">
              <div class="bg-blue-600 rounded-lg p-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                Seed Jobs
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Populate the database with mock job listings for testing
            </p>
          </router-link>

          <!-- Manage Jobs Card -->
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <div class="bg-green-600 rounded-lg p-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                Manage Jobs
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              View and manage all job listings in the system
            </p>
          </div>

          <!-- Manage Users Card -->
          <router-link
            to="/admin/users"
            class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <div class="flex items-center mb-4">
              <div class="bg-purple-600 rounded-lg p-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                Manage Users
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              View and manage user accounts and permissions
            </p>
          </router-link>

          <!-- Analytics Card -->
          <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <div class="bg-orange-600 rounded-lg p-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                Analytics
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              View platform statistics and insights
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

