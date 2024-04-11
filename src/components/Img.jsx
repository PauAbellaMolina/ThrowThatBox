/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Img({ url, size }) {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
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
    <div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Image"
          className="reminder-img image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="reminder-img no-image" style={{ height: size, width: size }} />
      )}
    </div>
  )
}