import {useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent} from 'react'
import {set, useClient, useFormValue, type ImageValue, type ObjectInputProps} from 'sanity'
import {watermarkFile, watermarkVersion} from './watermark'

type Asset = {_id: string; url: string; originalFilename?: string; description?: string}

export function WatermarkedImageInput(props: ObjectInputProps<ImageValue>) {
  const client = useClient({apiVersion: '2026-02-01'})
  const isProperty = ['property', 'condominium'].includes(String(useFormValue(['_type'])))
  const latest = useRef(props)
  latest.current = props
  const request = useRef(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const assetId = props.value?.asset?._ref

  const upload = useCallback(async (file: Blob, filename: string, expectedAsset?: string) => {
    const run = ++request.current
    setBusy(true)
    setError(null)
    try {
      const marked = await watermarkFile(file)
      const asset = await client.assets.upload('image', marked, {
        filename: filename.replace(/\.[^.]+$/, '') + '-' + watermarkVersion + '.jpg',
        description: watermarkVersion,
      })
      if (request.current !== run || latest.current.value?.asset?._ref !== expectedAsset) return
      latest.current.onChange(set({_type: 'reference', _ref: asset._id}, ['asset']))
    } catch (cause) {
      if (request.current === run) setError(cause instanceof Error ? cause.message : 'Falha ao aplicar a marca d’água. Tente novamente.')
    } finally {
      if (request.current === run) setBusy(false)
    }
  }, [client])

  useEffect(() => {
    if (!isProperty || !assetId || props.readOnly) return
    let cancelled = false
    async function check() {
      try {
        const asset = await client.fetch<Asset | null>('*[_id == $id][0]{_id,url,originalFilename,description}', {id: assetId})
        if (cancelled || !asset || asset.description === watermarkVersion) return
        const response = await fetch(asset.url)
        if (!response.ok) throw new Error('Não foi possível carregar a imagem selecionada.')
        const blob = await response.blob()
        if (!cancelled) await upload(blob, asset.originalFilename || 'foto.jpg', assetId)
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Falha ao preparar a imagem selecionada.')
      }
    }
    void check()
    return () => { cancelled = true }
  }, [assetId, client, isProperty, props.readOnly, upload])

  useEffect(() => () => { request.current++ }, [])

  function interceptFile(event: ChangeEvent<HTMLDivElement>) {
    const input = event.target
    if (!isProperty || !(input instanceof HTMLInputElement) || input.type !== 'file' || !input.files?.length || props.readOnly) return
    event.stopPropagation()
    const file = input.files[0]
    input.value = ''
    void upload(file, file.name, assetId)
  }

  function interceptDrop(event: DragEvent<HTMLDivElement>) {
    if (!isProperty || props.readOnly || !event.dataTransfer.files.length) return
    const file = event.dataTransfer.files[0]
    if (!file.type.startsWith('image/')) return
    event.preventDefault()
    event.stopPropagation()
    void upload(file, file.name, assetId)
  }

  return (
    <div data-watermark-field onChangeCapture={interceptFile} onDropCapture={interceptDrop} aria-busy={busy}>
      {props.renderDefault({...props, readOnly: props.readOnly || busy})}
      {busy && <p role="status">Aplicando a marca d’água da Pirâmide Imóveis Prime…</p>}
      {error && <p role="alert" style={{color: '#c83232'}}>{error}</p>}
    </div>
  )
}
