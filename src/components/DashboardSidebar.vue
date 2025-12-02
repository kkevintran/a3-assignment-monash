<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const route = useRoute()
const { logout, user } = useFirebaseAuth()

const handleLogout = async () => {
  await logout()
  router.push('/')
}

const navigateTo = (path: string) => {
  router.push(path)
}

const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-screen overflow-y-auto">
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p v-if="user" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ user.email }}
        </p>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2">
        <!-- Profile Menu Item -->
        <button
          @click="navigateTo('/dashboard/profile')"
          :class="[
            'w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors group',
            isActive('/dashboard/profile')
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <svg 
            :class="[
              'w-5 h-5 mr-3',
              isActive('/dashboard/profile')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
            ]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="font-medium">Profile</span>
        </button>

        <!-- Applications Menu Item -->
        <button
          @click="navigateTo('/dashboard/applications')"
          :class="[
            'w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors group',
            isActive('/dashboard/applications')
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <svg 
            :class="[
              'w-5 h-5 mr-3',
              isActive('/dashboard/applications')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
            ]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="font-medium">Applications</span>
        </button>

        <!-- Jobs Menu Item -->
        <button
          @click="navigateTo('/dashboard/jobs')"
          :class="[
            'w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors group',
            isActive('/dashboard/jobs')
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <svg 
            :class="[
              'w-5 h-5 mr-3',
              isActive('/dashboard/jobs')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
            ]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="font-medium">Jobs</span>
        </button>
      </nav>

      <!-- Sign Out Button -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
</style>

