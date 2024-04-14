/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function NewImg({ session, url, size, onUpload }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('reminder_imgs').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setImageUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  async function uploadImage(event) {
    try {
      setUploading(true)

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
    }
  }

  return (
    <div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Image"
          className="reminder-img image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="reminder-img no-image new-image" style={{ height: size, width: size }}>
          <label htmlFor="image">
            {uploading ? 'Uploading ...' : '+ Upload'}
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