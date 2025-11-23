<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-8">
          <button
            @click="navigateTo('/')"
            class="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
          >
            Low Income Family Assistance (LIFA)
          </button>
          
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden md:flex space-x-6">
            <button
              @click="navigateTo('/services')"
              class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Services
            </button>
            <button
              @click="navigateTo('/about')"
              class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              About Us
            </button>
            <button
              @click="navigateTo('/contact')"
              class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Contact
            </button>
          </div>
          <div class="w-6"></div> <!-- Add extra spacing between Contact and Sign up -->
          <button
            @click="navigateTo('/signup')"
            class="flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100"
          >
            Sign up
          </button>
          <button
            @click="navigateTo('/signin')"
            class="flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>

