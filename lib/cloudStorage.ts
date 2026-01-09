import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage'
import { db, storage } from './firebase'
import { Course, SlideFile, DownloadHistory } from '@/types'

const COLLECTIONS = {
  COURSES: 'courses',
  FILES: 'files',
  DOWNLOAD_HISTORY: 'downloadHistory',
}

// Course Management
export const saveCourseToCloud = async (course: Course): Promise<void> => {
  try {
    const courseRef = doc(db, COLLECTIONS.COURSES, course.id)
    await setDoc(courseRef, {
      ...course,
      createdAt: Timestamp.fromDate(new Date(course.createdAt)),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error saving course to cloud:', error)
    throw error
  }
}

export const getCoursesFromCloud = async (): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, COLLECTIONS.COURSES)
    const snapshot = await getDocs(coursesRef)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Course
    })
  } catch (error) {
    console.error('Error getting courses from cloud:', error)
    return []
  }
}

export const deleteCourseFromCloud = async (courseId: string): Promise<void> => {
  try {
    // Delete course document
    await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId))

    // Delete associated files
    const filesQuery = query(
      collection(db, COLLECTIONS.FILES),
      where('courseId', '==', courseId)
    )
    const filesSnapshot = await getDocs(filesQuery)

    const deletePromises = filesSnapshot.docs.map(async (fileDoc) => {
      const fileData = fileDoc.data()
      // Delete file from storage
      if (fileData.storagePath) {
        const fileRef = ref(storage, fileData.storagePath)
        await deleteObject(fileRef)
      }
      // Delete file document
      await deleteDoc(fileDoc.ref)
    })

    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting course from cloud:', error)
    throw error
  }
}

// File Management
export const uploadFileToCloud = async (
  file: File,
  courseId: string,
  fileId: string,
  onProgress?: (progress: number) => void
): Promise<SlideFile> => {
  try {
    // Upload file to Firebase Storage
    const storagePath = `courses/${courseId}/${fileId}_${file.name}`
    const storageRef = ref(storage, storagePath)

    // Upload file
    await uploadBytes(storageRef, file)

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)

    // Get file metadata
    const metadata = await getMetadata(storageRef)

    // Save file metadata to Firestore
    const fileData: SlideFile = {
      id: fileId,
      courseId,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      tags: [],
      downloadURL,
      storagePath,
    }

    const fileRef = doc(db, COLLECTIONS.FILES, fileId)
    await setDoc(fileRef, {
      ...fileData,
      uploadedAt: Timestamp.fromDate(fileData.uploadedAt),
    })

    return fileData
  } catch (error) {
    console.error('Error uploading file to cloud:', error)
    throw error
  }
}

export const getFilesFromCloud = async (courseId?: string): Promise<SlideFile[]> => {
  try {
    const filesRef = collection(db, COLLECTIONS.FILES)

    const q = courseId
      ? query(filesRef, where('courseId', '==', courseId))
      : filesRef

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
      } as SlideFile
    })
  } catch (error) {
    console.error('Error getting files from cloud:', error)
    return []
  }
}

export const deleteFileFromCloud = async (fileId: string): Promise<void> => {
  try {
    // Get file document to access storage path
    const fileRef = doc(db, COLLECTIONS.FILES, fileId)
    const fileDoc = await getDoc(fileRef)

    if (fileDoc.exists()) {
      const fileData = fileDoc.data()

      // Delete file from storage
      if (fileData.storagePath) {
        const storageRef = ref(storage, fileData.storagePath)
        await deleteObject(storageRef)
      }

      // Delete file document
      await deleteDoc(fileRef)
    }
  } catch (error) {
    console.error('Error deleting file from cloud:', error)
    throw error
  }
}

export const deleteMultipleFilesFromCloud = async (fileIds: string[]): Promise<void> => {
  try {
    const deletePromises = fileIds.map(fileId => deleteFileFromCloud(fileId))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting multiple files from cloud:', error)
    throw error
  }
}

// Generate shareable link for a file
export const generateShareLink = (fileId: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  return `${baseUrl}/share/${fileId}`
}

// Get file by ID for sharing
export const getFileById = async (fileId: string): Promise<SlideFile | null> => {
  try {
    const fileRef = doc(db, COLLECTIONS.FILES, fileId)
    const fileDoc = await getDoc(fileRef)

    if (fileDoc.exists()) {
      const data = fileDoc.data()
      return {
        ...data,
        id: fileDoc.id,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
      } as SlideFile
    }

    return null
  } catch (error) {
    console.error('Error getting file by ID:', error)
    return null
  }
}

// Update course stats in cloud
export const updateCourseStatsInCloud = async (courseId: string): Promise<void> => {
  try {
    const files = await getFilesFromCloud(courseId)
    const courseRef = doc(db, COLLECTIONS.COURSES, courseId)
    const courseDoc = await getDoc(courseRef)

    if (courseDoc.exists()) {
      await setDoc(
        courseRef,
        {
          fileCount: files.length,
          totalSize: files.reduce((sum, f) => sum + f.size, 0),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }
  } catch (error) {
    console.error('Error updating course stats:', error)
  }
}

// Sync localStorage with cloud (for migration)
export const syncLocalToCloud = async (): Promise<void> => {
  try {
    // This function can be used to migrate existing localStorage data to cloud
    const localCourses = localStorage.getItem('courses')
    if (localCourses) {
      const courses = JSON.parse(localCourses) as Course[]
      for (const course of courses) {
        await saveCourseToCloud(course)
      }
    }
  } catch (error) {
    console.error('Error syncing local to cloud:', error)
  }
}
