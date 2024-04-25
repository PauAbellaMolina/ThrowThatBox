import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Home from './Home'

function App() {
  const [session, setSession] = useState(null)
  const [realSession, setRealSession] = useState(null)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (!session) {
        setRealSession(null)
      }
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!realSession && session) {
      setRealSession(session)
    }
    if (session && session?.access_token !== realSession?.access_token) {
      setRealSession(session)
    }
  }, [session, realSession])

  return (
    <div>
      { !realSession ? 
        <Auth />
      :
        <Home key={session.user.id} session={realSession} />
      }
    </div>
  )
}

export default App