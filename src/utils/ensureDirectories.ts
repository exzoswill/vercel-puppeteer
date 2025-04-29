import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const mkdir = promisify(fs.mkdir)

/**
 * Ensures that required directories exist
 */
export async function ensureDirectories() {
  const downloadsDir = path.join(process.cwd(), 'public', 'downloads')
  
  try {
    await mkdir(downloadsDir, { recursive: true })
    console.log('Downloads directory created or already exists')
  } catch (error) {
    console.error('Error creating downloads directory:', error)
  }
}

export default ensureDirectories

