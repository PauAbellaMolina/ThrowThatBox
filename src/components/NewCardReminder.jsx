/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import Img from "./Img";

export default function NewCardReminder({ session, onAdd, onCancel }) {
  // const [parsedDate, setParsedDate] = useState(null);

  // useEffect(() => {
  //   setParsedDate(new Date(reminder.date).toLocaleDateString());
  // }, [reminder.date]);

  return (
    <form className="form-widget">
      <div className="card-reminder-wrapper" style={{ paddingBottom: '13px' }}>
        <span className="new-card-reminder-delete" onClick={onCancel}>Cancel</span>
        <span className="new-card-reminder-add" onClick={onAdd}>Save</span>
        <Img
          url={''}
          size={130}
        />
        <div className="card-reminder-body">
          <h2>{'hehe'}</h2>
          <div className="card-reminder-body-details">
            <div>
              <p className="label-title">Store location:</p>
              <p>{'ehhehehe'}</p>
            </div>
            <div>
              <p className="label-title">Reminder date:</p>
              <p>{'123123123'}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}