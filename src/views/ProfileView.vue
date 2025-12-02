<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { useFirestore } from '../composables/useFirestore'
import DashboardSidebar from '../components/DashboardSidebar.vue'

const router = useRouter()
const { user, loading: authLoading } = useFirebaseAuth()
const { getUserProfile } = useFirestore()

const userProfile = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Watch for user availability and fetch profile
watch([user, authLoading], async ([newUser, isLoading]) => {
  if (!isLoading && !newUser) {
    router.push('/')
    loading.value = false
  } else if (!isLoading && newUser && !userProfile.value) {
    await loadProfile()
  }
}, { immediate: true })

const loadProfile = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    userProfile.value = await getUserProfile(user.value.uid)
  } catch (err: any) {
    console.error('Error loading profile:', err)
    error.value = err.message || 'Failed to load profile'
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
        month: 'long', 
        day: 'numeric' 
      })
    }
    // Handle Date object
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
    // Handle string
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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
  if (user.value && !authLoading && !userProfile.value) {
    loadProfile()
  } else if (!authLoading && !user.value) {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="authLoading || loading" class="min-h-screen flex items-center justify-center">
      <p class="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
    <div v-else-if="user" class="flex">
      <!-- Sidebar -->
      <DashboardSidebar />
      
      <!-- Main Content -->
      <main class="flex-1 p-8 overflow-y-auto h-screen ml-64">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage your profile information
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>

          <!-- Profile Content -->
          <div v-if="userProfile" class="space-y-6">
            <!-- Personal Information Section -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <!-- Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <p class="text-gray-900 dark:text-white text-lg">
                    {{ userProfile.firstName || 'N/A' }} {{ userProfile.lastName || '' }}
                  </p>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <p class="text-gray-900 dark:text-white text-lg">
                    {{ userProfile.email || user?.email || 'N/A' }}
                  </p>
                </div>

                <!-- Gender -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <p class="text-gray-900 dark:text-white text-lg">
                    {{ formatGender(userProfile.gender) }}
                  </p>
                </div>

                <!-- Country -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <p class="text-gray-900 dark:text-white text-lg">
                    {{ userProfile.country || 'N/A' }}
                  </p>
                </div>

                <!-- Language -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <p class="text-gray-900 dark:text-white text-lg">
                    {{ userProfile.language || 'N/A' }}
                  </p>
                </div>

                <!-- Role -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <span
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      userProfile.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                    ]"
                  >
                    {{ userProfile.role || 'user' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Account Information Section -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Account Information
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <!-- Account Created -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Created
                  </label>
                  <p class="text-gray-900 dark:text-white text-lg">
                    {{ formatDate(userProfile.createdAt) }}
                  </p>
                </div>

                <!-- Last Updated -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Updated
                  </label>
                  <p class="text-gray-900 dark:text-white text-lg">
                    {{ formatDate(userProfile.updatedAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Documents Section -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Documents
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <!-- Resume -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resume
                  </label>
                  <div v-if="userProfile.resumeUrl" class="flex items-center gap-2">
                    <a
                      :href="userProfile.resumeUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View Resume
                    </a>
                  </div>
                  <p v-else class="text-gray-500 dark:text-gray-400">
                    No resume uploaded
                  </p>
                </div>

                <!-- Cover Letter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover Letter
                  </label>
                  <div v-if="userProfile.coverLetterUrl" class="flex items-center gap-2">
                    <a
                      :href="userProfile.coverLetterUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View Cover Letter
                    </a>
                  </div>
                  <p v-else class="text-gray-500 dark:text-gray-400">
                    No cover letter uploaded
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="!loading && !error" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No profile found</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Unable to load your profile information.
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>

