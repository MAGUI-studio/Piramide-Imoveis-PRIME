'use client'

import {useRef, useState, type ReactNode} from 'react'

export function DragCarousel({children, className = ''}: {children: ReactNode; className?: string}) {
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef({active: false, startX: 0, scrollLeft: 0, moved: false})
  const [grabbing, setGrabbing] = useState(false)

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !track.current) return
    drag.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: track.current.scrollLeft,
      moved: false,
    }
    setGrabbing(true)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active || !track.current) return
    const delta = event.clientX - drag.current.startX
    if (Math.abs(delta) > 5 && !drag.current.moved) {
      drag.current.moved = true
      track.current.setPointerCapture(event.pointerId)
    }
    if (!drag.current.moved) return
    track.current.scrollLeft = drag.current.scrollLeft - delta
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return
    drag.current.active = false
    setGrabbing(false)
    if (track.current?.hasPointerCapture(event.pointerId)) {
      track.current.releasePointerCapture(event.pointerId)
    }
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (drag.current.moved) {
      event.preventDefault()
      event.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <div
      ref={track}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      onDragStart={(event) => event.preventDefault()}
      className={
        className +
        ' ' +
        (grabbing ? 'cursor-grabbing select-none snap-none' : 'cursor-grab snap-x snap-mandatory')
      }
    >
      {children}
    </div>
  )
}
