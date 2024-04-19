import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [otp, setOtp] = useState('')


  function handleSubmit(event) {
    if (!emailSent) {
      sendEmail(event)
    } else {
      verifyOtp(event)
    }
  }

  async function sendEmail(event) {
    event.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the one time code!')
      setEmailSent(true)
    }
    setLoading(false)
  }

  async function verifyOtp(event) {
    event.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })

    if (error) {
      alert(error.name || error.message)
    }
    setLoading(false)
  }

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">📦 ThrowThatBox</h1>
        <p className="description">Sign in using a one time code sent to your email</p>
        <form className="form-widget" onSubmit={(e) => handleSubmit(e)}>
          <div>
            <input
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          { emailSent ? 
            <div>
              <input
                className="inputField"
                type="number"
                inputMode="numeric"
                placeholder="One time code"
                value={otp}
                required={true}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          : null }
          <div>
            <button className={'button block'} disabled={loading}>
              {loading ? <span>Loading...</span> : emailSent ? <span>Get in</span> : <span>Send one time code</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}