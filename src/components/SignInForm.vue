<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const { signIn, error, loading } = useFirebaseAuth()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  
  if (!email.value || !password.value) {
    return
  }

  try {
    isSubmitting.value = true
    await signIn(email.value, password.value)
    // Success - auth state will update automatically
    email.value = ''
    password.value = ''
  } catch (err) {
    // Error is handled by the composable
    console.error('Sign in error:', err)
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
            Login to your account
          </h2>
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email below to login to your account
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
            <div class="flex items-center justify-between">
              <label for="password" class="text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline">
                Forgot your password?
              </a>
            </div>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder=""
            />
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
            <span v-if="isSubmitting || loading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </form>
        
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <button
              type="button"
              @click="router.push('/signup')"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline ml-1"
            >
              Sign up
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

