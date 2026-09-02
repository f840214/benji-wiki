import { useState } from 'react'
import { useAuth } from '../store.js'

export default function Lock() {
  const [pw, setPw] = useState('')
  const { tryUnlock, error, clearError } = useAuth()

  const submit = (e) => {
    e.preventDefault()
    tryUnlock(pw)
  }

  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center">
      <form
        onSubmit={submit}
        className="w-[min(90vw,340px)] bg-panel border border-line rounded-2xl px-7 py-8 text-center"
      >
        <div className="text-2xl text-accent">~</div>
        <h1 className="text-xl mt-2 mb-0.5">Benji Wiki</h1>
        <p className="text-sm text-muted mb-5">私人筆記,輸入密碼解鎖</p>
        <input
          type="password"
          value={pw}
          autoFocus
          aria-label="密碼"
          autoComplete="current-password"
          onChange={(e) => {
            setPw(e.target.value)
            if (error) clearError()
          }}
          className="w-full text-center bg-codebg border-[1.5px] border-line rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-accent-deep focus:ring-[3px] focus:ring-accent-soft"
        />
        <button
          type="submit"
          className="w-full mt-3 py-2 font-semibold rounded-lg bg-accent-deep text-[#eaf5ff] cursor-pointer hover:brightness-110 active:scale-[.98] transition"
        >
          解鎖
        </button>
        {error && <p className="text-danger text-xs mt-2.5">密碼不對,再試一次</p>}
      </form>
    </div>
  )
}
