<script setup lang="ts">
import { ref } from 'vue'
import { useSendGrid } from '../composables/useSendGrid'

const name = ref('')
const email = ref('')
const message = ref('')
const isSubmitting = ref(false)

const { sendContactFormEmail } = useSendGrid()
const handleSubmit = async (e: Event) => {
  e.preventDefault()
  isSubmitting.value = true
  console.log('Sending contact form email to:', 'hikevintran@gmail.com')
  console.log('Name:', name.value)
  console.log('Email:', email.value)
  console.log('Message:', message.value)
  try {
    await sendContactFormEmail(name.value, email.value, message.value, 'hikevintran@gmail.com')
    alert('Thank you for your message! We will get back to you soon.')
    name.value = ''
    email.value = ''
    message.value = ''
  } catch (error) {
    console.error('Error sending contact form email:', error)
    alert('Failed to send message. Please try again later.')
  } finally {
    isSubmitting.value = false
  }


}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Contact Us
        </h1>
        <form @submit="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium text-gray-900 dark:text-white">
              Name
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder="Your name"
            />
          </div>
          <div class="space-y-2">
            <label for="contact-email" class="text-sm font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input
              id="contact-email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder="your.email@example.com"
            />
          </div>
          <div class="space-y-2">
            <label for="message" class="text-sm font-medium text-gray-900 dark:text-white">
              Message
            </label>
            <textarea
              id="message"
              v-model="message"
              required
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
              placeholder="Your message"
            ></textarea>
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Sending...</span>
            <span v-else>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

