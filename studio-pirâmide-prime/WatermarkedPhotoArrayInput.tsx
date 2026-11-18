import {useEffect, useRef, useState, type ChangeEvent, type DragEvent} from 'react'
import {insert, set, setIfMissing, useClient, type ArrayOfObjectsInputProps, type ImageValue} from 'sanity'
import {watermarkFile, watermarkVersion} from './watermark'

type Photo = ImageValue & {_key: string}

export function WatermarkedPhotoArrayInput(props: ArrayOfObjectsInputProps<Photo>) {
  const client = useClient({apiVersion: '2026-02-01'})
  const latest = useRef(props)
  latest.current = props
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signature = JSON.stringify(props.value?.map((photo) => [photo._key, photo.asset?._ref]))

  async function upload(file: Blob, filename: string) {
    return client.assets.upload('image', await watermarkFile(file), {
      filename: filename.replace(/\.[^.]+$/, '') + '-' + watermarkVersion + '.jpg',
      description: watermarkVersion,
    })
  }

  async function addFiles(files: File[]) {
    setBusy(true)
    setError(null)
    try {
      for (const file of files) {
        const asset = await upload(file, file.name)
        latest.current.onChange([
          setIfMissing([]),
          insert([{_type: 'primePhoto', _key: crypto.randomUUID().replaceAll('-', ''), asset: {_type: 'reference', _ref: asset._id}}], 'after', [-1]),
        ])
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao aplicar a marca d’água. Envie novamente as fotos que faltam.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (props.readOnly) return
    let cancelled = false
    async function checkImages() {
      try {
        for (const photo of latest.current.value || []) {
          const id = photo.asset?._ref
          if (!id || cancelled) continue
          const asset = await client.fetch<{url: string; originalFilename?: string; description?: string} | null>(
            '*[_id == $id][0]{url,originalFilename,description}', {id},
          )
          if (cancelled || !asset || asset.description === watermarkVersion) continue
          setBusy(true)
          const response = await fetch(asset.url)
          if (!response.ok) throw new Error('Não foi possível carregar uma foto selecionada.')
          const marked = await upload(await response.blob(), asset.originalFilename || 'foto.jpg')
          const current = latest.current.value?.find((item) => item._key === photo._key)
          if (!cancelled && current?.asset?._ref === id) {
            latest.current.onChange(set(marked._id, [{_key: photo._key}, 'asset', '_ref']))
          }
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Falha ao aplicar a marca d’água.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }
    void checkImages()
    return () => { cancelled = true }
  }, [signature, client, props.readOnly])

  function interceptFile(event: ChangeEvent<HTMLDivElement>) {
    const input = event.target
    if (!(input instanceof HTMLInputElement) || input.closest('[data-watermark-field]') || input.type !== 'file' || !input.files?.length || props.readOnly) return
    event.stopPropagation()
    const files = Array.from(input.files)
    input.value = ''
    void addFiles(files)
  }

  function interceptDrop(event: DragEvent<HTMLDivElement>) {
    if (props.readOnly || (event.target as Element).closest('[data-watermark-field]')) return
    const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/'))
    if (!files.length) return
    event.preventDefault()
    event.stopPropagation()
    void addFiles(files)
  }

  return (
    <div onChangeCapture={interceptFile} onDropCapture={interceptDrop} aria-busy={busy}>
      {props.renderDefault({...props, readOnly: props.readOnly || busy})}
      {busy && <p role="status">Aplicando marca d’água às fotos…</p>}
      {error && <p role="alert" style={{color: '#c83232'}}>{error}</p>}
    </div>
  )
}
