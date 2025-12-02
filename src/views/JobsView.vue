<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { useFirestore } from '../composables/useFirestore'
import DashboardSidebar from '../components/DashboardSidebar.vue'

const router = useRouter()
const { user, loading: authLoading } = useFirebaseAuth()
const { getActiveJobs } = useFirestore()

const allJobs = ref<any[]>([])
const allFilteredJobs = ref<any[]>([]) // For client-side search pagination
const searchQuery = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const hasMore = ref(false)
const canGoBack = ref(false)
const currentPage = ref(1)
const searchPage = ref(1) // For client-side pagination when searching
const limit = 10
const hasFetched = ref(false)
const isFetchingAllJobs = ref(false) // Flag to prevent multiple simultaneous fetches
const paginationHistory = ref<any[]>([]) // Stack of lastDoc references for going back
const lastDoc = ref<any>(null)
const firstDoc = ref<any>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// Filtered jobs based on search query (all matching jobs)
const filteredJobs = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }

  const query = searchQuery.value.toLowerCase().trim()
  const keywords = query.split(/\s+/).filter(k => k.length > 0)

  return allFilteredJobs.value.filter(job => {
    // Search across multiple fields
    const searchableText = [
      job.title || '',
      job.description || '',
      job.companyName || '',
      job.location?.city || '',
      job.location?.country || '',
      job.location?.state || '',
      job.jobType || '',
      job.experienceLevel || '',
      job.industry || '',
      job.category || '',
      ...(job.requiredSkills || []),
      ...(job.preferredSkills || []),
      ...(job.attributes || []),
      ...(job.benefits || [])
    ].join(' ').toLowerCase()

    // Check if all keywords match
    return keywords.every(keyword => searchableText.includes(keyword))
  })
})

// Paginated jobs (either server-side or client-side based on search)
const jobs = computed(() => {
  if (searchQuery.value.trim()) {
    // Client-side pagination for search results
    const start = (searchPage.value - 1) * limit
    const end = start + limit
    return filteredJobs.value.slice(start, end)
  } else {
    // Server-side pagination
    return allJobs.value
  }
})

// Check if we can go to next page
const canGoNext = computed(() => {
  if (searchQuery.value.trim()) {
    return searchPage.value * limit < filteredJobs.value.length
  } else {
    return hasMore.value
  }
})

// Check if we can go to previous page
const canGoPrevious = computed(() => {
  if (searchQuery.value.trim()) {
    return searchPage.value > 1
  } else {
    return canGoBack.value
  }
})

// Redirect to login if not authenticated
watch([user, authLoading], ([newUser, isLoading]) => {
  if (!isLoading && !newUser) {
    router.push('/')
  } else if (!isLoading && newUser && !hasFetched.value) {
    hasFetched.value = true
    fetchJobs()
  }
}, { immediate: true })

const fetchJobs = async (startAfterDoc?: any, isGoingBack: boolean = false) => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    
    let result
    
    if (isGoingBack) {
      // Remove the last entry from history (we're going back)
      paginationHistory.value.pop()
      // Get the previous lastDoc from history
      const prevLastDoc = paginationHistory.value[paginationHistory.value.length - 1]
      // Fetch from beginning if no history
      result = await getActiveJobs(limit, prevLastDoc || undefined)
      allJobs.value = result.jobs
      hasMore.value = result.hasMore
      lastDoc.value = result.lastDoc
      firstDoc.value = result.firstDoc
      canGoBack.value = paginationHistory.value.length > 0
      currentPage.value = Math.max(1, currentPage.value - 1)
    } else {
      // Going forward
      result = await getActiveJobs(limit, startAfterDoc)
      allJobs.value = result.jobs
      hasMore.value = result.hasMore
      
      if (startAfterDoc) {
        // Add to history for going back
        paginationHistory.value.push(startAfterDoc)
        canGoBack.value = true
        currentPage.value = currentPage.value + 1
      } else {
        // First page - reset filtered jobs
        paginationHistory.value = []
        canGoBack.value = false
        currentPage.value = 1
        allFilteredJobs.value = []
      }
      
      lastDoc.value = result.lastDoc
      firstDoc.value = result.firstDoc
      
      // Update filtered jobs for search (accumulate all fetched jobs)
      allFilteredJobs.value = [...allFilteredJobs.value, ...result.jobs]
    }
  } catch (err: any) {
    console.error('Error fetching jobs:', err)
    error.value = err.message || 'Failed to load jobs'
  } finally {
    loading.value = false
  }
}

