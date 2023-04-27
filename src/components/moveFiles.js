import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'node:fs'
import path from 'node:path'

export default function moveFiles() {
  const {
    COURSE_DIR_NAME,
    HOMEWORK_DIR_NAME,
    DOWNLOAD_PATH,
  } = process.env

  const courseDir = path.join(DOWNLOAD_PATH, COURSE_DIR_NAME)
  const homeworkDir = path.join(courseDir, HOMEWORK_DIR_NAME)

  if (!existsSync(homeworkDir))
    mkdirSync(homeworkDir, { recursive: true })

  const files = readdirSync(DOWNLOAD_PATH)

  files.forEach((file) => {
    if (file !== '.DS_Store') {
      const targetPath = path.join(homeworkDir, file)
      const filePath = path.join(DOWNLOAD_PATH, file)
      const isDir = statSync(filePath).isDirectory()
      if (!isDir)
        renameSync(filePath, targetPath)
    }
  })
}
