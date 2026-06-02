'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const jobId = searchParams.get('jobId')
    const jobIds = searchParams.get('jobIds')
    const rawState = searchParams.get('state')

    let bankIndex = 0
    let total = 1

    if (rawState) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawState))
        bankIndex = parsed.bankIndex ?? 0
        total = parsed.total ?? 1
      } catch {
        // ignore parse errors
      }
    }

    const existing = JSON.parse(sessionStorage.getItem('basiqJobIds') ?? '[]')
    if (jobId || jobIds) {
      existing.push({ jobId, jobIds, bankIndex })
      sessionStorage.setItem('basiqJobIds', JSON.stringify(existing))
    }

    const nextIndex = bankIndex + 1

    if (nextIndex < total) {
      router.replace(`/onboarding?step=4&bankIndex=${nextIndex}&total=${total}`)
    } else {
      router.replace('/onboarding?step=5')
    }
  }, [router, searchParams])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          'radial-gradient(ellipse at 30% 50%, #0d2d42 0%, #071828 20%, #040e1a 50%, #020810 100%)',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#00C896]" size={36} />
        <p className="text-white font-medium text-sm">
          Completing connection...
        </p>
      </div>
    </div>
  )
}

export default function OnboardingCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
