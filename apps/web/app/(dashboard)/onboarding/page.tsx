'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle, Info } from 'lucide-react'
import { FloLogo } from '@/components/logo'
import { useAuth } from '@clerk/nextjs'
import { StepSelect } from './components/StepSelect'
import { StepConsent } from './components/StepConsent'
import { StepConnect } from './components/StepConnect'
import { StepMobile } from './components/StepMobile'
import type { Institution } from '@/types/institution'
import { StepSync } from './components/StepSync'

const STEPS = [
  { number: 1, label: 'Select' },
  { number: 2, label: 'Consent' },
  { number: 3, label: 'Mobile' },
  { number: 4, label: 'Connect' },
  { number: 5, label: 'Sync' },
]

function OnboardingContent() {
  const router = useRouter()
  const { getToken, isLoaded } = useAuth()
  const searchParams = useSearchParams()

  const [selectedBanks, setSelectedBanks] = useState<string[]>([])
  const [banks, setBanks] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(() => {
    const step = searchParams.get('step')
    if (step === '5') return 5
    if (step === '4') return 4
    return 1
  })

  const [initialBankIndex] = useState(() =>
    parseInt(searchParams.get('bankIndex') ?? '0'),
  )

  useEffect(() => {
    const step = searchParams.get('step')
    if (step === '4' || step === '5') {
      window.history.replaceState({}, '', '/onboarding')
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    async function fetchInstitutions() {
      try {
        const token = await getToken()

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/institutions`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )
        if (!response.ok) throw new Error(`Status: ${response.status}`)
        const data = await response.json()
        setBanks(data)
      } catch (error) {
        console.error('Failed fetching institutions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInstitutions()
  }, [getToken, isLoaded])

  useEffect(() => {
    if (!isLoaded) return

    async function checkOnboardingStatus() {
      try {
        const token = await getToken()
        if (!token) {
          setIsCheckingStatus(false)
          return
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (!response.ok) {
          setIsCheckingStatus(false)
          return
        }

        const user = await response.json()

        if (user.onboardingCompleted) {
          router.replace('/dashboard')
          return
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      }
      setIsCheckingStatus(false)
    }
    checkOnboardingStatus()
  }, [isLoaded, getToken, router])

  const toggleBank = (id: string) => {
    setSelectedBanks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id],
    )
  }

  const handleSkip = async () => {
    const token = await getToken()
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/skip-onboarding`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    router.push('/dashboard')
  }

  if (isCheckingStatus) return null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 30% 50%, #0d2d42 0%, #071828 20%, #040e1a 50%, #020810 100%)',
      }}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-8 py-5 shrink-0">
        <div className="flex items-center gap-2">
          <FloLogo size={36} />
          <span className="text-white font-semibold text-xl">Flo</span>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-sm transition-colors"
        >
          Skip for now <ArrowRight size={14} />
        </button>
      </div>

      {/* PROGRESS STEPS */}
      <div className="flex items-center justify-center py-4 shrink-0">
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const isCompleted = step.number < currentStep
            const isActive = step.number === currentStep
            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                      isCompleted
                        ? 'border-[#00C896] bg-[#00C896] text-black'
                        : isActive
                          ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]'
                          : 'border-[#1e2d3d] bg-transparent text-[#4a6070]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={16} /> : step.number}
                  </div>
                  <span
                    className={`text-xs ${isActive || isCompleted ? 'text-[#00C896]' : 'text-[#4a6070]'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-px mb-5 mx-1 ${isCompleted ? 'bg-[#00C896]' : 'bg-[#1e2d3d]'}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 items-start justify-center px-8 py-6 gap-12 max-w-6xl mx-auto w-full">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-start max-w-sm pt-4">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Connect your <br />
              <span className="text-[#00C896]">bank accounts</span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed mb-6">
              Securely link your Australian bank accounts to Flo to
              automatically track transactions, analyze spending, and build your
              wealth.
            </p>
          </div>

          <div
            className="rounded-2xl p-8 border border-[#1e2d3d]"
            style={{ background: '#0d1f2d' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0, 200, 150, 0.1)' }}
              >
                <CheckCircle size={18} className="text-[#00C896]" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
                  Bank-Level Security
                </p>
                <p className="text-[#8b949e] text-sm">
                  Your data is fully protected.
                </p>
              </div>
            </div>
            <div className="space-y-5">
              {['Read-only access', '256-bit Encryption', 'CDR Compliant'].map(
                (title, i) => (
                  <div key={title} className="flex items-start gap-3">
                    <CheckCircle
                      size={16}
                      className="text-[#00C896] mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">{title}</p>
                      <p className="text-[#8b949e] text-xs leading-relaxed">
                        {i === 0 &&
                          'Flo can only view your transactions. We cannot move money or change your account settings.'}
                        {i === 1 &&
                          'Your credentials are never stored on our servers. We use industry-standard encryption.'}
                        {i === 2 &&
                          'Connecting via the Australian Consumer Data Right framework for maximum security.'}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        {currentStep === 1 && (
          <StepSelect
            banks={banks}
            isLoading={isLoading}
            selectedBanks={selectedBanks}
            onToggleBank={toggleBank}
            onContinue={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <StepConsent
            banks={banks}
            selectedBanks={selectedBanks}
            onContinue={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepMobile
            onContinue={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <StepConnect
            banks={banks}
            selectedBanks={selectedBanks}
            initialBankIndex={initialBankIndex}
            onBack={() => setCurrentStep(3)}
          />
        )}
        {currentStep === 5 && <StepSync onBack={() => setCurrentStep(4)} />}
      </div>

      {/* FOOTER */}
      <div className="flex flex-col items-center justify-center py-6 shrink-0 text-center px-4 mt-auto">
        <button
          onClick={handleSkip}
          className="text-xs text-[#8b949e] hover:text-white transition-colors mb-1 inline-flex items-center gap-2 group"
        >
          Skip for now
          <Info
            size={14}
            className="group-hover:text-[#00C896] transition-colors"
          />
        </button>
        <p className="text-[10px] text-[#4a6070] max-w-xs leading-relaxed">
          Skipping will limit your dashboard to manual entries only. You can
          connect a bank later in Settings.
        </p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
