<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { useFirestore } from '../composables/useFirestore'
import { useSendGrid } from '../composables/useSendGrid'

const props = defineProps<{
  job: any | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  applied: []
}>()

const { user } = useFirebaseAuth()
const { getUserProfile } = useFirestore()
const { sendEmail } = useSendGrid()

const userProfile = ref<any>(null)
const loading = ref(false)
const loadingProfile = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

// Form data
const coverLetter = ref('')
const resumeFile = ref<File | null>(null)
const resumeFileName = ref('')
const coverLetterFile = ref<File | null>(null)
const coverLetterFileName = ref('')

watch(() => props.isOpen, async (newValue) => {
  if (newValue && user.value) {
    await loadUserProfile()
    // Reset form
    coverLetter.value = ''
    resumeFile.value = null
    resumeFileName.value = ''
    coverLetterFile.value = null
    coverLetterFileName.value = ''
    error.value = null
    success.value = false
  }
})

const loadUserProfile = async () => {
  if (!user.value) return
  
  try {
    loadingProfile.value = true
    userProfile.value = await getUserProfile(user.value.uid)
  } catch (err: any) {
    console.error('Error loading user profile:', err)
    error.value = err.message || 'Failed to load profile'
  } finally {
    loadingProfile.value = false
  }
}

const handleResumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    resumeFile.value = target.files[0]
    resumeFileName.value = target.files[0].name
  }
}

const handleCoverLetterFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    coverLetterFile.value = target.files[0]
    coverLetterFileName.value = target.files[0].name
  }
}

const removeResume = () => {
  resumeFile.value = null
  resumeFileName.value = ''
}

const removeCoverLetterFile = () => {
  coverLetterFile.value = null
  coverLetterFileName.value = ''
}

