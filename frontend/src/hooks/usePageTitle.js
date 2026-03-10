import { useEffect } from 'react'

/**
 * Sets document.title on mount and restores on unmount.
 * @param {string} title - Page title (will be suffixed with " | Meme Terminal")
 */
export default function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} | Meme Terminal` : 'Meme Terminal'
    return () => { document.title = prev }
  }, [title])
}
