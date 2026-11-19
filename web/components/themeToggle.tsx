'use client'

import * as React from 'react'
import {Moon, Sun} from 'lucide-react'
import {useThemeTransition} from '../lib/useThemeTransition'

export interface ThemeToggleProps {
  isDarkOverlay?: boolean
}

export function ThemeToggle({isDarkOverlay = false}: ThemeToggleProps): React.JSX.Element {
  const {resolvedTheme, toggleTheme} = useThemeTransition()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-[68px] shrink-0 animate-pulse rounded-none bg-transparent" />
  }

  const isLight = resolvedTheme === 'light'

  return (
    <div className="group relative grid h-9 w-[68px] shrink-0 grid-cols-2 items-center gap-1 rounded-none bg-transparent p-1 transition-all">
      <div
        aria-hidden="true"
        style={{transform: `translateX(${isLight ? '0px' : 'calc(100% + 4px)'})`}}
        className={
          'pointer-events-none absolute top-1 left-1 z-0 h-7 w-7 rounded-none shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ' +
          (isDarkOverlay ? 'bg-white/20' : 'bg-zinc-200/80 dark:bg-[#1a1a1f]')
        }
      />

      <button
        type="button"
        onClick={() => (isLight ? null : toggleTheme())}
        className={
          'relative z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-none transition-colors duration-200 ' +
          (isDarkOverlay
            ? isLight
              ? 'text-white'
              : 'text-white/40 hover:text-white/80'
            : isLight
              ? 'text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200')
        }
        title="Tema claro (ou pressione 'D')"
        aria-label="Ativar tema claro"
        aria-pressed={isLight}
      >
        <Sun
          aria-hidden="true"
          className={'size-3.5 transition-transform duration-300 ' + (isLight ? 'fill-current' : '')}
        />
      </button>

      <button
        type="button"
        onClick={() => (!isLight ? null : toggleTheme())}
        className={
          'relative z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-none transition-colors duration-200 ' +
          (isDarkOverlay
            ? !isLight
              ? 'text-white'
              : 'text-white/40 hover:text-white/80'
            : !isLight
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200')
        }
        title="Tema escuro (ou pressione 'D')"
        aria-label="Ativar tema escuro"
        aria-pressed={!isLight}
      >
        <Moon
          aria-hidden="true"
          className={'size-3.5 transition-transform duration-300 ' + (!isLight ? 'fill-current' : '')}
        />
      </button>
    </div>
  )
}
