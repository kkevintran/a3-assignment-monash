<script setup lang="ts">
defineProps<{
  application: {
    id: string
    jobId: string
    job: any
    application: any
  }
}>()

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    reviewed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    shortlisted: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    accepted: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  }
  return colors[status] || colors.pending
}

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date)
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
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} per ${periodText}`
}
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ application.job.title }}
          </h3>
          <span
            :class="['px-2 py-1 text-xs font-semibold rounded border', getStatusColor(application.application.status)]"
          >
            {{ application.application.status.charAt(0).toUpperCase() + application.application.status.slice(1) }}
          </span>
        </div>
        
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-3">
          {{ application.job.companyName }}
        </p>

        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {{ application.job.location.city }}, {{ application.job.location.country }}
              <span v-if="application.job.location.remote" class="ml-1 text-blue-600 dark:text-blue-400">(Remote)</span>
            </span>
          </div>

          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{{ application.job.jobType }}</span>
          </div>

          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ formatSalary(application.job.salary) }}</span>
          </div>

          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Applied on {{ formatDate(application.application.appliedAt) }}</span>
          </div>
        </div>

        <div v-if="application.application.coverLetter" class="mt-4">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Letter:</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {{ application.application.coverLetter }}
          </p>
        </div>

        <div v-if="application.application.resumeUrl" class="mt-2">
          <a
            :href="application.application.resumeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            View Resume
          </a>
        </div>
      </div>
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

