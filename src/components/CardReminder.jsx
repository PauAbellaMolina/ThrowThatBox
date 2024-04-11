/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import Img from "./Img";

export default function CardReminder({ reminder, onDelete }) {
  const [parsedDate, setParsedDate] = useState(null);

  useEffect(() => {
    setParsedDate(new Date(reminder.date).toLocaleDateString());
  }, [reminder.date]);

  return (
    <div className="card-reminder-wrapper" style={!reminder.img_url ? { paddingBottom: '13px' } : null}>
      <span className="card-reminder-delete" onClick={onDelete}>Delete</span>
      <Img
        url={reminder.img_url}
        size={130}
      />
      <div className="card-reminder-body">
        <h2>{reminder.description}</h2>
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