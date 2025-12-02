<script setup lang="ts">
defineProps<{
  job: any
}>()

const emit = defineEmits<{
  viewDetails: [job: any]
  apply: [job: any]
}>()

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
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Header: Title and Featured Badge -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ job.title }}
              </h3>
              <span v-if="job.featured" class="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                Featured
              </span>
            </div>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-2">
              {{ job.companyName }}
            </p>
          </div>
        </div>

        <!-- Key Metrics Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <!-- Rating -->
          <div class="flex items-center gap-2">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="ml-1 text-sm font-semibold text-gray-900 dark:text-white">
                {{ job.averageRating?.toFixed(1) || 'N/A' }}
              </span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              ({{ job.ratingCount || 0 }})
            </span>
          </div>

          <!-- Views -->
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ formatNumber(job.views || 0) }} views
            </span>
          </div>

          <!-- Saves -->
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ formatNumber(job.saves || 0) }} saved
            </span>
          </div>

          <!-- Applicants -->
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ formatNumber(job.applicantCount || 0) }} applied
            </span>
          </div>
        </div>

        <!-- Job Details Grid -->
        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <!-- Location -->
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

          <!-- Job Type -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="capitalize">{{ job.jobType?.replace('-', ' ') }}</span>
          </div>

          <!-- Experience Level -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span class="capitalize">{{ job.experienceLevel }}</span>
          </div>

          <!-- Salary -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ formatSalary(job.salary) }}</span>
          </div>
        </div>

        <!-- Skills Tags -->
        <div v-if="job.requiredSkills && job.requiredSkills.length > 0" class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="(skill, index) in job.requiredSkills.slice(0, 5)"
            :key="index"
            class="px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
          >
            {{ skill }}
          </span>
          <span v-if="job.requiredSkills.length > 5" class="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
            +{{ job.requiredSkills.length - 5 }} more
          </span>
        </div>

        <!-- Posted Date -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Posted {{ formatDate(job.postedAt) }}
          </div>
          <div class="flex gap-2">
            <button
              @click="emit('apply', job)"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Apply
            </button>
            <button
              @click="emit('viewDetails', job)"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

