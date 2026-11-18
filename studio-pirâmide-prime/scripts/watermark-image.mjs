import sharp from 'sharp'
import {watermarkMaxDimension, watermarkOpacity, watermarkWidth} from '../watermark.ts'

export async function watermarkImage(buffer, logo) {
  const image = await sharp(buffer, {limitInputPixels: 100_000_000})
    .rotate().resize({width: watermarkMaxDimension, height: watermarkMaxDimension, fit: 'inside', withoutEnlargement: true})
    .toBuffer({resolveWithObject: true})
  const width = Math.max(1, Math.round(Math.min(image.info.width * watermarkWidth, image.info.height * 0.4 * 1000 / 512)))
  const overlay = await sharp(logo).resize({width}).ensureAlpha().raw().toBuffer({resolveWithObject: true})
  for (let i = 3; i < overlay.data.length; i += 4) overlay.data[i] = Math.round(overlay.data[i] * watermarkOpacity)
  for (const quality of [94, 86, 76, 65]) {
    const result = await sharp(image.data).flatten({background: '#fff'})
      .composite([{input: overlay.data, raw: {width: overlay.info.width, height: overlay.info.height, channels: 4}, gravity: 'centre'}])
      .jpeg({quality, mozjpeg: true}).toBuffer()
    if (result.length <= 2 * 1024 * 1024) return result
  }
  throw new Error('Arquivo marcado maior que 2 MB.')
}

