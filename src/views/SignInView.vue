<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import SignInForm from '../components/SignInForm.vue'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const { user, loading } = useFirebaseAuth()

// Redirect to dashboard when user is authenticated
watch(user, (newUser) => {
  if (newUser && !loading.value) {
    router.push('/dashboard')
  }
}, { immediate: true })
</script>

<template>
  <SignInForm />
</template>

