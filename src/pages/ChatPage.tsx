import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl, authFetch } from '../api/authFetch'
import { useKeycloakAuth } from '../auth/KeycloakAuthProvider'
import { clearDemoSession } from '../auth/demoSession'
import '../styles/chat.css'

type ChatUser = {
  id: string
  name: string
  preview: string
}

type Message = {
  id: string
  text: string
  me: boolean
  at: string
}

type MessageDTO = {
  messageId?: string
  senderId: string
  receiverId: string
  message: string
  sentAt?: string
}

const MOCK_USERS: ChatUser[] = [
  { id: '1', name: 'Priya Sharma', preview: 'See you tomorrow at 10' },
  { id: '2', name: 'Rahul Verma', preview: 'Thanks for the update' },
  { id: '3', name: 'Ananya Iyer', preview: 'Did you get the doc?' },
  { id: '4', name: 'Vikram Patel', preview: 'OK, sounds good' },
]

const INITIAL_THREADS: Record<string, Message[]> = {
  '1': [
    { id: 'm1', text: 'Hi! Are we still on for the review?', me: false, at: '10:02' },
    { id: 'm2', text: 'Yes, same time works for me.', me: true, at: '10:05' },
    { id: 'm3', text: 'See you tomorrow at 10', me: false, at: '10:06' },
  ],
  '2': [
    { id: 'm4', text: 'The report is uploaded.', me: true, at: 'Yesterday' },
    { id: 'm5', text: 'Thanks for the update', me: false, at: 'Yesterday' },
  ],
  '3': [{ id: 'm6', text: 'Did you get the doc?', me: false, at: 'Mon' }],
  '4': [
    { id: 'm7', text: 'Let’s sync after lunch.', me: false, at: '9:41' },
    { id: 'm8', text: 'OK, sounds good', me: true, at: '9:43' },
  ],
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function timeNow() {
  return new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function mapMessage(dto: MessageDTO, currentUserId: string, index: number): Message {
  const at = dto.sentAt
    ? new Date(dto.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : timeNow()
  return {
    id: dto.messageId ?? `srv-${dto.senderId}-${dto.receiverId}-${index}-${Date.now()}`,
    text: dto.message,
    me: dto.senderId === currentUserId,
    at,
  }
}

function isMessageDTO(value: unknown): value is MessageDTO {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.senderId === 'string' &&
    typeof item.receiverId === 'string' &&
    typeof item.message === 'string'
  )
}

export function ChatPage() {
  const navigate = useNavigate()
  const { mode, authenticated, keycloak, logoutKeycloak } = useKeycloakAuth()

  const [selectedId, setSelectedId] = useState(MOCK_USERS[0].id)
  const [threads, setThreads] = useState<Record<string, Message[]>>(() => ({ ...INITIAL_THREADS }))
  const [draft, setDraft] = useState('')
  const listEndRef = useRef<HTMLDivElement>(null)
  const apiConfigured = Boolean(import.meta.env.VITE_API_BASE_URL?.trim())

  const currentUserId = useMemo(() => {
    if (mode !== 'keycloak') return 'demo-user'
    const parsed = keycloak?.tokenParsed as Record<string, unknown> | undefined
    const candidates = [parsed?.preferred_username, parsed?.email, parsed?.sub]
    const found = candidates.find((v) => typeof v === 'string' && v.trim().length > 0)
    return typeof found === 'string' ? found : null
  }, [keycloak, mode])

  const selected = useMemo(
    () => MOCK_USERS.find((u) => u.id === selectedId) ?? MOCK_USERS[0],
    [selectedId],
  )
  const messages = threads[selectedId] ?? []

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedId])

  useEffect(() => {
    if (!apiConfigured || !currentUserId) return
    void authFetch(apiUrl(`/fetch/new/messages?userId=${encodeURIComponent(currentUserId)}`))
      .then(async (res) => {
        if (!res.ok) return
        const payload = (await res.json()) as unknown
        if (!Array.isArray(payload)) return
        const dtos = payload.filter(isMessageDTO)
        setThreads((prev) => {
          const next = { ...prev }
          dtos.forEach((dto, idx) => {
            const otherUserId = dto.senderId === currentUserId ? dto.receiverId : dto.senderId
            next[otherUserId] = [...(next[otherUserId] ?? []), mapMessage(dto, currentUserId, idx)]
          })
          return next
        })
      })
      .catch((err) => console.warn('New messages API:', err))
  }, [apiConfigured, currentUserId])

  useEffect(() => {
    if (!apiConfigured || !currentUserId || !selectedId) return
    const url =
      `/fetch/messages?userId1=${encodeURIComponent(currentUserId)}` +
      `&userId2=${encodeURIComponent(selectedId)}`
    void authFetch(apiUrl(url))
      .then(async (res) => {
        if (!res.ok) return
        const payload = (await res.json()) as unknown
        if (!Array.isArray(payload)) return
        const dtos = payload.filter(isMessageDTO)
        setThreads((prev) => ({
          ...prev,
          [selectedId]: dtos.map((dto, idx) => mapMessage(dto, currentUserId, idx)),
        }))
      })
      .catch((err) => console.warn('Conversation API:', err))
  }, [apiConfigured, currentUserId, selectedId])

  function send() {
    const text = draft.trim()
    if (!text || !currentUserId) return

    const msg: Message = {
      id: `local-${Date.now()}`,
      text,
      me: true,
      at: timeNow(),
    }
    const body: MessageDTO = {
      senderId: currentUserId,
      receiverId: selectedId,
      message: text,
    }

    if (apiConfigured) {
      void authFetch(apiUrl('/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch((err) => console.warn('Send API:', err))
    }

    setThreads((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }))
    setDraft('')
  }

  function handleLogout() {
    if (mode === 'keycloak' && authenticated) {
      logoutKeycloak()
      return
    }
    clearDemoSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="chat-nav-top">
          <span className="chat-brand">Chats</span>
          <button type="button" className="chat-logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <div className="chat-sidebar-header">
          <h2>People</h2>
          <p>Select someone to open the thread</p>
        </div>
        <ul className="chat-user-list" role="listbox" aria-label="Chat contacts">
          {MOCK_USERS.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className={`chat-user-item ${u.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(u.id)}
                role="option"
                aria-selected={u.id === selectedId}
              >
                <span className="chat-avatar" aria-hidden>
                  {initials(u.name)}
                </span>
                <div className="chat-user-meta">
                  <div className="chat-user-name">{u.name}</div>
                  <div className="chat-user-preview">{u.preview}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="chat-main" aria-label="Conversation">
        <header className="chat-main-header">
          <span className="chat-avatar">{initials(selected.name)}</span>
          <span className="chat-main-title">{selected.name}</span>
        </header>

        <div className="chat-messages" role="log" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`msg-row ${m.me ? 'me' : 'them'}`}>
              <div className="msg-bubble">{m.text}</div>
              <span className="msg-time">{m.at}</span>
            </div>
          ))}
          <div ref={listEndRef} />
        </div>

        <div className="chat-composer">
          <textarea
            rows={1}
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            aria-label="Message text"
          />
          <button type="button" className="btn-send" onClick={send}>
            Send
          </button>
        </div>
      </section>
    </div>
  )
}
