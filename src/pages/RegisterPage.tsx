import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/forms.css'
import { isValidAadhaar, normalizeAadhaar } from '../utils/validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      setError('Please enter a username.')
      return
    }
    if (!isValidAadhaar(aadhaar)) {
      setError('Aadhaar number must be exactly 12 digits.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    // Demo: no backend — go to login
    void normalizeAadhaar(aadhaar)
    navigate('/login', { state: { registered: true } })
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-sub">Register with your details</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
          </div>
          <div className="form-field">
            <label htmlFor="reg-aadhaar">Aadhaar number</label>
            <input
              id="reg-aadhaar"
              name="aadhaar"
              inputMode="numeric"
              maxLength={14}
              value={aadhaar}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 12)
                setAadhaar(v)
              }}
              placeholder="12-digit Aadhaar"
            />
          </div>
          <div className="form-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="form-field">
            <label htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
            />
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
