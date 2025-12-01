/**
 * Seed script to populate Firestore with mock job listings
 *
 * Usage:
 *   npm run seed:jobs
 *   or
 *   npx tsx scripts/seedJobs.ts
 *
 * This script uses Firebase Admin SDK which bypasses security rules.
 * Make sure you have Firebase CLI authenticated or set GOOGLE_APPLICATION_CREDENTIALS.
 */

import * as dotenv from 'dotenv'
dotenv.config()

import { initializeApp, applicationDefault } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"
import { generateMockJobs } from '../src/lib/mockJobs'

// Use the same environment config pattern as in src/main.ts, but adapted for admin SDK
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Check for the required values, especially projectId
if (!firebaseConfig.projectId) {
  console.error('Error: VITE_FIREBASE_PROJECT_ID is missing!')
  console.error('Please make sure your .env file contains VITE_FIREBASE_PROJECT_ID')
  process.exit(1)
}

// Initialize Admin SDK (if not already initialized in the global context)
let app
try {
  // If already initialized, this throws; if not, we create a new app
  app = initializeApp({
    credential: applicationDefault(),
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  })
  console.log('Firebase Admin app initialized successfully')
} catch (e: any) {
  if (e.message && e.message.includes('app/duplicate-app')) {
    console.log('Firebase Admin app already initialized')
  } else {
    console.error('Error initializing Firebase Admin SDK:', e.message)
    process.exit(1)
  }
}

const db = getFirestore()

async function seedJobs() {
  console.log('Generating mock jobs...')
  const mockJobs = generateMockJobs(50) // Generate 50 mock jobs

  console.log(`Seeding ${mockJobs.length} jobs to Firestore...`)

  let successCount = 0
  let errorCount = 0

  // Helper function to remove undefined values from object
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null
    }
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined)
    }
    if (typeof obj === 'object') {
      const cleaned: any = {}
      for (const key in obj) {
        if (obj[key] !== undefined) {
          cleaned[key] = removeUndefined(obj[key])
        }
      }
      return cleaned
    }
    return obj
  }

  for (const job of mockJobs) {
    try {
      // Prepare job data with proper Firestore Timestamp conversions
      const jobData: any = {
        ...job,
        createdAt: Timestamp.fromDate(job.createdAt),
        updatedAt: Timestamp.fromDate(job.updatedAt),
        postedAt: Timestamp.fromDate(job.postedAt),
        ratings: job.ratings.map(r => ({
          ...r,
          createdAt: Timestamp.fromDate(r.createdAt),
        })),
      }

      // Remove any undefined values before sending to Firestore
      const cleanedData = removeUndefined(jobData)

      // Use Admin SDK to add document (bypasses security rules)
      await db.collection('jobs').add(cleanedData)
      successCount++
      console.log(`✓ Created job: ${job.title} at ${job.companyName}`)
    } catch (error: any) {
      errorCount++
      console.error(`✗ Error creating job "${job.title}":`, error.message)
    }
  }

  console.log('\n=== Seeding Complete ===')
  console.log(`Successfully created: ${successCount} jobs`)
  console.log(`Errors: ${errorCount} jobs`)
  console.log('\nYou can now view the jobs in your Firestore database!')
}

// Run the seed function
seedJobs()
  .then(() => {
    console.log('Seed script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed script failed:', error)
    process.exit(1)
  })

