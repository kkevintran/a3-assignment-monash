<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SignInForm from '../components/SignInForm.vue'
import SignUpForm from '../components/SignUpForm.vue'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const route = useRoute()
const { user, loading } = useFirebaseAuth()
const showSignUp = ref(false)

const switchToSignUp = () => {
  showSignUp.value = true
}

const switchToSignIn = () => {
  showSignUp.value = false
}

// Redirect to dashboard when user is authenticated
watch([user, loading], ([newUser, isLoading]) => {
  if (!isLoading && newUser && (route.path === '/login' || route.path === '/signin')) {
    // Small delay to ensure auth state is fully updated
    setTimeout(() => {
      router.push('/dashboard')
    }, 100)
  }
}, { immediate: true })
</script>

<template>
  <div>
    <SignInForm v-if="!showSignUp" @switch-to-sign-up="switchToSignUp" />
    <SignUpForm v-else @switch-to-sign-in="switchToSignIn" />
  </div>
</template>

