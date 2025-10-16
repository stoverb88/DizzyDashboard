/**
 * Fullscreen API utility functions with browser compatibility checks
 */

interface FullscreenAPI {
  requestFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  fullscreenElement: Element | null
  fullscreenEnabled: boolean
  fullscreenChangeEvent: string
}

/**
 * Get the appropriate fullscreen API methods for the current browser
 */
export function getFullscreenAPI(): FullscreenAPI | null {
  if (typeof document === 'undefined') return null

  const doc = document as any
  const docEl = document.documentElement as any

  // Standard API
  if (docEl.requestFullscreen) {
    return {
      requestFullscreen: () => docEl.requestFullscreen(),
      exitFullscreen: () => doc.exitFullscreen(),
      fullscreenElement: doc.fullscreenElement,
      fullscreenEnabled: doc.fullscreenEnabled,
      fullscreenChangeEvent: 'fullscreenchange'
    }
  }

  // Webkit (Safari)
  if (docEl.webkitRequestFullscreen) {
    return {
      requestFullscreen: () => docEl.webkitRequestFullscreen(),
      exitFullscreen: () => doc.webkitExitFullscreen(),
      fullscreenElement: doc.webkitFullscreenElement,
      fullscreenEnabled: doc.webkitFullscreenEnabled,
      fullscreenChangeEvent: 'webkitfullscreenchange'
    }
  }

  // Mozilla (older Firefox)
  if (docEl.mozRequestFullScreen) {
    return {
      requestFullscreen: () => docEl.mozRequestFullScreen(),
      exitFullscreen: () => doc.mozCancelFullScreen(),
      fullscreenElement: doc.mozFullScreenElement,
      fullscreenEnabled: doc.mozFullScreenEnabled,
      fullscreenChangeEvent: 'mozfullscreenchange'
    }
  }

  // Microsoft (IE11)
  if (docEl.msRequestFullscreen) {
    return {
      requestFullscreen: () => docEl.msRequestFullscreen(),
      exitFullscreen: () => doc.msExitFullscreen(),
      fullscreenElement: doc.msFullscreenElement,
      fullscreenEnabled: doc.msFullscreenEnabled,
      fullscreenChangeEvent: 'MSFullscreenChange'
    }
  }

  return null
}

/**
 * Check if fullscreen API is supported
 */
export function isFullscreenSupported(): boolean {
  return getFullscreenAPI() !== null
}

/**
 * Check if currently in fullscreen mode
 */
export function isFullscreen(): boolean {
  const api = getFullscreenAPI()
  if (!api) return false
  return !!api.fullscreenElement
}

/**
 * Request fullscreen mode
 */
export async function requestFullscreen(): Promise<boolean> {
  const api = getFullscreenAPI()

  if (!api) {
    console.warn('Fullscreen API is not supported in this browser')
    return false
  }

  if (!api.fullscreenEnabled) {
    console.warn('Fullscreen is not allowed in this context')
    return false
  }

  try {
    await api.requestFullscreen()
    return true
  } catch (error) {
    console.error('Failed to enter fullscreen:', error)
    return false
  }
}

/**
 * Exit fullscreen mode
 */
export async function exitFullscreen(): Promise<boolean> {
  const api = getFullscreenAPI()

  if (!api) {
    console.warn('Fullscreen API is not supported in this browser')
    return false
  }

  if (!api.fullscreenElement) {
    // Already not in fullscreen
    return true
  }

  try {
    await api.exitFullscreen()
    return true
  } catch (error) {
    console.error('Failed to exit fullscreen:', error)
    return false
  }
}

/**
 * Toggle fullscreen mode
 */
export async function toggleFullscreen(): Promise<boolean> {
  if (isFullscreen()) {
    return await exitFullscreen()
  } else {
    return await requestFullscreen()
  }
}

/**
 * Add fullscreen change event listener with cross-browser support
 */
export function addFullscreenChangeListener(callback: () => void): () => void {
  if (typeof document === 'undefined') return () => {}

  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange'
  ]

  events.forEach(event => {
    document.addEventListener(event, callback)
  })

  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, callback)
    })
  }
}
