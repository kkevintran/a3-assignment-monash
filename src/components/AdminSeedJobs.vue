<script setup lang="ts">
import { ref } from 'vue'
import { useFirestore } from '../composables/useFirestore'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const { seedMockJobs } = useFirestore()
const { user } = useFirebaseAuth()

const isSeeding = ref(false)
const seedCount = ref(50)
const seedResult = ref<{ successCount: number; errorCount: number; total: number } | null>(null)
const error = ref<string | null>(null)

const handleSeed = async () => {
  if (!user.value) {
    error.value = 'You must be signed in to seed jobs. Please sign in and try again.'
    return
  }

  isSeeding.value = true
  error.value = null
  seedResult.value = null

  try {
    const result = await seedMockJobs(seedCount.value)
    seedResult.value = result
    
    if (result.errorCount > 0 && result.successCount === 0) {
      error.value = `Failed to create all jobs. This might be a permissions issue. Make sure you're signed in and your Firestore rules allow job creation.`
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to seed jobs'
    console.error('Seed error:', err)
  } finally {
    isSeeding.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800">
    <div class="flex items-center mb-4">
      <div class="bg-blue-600 rounded-lg p-2 mr-3">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        Admin: Seed Jobs Database
      </h2>
    </div>

    <div class="space-y-4">
      <div>
        <label for="seed-count" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of jobs to create
        </label>
        <input
          id="seed-count"
          v-model.number="seedCount"
          type="number"
          min="1"
          max="200"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="isSeeding"
        />
      </div>

      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
        <p class="text-xs text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This will create mock job listings in your Firestore database.
        </p>
      </div>

      <button
        @click="handleSeed"
        :disabled="isSeeding"
        class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
      >
        <span v-if="isSeeding">Seeding jobs...</span>
        <span v-else>Seed {{ seedCount }} Jobs</span>
      </button>

      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
        <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
      </div>

      <div v-if="seedResult" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
        <h3 class="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
          Seeding Complete!
        </h3>
        <p class="text-xs text-green-700 dark:text-green-300">
          Successfully created: <strong>{{ seedResult.successCount }}</strong> jobs<br>
          Errors: <strong>{{ seedResult.errorCount }}</strong> jobs<br>
          Total attempted: <strong>{{ seedResult.total }}</strong> jobs
        </p>
      </div>
    </div>
  </div>
</template>

