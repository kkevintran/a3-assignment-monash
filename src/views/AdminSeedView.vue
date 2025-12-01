<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { useFirestore } from '../composables/useFirestore'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const { user, userRole, loading: authLoading } = useFirebaseAuth()
const { seedMockJobs } = useFirestore()

const isSeeding = ref(false)
const seedCount = ref(50)
const seedResult = ref<{ successCount: number; errorCount: number; total: number } | null>(null)
const error = ref<string | null>(null)

// Redirect if not authenticated or not admin
watch([user, userRole, authLoading], ([newUser, role, isLoading]) => {
  if (!isLoading) {
    if (!newUser) {
      router.push('/signin')
    } else if (role !== 'admin') {
      router.push('/dashboard')
    }
  }
}, { immediate: true })

const handleSeed = async () => {
  if (!user.value) {
    error.value = 'You must be signed in to seed jobs'
    return
  }

  isSeeding.value = true
  error.value = null
  seedResult.value = null

  try {
    const result = await seedMockJobs(seedCount.value)
    seedResult.value = result
  } catch (err: any) {
    error.value = err.message || 'Failed to seed jobs'
    console.error('Seed error:', err)
  } finally {
    isSeeding.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NavBar />
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Seed Jobs Database
        </h1>

        <div class="space-y-6">
          <div>
            <label for="count" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of jobs to create
            </label>
            <input
              id="count"
              v-model.number="seedCount"
              type="number"
              min="1"
              max="200"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="isSeeding"
            />
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This will create mock job listings in your Firestore database.
              Make sure you have proper permissions (admin or employer role) to create jobs.
            </p>
          </div>

          <button
            @click="handleSeed"
            :disabled="isSeeding || !user"
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
          >
            <span v-if="isSeeding">Seeding jobs...</span>
            <span v-else>Seed {{ seedCount }} Jobs</span>
          </button>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
            <p class="text-xs text-red-600 dark:text-red-300 mt-2">
              If you're getting permission errors, make sure:
              <ul class="list-disc list-inside mt-1">
                <li>Your user has 'admin' or 'employer' role in Firestore</li>
                <li>Or temporarily update firestore.rules to allow job creation</li>
              </ul>
            </p>
          </div>

          <div v-if="seedResult" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <h3 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Seeding Complete!
            </h3>
            <p class="text-sm text-green-700 dark:text-green-300">
              Successfully created: <strong>{{ seedResult.successCount }}</strong> jobs<br>
              Errors: <strong>{{ seedResult.errorCount }}</strong> jobs<br>
              Total attempted: <strong>{{ seedResult.total }}</strong> jobs
            </p>
          </div>

          <div v-if="!user && !authLoading" class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Please <router-link to="/signin" class="text-blue-600 dark:text-blue-400 hover:underline">sign in</router-link> to seed jobs.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

