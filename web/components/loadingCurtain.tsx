'use client'

import {useEffect, useState} from 'react'

export function LoadingCurtain({embedded = false, onComplete}: {embedded?: boolean; onComplete?: () => void}) {
  const [stage, setStage] = useState<'showing' | 'revealing' | 'complete'>('showing')
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage('complete')
      onComplete?.()
      return
    }
    const enterFrame = requestAnimationFrame(() => setEntered(true))

    const revealTimer = setTimeout(() => {
      setStage('revealing')
    }, 900)

    const completeTimer = setTimeout(() => {
      setStage('complete')
      onComplete?.()
    }, 1780)

    return () => {
      cancelAnimationFrame(enterFrame)
      clearTimeout(revealTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  if (stage === 'complete') {
    return null
  }

  const revealing = stage === 'revealing'

  return (
    <div
      data-testid="loading-curtain"
      aria-hidden={embedded || undefined}
      className={'pointer-events-none overflow-hidden select-none transform-gpu ' + (embedded ? 'absolute inset-0 z-10' : 'fixed inset-y-0 left-1/2 z-[999999] w-full max-w-[110rem] -translate-x-1/2')}
    >
      <div className="pointer-events-none absolute inset-0 z-[1000000] flex items-center justify-center px-6">
        <div
          className={
            'relative flex flex-col items-center justify-center transition-all motion-reduce:transition-none ' +
            (revealing
              ? '-translate-y-4 scale-104 opacity-0 duration-250 ease-in'
              : entered
                ? 'translate-y-0 scale-100 opacity-100 duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]'
                : 'translate-y-5 scale-95 opacity-0 duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]')
          }
        >
          <img
            src="/logos/piramide/logo_white.png"
            alt="Pirâmide Imóveis"
            width={380}
            height={100}
            className="h-28 w-auto object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] sm:h-36 md:h-44 lg:h-52"
          />
        </div>
      </div>

      <div
        className={
          'pointer-events-none absolute inset-0 size-full bg-black/75 backdrop-blur-md transition-[clip-path] motion-reduce:transition-none duration-850 ease-[cubic-bezier(0.85,0,0.15,1)] transform-gpu will-change-[clip-path] ' +
          (revealing
            ? '[clip-path:polygon(0%_0%,0%_100%,0%_100%,0%_0%,100%_0%,100%_100%,100%_100%,100%_0%)]'
            : '[clip-path:polygon(0%_0%,0%_100%,50%_100%,50%_0%,50%_0%,50%_100%,100%_100%,100%_0%)]')
        }
      />
    </div>
  )
}
