/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Img({ url }) {
  const [imageUrl, setImageUrl] = useState(null)

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
        <div className="reminder-img no-image" style={{ height: 130, width: 130 }}>
          <label>No image</label>
        </div>
      )}
    </div>
  )
}