const handleSubmit = async () => {
  if (!user.value || !props.job) return

  try {
    loading.value = true
    error.value = null
    success.value = false

    // Validate resume is provided
    if (!resumeFile.value && !userProfile.value?.resumeUrl) {
      throw new Error('Resume is required. Please upload a resume file.')
    }

    // Get user email
    const userEmail = userProfile.value?.email || user.value?.email || ''
    if (!userEmail) {
      throw new Error('Unable to find your email address. Please ensure you are logged in.')
    }

    const fromEmail = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@jobportal.com'
    
    // Prepare application details for email
    const applicationDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    const applicationTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Build application details text
    let applicationDetails = `
Application Details:
- Position: ${props.job.title}
- Company: ${props.job.companyName}
- Location: ${props.job.location?.city || 'N/A'}, ${props.job.location?.country || 'N/A'}
- Job Type: ${props.job.jobType || 'N/A'}
- Application Date: ${applicationDate} at ${applicationTime}

Applicant Information:
- Name: ${userProfile.value?.firstName || ''} ${userProfile.value?.lastName || ''}
- Email: ${userEmail}
- Country: ${userProfile.value?.country || 'N/A'}
- Language: ${userProfile.value?.language || 'N/A'}
    `.trim()

    // Add cover letter if provided
    if (coverLetter.value.trim()) {
      applicationDetails += `\n\nCover Letter:\n${coverLetter.value.trim()}`
    }

    // Add resume information
    if (resumeFile.value) {
      applicationDetails += `\n\nResume: ${resumeFile.value.name} (uploaded)`
    } else if (userProfile.value?.resumeUrl) {
      applicationDetails += `\n\nResume: Using resume from profile`
    }

    // Add cover letter file if provided
    if (coverLetterFile.value) {
      applicationDetails += `\n\nCover Letter File: ${coverLetterFile.value.name} (uploaded)`
    }

    // Send confirmation email
    const emailSubject = `Application Confirmation: ${props.job.title} at ${props.job.companyName}`
    const emailText = `
Dear ${userProfile.value?.firstName || 'Applicant'},

Thank you for applying to the ${props.job.title} position at ${props.job.companyName}.

Your application has been successfully submitted and is now under review. We will contact you if your qualifications match our requirements.

${applicationDetails}

Best regards,
${props.job.companyName} Team
    `.trim()
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
          Application Confirmation
        </h2>
        <p>Dear ${userProfile.value?.firstName || 'Applicant'},</p>
        <p>Thank you for applying to the <strong>${props.job.title}</strong> position at <strong>${props.job.companyName}</strong>.</p>
        <p>Your application has been successfully submitted and is now under review. We will contact you if your qualifications match our requirements.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
          <p><strong>Position:</strong> ${props.job.title}</p>
          <p><strong>Company:</strong> ${props.job.companyName}</p>
          <p><strong>Location:</strong> ${props.job.location?.city || 'N/A'}, ${props.job.location?.country || 'N/A'}</p>
          <p><strong>Job Type:</strong> ${props.job.jobType || 'N/A'}</p>
          <p><strong>Application Date:</strong> ${applicationDate} at ${applicationTime}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Applicant Information:</h3>
          <p><strong>Name:</strong> ${userProfile.value?.firstName || ''} ${userProfile.value?.lastName || ''}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Country:</strong> ${userProfile.value?.country || 'N/A'}</p>
          <p><strong>Language:</strong> ${userProfile.value?.language || 'N/A'}</p>
        </div>
        ${coverLetter.value.trim() ? `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Cover Letter:</h3>
          <p style="white-space: pre-wrap;">${coverLetter.value.trim()}</p>
        </div>
        ` : ''}
        ${resumeFile.value || userProfile.value?.resumeUrl ? `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Resume:</h3>
          <p>${resumeFile.value ? resumeFile.value.name + ' (uploaded)' : 'Using resume from profile'}</p>
        </div>
        ` : ''}
        ${coverLetterFile.value ? `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Cover Letter File:</h3>
          <p>${coverLetterFile.value.name} (uploaded)</p>
        </div>
        ` : ''}
        
        <p>Best regards,<br><strong>${props.job.companyName} Team</strong></p>
      </div>
    `
    
    await sendEmail(userEmail, fromEmail, emailSubject, emailText, emailHtml)
    
    success.value = true
    emit('applied')
    
    // Close modal after 2 seconds
    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (err: any) {
    console.error('Error submitting application:', err)
    error.value = err.message || 'Failed to submit application'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
}

onMounted(() => {
  if (user.value && props.isOpen) {
    loadUserProfile()
  }
})
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
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Apply for {{ job.title }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ job.companyName }}
            </p>
          </div>

          <!-- Loading Profile -->
          <div v-if="loadingProfile" class="mb-6 text-center py-8">
            <p class="text-gray-600 dark:text-gray-400">Loading your profile...</p>
          </div>

          <!-- User Profile Section -->
          <div v-if="userProfile && !loadingProfile" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Profile</h3>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p class="text-gray-900 dark:text-white">{{ userProfile.email || user?.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <p class="text-gray-900 dark:text-white">
                    {{ userProfile.firstName || '' }} {{ userProfile.lastName || '' }}
                  </p>
                </div>
                <div v-if="userProfile.country">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                  <p class="text-gray-900 dark:text-white">{{ userProfile.country }}</p>
                </div>
                <div v-if="userProfile.language">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                  <p class="text-gray-900 dark:text-white">{{ userProfile.language }}</p>
                </div>
                <div v-if="userProfile.gender">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                  <p class="text-gray-900 dark:text-white">{{ userProfile.gender }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p class="text-sm text-green-800 dark:text-green-200 font-medium">
              ✓ Application submitted successfully!
            </p>
          </div>

          <!-- Application Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Cover Letter Text -->
            <div>
              <label for="coverLetter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter (Text)
              </label>
              <textarea
                id="coverLetter"
                v-model="coverLetter"
                rows="6"
                placeholder="Write your cover letter here..."
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Cover Letter File Upload -->
            <div>
              <label for="coverLetterFile" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter (File Upload)
              </label>
              <div class="flex items-center gap-4">
                <label
                  for="coverLetterFile"
                  class="flex-1 cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Choose File
                </label>
                <input
                  id="coverLetterFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  @change="handleCoverLetterFileChange"
                  class="hidden"
                />
                <span v-if="coverLetterFileName" class="flex-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ coverLetterFileName }}
                </span>
                <button
                  v-if="coverLetterFileName"
                  type="button"
                  @click="removeCoverLetterFile"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, DOCX, or TXT files only
              </p>
            </div>

            <!-- Resume Upload -->
            <div>
              <label for="resume" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume <span class="text-red-500">*</span>
              </label>
              <div v-if="userProfile?.resumeUrl && !resumeFile" class="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p class="text-sm text-blue-800 dark:text-blue-200">
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Using resume from your profile. Upload a new file to replace it.
                </p>
              </div>
              <div class="flex items-center gap-4">
                <label
                  for="resume"
                  class="flex-1 cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {{ resumeFile ? 'Change Resume File' : 'Upload Resume File' }}
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  @change="handleResumeChange"
                  class="hidden"
                />
                <span v-if="resumeFileName" class="flex-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ resumeFileName }}
                </span>
                <button
                  v-if="resumeFileName"
                  type="button"
                  @click="removeResume"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, or DOCX files only. {{ userProfile?.resumeUrl && !resumeFile ? 'Your existing resume will be used if no new file is uploaded.' : '' }}
              </p>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                :disabled="loading || success || (!resumeFile && !userProfile?.resumeUrl)"
                :class="[
                  'flex-1 px-6 py-3 text-base font-medium rounded-lg transition-colors',
                  loading || success || (!resumeFile && !userProfile?.resumeUrl)
                    ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                ]"
              >
                <span v-if="loading">Submitting...</span>
                <span v-else-if="success">Applied ✓</span>
                <span v-else>Submit Application</span>
              </button>
              
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-3 text-base font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

