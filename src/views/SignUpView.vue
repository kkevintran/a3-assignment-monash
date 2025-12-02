<script setup lang="ts">
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SignUpForm from '../components/SignUpForm.vue'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const route = useRoute()
const { user, loading } = useFirebaseAuth()

// Redirect to dashboard when user is authenticated
watch([user, loading], ([newUser, isLoading]) => {
  if (!isLoading && newUser && route.path === '/signup') {
    // Small delay to ensure auth state is fully updated
    setTimeout(() => {
      router.push('/dashboard')
    }, 100)
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <div class="flex-1 flex items-center justify-center px-4">
      <SignUpForm />
    </div>
  </div>
</template>

