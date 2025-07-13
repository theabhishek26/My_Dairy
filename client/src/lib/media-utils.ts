export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'unknown';
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

export function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file) && !isVideoFile(file)) {
      reject(new Error('File is not an image or video'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    if (isImageFile(file)) {
      const img = new Image();
      img.onload = () => {
        canvas.width = 200;
        canvas.height = 200;
        
        // Calculate aspect ratio and crop to square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 200, 200);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    } else if (isVideoFile(file)) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Get frame at 1 second
      };
      video.onseeked = () => {
        canvas.width = 200;
        canvas.height = 200;
        
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - minDim) / 2;
        const sy = (video.videoHeight - minDim) / 2;
        
        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 200, 200);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    }
  });
}

export function compressImage(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error('File is not an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions (max 1920x1920)
      const maxDim = 1920;
      let { width, height } = img;
      
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, file.type, quality);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!isAudioFile(file)) {
      reject(new Error('File is not an audio file'));
      return;
    }

    const audio = document.createElement('audio');
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => reject(new Error('Failed to load audio'));
    audio.src = URL.createObjectURL(file);
  });
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!isVideoFile(file)) {
      reject(new Error('File is not a video file'));
      return;
    }

    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
}

export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function shareFile(file: File, title?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: title || 'Shared from Diary',
        files: [file],
      }).then(resolve).catch(reject);
    } else {
      // Fallback - copy URL to clipboard if available
      const url = URL.createObjectURL(file);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(resolve).catch(reject);
      } else {
        reject(new Error('Sharing not supported'));
      }
    }
  });
}

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
];

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
];

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/m4a',
  'audio/aac',
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`,
    };
  }

  const supportedTypes = [
    ...SUPPORTED_IMAGE_TYPES,
    ...SUPPORTED_VIDEO_TYPES,
    ...SUPPORTED_AUDIO_TYPES,
  ];

  if (!supportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported`,
    };
  }

  return { isValid: true };
}
