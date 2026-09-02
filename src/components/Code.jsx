// 程式碼區塊:用法 <Code>{`const a = 1`}</Code>
export default function Code({ children }) {
  return (
    <pre className="bg-codebg border border-line rounded-xl px-4 py-3.5 overflow-x-auto text-[.82rem] leading-relaxed font-mono mt-3 mb-6">
      <code>{children}</code>
    </pre>
  )
}
