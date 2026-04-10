import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
  '3': [
    { id: 'm6', text: 'Did you get the doc?', me: false, at: 'Mon' },
  ],
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

export function ChatPage() {
  const [selectedId, setSelectedId] = useState(MOCK_USERS[0].id)
  const [threads, setThreads] = useState<Record<string, Message[]>>(() => ({
    ...INITIAL_THREADS,
  }))
  const [draft, setDraft] = useState('')
  const listEndRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => MOCK_USERS.find((u) => u.id === selectedId) ?? MOCK_USERS[0],
    [selectedId],
  )

  const messages = threads[selectedId] ?? []

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedId])

  function send() {
    const text = draft.trim()
    if (!text) return
    const msg: Message = {
      id: `local-${Date.now()}`,
      text,
      me: true,
      at: timeNow(),
    }
    setThreads((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }))
    setDraft('')
  }

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="chat-nav-top">
          <span className="chat-brand">Chats</span>
          <Link to="/login">Log out</Link>
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
