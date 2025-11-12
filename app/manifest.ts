import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dizzy Dashboard',
    short_name: 'Dizzy Dashboard',
    description: 'Clinical decision support for dizziness and vertigo evaluation',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1A202C',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
