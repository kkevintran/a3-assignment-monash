<script setup lang="ts">
import NavBar from '../components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NavBar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Our Platform
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Discover our services and learn more about what we offer
        </p>
        <div class="flex justify-center space-x-4">
          <button
            @click="$router.push('/signin')"
            class="flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

