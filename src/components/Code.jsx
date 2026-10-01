import { useState } from 'react'

// 程式碼區塊:用法 <Code>{`const a = 1`}</Code>。右上角一鍵複製(複製的是原始字串,不含 JSX)。
export default function Code({ children, className = '' }) {
  const [copied, setCopied] = useState(false)
  const text = typeof children === 'string' ? children : String(children ?? '')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className={`relative group mt-3 mb-6 ${className}`}>
      <pre className="bg-codebg border border-line rounded-xl px-4 py-3.5 pr-20 overflow-x-auto text-[.82rem] leading-relaxed font-mono m-0">
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className={`absolute top-2 right-2 px-2 py-0.5 rounded-md border text-[.72rem] cursor-pointer transition-colors ${copied ? 'border-accent-deep text-accent bg-panel' : 'border-line text-muted bg-panel hover:text-accent'}`}
        aria-label="複製程式碼"
      >
        {copied ? '已複製' : '複製'}
      </button>
    </div>
  )
}
