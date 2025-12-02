<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  job: any | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  applied: []
  openApplicationForm: [job: any]
}>()


const handleApply = () => {
  if (!props.job) return
  emit('openApplicationForm', props.job)
}

const closeModal = () => {
  emit('close')
}

const formatDate = (date: any) => {
  if (!date) return 'N/A'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatSalary = (salary: any) => {
  if (!salary) return 'Not specified'
  const { min, max, currency, period } = salary
  const periodText = period === 'yearly' ? 'year' : period === 'monthly' ? 'month' : 'hour'
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}/${periodText === 'year' ? 'yr' : periodText === 'month' ? 'mo' : 'hr'}`
}

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<template>
  <div
    v-if="isOpen && job"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="closeModal"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Modal Content -->
        <div class="p-8">
          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 pr-8">
                <div class="flex items-center gap-2 mb-2">
                  <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                    {{ job.title }}
                  </h2>
                  <span v-if="job.featured" class="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                    Featured
                  </span>
                </div>
                <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  {{ job.companyName }}
                </p>
              </div>
            </div>

            <!-- Key Info Grid -->
            <div class="grid md:grid-cols-2 gap-4 mb-6">
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {{ job.location?.city }}, {{ job.location?.country }}
                  <span v-if="job.location?.remote" class="ml-1 text-blue-600 dark:text-blue-400 font-medium">(Remote)</span>
                  <span v-else-if="job.location?.hybrid" class="ml-1 text-purple-600 dark:text-purple-400 font-medium">(Hybrid)</span>
                </span>
              </div>

              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="capitalize">{{ job.jobType?.replace('-', ' ') }}</span>
              </div>

              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span class="capitalize">{{ job.experienceLevel }}</span>
              </div>

              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ formatSalary(job.salary) }}</span>
              </div>
            </div>

            <!-- Metrics -->
            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="font-semibold text-gray-900 dark:text-white">{{ job.averageRating?.toFixed(1) || 'N/A' }}</span>
                <span class="text-gray-500 dark:text-gray-400">({{ job.ratingCount || 0 }} reviews)</span>
              </div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ formatNumber(job.views || 0) }} views
              </div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ formatNumber(job.saves || 0) }} saved
              </div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ formatNumber(job.applicantCount || 0) }} applicants
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ job.description }}</p>
          </div>

          <!-- Required Skills -->
          <div v-if="job.requiredSkills && job.requiredSkills.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, index) in job.requiredSkills"
                :key="index"
                class="px-3 py-1 text-sm font-medium rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- Preferred Skills -->
          <div v-if="job.preferredSkills && job.preferredSkills.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preferred Skills</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, index) in job.preferredSkills"
                :key="index"
                class="px-3 py-1 text-sm font-medium rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- Requirements -->
          <div v-if="job.requirements && job.requirements.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
            <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li v-for="(req, index) in job.requirements" :key="index">{{ req }}</li>
            </ul>
          </div>

          <!-- Responsibilities -->
          <div v-if="job.responsibilities && job.responsibilities.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Responsibilities</h3>
            <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li v-for="(resp, index) in job.responsibilities" :key="index">{{ resp }}</li>
            </ul>
          </div>

          <!-- Benefits -->
          <div v-if="job.benefits && job.benefits.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Benefits</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(benefit, index) in job.benefits"
                :key="index"
                class="px-3 py-1 text-sm font-medium rounded bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200"
              >
                {{ benefit }}
              </span>
            </div>
          </div>

          <!-- Application Instructions -->
          <div v-if="job.applicationInstructions" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Application Instructions</h3>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ job.applicationInstructions }}</p>
          </div>

          <!-- Posted Date -->
          <div class="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Posted {{ formatDate(job.postedAt) }}
            <span v-if="job.applicationDeadline">
              • Application deadline: {{ formatDate(job.applicationDeadline) }}
            </span>
          </div>

          <!-- Apply Button -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex gap-4">
              <button
                @click="handleApply"
                class="flex-1 px-6 py-3 text-base font-medium rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white"
              >
                Apply Now
              </button>
              
              <button
                @click="closeModal"
                class="px-6 py-3 text-base font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

