import { inject, ref, onMounted, onUnmounted } from 'vue'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirestore, setDoc, doc } from 'firebase/firestore'
import { getStorage, ref as firebaseStorageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'

export function useFirebaseAuth() {
  const firebaseApp = inject<FirebaseApp>('firebaseApp')
  
  if (!firebaseApp) {
    throw new Error('Firebase app not found. Make sure Firebase is initialized in main.ts')
  }

  const auth = getAuth(firebaseApp)
  const db = getFirestore(firebaseApp)
  const storage = getStorage(firebaseApp)
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Listen to auth state changes
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
      error.value = null
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const signIn = async (email: string, password: string) => {
    try {
      error.value = null
      loading.value = true
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData?: {
      firstName: string
      lastName: string
      gender: string
      country: string
      language: string
      resumeFile?: File
      coverLetterFile?: File
    }
  ) => {
    try {
      error.value = null
      loading.value = true
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const userId = userCredential.user.uid

      // Create user document in Firestore if userData is provided
      if (userData) {
        let resumeUrl: string | undefined
        let coverLetterUrl: string | undefined

        // Upload resume if provided
        if (userData.resumeFile) {
          const resumePath = `resumes/${userId}/${userData.resumeFile.name}`
          const fileRef = firebaseStorageRef(storage, resumePath)
          await uploadBytes(fileRef, userData.resumeFile)
          resumeUrl = await getDownloadURL(fileRef)
        }

        // Upload cover letter if provided
        if (userData.coverLetterFile) {
          const coverLetterPath = `cover-letters/${userId}/${userData.coverLetterFile.name}`
          const fileRef = firebaseStorageRef(storage, coverLetterPath)
          await uploadBytes(fileRef, userData.coverLetterFile)
          coverLetterUrl = await getDownloadURL(fileRef)
        }

        // Create user document in Firestore
        // Only include optional fields if they have values (Firestore doesn't allow undefined)
        const userDocument: Record<string, any> = {
          email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          country: userData.country,
          language: userData.language,
          role: 'user', // Default role
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Only add optional fields if they exist
        if (resumeUrl) {
          userDocument.resumeUrl = resumeUrl
        }
        if (coverLetterUrl) {
          userDocument.coverLetterUrl = coverLetterUrl
        }

        await setDoc(doc(db, 'users', userId), userDocument)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to sign up'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      error.value = null
      await signOut(auth)
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out'
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    isAuthenticated: () => user.value !== null
  }
}

