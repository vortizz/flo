'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AlertCircle, XCircle } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

interface JobStep {
  title: string
  status: 'pending' | 'in-progress' | 'success' | 'failed'
}

interface StepSyncProps {
  onBack: () => void
}

const POLL_INTERVAL = 3000
const MAX_POLLS = 20

export function StepSync({ onBack }: StepSyncProps) {
  const { getToken } = useAuth()
  const router = useRouter()

  const [jobSteps, setJobSteps] = useState<JobStep[]>([
    { title: 'Verifying connection', status: 'pending' },
    { title: 'Retrieving accounts', status: 'pending' },
    { title: 'Fetching transactions', status: 'pending' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('basiqJobIds')
    if (!stored) {
      setError('No job IDs found. Please try connecting again.')
      return
    }

    const jobEntries = JSON.parse(stored)
    const allJobIds: string[] = jobEntries
      .flatMap((entry: any) => {
        if (entry.jobIds) return entry.jobIds.split(',')
        if (entry.jobId) return [entry.jobId]
        return []
      })
      .filter(Boolean)

    if (allJobIds.length === 0) {
      setError('No job IDs found. Please try connecting again.')
      return
    }

    let polls = 0

    async function poll() {
      try {
        const token = await getToken()
        const results = await Promise.all(
          allJobIds.map(jobId =>
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/basiq/jobs/${jobId}`,
              { headers: { Authorization: `Bearer ${token}` } },
            ).then(r => r.json()),
          ),
        )

        // Map Basiq job steps to our UI steps
        const allSteps = results.flatMap((job: any) => job.steps ?? [])

        const verifyStep = allSteps.find((s: any) =>
          s.title?.toLowerCase().includes('verify'),
        )
        const accountStep = allSteps.find((s: any) =>
          s.title?.toLowerCase().includes('account'),
        )
        const transactionStep = allSteps.find((s: any) =>
          s.title?.toLowerCase().includes('transaction'),
        )

        const mapStatus = (step: any): JobStep['status'] => {
          if (!step) return 'pending'
          if (step.status === 'success') return 'success'
          if (step.status === 'failed') return 'failed'
          if (step.status === 'in-progress') return 'in-progress'
          return 'pending'
        }

        setJobSteps([
          { title: 'Verifying connection', status: mapStatus(verifyStep) },
          { title: 'Retrieving accounts', status: mapStatus(accountStep) },
          {
            title: 'Fetching transactions',
            status: mapStatus(transactionStep),
          },
        ])

        const anyFailed = allSteps.some((s: any) => s.status === 'failed')
        if (anyFailed) {
          setError('Something went wrong while syncing. Please try again.')
          return
        }

        const allSuccess = results.every((job: any) =>
          job.steps?.every((s: any) => s.status === 'success'),
        )

        if (allSuccess) {
          // Trigger account sync
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/basiq/sync`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
          sessionStorage.removeItem('basiqJobIds')
          setIsDone(true)
          setTimeout(() => router.push('/dashboard'), 2000)
          return
        }

        polls++
        if (polls >= MAX_POLLS) {
          setError(
            'Sync is taking longer than expected. Please check back later.',
          )
          return
        }

        setTimeout(poll, POLL_INTERVAL)
      } catch (err) {
        console.error('Polling error:', err)
        setError('Something went wrong. Please try again.')
      }
    }

    poll()
  }, [getToken, router])

  if (error) {
    return (
      <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center gap-4 min-h-64">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-white font-medium text-sm text-center">{error}</p>
        <button
          onClick={onBack}
          className="border border-[#1e2d3d] hover:border-[#4a6070] text-[#8b949e] hover:text-white font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (isDone) {
    return (
      <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center gap-4 min-h-64">
        <div className="w-14 h-14 rounded-full bg-[#00C896]/10 flex items-center justify-center">
          <CheckCircle size={32} className="text-[#00C896]" />
        </div>
        <p className="text-white font-semibold text-lg">All connected!</p>
        <p className="text-[#8b949e] text-xs text-center">
          Your accounts have been synced. Taking you to your dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white mb-1">
        Syncing your accounts
      </h2>
      <p className="text-[#8b949e] text-xs mb-8">
        We&apos;re securely retrieving your bank data. This usually takes a few
        seconds.
      </p>

      <div className="space-y-4 mb-8">
        {jobSteps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 rounded-xl border border-[#1e2d3d] bg-[#0d1f2d]"
          >
            <div className="shrink-0">
              {step.status === 'success' && (
                <CheckCircle size={20} className="text-[#00C896]" />
              )}
              {step.status === 'in-progress' && (
                <Loader2 size={20} className="animate-spin text-[#00C896]" />
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-[#1e2d3d]" />
              )}
              {step.status === 'failed' && (
                <XCircle size={20} className="text-red-400" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step.status === 'success'
                  ? 'text-white'
                  : step.status === 'failed'
                    ? 'text-red-400'
                    : step.status === 'in-progress'
                      ? 'text-white'
                      : 'text-[#4a6070]'
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-[#4a6070] text-xs">
        Please don&apos;t close this page while we sync your data.
      </p>
    </div>
  )
}
