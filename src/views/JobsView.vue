<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { useFirestore } from '../composables/useFirestore'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import JobCard from '../components/JobCard.vue'
import JobSearchBar from '../components/JobSearchBar.vue'
import JobDetailsModal from '../components/JobDetailsModal.vue'
import ApplicationForm from '../components/ApplicationForm.vue'

const router = useRouter()
const { user, loading: authLoading } = useFirebaseAuth()
const { getActiveJobs, getActiveJobsCount, applyToJob, getJobById } = useFirestore()

const allJobs = ref<any[]>([])
const allFilteredJobs = ref<any[]>([]) // For client-side search pagination
const searchQuery = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const hasMore = ref(false)
const canGoBack = ref(false)
const currentPage = ref(1)
const searchPage = ref(1) // For client-side pagination when searching
const totalJobsCount = ref<number | null>(null) // Total jobs in database
const limit = 10
const hasFetched = ref(false)
const isFetchingAllJobs = ref(false) // Flag to prevent multiple simultaneous fetches
const paginationHistory = ref<any[]>([]) // Stack of lastDoc references for going back
const lastDoc = ref<any>(null)
const firstDoc = ref<any>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// Modal state
const selectedJob = ref<any>(null)
const isModalOpen = ref(false)
const isApplicationFormOpen = ref(false)
const jobToApply = ref<any>(null)

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

// Current displayed count
const displayedCount = computed(() => {
  return jobs.value.length
})

// Total available count (for search or regular browsing)
const totalAvailableCount = computed(() => {
  if (searchQuery.value.trim()) {
    return filteredJobs.value.length
  } else {
    return totalJobsCount.value ?? 0
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
    
    // Fetch total count on first load
    if (!startAfterDoc && !isGoingBack && totalJobsCount.value === null) {
      try {
        totalJobsCount.value = await getActiveJobsCount()
      } catch (err) {
        console.error('Error fetching job count:', err)
        // Continue even if count fails
      }
    }
    
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
    
    // Update total count if we fetched all jobs
    if (allJobsList.length > 0) {
      totalJobsCount.value = allJobsList.length
    }
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

const openJobModal = async (job: any) => {
  try {
    // Fetch full job details
    const fullJob = await getJobById(job.id)
    selectedJob.value = fullJob
    isModalOpen.value = true
  } catch (err: any) {
    console.error('Error fetching job details:', err)
    error.value = err.message || 'Failed to load job details'
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedJob.value = null
}

const handleModalApplied = async () => {
  // Refresh jobs to update applicant count
  await fetchJobs()
}

const openApplicationForm = async (job: any) => {
  try {
    // Fetch full job details
    const fullJob = await getJobById(job.id)
    jobToApply.value = fullJob
    isApplicationFormOpen.value = true
  } catch (err: any) {
    console.error('Error fetching job details:', err)
    error.value = err.message || 'Failed to load job details'
  }
}

const closeApplicationForm = () => {
  isApplicationFormOpen.value = false
  jobToApply.value = null
}

const handleApplicationSubmitted = async () => {
  // Application submitted successfully (email sent)
  // Close details modal if open
  if (isModalOpen.value) {
    closeModal()
  }
}

// Close modal on Escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  if (user.value && !authLoading && !hasFetched.value) {
    hasFetched.value = true
    fetchJobs()
  } else if (!authLoading && !user.value) {
    loading.value = false
  }
  
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
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
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700 dark:text-gray-300">
                <span v-if="searchQuery">
                  Showing <strong class="font-semibold text-gray-900 dark:text-white">{{ displayedCount }}</strong> of <strong class="font-semibold text-gray-900 dark:text-white">{{ totalAvailableCount }}</strong> matching job{{ totalAvailableCount !== 1 ? 's' : '' }}
                </span>
                <span v-else>
                  Showing <strong class="font-semibold text-gray-900 dark:text-white">{{ displayedCount }}</strong> of <strong class="font-semibold text-gray-900 dark:text-white">{{ totalAvailableCount }}</strong> total job{{ totalAvailableCount !== 1 ? 's' : '' }} available
                  <span v-if="hasMore" class="text-gray-500 dark:text-gray-400"> (more available)</span>
                </span>
              </div>
              <div v-if="totalJobsCount !== null && !searchQuery" class="text-xs text-gray-500 dark:text-gray-400">
                Page {{ currentPage }}
              </div>
            </div>
          </div>

          <JobCard
            v-for="job in jobs"
            :key="job.id"
            :job="job"
            @view-details="openJobModal"
            @apply="openApplicationForm"
          />

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

    <!-- Job Details Modal -->
    <JobDetailsModal
      :job="selectedJob"
      :is-open="isModalOpen"
      @close="closeModal"
      @applied="handleModalApplied"
      @open-application-form="openApplicationForm"
    />

    <!-- Application Form Modal -->
    <ApplicationForm
      :job="jobToApply"
      :is-open="isApplicationFormOpen"
      @close="closeApplicationForm"
      @applied="handleApplicationSubmitted"
    />
  </div>
</template>

<style scoped>
</style>
