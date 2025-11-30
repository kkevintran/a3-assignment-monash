import { inject } from 'vue'
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'

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
      throw new Error(error.message || 'Failed to upload file')
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

  return {
    db,
    storage,
    uploadFile,
    createUserDocument,
    saveContactSubmission,
    addDocument,
  }
}

