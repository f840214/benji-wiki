import { create } from 'zustand'

// 密碼不存在程式碼裡,只存加鹽後的 SHA-256 雜湊。
// 要換密碼:printf 'benji-wiki::新密碼' | shasum -a 256,把結果貼到 HASH。
const SALT = 'benji-wiki::'
const HASH = '1cd921659000cedc2f38600693700ea648dc67845b740a2fa23746476bcd52e9'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 本 wiki 的 zustand 實戰範例:解鎖狀態就是一個 store
export const useAuth = create((set) => ({
  unlocked: sessionStorage.getItem('bw-unlocked') === '1',
  error: false,
  clearError: () => set({ error: false }),
  tryUnlock: async (pw) => {
    if ((await sha256(SALT + pw)) === HASH) {
      sessionStorage.setItem('bw-unlocked', '1')
      set({ unlocked: true, error: false })
    } else {
      set({ error: true })
    }
  },
}))
