'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

export interface SliderMark {
  value: number
  label?: string
}

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  size?: 'sm' | 'md' | 'lg'
  label?: React.ReactNode
  showValue?: boolean
  showTooltip?: boolean
  formatTooltip?: (value: number) => string
  formatValue?: (val: number[]) => string
  marks?: SliderMark[]
  histogramData?: number[]
  histogramHeight?: number
  isRequired?: boolean
}

const sizeMap = {
  sm: {track: 'h-1', thumb: 'size-3.5'},
  md: {track: 'h-1.5', thumb: 'size-4'},
  lg: {track: 'h-2.5', thumb: 'size-5'},
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      size = 'md',
      label,
      showValue = false,
      showTooltip = false,
      formatTooltip,
      formatValue,
      marks,
      histogramData,
      histogramHeight = 32,
      value,
      defaultValue,
      min = 0,
      max = 100,
      onValueChange,
      isRequired = false,
      ...props
    },
    ref,
  ) => {
    const initialVal = React.useMemo(() => {
      if (Array.isArray(value)) return value
      if (Array.isArray(defaultValue)) return defaultValue
      return [min]
    }, [value, defaultValue, min])

    const [currentVal, setCurrentVal] = React.useState<number[]>(initialVal)
    const [activeThumbIndex, setActiveThumbIndex] = React.useState<number | null>(null)

    React.useEffect(() => {
      if (Array.isArray(value)) {
        setCurrentVal(value)
      }
    }, [value])

    const handleValueChange = (vals: number[]) => {
      if (value === undefined) {
        setCurrentVal(vals)
      }
      onValueChange?.(vals)
    }

    const formattedDisplay = React.useMemo(() => {
      if (formatValue) return formatValue(currentVal)
      return currentVal.join(' - ')
    }, [currentVal, formatValue])

    const maxHistogramVal = React.useMemo(() => {
      if (!histogramData || histogramData.length === 0) return 1
      return Math.max(1, ...histogramData)
    }, [histogramData])

    const activeRange = React.useMemo(() => {
      if (currentVal.length === 0) return [min, max]
      if (currentVal.length === 1) return [min, currentVal[0]]
      const sorted = [...currentVal].sort((a, b) => a - b)
      return [sorted[0], sorted[sorted.length - 1]]
    }, [currentVal, min, max])

    return (
      <div className="flex w-full flex-col gap-2.5">
        {(label || showValue) && (
          <div className="flex items-baseline justify-between gap-2">
            {label && (
              <span className="text-[10px] font-semibold tracking-wider text-earth uppercase">
                {label}
                {isRequired && <span className="ml-0.5 text-rose-500">*</span>}
              </span>
            )}
            {showValue && (
              <span className="font-mono text-[11px] font-semibold text-espresso tabular-nums">
                {formattedDisplay}
              </span>
            )}
          </div>
        )}

        <div className="relative flex w-full flex-col items-center">
          {histogramData && histogramData.length > 0 && (
            <div
              style={{height: `${histogramHeight}px`}}
              className="pointer-events-none mb-1.5 flex w-full items-end gap-1 px-0.5 select-none"
            >
              {histogramData.map((val, idx) => {
                const span = Math.max(1, max - min)
                const stepSize = span / histogramData.length
                const barMin = min + idx * stepSize
                const barMax = barMin + stepSize
                const heightPercent = val === 0 ? 12 : Math.max(20, (val / maxHistogramVal) * 100)
                const isActive = barMax >= activeRange[0] && barMin <= activeRange[1]

                return (
                  <div
                    key={idx}
                    style={{height: `${heightPercent}%`}}
                    className={
                      'flex-1 rounded-t-[2px] transition-colors duration-200 ' +
                      (isActive
                        ? 'bg-piramide/75'
                        : 'bg-zinc-200/80 dark:bg-white/[0.08]')
                    }
                  />
                )
              })}
            </div>
          )}

          <div className="relative w-full py-1">
            <SliderPrimitive.Root
              ref={ref}
              value={value}
              defaultValue={defaultValue}
              min={min}
              max={max}
              onValueChange={handleValueChange}
              className={
                'relative z-10 flex w-full cursor-pointer touch-none items-center select-none ' +
                (className || '')
              }
              {...props}
            >
              <SliderPrimitive.Track
                className={
                  'relative w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.10] ' +
                  sizeMap[size].track
                }
              >
                <SliderPrimitive.Range className="absolute h-full bg-piramide" />
              </SliderPrimitive.Track>

              {currentVal.map((val, i) => {
                const isActive = activeThumbIndex === i
                return (
                  <SliderPrimitive.Thumb
                    key={i}
                    onMouseEnter={() => setActiveThumbIndex(i)}
                    onMouseLeave={() => setActiveThumbIndex(null)}
                    onPointerDown={() => setActiveThumbIndex(i)}
                    onPointerUp={() => setActiveThumbIndex(null)}
                    className={
                      'relative block cursor-pointer rounded-full border-2 border-piramide bg-white shadow-sm transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-piramide/25 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:bg-[#0e0e12] ' +
                      sizeMap[size].thumb
                    }
                  >
                    {showTooltip && (
                      <div
                        className={
                          'pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 origin-bottom whitespace-nowrap rounded-none border border-zinc-200/80 bg-zinc-900 px-2 py-1 font-mono text-[10px] font-bold text-white shadow-lg transition-all duration-150 dark:border-white/15 dark:bg-[#f4f4f5] dark:text-[#0a0a0b] ' +
                          (isActive
                            ? 'translate-y-0 scale-100 opacity-100'
                            : 'translate-y-1 scale-95 opacity-0')
                        }
                      >
                        {formatTooltip ? formatTooltip(val) : val}
                      </div>
                    )}
                  </SliderPrimitive.Thumb>
                )
              })}
            </SliderPrimitive.Root>

            {marks && marks.length > 0 && (
              <div className="relative mt-2 h-4 w-full select-none">
                {marks.map((mark, i) => {
                  const span = Math.max(1, max - min)
                  const percent = Math.min(100, Math.max(0, ((mark.value - min) / span) * 100))
                  return (
                    <div
                      key={i}
                      style={{left: `${percent}%`}}
                      className="absolute flex -translate-x-1/2 flex-col items-center"
                    >
                      <div className="mb-0.5 h-1.5 w-px bg-zinc-300 dark:bg-white/20" />
                      {mark.label && (
                        <span className="font-mono text-[9px] font-medium whitespace-nowrap text-earth">
                          {mark.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName

export {Slider}
