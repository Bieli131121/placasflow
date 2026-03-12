// src/hooks/useFirestore.js
import { useState, useEffect, useRef } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNotify } from './useNotify'

export function useCollection(collectionName, notifyOnNew = false) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { notify } = useNotify()
  const isFirstLoad = useRef(true)
  const prevIds = useRef(new Set())

  useEffect(() => {
    setLoading(true)
    setError(null)

    let q
    try {
      q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
    } catch (e) {
      setError(e.message)
      setLoading(false)
      return
    }

    const unsub = onSnapshot(q,
      snapshot => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

        if (!isFirstLoad.current && notifyOnNew) {
          docs.forEach(d => {
            if (!prevIds.current.has(d.id) && collectionName === 'pedidos') {
              notify('📋 Novo Pedido!', `Pedido de ${d.cliente || 'cliente'} — ${d.tipo || 'Placa'}`)
            }
          })
        }

        prevIds.current = new Set(docs.map(d => d.id))
        if (isFirstLoad.current) isFirstLoad.current = false

        setData(docs)
        setLoading(false)
      },
      err => {
        console.error(`[useFirestore] Erro em "${collectionName}":`, err)
        setError(err.message)
        setLoading(false)
      }
    )

    return unsub
  }, [collectionName])

  const add = async (newData) => {
    return await addDoc(collection(db, collectionName), {
      ...newData,
      createdAt: serverTimestamp()
    })
  }

  const update = async (id, newData) => {
    return await updateDoc(doc(db, collectionName, id), {
      ...newData,
      updatedAt: serverTimestamp()
    })
  }

  const remove = async (id) => {
    return await deleteDoc(doc(db, collectionName, id))
  }

  return { data, loading, error, add, update, remove }
}
