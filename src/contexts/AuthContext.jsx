// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext()
export const ADMIN_EMAIL = 'gabrasil2014@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubProfile = null
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (unsubProfile) unsubProfile()
      setUser(u)
      if (u) {
        const ref = doc(db, 'usuarios', u.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            email: u.email,
            nome: u.displayName || u.email.split('@')[0],
            isAdmin: u.email === ADMIN_EMAIL,
            createdAt: new Date().toISOString()
          })
        }
        unsubProfile = onSnapshot(ref, s => setUserProfile({ id: s.id, ...s.data() }))
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => { unsub(); if (unsubProfile) unsubProfile() }
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  const register = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      email, nome: name,
      isAdmin: email === ADMIN_EMAIL,
      createdAt: new Date().toISOString()
    })
    return cred
  }

  const updateNome = async (nome) => {
    if (!user) return
    await updateProfile(user, { displayName: nome })
    await setDoc(doc(db, 'usuarios', user.uid), { nome }, { merge: true })
  }

  const adminUpdateNome = async (uid, nome) => {
    await setDoc(doc(db, 'usuarios', uid), { nome }, { merge: true })
  }

  const isAdmin = userProfile?.isAdmin || user?.email === ADMIN_EMAIL

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout, register, updateNome, adminUpdateNome, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
