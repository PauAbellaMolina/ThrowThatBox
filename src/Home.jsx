/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import CardReminder from './components/CardReminder'
import NewCardReminder from './components/NewCardReminder'

export default function Home({ session }) {
  const [loading, setLoading] = useState(null)
  const [reminders, setReminders] = useState(null)
  const [addingNewReminder, setAddingNewReminder] = useState(false)

  useEffect(() => {
    let ignore = false

    getReminders(session, ignore)

    return () => {
      ignore = true
    }
  }, [session])

  async function getReminders(session, ignore) {
    setLoading(true)
    const { user } = session

    const { data, error } = await supabase
      .from('reminders')
      .select(`id, description, location, date, img_url`)
      .eq('user_id', user.id)

    if (!ignore) {
      if (error) {
        console.warn(error)
      } else if (data) {
        setReminders(data)
      }
    }

    setLoading(false)
  }

  async function deleteReminder(reminderId) {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)

      if (error) {
        throw error
      } else {
        getReminders(session, false)
      }
    } catch (error) {
      console.error('Error deleting reminder: ', error.message)
    }
  }

  function onAddNewReminder() {
    console.log('Add new reminder')
    setAddingNewReminder(true)
  }

  return (
      <div>
        { loading ?
          <div>Loading ...</div> 
        : <>
          <h1>ThowThatBox</h1>
          <p>Welcome, {session.user.email}</p>
          <hr className="home-divider" />
          { !reminders?.length ? 
            <div>No reminders yet</div> 
          :
            <div>
              <div className="reminders-header">
                <h2>Your reminders:</h2>
                <span className="add-reminder" onClick={() => onAddNewReminder()}>+ Add new reminder</span>
              </div>
              { addingNewReminder ?
                <NewCardReminder
                  session={session}
                  onAdd={() => {
                    setAddingNewReminder(false)
                    getReminders(session, false)
                  }}
                  onCancel={() => setAddingNewReminder(false)}
                />
              : null }
              {reminders?.map((reminder, index) => (
                <CardReminder
                  key={index}
                  reminder={reminder} 
                  onDelete={() => deleteReminder(reminder.id)}
                />
              ))}
            </div>
          }  
        </>}
      </div>
    // <form onSubmit={updateProfile} className="form-widget">
    //   <Avatar
    //     url={avatar_url}
    //     size={150}
    //     onUpload={(event, url) => {
    //       updateProfile(event, url)
    //     }}
    //   />
    //   <div>
    //     <label htmlFor="email">Email</label>
    //     <input id="email" type="text" value={session.user.email} disabled />
    //   </div>
    //   <div>
    //     <label htmlFor="username">Name</label>
    //     <input
    //       id="username"
    //       type="text"
    //       required
    //       value={username || ''}
    //       onChange={(e) => setUsername(e.target.value)}
    //     />
    //   </div>
    //   <div>
    //     <label htmlFor="website">Website</label>
    //     <input
    //       id="website"
    //       type="url"
    //       value={website || ''}
    //       onChange={(e) => setWebsite(e.target.value)}
    //     />
    //   </div>

    //   <div>
    //     <button className="button block primary" type="submit" disabled={loading}>
    //       {loading ? 'Loading ...' : 'Update'}
    //     </button>
    //   </div>

    //   <div>
    //     <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
    //       Sign Out
    //     </button>
    //   </div>
    // </form>
  )
}