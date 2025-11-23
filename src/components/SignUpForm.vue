<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const { signUp, error, loading } = useFirebaseAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)

const passwordMatch = ref(true)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  
  if (!email.value || !password.value || !confirmPassword.value) {
    return
  }

  if (password.value !== confirmPassword.value) {
    passwordMatch.value = false
    return
  }

  passwordMatch.value = true

  try {
    isSubmitting.value = true
    await signUp(email.value, password.value)
    // Success - auth state will update automatically
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
  } catch (err) {
    // Error is handled by the composable
    console.error('Sign up error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full">
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

