'use client'

import {ArrowLeft} from 'lucide-react'
import {useRouter} from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  function goBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <button type="button" onClick={goBack} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-piramide">
      <ArrowLeft size={17} aria-hidden="true" />
      Voltar à página anterior
    </button>
  )
}
