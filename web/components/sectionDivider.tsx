import {wrap} from '../lib/classes'

export function SectionDivider() {
  return (
    <div aria-hidden="true" className={wrap + ' flex items-center justify-center gap-5 py-5 sm:gap-7 sm:py-7'}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-rule" />
      <img src="/logos/piramide/icon.png" alt="" width={632} height={237} loading="lazy" className="h-auto w-28 shrink-0 sm:w-36 md:w-44" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-rule" />
    </div>
  )
}
