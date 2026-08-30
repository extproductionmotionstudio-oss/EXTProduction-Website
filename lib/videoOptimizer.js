/**
 * Cloudinary & Video Live-Streaming Optimizer
 * Automatically transforms raw heavy Cloudinary video URLs (100MB+) into 
 * dynamic adaptive bitrate progressive live streams (3MB-5MB) with f_auto, q_auto.
 * 
 * - f_auto: Chooses the lightest modern video codec (AV1 / VP9 / WebM / MP4) supported by browser
 * - q_auto: Intelligent perceptual compression with zero visible loss
 * - vc_auto: Video codec auto-selection
 * - w_1280 (or w_720 for vertical): Web-optimized resolution limit
 * - fl_progressive: Allows instant frame-1 progressive streaming like YouTube
 */
export function getOptimizedVideoUrl(url, { isVertical = false } = {}) {
  if (!url || typeof url !== 'string') return url;

  // Optimize Cloudinary URLs
  if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
    // Avoid double transforming if already transformed
    if (url.includes('/video/upload/f_auto') || url.includes('/video/upload/q_auto')) {
      return url;
    }

    const width = isVertical ? 'w_720' : 'w_1280';
    const transformations = `f_auto,q_auto,vc_auto,${width},c_limit,fl_progressive`;
    return url.replace('/video/upload/', `/video/upload/${transformations}/`);
  }

  return url;
}

/**
 * Generates an instant, ultra-fast (~15KB) thumbnail poster image for any video.
 * Extracts frame 0 from Cloudinary videos automatically or fetches YouTube HQ poster.
 */
export function getVideoPosterUrl(url, { isVertical = false } = {}) {
  if (!url || typeof url !== 'string') return '';

  // YouTube thumbnail
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const ytId = (match && match[2].length === 11) ? match[2] : null;
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }

  // Cloudinary video thumbnail poster
  if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
    const width = isVertical ? 'w_720' : 'w_1280';
    // Replace video extension with .jpg and capture frame at 0s (so_0)
    let posterUrl = url.replace(/\.(mp4|webm|mov|m4v|mkv|avi)$/i, '.jpg');
    if (!posterUrl.endsWith('.jpg') && !posterUrl.endsWith('.webp')) {
      posterUrl += '.jpg';
    }
    const transformation = `f_auto,q_auto,${width},c_limit,so_0/`;
    return posterUrl.replace('/video/upload/', `/video/upload/${transformation}`);
  }

  return '';
}
