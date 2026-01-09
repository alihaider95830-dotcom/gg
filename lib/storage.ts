import { Course, SlideFile, DownloadHistory } from '@/types'

const STORAGE_KEYS = {
  COURSES: 'courses',
  FILES: 'files',
  DOWNLOAD_HISTORY: 'downloadHistory',
}

// Course Management
export const getCourses = (): Course[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.COURSES)
  return data ? JSON.parse(data) : []
}

export const saveCourse = (course: Course): void => {
  const courses = getCourses()
  const existingIndex = courses.findIndex(c => c.id === course.id)

  if (existingIndex >= 0) {
    courses[existingIndex] = course
  } else {
    courses.push(course)
  }

  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses))
}

export const deleteCourse = (courseId: string): void => {
  const courses = getCourses().filter(c => c.id !== courseId)
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses))

  // Also delete associated files
  const files = getFiles().filter(f => f.courseId !== courseId)
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files))
}

// File Management
export const getFiles = (): SlideFile[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.FILES)
  return data ? JSON.parse(data) : []
}

export const getFilesByCourse = (courseId: string): SlideFile[] => {
  return getFiles().filter(f => f.courseId === courseId)
}

export const saveFile = (file: SlideFile): void => {
  const files = getFiles()
  const existingIndex = files.findIndex(f => f.id === file.id)

  if (existingIndex >= 0) {
    files[existingIndex] = file
  } else {
    files.push(file)
  }

  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files))

  // Update course file count and size
  updateCourseStats(file.courseId)
}

export const deleteFile = (fileId: string): void => {
  const files = getFiles()
  const file = files.find(f => f.id === fileId)
  const courseId = file?.courseId

  const updatedFiles = files.filter(f => f.id !== fileId)
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updatedFiles))

  if (courseId) {
    updateCourseStats(courseId)
  }
}

export const deleteMultipleFiles = (fileIds: string[]): void => {
  const files = getFiles()
  const affectedCourses = new Set<string>()

  files.forEach(f => {
    if (fileIds.includes(f.id)) {
      affectedCourses.add(f.courseId)
    }
  })

  const updatedFiles = files.filter(f => !fileIds.includes(f.id))
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updatedFiles))

  affectedCourses.forEach(courseId => updateCourseStats(courseId))
}

// Update course statistics
const updateCourseStats = (courseId: string): void => {
  const courses = getCourses()
  const course = courses.find(c => c.id === courseId)

  if (course) {
    const courseFiles = getFilesByCourse(courseId)
    course.fileCount = courseFiles.length
    course.totalSize = courseFiles.reduce((sum, f) => sum + f.size, 0)
    saveCourse(course)
  }
}

// Download History
export const getDownloadHistory = (): DownloadHistory[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.DOWNLOAD_HISTORY)
  return data ? JSON.parse(data) : []
}

export const addToDownloadHistory = (download: DownloadHistory): void => {
  const history = getDownloadHistory()
  history.unshift(download)

  // Keep only last 50 downloads
  const trimmedHistory = history.slice(0, 50)
  localStorage.setItem(STORAGE_KEYS.DOWNLOAD_HISTORY, JSON.stringify(trimmedHistory))
}

// Storage stats
export const getStorageStats = () => {
  const courses = getCourses()
  const files = getFiles()
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return {
    courseCount: courses.length,
    fileCount: files.length,
    totalSize,
    averageFileSize: files.length > 0 ? totalSize / files.length : 0,
  }
}
