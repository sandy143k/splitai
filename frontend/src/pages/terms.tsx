import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptable Use',
      body: `You may only upload audio files that you own or have explicit rights to process. Uploading copyrighted music without authorisation from the rights holder may violate applicable law. Split AI is not responsible for any misuse of the service.`,
    },
    {
      title: '2. File Storage & Privacy',
      body: `Uploaded files and separated stems are stored temporarily on our servers for processing and download. All files are automatically and permanently deleted within 24 hours of upload. We do not share, sell, or listen to your files.`,
    },
    {
      title: '3. No Guarantee of Availability',
      body: `The service is provided "as is." We make no warranties regarding uptime, accuracy of separation, or continued availability. Audio quality depends on the input file and the AI model.`,
    },
    {
      title: '4. Limitation of Liability',
      body: `Split AI shall not be held liable for any direct, indirect, or consequential damages arising from your use of the service, including but not limited to copyright infringement claims arising from files you upload.`,
    },
    {
      title: '5. Changes to These Terms',
      body: `We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance.`,
    },
  ]

  return (
    <main className="min-h-screen px-4 py-16 max-w-2xl mx-auto">
      <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-10">
        <ArrowLeft size={14} /> Back to Split AI
      </Link>

      <h1 className="text-4xl font-extrabold mb-2 text-gradient" style={{ fontFamily: 'var(--font-display)' }}>
        Terms of Service
      </h1>
      <p className="text-white/30 text-sm mb-10">Last updated: January 2025</p>

      <div className="space-y-8">
        {sections.map(s => (
          <section key={s.title} className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white/80 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              {s.title}
            </h2>
            <p className="text-white/45 text-sm leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
