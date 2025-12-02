<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { useFirestore } from '../composables/useFirestore'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import ApplicationCard from '../components/ApplicationCard.vue'

const router = useRouter()
const { user, loading: authLoading } = useFirebaseAuth()
const { getUserApplications } = useFirestore()

const applications = ref<Array<{
  id: string
  jobId: string
  job: any
  application: any
}>>([])
const totalApplications = ref(0)
const hasMore = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const limit = 10
const hasFetched = ref(false)

// Watch for user availability and fetch applications
watch([user, authLoading], ([newUser, isLoading]) => {
  if (!isLoading && !newUser) {
    router.push('/')
    loading.value = false
  } else if (!isLoading && newUser && !hasFetched.value) {
    // Fetch applications when user becomes available (only once)
    hasFetched.value = true
    fetchApplications()
  }
}, { immediate: true })

const fetchApplications = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    const result = await getUserApplications(user.value.uid, limit)
    applications.value = result.applications
    totalApplications.value = result.total
    hasMore.value = result.hasMore
  } catch (err: any) {
    console.error('Error fetching applications:', err)
    error.value = err.message || 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // If user is already available when component mounts, fetch immediately
  if (user.value && !authLoading && !hasFetched.value) {
    hasFetched.value = true
    fetchApplications()
  } else if (!authLoading && !user.value) {
    // If auth is done loading but no user, stop loading state
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
      <main class="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              My Applications
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and track all your job applications
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && applications.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No application submitted.</h3>
          </div>

          <!-- Applications List -->
          <div v-if="!loading && applications.length > 0" class="space-y-4">
            <!-- Pagination Info -->
            <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {{ applications.length }} of {{ totalApplications }} application{{ totalApplications !== 1 ? 's' : '' }}
            </div>

            <ApplicationCard
              v-for="item in applications"
              :key="item.id"
              :application="item"
            />

            <!-- Pagination Note -->
            <div v-if="hasMore" class="mt-6 text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Showing first {{ limit }} applications. {{ totalApplications - limit }} more application{{ totalApplications - limit !== 1 ? 's' : '' }} available.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

