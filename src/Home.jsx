/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import CardReminder from './components/CardReminder'
import NewCardReminder from './components/NewCardReminder'
import loadingSpinner from './assets/loadingSpinner.svg'

export default function Home({ session }) {
  const [loading, setLoading] = useState(null)
  const [reminders, setReminders] = useState(null)
  const [addingNewReminder, setAddingNewReminder] = useState(false)

  useEffect(() => {
    let ignore = false

    getReminders(session, ignore)

    return () => { //TODO PAU check if necessary and if so applicable to other places
      ignore = true
    }
  }, [session])

  async function getReminders(session, ignore) {
    if (!ignore) {
      setLoading(true)
      const { user } = session

      const { data, error } = await supabase
        .from('reminders')
        .select(`id, description, location, date, img_url`)
        .eq('user_id', user.id)

      if (error) {
        console.warn(error)
      } else if (data) {
        setReminders(data)
      }

      setLoading(false)
    }
  }

  return (
      <div>
        <h1>📦 ThrowThatBox</h1>
        <p>Welcome, {session.user.email}</p>
        <hr className="home-divider" />
        <div>
          <div className="reminders-header">
            <h2>{ !loading && !reminders?.length ? 'No reminders yet' : 'Your reminders:'}</h2>
            <span className="add-reminder" onClick={() => loading ? null : setAddingNewReminder(true)}>+ Add new reminder</span>
          </div>
          { loading ?
            <div className="loading-home">
              <img src={loadingSpinner} width="32" height="32" className="loading-spinner" alt="Loading spinner" />
            </div>
          : <>
            { addingNewReminder ?
              <NewCardReminder
                session={session}
                onSave={() => {
                  setAddingNewReminder(false)
                  getReminders(session, false)
                }}
                onCancel={() => setAddingNewReminder(false)}
              />
            : null }
            {reminders?.map((reminder, index) => (
              <CardReminder
                session={session}
                key={index}
                reminder={reminder} 
                onDelete={() => getReminders(session, false)}
              />
            ))}
          </>}
        </div>
      </div>
  )
}