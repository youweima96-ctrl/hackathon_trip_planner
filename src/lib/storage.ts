import { supabase } from './supabase'

export interface UploadImageResult {
  url: string
  error?: string
}

export async function uploadImage(file: File, folder: string = 'antiques'): Promise<UploadImageResult> {
  try {
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${folder}/${fileName}`
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { url: '', error: error.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (error: any) {
    return { url: '', error: error.message || '图片上传失败' }
  }
}

export async function uploadMultipleImages(files: File[], folder: string = 'antiques'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, folder))
  const results = await Promise.all(uploadPromises)
  
  return results
    .filter(result => !result.error)
    .map(result => result.url)
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
    
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    return !error
  } catch (error) {
    return false
  }
}