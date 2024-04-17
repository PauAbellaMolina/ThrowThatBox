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
      setSession(session);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => { //TODO PAU this looks like it works, but test it deeply and try to find a less hacky way to do it
    if (!realSession && session) {
      setRealSession(session)
    }
    if (session && session?.access_token !== realSession?.access_token) {
      setRealSession(session)
    }
  }, [session, realSession]);

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session: authSession } }) => {
  //     setSession(authSession)
  //   })

  //   supabase.auth.onAuthStateChange((_event, authSession) => {
  //     setSession(authSession)
  //   })
  // }, [])

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