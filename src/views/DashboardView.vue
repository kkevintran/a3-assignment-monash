<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import AdminSeedJobs from '../components/AdminSeedJobs.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'

const router = useRouter()
const { user, userRole, loading } = useFirebaseAuth()

// Redirect to login if not authenticated
watch([user, loading], ([newUser, isLoading]) => {
  if (!isLoading && !newUser) {
    router.push('/')
  }
}, { immediate: true })

const isAdmin = () => userRole.value === 'admin'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <p class="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
    <div v-else-if="user" class="flex">
      <!-- Sidebar -->
      <DashboardSidebar />
      
      <!-- Main Content -->
      <main class="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, <strong class="text-gray-900 dark:text-white">{{ user.email }}</strong>
              <span v-if="isAdmin()" class="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
                Admin
              </span>
            </p>
          </div>

        <div class="space-y-6">
          <!-- Admin-only section -->
          <div v-if="isAdmin()" class="mb-6">
            <AdminSeedJobs />
          </div>

          <!-- User-specific content -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- My Applications Card -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="bg-blue-600 rounded-lg p-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                  My Applications
                </h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                View and manage your job applications
              </p>
            </div>

            <!-- Saved Jobs Card -->
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="bg-green-600 rounded-lg p-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Jobs
                </h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Jobs you've bookmarked for later
              </p>
            </div>

            <!-- Profile Card -->
            <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="bg-purple-600 rounded-lg p-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                  My Profile
                </h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Update your profile information and resume
              </p>
            </div>

            <!-- Browse Jobs Card -->
            <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="bg-orange-600 rounded-lg p-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 class="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Browse Jobs
                </h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Search and discover new job opportunities
              </p>
            </div>
          </div>

          <!-- Role indicator -->
          <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Role: <span class="font-semibold text-gray-900 dark:text-white">{{ userRole || 'user' }}</span>
            </p>
          </div>
        </div>
      </div>
      </main>
    </div>
  </div>
</template>

