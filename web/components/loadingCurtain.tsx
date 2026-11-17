'use client'

import {useEffect, useState} from 'react'

export function LoadingCurtain() {
  const [stage, setStage] = useState<'showing' | 'splitting' | 'revealing' | 'complete'>('showing')
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const enterFrame = requestAnimationFrame(() => setEntered(true))
    let splitFrame1 = 0
    let splitFrame2 = 0

    const revealTimer = setTimeout(() => {
      setStage('splitting')
      splitFrame1 = requestAnimationFrame(() => {
        splitFrame2 = requestAnimationFrame(() => {
          setStage('revealing')
        })
      })
    }, 900)

    const completeTimer = setTimeout(() => {
      setStage('complete')
      document.body.style.overflow = ''
    }, 1780)

    return () => {
      cancelAnimationFrame(enterFrame)
      cancelAnimationFrame(splitFrame1)
      cancelAnimationFrame(splitFrame2)
      clearTimeout(revealTimer)
      clearTimeout(completeTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (stage === 'complete') {
    return null
  }

  const splitting = stage === 'splitting' || stage === 'revealing'
  const revealing = stage === 'revealing'

  return (
    <div
      data-testid="loading-curtain"
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[999999] w-full max-w-[110rem] -translate-x-1/2 overflow-hidden select-none will-change-transform"
    >
      <div className="pointer-events-none absolute inset-0 z-[1000000] flex items-center justify-center px-6">
        <div
          className={
            'relative flex flex-col items-center justify-center transition-all ' +
            (splitting
              ? '-translate-y-4 scale-104 opacity-0 duration-250 ease-in'
              : entered
                ? 'translate-y-0 scale-100 opacity-100 duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]'
                : 'translate-y-5 scale-95 opacity-0 duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]')
          }
        >
          <img
            src="/logos/piramide/logo_white.svg"
            alt="Pirâmide Imóveis"
            width={380}
            height={100}
            className="h-auto max-h-20 w-auto object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] sm:h-22 md:h-26 lg:h-30"
          />
        </div>
      </div>

      {!splitting && (
        <div className="pointer-events-none absolute inset-0 size-full bg-black/75 backdrop-blur-md" />
      )}

      <div
        className={
          'pointer-events-none absolute inset-y-0 left-0 h-full w-1/2 bg-black/75 backdrop-blur-md transition-transform duration-850 ease-[cubic-bezier(0.85,0,0.15,1)] will-change-transform ' +
          (!splitting ? 'opacity-0 ' : 'opacity-100 ') +
          (revealing ? '-translate-x-full' : 'translate-x-0')
        }
      />

      <div
        className={
          'pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 bg-black/75 backdrop-blur-md transition-transform duration-850 ease-[cubic-bezier(0.85,0,0.15,1)] will-change-transform ' +
          (!splitting ? 'opacity-0 ' : 'opacity-100 ') +
          (revealing ? 'translate-x-full' : 'translate-x-0')
        }
      />
    </div>
  )
}
