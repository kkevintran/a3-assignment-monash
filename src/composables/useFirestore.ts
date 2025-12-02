import { inject } from 'vue'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  getDoc,
  Timestamp
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'
import type { JobListing, JobRating } from '../types/job'

/**
 * Composable for interacting with Firestore
 */
export function useFirestore() {
  const firebaseApp = inject<FirebaseApp>('firebaseApp')
  
  if (!firebaseApp) {
    throw new Error('Firebase app not found. Make sure Firebase is initialized in main.ts')
  }

  const db = getFirestore(firebaseApp)
  const storage = getStorage(firebaseApp)

  /**
   * Upload a file to Firebase Storage
   * @param file - File to upload
   * @param path - Storage path (e.g., 'resumes/user123/resume.pdf')
   * @returns Download URL of the uploaded file
   */
  const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    } catch (error: any) {
      console.error('Storage upload error:', error)
      
      // Provide more helpful error messages
      if (error.code === 'storage/unauthorized' || error.code === 'permission-denied') {
        throw new Error('Permission denied. Please make sure you are logged in and Firebase Storage is enabled.')
      } else if (error.code === 'storage/unauthenticated') {
        throw new Error('You must be logged in to upload files.')
      } else if (error.message?.includes('CORS') || error.message?.includes('preflight')) {
        throw new Error('Firebase Storage is not enabled. Please enable it in the Firebase Console: https://console.firebase.google.com/project/monash-a3/storage')
      }
      
      throw new Error(error.message || 'Failed to upload file. Please ensure Firebase Storage is enabled.')
    }
  }

  /**
   * Create a user document in Firestore
   * @param userId - Firebase Auth UID
   * @param userData - User data to store
   */
  const createUserDocument = async (userId: string, userData: {
    email: string
    firstName: string
    lastName: string
    gender: string
    country: string
    language: string
    resumeUrl?: string
    coverLetterUrl?: string
  }) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        role: 'user', // Default role
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return { success: true, id: userId }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to create user document')
    }
  }

  /**
   * Save a contact form submission to the 'store' collection
   * 
   * Collection structure:
   * - store (collection)
   *   - {documentId} (document)
   *     - name: string
   *     - email: string
   *     - message: string
   *     - timestamp: Timestamp (auto-generated)
   *     - status: string (e.g., 'new', 'read', 'replied')
   */
  const saveContactSubmission = async (name: string, email: string, message: string) => {
    try {
      const docRef = await addDoc(collection(db, 'store'), {
        name,
        email,
        message,
        timestamp: new Date(),
        status: 'new',
        type: 'contact_form',
      })
      
      return { success: true, id: docRef.id }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to save to database')
    }
  }

  /**
   * Generic function to add a document to any collection
   */
  const addDocument = async (collectionName: string, data: Record<string, any>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        timestamp: new Date(),
      })
      
      return { success: true, id: docRef.id }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to save to database')
    }
  }

  /**
   * Create a job listing
   */
  const createJobListing = async (jobData: Omit<JobListing, 'createdAt' | 'updatedAt' | 'postedAt'>) => {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        postedAt: Timestamp.fromDate(now),
      })
      return { success: true, id: docRef.id }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to create job listing')
    }
  }

  /**
   * Get total count of active jobs
   */
  const getActiveJobsCount = async () => {
    try {
      const q = query(
        collection(db, 'jobs'),
        where('status', '==', 'active')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to fetch job count')
    }
  }

  /**
   * Get all active job listings with pagination
   */
  const getActiveJobs = async (limitCount: number = 10, startAfterDoc?: any) => {
    try {
      let q = query(
        collection(db, 'jobs'),
        where('status', '==', 'active'),
        orderBy('postedAt', 'desc'),
        limit(limitCount)
      )
      
      // Add startAfter if provided for pagination
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc))
      }
      
      const querySnapshot = await getDocs(q)
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
      const hasMore = querySnapshot.docs.length === limitCount
      
      return {
        jobs,
        hasMore,
        lastDoc: hasMore ? lastDoc : null,
        firstDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[0] : null
      }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to fetch jobs')
    }
  }

  /**
   * Get job by ID
   */
  const getJobById = async (jobId: string) => {
    try {
      const docRef = doc(db, 'jobs', jobId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        throw new Error('Job not found')
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to fetch job')
    }
  }

  /**
   * Get user profile data
   */
  const getUserProfile = async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        throw new Error('User profile not found')
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to fetch user profile')
    }
  }

  /**
   * Get all users (admin only)
   */
  const getAllUsers = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return users
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to fetch users')
    }
  }

  /**
   * Apply to a job
   */
  const applyToJob = async (jobId: string, userId: string, applicationData?: { coverLetter?: string; resumeUrl?: string }) => {
    try {
      const jobRef = doc(db, 'jobs', jobId)
      const jobSnap = await getDoc(jobRef)
      
      if (!jobSnap.exists()) {
        throw new Error('Job not found')
      }
      
      const jobData = jobSnap.data()
      
      // Check if user already applied
      if (jobData.applicants?.includes(userId)) {
        throw new Error('You have already applied to this job')
      }
      
      // Add user to applicants array and increment count
      await updateDoc(jobRef, {
        applicants: arrayUnion(userId),
        applicantCount: increment(1),
        updatedAt: Timestamp.fromDate(new Date()),
      })
      
      // Create application document in subcollection
      await addDoc(collection(db, 'jobs', jobId, 'applications'), {
        userId,
        appliedAt: Timestamp.fromDate(new Date()),
        status: 'pending',
        ...applicationData,
      })
      
      return { success: true }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to apply to job')
    }
  }

  /**
   * Rate a job listing
   */
  const rateJob = async (jobId: string, userId: string, rating: number, comment?: string) => {
    try {
      const jobRef = doc(db, 'jobs', jobId)
      const jobSnap = await getDoc(jobRef)
      
      if (!jobSnap.exists()) {
        throw new Error('Job not found')
      }
      
      const jobData = jobSnap.data()
      const ratings = jobData.ratings || []
      
      // Check if user already rated
      const existingRatingIndex = ratings.findIndex((r: JobRating) => r.userId === userId)
      
      const newRating: JobRating = {
        userId,
        rating,
        comment,
        createdAt: new Date(),
      }
      
      if (existingRatingIndex >= 0) {
        // Update existing rating
        ratings[existingRatingIndex] = newRating
      } else {
        // Add new rating
        ratings.push(newRating)
      }
      
      // Calculate new average
      const averageRating = ratings.reduce((sum: number, r: JobRating) => sum + r.rating, 0) / ratings.length
      
      await updateDoc(jobRef, {
        ratings: ratings.map((r: JobRating) => ({
          ...r,
          createdAt: Timestamp.fromDate(r.createdAt),
        })),
        averageRating: Math.round(averageRating * 10) / 10,
        ratingCount: ratings.length,
        updatedAt: Timestamp.fromDate(new Date()),
      })
      
      return { success: true }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to rate job')
    }
  }

  /**
   * Save/bookmark a job
   */
  const saveJob = async (jobId: string, userId: string) => {
    try {
      const jobRef = doc(db, 'jobs', jobId)
      const jobSnap = await getDoc(jobRef)
      
      if (!jobSnap.exists()) {
        throw new Error('Job not found')
      }
      
      const jobData = jobSnap.data()
      
      if (jobData.savesUserIds?.includes(userId)) {
        // Unsave
        await updateDoc(jobRef, {
          savesUserIds: arrayRemove(userId),
          saves: increment(-1),
          updatedAt: Timestamp.fromDate(new Date()),
        })
        return { success: true, saved: false }
      } else {
        // Save
        await updateDoc(jobRef, {
          savesUserIds: arrayUnion(userId),
          saves: increment(1),
          updatedAt: Timestamp.fromDate(new Date()),
        })
        return { success: true, saved: true }
      }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to save job')
    }
  }

  /**
   * Increment job views
   */
  const incrementJobViews = async (jobId: string) => {
    try {
      const jobRef = doc(db, 'jobs', jobId)
      await updateDoc(jobRef, {
        views: increment(1),
      })
    } catch (error: any) {
      console.error('Firestore error:', error)
      // Don't throw - views are not critical
    }
  }

  /**
   * Search jobs by skills, location, etc.
   */
  const searchJobs = async (filters: {
    skills?: string[]
    location?: string
    jobType?: string
    experienceLevel?: string
    minSalary?: number
    remote?: boolean
    limitCount?: number
  }) => {
    try {
      let q = query(collection(db, 'jobs'), where('status', '==', 'active'))
      
      if (filters.remote !== undefined) {
        q = query(q, where('location.remote', '==', filters.remote))
      }
      
      if (filters.jobType) {
        q = query(q, where('jobType', '==', filters.jobType))
      }
      
      if (filters.experienceLevel) {
        q = query(q, where('experienceLevel', '==', filters.experienceLevel))
      }
      
      q = query(q, orderBy('postedAt', 'desc'))
      
      if (filters.limitCount) {
        q = query(q, limit(filters.limitCount))
      }
      
      const querySnapshot = await getDocs(q)
      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Filter by skills in memory (Firestore doesn't support array-contains-any well for multiple skills)
      if (filters.skills && filters.skills.length > 0) {
        results = results.filter((job: any) => {
          const jobSkills = job.requiredSkills || []
          return filters.skills!.some(skill => jobSkills.includes(skill))
        })
      }
      
      // Filter by location in memory
      if (filters.location) {
        results = results.filter((job: any) => {
          const loc = job.location || {}
          return loc.city?.toLowerCase().includes(filters.location!.toLowerCase()) ||
                 loc.country?.toLowerCase().includes(filters.location!.toLowerCase())
        })
      }
      
      // Filter by min salary in memory
      if (filters.minSalary) {
        results = results.filter((job: any) => {
          const salary = job.salary
          return salary && salary.max >= filters.minSalary!
        })
      }
      
      return results
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to search jobs')
    }
  }

  /**
   * Get applications for a specific user with pagination
   * Returns applications with job details, paginated to first 10 by default
   */
  const getUserApplications = async (userId: string, limitCount: number = 10) => {
    try {
      // First, get all jobs where the user is in the applicants array
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('applicants', 'array-contains', userId)
      )
      
      const jobsSnapshot = await getDocs(jobsQuery)
      const applications: Array<{
        id: string
        jobId: string
        job: any
        application: any
      }> = []

      // For each job, fetch the application document
      for (const jobDoc of jobsSnapshot.docs) {
        const jobId = jobDoc.id
        const jobData = jobDoc.data()
        
        // Query applications subcollection for this user's application
        const applicationsQuery = query(
          collection(db, 'jobs', jobId, 'applications'),
          where('userId', '==', userId)
        )
        
        const applicationsSnapshot = await getDocs(applicationsQuery)
        
        // There should be only one application per job per user
        applicationsSnapshot.forEach((appDoc) => {
          const appData = appDoc.data()
          applications.push({
            id: appDoc.id,
            jobId,
            job: {
              id: jobId,
              ...jobData
            },
            application: {
              id: appDoc.id,
              ...appData,
              // Convert Firestore Timestamp to Date if needed
              appliedAt: appData.appliedAt?.toDate ? appData.appliedAt.toDate() : appData.appliedAt
            }
          })
        })
      }

      // Sort by appliedAt date (most recent first)
      applications.sort((a, b) => {
        const dateA = a.application.appliedAt instanceof Date 
          ? a.application.appliedAt.getTime() 
          : new Date(a.application.appliedAt).getTime()
        const dateB = b.application.appliedAt instanceof Date 
          ? b.application.appliedAt.getTime() 
          : new Date(b.application.appliedAt).getTime()
        return dateB - dateA
      })

      const total = applications.length
      const paginatedApplications = applications.slice(0, limitCount)
      const hasMore = total > limitCount

      return {
        applications: paginatedApplications,
        total,
        hasMore,
        limit: limitCount
      }
    } catch (error: any) {
      console.error('Firestore error:', error)
      throw new Error(error.message || 'Failed to fetch user applications')
    }
  }

  /**
   * Seed database with mock jobs (for admin/development use)
   * Uses client SDK, so user must be authenticated and have proper permissions
   */
  const seedMockJobs = async (count: number = 50) => {
    const { generateMockJobs } = await import('../lib/mockJobs')
    const mockJobs = generateMockJobs(count)
    
    let successCount = 0
    let errorCount = 0
    
    // Helper function to remove undefined values
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
        
        if (job.expiresAt) {
          jobData.expiresAt = Timestamp.fromDate(job.expiresAt)
        }
        if (job.applicationDeadline) {
          jobData.applicationDeadline = Timestamp.fromDate(job.applicationDeadline)
        }
        
        const cleanedData = removeUndefined(jobData)
        await addDoc(collection(db, 'jobs'), cleanedData)
        successCount++
      } catch (error: any) {
        errorCount++
        console.error(`Error creating job "${job.title}":`, error.message)
      }
    }
    
    return { successCount, errorCount, total: mockJobs.length }
  }

  return {
    db,
    storage,
    uploadFile,
    createUserDocument,
    saveContactSubmission,
    addDocument,
    // Job-related functions
    createJobListing,
    getActiveJobs,
    getActiveJobsCount,
    getJobById,
    getUserProfile,
    getAllUsers,
    applyToJob,
    getUserApplications,
    rateJob,
    saveJob,
    incrementJobViews,
    searchJobs,
    seedMockJobs,
  }
}

