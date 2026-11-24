export const watermarkVersion = 'piramide-watermark-v1'
export const watermarkWidth = 0.3
export const watermarkOpacity = 0.42
export const watermarkMaxDimension = 3200

function loadImage(url: string, errorMessage = 'Não foi possível abrir a imagem para aplicar a marca d’água.'): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(errorMessage))
    image.src = url
  })
}

export async function watermarkFile(file: Blob): Promise<Blob> {
  const fileUrl = URL.createObjectURL(file)
  try {
    const logoUrl = new URL('/static/watermark-logo.svg', window.location.origin).href
    const [image, logo] = await Promise.all([
      loadImage(fileUrl),
      loadImage(logoUrl, 'Não foi possível carregar o logotipo da marca d’água.'),
    ])
    const scale = Math.min(1, watermarkMaxDimension / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('O navegador não conseguiu preparar a imagem.')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const width = Math.min(canvas.width * watermarkWidth, canvas.height * 0.4 * logo.naturalWidth / logo.naturalHeight)
    const height = width * logo.naturalHeight / logo.naturalWidth
    context.globalAlpha = watermarkOpacity
    context.drawImage(logo, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
    for (const quality of [0.94, 0.86, 0.76, 0.65]) {
      const result = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Não foi possível salvar a imagem com a marca d’água.')),
        'image/jpeg', quality,
      ))
      if (result.size <= 2 * 1024 * 1024) return result
    }
    throw new Error('A imagem ficou maior que 2 MB. Reduza o tamanho e tente novamente.')
  } finally {
    URL.revokeObjectURL(fileUrl)
  }
}
