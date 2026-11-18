import type {CSSProperties} from 'react'

const assets = {
  area: 'metragem', suite: 'quarto-casal', bedroom: 'quarto-solteiro',
  parking: 'garagem', bath: 'banheiro', building: 'apartamento',
}

const paths = {
  arrow: 'M5 16h21m-8-8 8 8-8 8',
  external: 'M8 24 24 8M12 8h12v12',
  expand: 'M5 12V5h7m8 0h7v7m0 8v7h-7m-8 0H5v-7',
  photos: 'M8 5h18a2 2 0 0 1 2 2v15M4 10h19v17H4zM4 23l6-6 4 4 4-4 5 5m-6-8h.01',
  play: 'M7 5h18a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm6 6 8 5-8 5z',
  compass: 'M16 4a12 12 0 1 1 0 24 12 12 0 0 1 0-24Zm5 7-3 7-7 3 3-7z',
  sparkle: 'M16 4c0 7 5 12 12 12-7 0-12 5-12 12 0-7-5-12-12-12 7 0 12-5 12-12Z',
  floors: 'M5 11 16 5l11 6-11 6-11-6Zm0 5 11 6 11-6M5 21l11 6 11-6',
  sun: 'M16 10a6 6 0 1 1 0 12 6 6 0 0 1 0-12ZM16 4v3m0 18v3M4 16h3m18 0h3M7.5 7.5l2 2m13 13 2 2m0-17-2 2m-13 13-2 2',
  plan: 'M11 6H5v21h22v-6M11 6v5H5m22 10h-5v6M10 21 23 8l3 3-13 13-4 1 1-4Zm11-11 3 3',
  reference: 'M5 8h14l8 8-8 8H5V8Zm14 8h.01M9 13h6m-6 6h6',
  office: 'M7 6h18v13H7zM11 25h10m-5-6v6M4 28h24',
  storage: 'm5 10 11-5 11 5v12l-11 5-11-5V10Zm0 0 11 5 11-5m-11 5v12M10.5 7.5l11 5',
  charging: 'M8 27V6h13v21M5 27h19m-3-6h3a3 3 0 0 0 3-3v-5l-2-2m-10-1-3 5h5l-3 5',
  close: 'm8 8 16 16M24 8 8 24',
  chat: 'M26 15a10 10 0 0 1-10 10c-2 0-3-.3-5-1l-6 2 2-6a10 10 0 1 1 19-5ZM12 15h.01m4 0h.01m4 0h.01',
}

export function CinemaIcon({name, className}: {name: keyof typeof assets | keyof typeof paths; className?: string}) {
  const classes = 'inline-block size-5 shrink-0 ' + (className ?? '')
  if (name in assets) {
    const mask = 'url(/brand/property-icons/' + assets[name as keyof typeof assets] + '.svg) center / contain no-repeat'
    return <span className={classes} style={{backgroundColor: 'currentColor', mask} satisfies CSSProperties} aria-hidden="true" />
  }
  return (
    <svg aria-hidden="true" className={classes} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name as keyof typeof paths]} />
    </svg>
  )
}
