/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import NewImg from "./NewImg";

export default function NewCardReminder({ session, onSave, onCancel }) {
  // const [parsedDate, setParsedDate] = useState(null);
  const [loading, setLoading] = useState(false)
  const [reminderId, setReminderId] = useState(null)
  const [imgUrl, setImgUrl] = useState(null)
  const [description, setDescription] = useState(null)
  const [location, setLocation] = useState(null)
  const [date, setDate] = useState(null)

  // useEffect(() => {
  //   setParsedDate(new Date(reminder.date).toLocaleDateString());
  // }, [reminder.date]);

  async function updateReminder(event, imgUrl, justImg = false) {
    try {
      event.preventDefault()

      setLoading(true)
      const { user } = session

      const updates = {
        user_id: user.id,
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
      setLoading(false)
    }
  }

  async function cancelNewReminder() {
    try {
      setLoading(true)
      if (reminderId) {
        let [deleteReminder, deleteImage] = await Promise.all([await supabase.from('reminders').delete().eq('id', reminderId), await supabase.storage.from('reminder_imgs').remove(imgUrl)]);

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
      setLoading(false)
    }
  }

  return (
    <form onSubmit={updateReminder} className="form-widget">
      <div className="new-card-reminder-wrapper" style={!imgUrl ? { paddingBottom: '13px' } : null}>
        <span className="new-card-reminder-delete" onClick={cancelNewReminder}>Cancel</span>
        <button className="new-card-reminder-save" type="submit">Save</button>
        <NewImg
          session={session}
          url={imgUrl}
          size={130}
          onUpload={(event, url) => {
            updateReminder(event, url, true)
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
                required
                placeholder="Location"
                value={location || ''}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <p className="label-title">Reminder date:</p>
              <select name="selectedDate" defaultValue="monthFromNow">
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