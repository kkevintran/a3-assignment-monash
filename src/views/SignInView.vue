<script setup lang="ts">
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SignInForm from '../components/SignInForm.vue'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const route = useRoute()
const { user, loading } = useFirebaseAuth()

// Redirect to dashboard when user is authenticated (both admin and regular users)
watch([user, loading], ([newUser, isLoading]) => {
  if (!isLoading && newUser && route.path === '/signin') {
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
      <SignInForm />
    </div>
  </div>
</template>

