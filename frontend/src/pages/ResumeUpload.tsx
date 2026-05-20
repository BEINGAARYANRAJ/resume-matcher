// ResumeUpload.tsx
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from '../api/client'

export function ResumeUpload() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.docx'] },
    onDrop: async (files) => {
      setUploading(true)
      const form = new FormData()
      form.append('file', files[0])
      const res = await axios.post('/api/resume/upload', form)
      setResult(res.data)
      setUploading(false)
    }
  })

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : (
        <p>Drag & drop a PDF or DOCX here, or click to select</p>
      )}
      {result && (
        <div className="result">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}