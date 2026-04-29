import { useRoute } from 'wouter'

export default function WorkDetail() {
  const [, params] = useRoute('/work/:slug')
  const slug = params?.slug ?? ''

  return (
    <main className="px-s7 py-s8">
      <p className="font-mono-label text-ink-3">STATUS: AVAILABLE · PLACEHOLDER</p>
      <h1 className="text-ink mt-s4">Lundeen Studio — Case Study: {slug}</h1>
    </main>
  )
}
