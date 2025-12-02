<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { useFirestore } from '../composables/useFirestore'

const router = useRouter()
const { user, userRole, loading: authLoading } = useFirebaseAuth()
const { getAllUsers } = useFirestore()

const users = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const hasFetched = ref(false)

// Redirect if not admin and fetch users when admin role is confirmed
watch([user, userRole, authLoading], ([newUser, role, isLoading]) => {
  if (!isLoading) {
    if (!newUser) {
      router.push('/signin')
    } else if (role !== 'admin') {
      router.push('/dashboard')
    } else if (role === 'admin' && !hasFetched.value) {
      // Fetch users when admin role is confirmed
      hasFetched.value = true
      fetchUsers()
    }
  }
}, { immediate: true })

const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null
    users.value = await getAllUsers()
  } catch (err: any) {
    console.error('Error fetching users:', err)
    error.value = err.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: any) => {
  if (!date) return 'N/A'
  try {
    // Handle Firestore Timestamp
    if (date.toDate) {
      return date.toDate().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    // Handle Date object
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    // Handle string
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Invalid date'
  }
}

const formatGender = (gender: string) => {
  if (!gender) return 'N/A'
  return gender
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

onMounted(() => {
  // If user and role are already available, fetch users
  if (user.value && userRole.value === 'admin' && !hasFetched.value) {
    hasFetched.value = true
    fetchUsers()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="authLoading || loading" class="min-h-screen flex items-center justify-center">
      <p class="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
    <div v-else-if="user && userRole === 'admin'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                All Users
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage all user accounts
              </p>
            </div>
            <router-link
              to="/dashboard"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              Back to Dashboard
            </router-link>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
        </div>

        <!-- Users Count -->
        <div v-if="!loading && users.length > 0" class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Total Users: <strong class="font-semibold text-gray-900 dark:text-white">{{ users.length }}</strong>
          </p>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && users.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no users registered in the system yet.
          </p>
        </div>

        <!-- Users List -->
        <div v-if="!loading && users.length > 0" class="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <div
            v-for="userItem in users"
            :key="userItem.id"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <!-- Header Section -->
            <div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ userItem.firstName || 'N/A' }} {{ userItem.lastName || 'N/A' }}
                </h3>
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded',
                      userItem.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                    ]"
                  >
                    {{ userItem.role || 'user' }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    User ID: {{ userItem.id }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Signup Date - Prominently Displayed -->
            <div class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p class="text-xs font-medium text-green-800 dark:text-green-200">Signed Up</p>
                  <p class="text-sm font-semibold text-green-900 dark:text-green-100">
                    {{ formatDate(userItem.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Personal Information Section -->
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Personal Information
              </h4>
              <div class="space-y-3">
                <!-- Email -->
                <div class="flex items-start">
                  <svg class="w-5 h-5 mr-3 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white break-words">
                      {{ userItem.email || 'N/A' }}
                    </p>
                  </div>
                </div>

                <!-- Gender -->
                <div class="flex items-start">
                  <svg class="w-5 h-5 mr-3 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatGender(userItem.gender) }}
                    </p>
                  </div>
                </div>

                <!-- Country -->
                <div class="flex items-start">
                  <svg class="w-5 h-5 mr-3 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Country</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ userItem.country || 'N/A' }}
                    </p>
                  </div>
                </div>

                <!-- Language -->
                <div class="flex items-start">
                  <svg class="w-5 h-5 mr-3 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Language</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ userItem.language || 'N/A' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Information Section -->
            <div class="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Account Information
              </h4>
              <div class="space-y-3">
                <!-- Last Updated -->
                <div class="flex items-start">
                  <svg class="w-5 h-5 mr-3 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatDate(userItem.updatedAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents Section -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Documents
              </h4>
              <div class="flex flex-wrap gap-3">
                <div v-if="userItem.resumeUrl" class="flex items-center">
                  <a
                    :href="userItem.resumeUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    View Resume
                  </a>
                </div>
                <div v-else class="flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  No Resume
                </div>

                <div v-if="userItem.coverLetterUrl" class="flex items-center">
                  <a
                    :href="userItem.coverLetterUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    View Cover Letter
                  </a>
                </div>
                <div v-else class="flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  No Cover Letter
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

