import { inject } from 'vue'
import { getFirestore, collection, addDoc, type Firestore } from 'firebase/firestore'
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
    saveContactSubmission,
    addDocument,
  }
}