const loadNextPage = async () => {
  if (searchQuery.value.trim()) {
    // Client-side pagination for search
    searchPage.value += 1
  } else {
    // Server-side pagination
    if (lastDoc.value) {
      await fetchJobs(lastDoc.value)
    }
  }
}

const loadPreviousPage = async () => {
  if (searchQuery.value.trim()) {
    // Client-side pagination for search
    searchPage.value = Math.max(1, searchPage.value - 1)
  } else {
    // Server-side pagination
    await fetchJobs(undefined, true)
  }
}

// Fetch all jobs when search is performed
const fetchAllJobsForSearch = async () => {
  if (!user.value || isFetchingAllJobs.value) return

  try {
    isFetchingAllJobs.value = true
    error.value = null
    
    // Fetch all jobs (use a large limit or fetch in batches)
    const allJobsList: any[] = []
    let lastDocRef: any = null
    let hasMoreData = true
    
    while (hasMoreData) {
      const result = await getActiveJobs(100, lastDocRef) // Fetch 100 at a time
      allJobsList.push(...result.jobs)
      
      if (result.hasMore && result.lastDoc) {
        lastDocRef = result.lastDoc
      } else {
        hasMoreData = false
      }
    }
    
    allFilteredJobs.value = allJobsList
  } catch (err: any) {
    console.error('Error fetching all jobs for search:', err)
    error.value = err.message || 'Failed to load jobs for search'
  } finally {
    isFetchingAllJobs.value = false
  }
}

// Reset search pagination when search query changes (with debouncing)
watch(searchQuery, (newQuery) => {
  searchPage.value = 1
  
  // Clear any existing debounce timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  // Debounce the fetch - only fetch if user stops typing for 500ms
  searchDebounceTimer = setTimeout(async () => {
    // If search query is entered and we don't have all jobs loaded, fetch them
    if (newQuery.trim() && allFilteredJobs.value.length < 50 && !isFetchingAllJobs.value) {
      await fetchAllJobsForSearch()
    }
  }, 500)
})

onMounted(() => {
  if (user.value && !authLoading && !hasFetched.value) {
    hasFetched.value = true
    fetchJobs()
  } else if (!authLoading && !user.value) {
    loading.value = false
  }
})

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

const getRatingStars = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  return { fullStars, hasHalfStar, emptyStars }
}

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
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
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Browse Jobs
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Discover job opportunities and find your next role
          </p>
        </div>

        <!-- Search Bar -->
        <div class="mb-6">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search jobs by title, company, location, skills, or description..."
              @keydown.enter.prevent
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="searchQuery" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Found {{ jobs.length }} job{{ jobs.length !== 1 ? 's' : '' }} matching "{{ searchQuery }}"
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && jobs.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ searchQuery ? 'No jobs found' : 'No jobs available' }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ searchQuery 
              ? `No jobs match your search "${searchQuery}". Try different keywords.`
              : 'There are currently no active job listings available.'
            }}
          </p>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Clear Search
          </button>
        </div>

        <!-- Jobs List -->
        <div v-if="!loading && jobs.length > 0" class="space-y-4">
          <!-- Results Info -->
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <span v-if="searchQuery">
              Showing {{ jobs.length }} job{{ jobs.length !== 1 ? 's' : '' }} matching your search
            </span>
            <span v-else>
              Showing {{ jobs.length }} job{{ jobs.length !== 1 ? 's' : '' }}
              <span v-if="hasMore"> (more available)</span>
            </span>
          </div>

          <div
            v-for="job in jobs"
            :key="job.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
          >
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
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="capitalize">{{ job.jobType?.replace('-', ' ') }}</span>
                  </div>

                  <!-- Experience Level -->
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span class="capitalize">{{ job.experienceLevel }}</span>
                  </div>

                  <!-- Salary -->
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <button
                    @click="router.push(`/dashboard/jobs/${job.id}`)"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              @click="loadPreviousPage"
              :disabled="!canGoPrevious || loading"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                canGoPrevious && !loading
                  ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
              ]"
            >
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </div>
            </button>

            <div class="text-sm text-gray-600 dark:text-gray-400">
              <span v-if="searchQuery">
                Page {{ searchPage }} of {{ Math.ceil(filteredJobs.length / limit) || 1 }}
              </span>
              <span v-else>
                Page {{ currentPage }}
              </span>
            </div>

            <button
              @click="loadNextPage"
              :disabled="!canGoNext || loading"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                canGoNext && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
              ]"
            >
              <div class="flex items-center gap-2">
                Next
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>

