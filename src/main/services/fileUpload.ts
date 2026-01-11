import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import sharp from 'sharp';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const THUMBNAIL_SIZE = 300;
const PHOTO_MAX_WIDTH = 1920;
const PHOTO_MAX_HEIGHT = 1920;

/**
 * Saves an uploaded image file with optimization
 */
export async function saveCarPhoto(filePath: string, carId: number): Promise<{ photoPath: string; thumbnailPath: string }> {
  const userDataPath = app.getPath('userData');
  const photosDir = path.join(userDataPath, 'photos');
  const thumbnailsDir = path.join(userDataPath, 'photos', 'thumbnails');
  
  // Create directories if they don't exist
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
  }
  
  // Validate file exists and check size
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_IMAGE_SIZE) {
    throw new Error('Image file is too large (max 10MB)');
  }
  
  // Generate unique filename
  const ext = path.extname(filePath);
  const filename = `car-${carId}-${Date.now()}${ext}`;
  const photoPath = path.join(photosDir, filename);
  const thumbnailPath = path.join(thumbnailsDir, `thumb-${filename}`);
  
  try {
    // Resize and optimize main image
    await sharp(filePath)
      .resize(PHOTO_MAX_WIDTH, PHOTO_MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(photoPath);
    
    // Create thumbnail
    await sharp(filePath)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'cover',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    return {
      photoPath: path.relative(userDataPath, photoPath),
      thumbnailPath: path.relative(userDataPath, thumbnailPath),
    };
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes car photos
 */
export function deleteCarPhoto(photoPath: string, thumbnailPath?: string): void {
  const userDataPath = app.getPath('userData');
  
  try {
    const fullPhotoPath = path.join(userDataPath, photoPath);
    if (fs.existsSync(fullPhotoPath)) {
      fs.unlinkSync(fullPhotoPath);
    }
    
    if (thumbnailPath) {
      const fullThumbnailPath = path.join(userDataPath, thumbnailPath);
      if (fs.existsSync(fullThumbnailPath)) {
        fs.unlinkSync(fullThumbnailPath);
      }
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    // Don't throw - deletion failure shouldn't break the app
  }
}

/**
 * Gets the full path to a photo
 */
export function getPhotoPath(relativePath: string): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, relativePath);
}
