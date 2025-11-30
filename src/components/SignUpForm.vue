<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const { signUp, error, loading } = useFirebaseAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const gender = ref('')
const country = ref('')
const language = ref('')
const resumeFile = ref<File | null>(null)
const coverLetterFile = ref<File | null>(null)
const isSubmitting = ref(false)

const passwordMatch = ref(true)
const resumeFileName = ref('')
const coverLetterFileName = ref('')

const handleResumeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    resumeFile.value = target.files[0]
    resumeFileName.value = target.files[0].name
  }
}

const handleCoverLetterChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    coverLetterFile.value = target.files[0]
    coverLetterFileName.value = target.files[0].name
  }
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  
  if (!email.value || !password.value || !confirmPassword.value || !firstName.value || !lastName.value || !gender.value || !country.value || !language.value) {
    return
  }

  if (password.value !== confirmPassword.value) {
    passwordMatch.value = false
    return
  }

  passwordMatch.value = true

  try {
    isSubmitting.value = true
    await signUp(email.value, password.value, {
      firstName: firstName.value,
      lastName: lastName.value,
      gender: gender.value,
      country: country.value,
      language: language.value,
      resumeFile: resumeFile.value || undefined,
      coverLetterFile: coverLetterFile.value || undefined,
    })
    // Success - auth state will update automatically
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    firstName.value = ''
    lastName.value = ''
    gender.value = ''
    country.value = ''
    language.value = ''
    resumeFile.value = null
    coverLetterFile.value = null
    resumeFileName.value = ''
    coverLetterFileName.value = ''
  } catch (err) {
    // Error is handled by the composable
    console.error('Sign up error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
        <div class="space-y-2">
          <h2 class="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your information below to create your account
          </p>
        </div>
        <form class="space-y-4" @submit="handleSubmit">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="first-name" class="text-sm font-medium text-gray-900 dark:text-white">
                First Name
              </label>
              <input
                id="first-name"
                v-model="firstName"
                name="first-name"
                type="text"
                autocomplete="given-name"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
                placeholder="John"
              />
            </div>
            <div class="space-y-2">
              <label for="last-name" class="text-sm font-medium text-gray-900 dark:text-white">
                Last Name
              </label>
              <input
                id="last-name"
                v-model="lastName"
                name="last-name"
                type="text"
                autocomplete="family-name"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
                placeholder="Doe"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label for="email-address" class="text-sm font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input
              id="email-address"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder="m@example.com"
            />
          </div>
          <div class="space-y-2">
            <label for="gender" class="text-sm font-medium text-gray-900 dark:text-white">
              Gender
            </label>
            <select
              id="gender"
              v-model="gender"
              name="gender"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div class="space-y-2">
            <label for="country" class="text-sm font-medium text-gray-900 dark:text-white">
              Country
            </label>
            <input
              id="country"
              v-model="country"
              name="country"
              type="text"
              autocomplete="country"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder="Australia"
            />
          </div>
          <div class="space-y-2">
            <label for="language" class="text-sm font-medium text-gray-900 dark:text-white">
              Language
            </label>
            <input
              id="language"
              v-model="language"
              name="language"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder="English"
            />
          </div>
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder=""
            />
          </div>
          <div class="space-y-2">
            <label for="confirm-password" class="text-sm font-medium text-gray-900 dark:text-white">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder=""
            />
          </div>
          <div class="space-y-2">
            <label for="resume" class="text-sm font-medium text-gray-900 dark:text-white">
              Resume (Optional)
            </label>
            <div class="flex items-center gap-2">
              <label
                for="resume"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              >
                <span v-if="resumeFileName" class="text-gray-700 dark:text-gray-300">{{ resumeFileName }}</span>
                <span v-else class="text-gray-500 dark:text-gray-400">Choose file...</span>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  @change="handleResumeChange"
                  class="hidden"
                />
              </label>
            </div>
          </div>
          <div class="space-y-2">
            <label for="cover-letter" class="text-sm font-medium text-gray-900 dark:text-white">
              Cover Letter (Optional)
            </label>
            <div class="flex items-center gap-2">
              <label
                for="cover-letter"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              >
                <span v-if="coverLetterFileName" class="text-gray-700 dark:text-gray-300">{{ coverLetterFileName }}</span>
                <span v-else class="text-gray-500 dark:text-gray-400">Choose file...</span>
                <input
                  id="cover-letter"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  @change="handleCoverLetterChange"
                  class="hidden"
                />
              </label>
            </div>
          </div>

        <div v-if="!passwordMatch" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                Passwords do not match
              </h3>
            </div>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

          <button
            type="submit"
            :disabled="isSubmitting || loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting || loading">Creating account...</span>
            <span v-else>Sign up</span>
          </button>

        </form>
        
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <button
              type="button"
              @click="router.push('/signin')"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline ml-1"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
</template>

<style scoped>
.bg-primary {
  background-color: hsl(var(--primary));
}

.hover\:bg-primary\/90:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.focus\:ring-primary:focus {
  --tw-ring-color: hsl(var(--primary));
}

.focus\:border-primary:focus {
  border-color: hsl(var(--primary));
}

.text-primary {
  color: hsl(var(--primary));
}

.hover\:text-primary\/80:hover {
  color: hsl(var(--primary) / 0.8);
}
</style>

