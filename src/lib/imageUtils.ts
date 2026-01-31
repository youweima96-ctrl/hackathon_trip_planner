import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  maxIteration?: number
  exifOrientation?: number
  onProgress?: (progress: number) => void
  fileType?: string
}

export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    maxIteration: 10,
    ...options
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions)
    return compressedFile
  } catch (error) {
    console.error('图片压缩失败:', error)
    return file
  }
}

export async function compressMultipleImages(
  files: File[], 
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => compressImage(file, options))
  return Promise.all(compressionPromises)
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}