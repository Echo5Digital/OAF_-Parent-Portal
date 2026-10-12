import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // amazon-cognito-identity-js references the Node `global` object, which doesn't
  // exist in the browser — alias it to `window` so the library's UMD wrapper loads.
  define: {
    global: 'window',
  },
})
