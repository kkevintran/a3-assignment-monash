import { inject, ref, onMounted, onUnmounted } from 'vue'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import type { FirebaseApp } from 'firebase/app'

export function useFirebaseAuth() {
  const firebaseApp = inject<FirebaseApp>('firebaseApp')
  
  if (!firebaseApp) {
    throw new Error('Firebase app not found. Make sure Firebase is initialized in main.ts')
  }

  const auth = getAuth(firebaseApp)
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

  const signUp = async (email: string, password: string) => {
    try {
      error.value = null
      loading.value = true
      await createUserWithEmailAndPassword(auth, email, password)
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

