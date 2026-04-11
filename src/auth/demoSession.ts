const KEY = 'adhar_chat_demo'

export function setDemoSession() {
  sessionStorage.setItem(KEY, '1')
}

export function clearDemoSession() {
  sessionStorage.removeItem(KEY)
}

export function hasDemoSession() {
  return sessionStorage.getItem(KEY) === '1'
}
