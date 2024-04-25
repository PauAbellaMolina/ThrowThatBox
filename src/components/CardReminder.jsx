/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Img from "./Img"

export default function CardReminder({ session, reminder, onDelete }) {
  const [parsedDate, setParsedDate] = useState(null)
  const [reminderUrl, setReminderUrl] = useState(null)

  useEffect(() => {
    setParsedDate(new Date(reminder.date).toLocaleDateString())
  }, [reminder.date])

  useEffect(() => {
    const { user } = session
    if (user.id && reminder.img_url) {
      setReminderUrl(user.id+'/'+reminder.img_url)
    }
  }, [reminder.img_url, session])

  async function deleteReminder() {
    try {
      const { user } = session

      let [deleteReminder, deleteImage] = await Promise.all([await supabase.from('reminders').delete().eq('id', reminder.id), await supabase.storage.from('reminder_imgs').remove([user.id+'/'+reminder.img_url])])

      const { error } = deleteReminder
      const { error: uploadError } = deleteImage
      if (error || uploadError) {
        throw error.message || uploadError.message
      } else {
        onDelete()
      }
    } catch (error) {
      alert('Error deleting reminder: ', error.message)
    }
  }


  return (
    <div className="card-reminder-wrapper">
      <span className="card-reminder-delete" onClick={deleteReminder}>Delete</span>
      <Img
        url={reminderUrl}
      />
      <div className="card-reminder-body">
        { !reminder.description ? <></> : 
        <h2>{reminder.description}</h2>}
        { !reminder.location && !reminder.date ? <></> : <>
          <div className="card-reminder-body-details">
            { !reminder.location ? <></> :
              <div>
                <p className="label-title">Store location:</p>
                <p>{reminder.location}</p>
              </div>
            }
            { !reminder.date ? <></> :
              <div>
                <p className="label-title">Reminder date:</p>
                <p>{parsedDate}</p>
              </div>
            }
          </div>
        </>}
      </div>
    </div>
  )
}