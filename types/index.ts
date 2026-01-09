export interface Course {
  id: string
  name: string
  description: string
  color: string
  createdAt: Date
  fileCount: number
  totalSize: number
}

export interface SlideFile {
  id: string
  courseId: string
  name: string
  size: number
  uploadedAt: Date
  thumbnail?: string
  tags: string[]
}

export interface DownloadHistory {
  id: string
  fileId: string
  fileName: string
  downloadedAt: Date
  type: 'single' | 'batch' | 'zip'
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}
