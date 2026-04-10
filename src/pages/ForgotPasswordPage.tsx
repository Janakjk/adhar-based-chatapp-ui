import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import '../styles/forms.css'

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [done, setDone] = useState(false)

  function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    setError('')
    const v = identifier.trim()
    if (!v) {
      setError('Enter your username or email.')
      return
    }
    const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    if (!looksEmail && v.length < 2) {
      setError('Enter a valid username or email.')
      return
    }
    setSent(true)
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^\d{4,8}$/.test(otp.trim())) {
      setError('Enter the OTP from your email (4–8 digits).')
      return
    }
    setDone(true)
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p className="auth-sub">
          We’ll send a one-time code to your registered email
        </p>

        {!done ? (
          <form onSubmit={sent ? handleVerify : handleRequestOtp} noValidate>
            <div className="form-field">
              <label htmlFor="fp-identifier">Username or email</label>
              <input
                id="fp-identifier"
                name="identifier"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or email"
                disabled={sent}
              />
            </div>
            {sent ? (
              <div className="form-field">
                <label htmlFor="fp-otp">OTP from email</label>
                <input
                  id="fp-otp"
                  name="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Enter OTP"
                />
              </div>
            ) : null}
            {error ? <p className="form-error">{error}</p> : null}
            {sent ? (
              <button type="submit" className="btn-primary">
                Verify OTP & continue
              </button>
            ) : (
              <button type="submit" className="btn-primary">
                Send OTP to email
              </button>
            )}
          </form>
        ) : (
          <p style={{ color: 'var(--text)', marginBottom: '1rem' }}>
            OTP verified (demo). In a real app you would set a new password here.
          </p>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
