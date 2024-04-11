import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
// import Account from './Account'
import Home from './Home'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <div>
      { !session ? 
        <Auth />
      :
        <Home key={session.user.id} session={session} />
        // <Account key={session.user.id} session={session} />
      }
    </div>
  )
}

export default App