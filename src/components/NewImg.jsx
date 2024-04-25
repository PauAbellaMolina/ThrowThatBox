/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import loadingSpinner from '../assets/loadingSpinner.svg'
import { supabase } from '../supabaseClient'

export default function NewImg({ session, url, onUpload, onUploading }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loadingImg, setLoadingImg] = useState(false)

  useEffect(() => {
    let unmounted = false
    if (url) {
      setLoadingImg(true)
      downloadImage(url, unmounted)
    }

    return () => {
      unmounted = true
    }
  }, [url])

  async function downloadImage(path, unmounted) {
    try {
      const { data, error } = await supabase.storage.from('reminder_imgs').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      if (!unmounted) setImageUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    } finally {
      if (!unmounted) setLoadingImg(false)
    }
  }

  async function uploadImage(event) {
    try {
      setUploading(true)
      onUploading()

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const { user } = session
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('reminder_imgs').upload(user.id+'/'+filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(event, filePath)
    } catch (error) {
      alert('Error uploading image: ', error.message)
    } finally {
      setUploading(false)
      setLoadingImg(true)
    }
  }

  return (
    <div className="reminder-img-wrapper">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Image"
          className="reminder-img image"
          style={{ height: 130, width: 130 }}
        />
      ) : (
        <div className="reminder-img no-image new-image" style={{ height: 130, width: 130 }}>
          <label htmlFor="image">
            {loadingImg ? <>
              <img src={loadingSpinner} className="loading-spinner" alt="Loading spinner" />
            </> : 
              uploading ? 'Uploading ...' : '+ Upload'
            }
          </label>
          <input
            style={{
              visibility: 'hidden',
              position: 'absolute'
            }}
            type="file"
            id="image"
            capture="user"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  )
}