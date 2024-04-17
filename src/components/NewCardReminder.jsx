/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import loadingSpinner from '../assets/loadingSpinner.svg'
import NewImg from "./NewImg";

export default function NewCardReminder({ session, onSave, onCancel }) {
  const [cancelLoading, setCancelLoading] = useState(false)
  const [disableCancel, setDisableCancel] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [disableSave, setDisableSave] = useState(false)
  const [reminderId, setReminderId] = useState(null)
  const [imgUrl, setImgUrl] = useState(null)
  const [description, setDescription] = useState(null)
  const [location, setLocation] = useState(null)
  const [date, setDate] = useState(null)

  useEffect(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    setDate(date)
  }, []);

  async function updateReminder(event, imgUrl, justImg = false) {
    try {
      event.preventDefault()

      if (!justImg) {
        setSaveLoading(true)
      }

      const { user } = session
      const updates = {
        user_id: user.id,
        email: user.email,
        description,
        location,
        date,
        img_url: imgUrl
      }

      const { data, error } = await supabase.from('reminders').upsert(reminderId ? { ...updates, id: reminderId } : updates, { onConflict: 'id' }).select().single()

      if (error) {
        throw error.message
      } else {
        setImgUrl(user.id+'/'+imgUrl)
        setReminderId(data?.id)
        if (!justImg) {
          onSave()
        }
      }
    } catch (error) {
      alert('Error updating reminder: ', error.message)
    } finally {
      setSaveLoading(false)
      setDisableSave(false)
      setDisableCancel(false)
    }
  }

  async function cancelNewReminder() {
    try {
      setCancelLoading(true)
      if (reminderId) {
        let [deleteReminder, deleteImage] = await Promise.all([await supabase.from('reminders').delete().eq('id', reminderId), await supabase.storage.from('reminder_imgs').remove([imgUrl])]);

        const { error } = deleteReminder
        const { error: uploadError } = deleteImage
        if (error || uploadError) {
          throw error.message || uploadError.message
        }
      }
    } catch (error) {
      alert('Error deleting reminder: ', error.message)
    } finally {
      onCancel()
      setCancelLoading(false)
    }
  }

  function parseSetDate(selectedDate) {
    const date = new Date()
    switch (selectedDate) {
      case 'weekFromNow':
        date.setDate(date.getDate() + 7)
        break
      case 'twoWeeksFromNow':
        date.setDate(date.getDate() + 14)
        break
      case 'monthFromNow':
        date.setMonth(date.getMonth() + 1)
        break
      case 'twoMonthsFromNow':
        date.setMonth(date.getMonth() + 2)
        break
      case 'threeMonthsFromNow':
        date.setMonth(date.getMonth() + 3)
        break
      case 'sixMonthsFromNow':
        date.setMonth(date.getMonth() + 6)
        break
      case 'yearFromNow':
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    setDate(date)
  }

  return (
    <form onSubmit={updateReminder} className="form-widget">
      <div className="new-card-reminder-wrapper">
        <span className="new-card-reminder-delete" disabled={disableCancel} onClick={!disableCancel ? cancelNewReminder : null}>
          { cancelLoading ? 
            <img src={loadingSpinner} width="13" height="13" className="loading-spinner" alt="Loading spinner" />
          : 'Cancel' }
        </span>
        <button className="new-card-reminder-save" type="submit" disabled={disableSave}>
          { saveLoading ? 
            <img src={loadingSpinner} width="13" height="13" className="loading-spinner" alt="Loading spinner" />
          : 'Save' }
        </button>
        <NewImg
          session={session}
          url={imgUrl}
          onUpload={(event, url) => {
            updateReminder(event, url, true)
          }}
          onUploading={() => {
            setDisableSave(true)
            setDisableCancel(true)
          }}
        />
        <div className="new-card-reminder-body">
          <input
            id="description"
            type="text"
            required
            placeholder="Description"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="new-card-reminder-body-details">
            <div>
              <p className="label-title">Store location:</p>
              <input
                id="location"
                type="text"
                placeholder="Location"
                value={location || ''}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <p className="label-title">Reminder date:</p>
              <select
                name="selectedDate"
                defaultValue="monthFromNow"
                onChange={(e) => parseSetDate(e.target.value)}
              >
                <option value="weekFromNow">In 1 week</option>
                <option value="twoWeeksFromNow">In 2 weeks</option>
                <option value="monthFromNow">In 1 month</option>
                <option value="twoMonthsFromNow">In 2 months</option>
                <option value="threeMonthsFromNow">In 3 months</option>
                <option value="sixMonthsFromNow">In 6 months</option>
                <option value="yearFromNow">In 1 year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}