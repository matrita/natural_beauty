import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Non abbiamo più bisogno di basicSsl se il backend è HTTP
// import basicSsl from '@vitejs/plugin-basic-ssl' 

export default defineConfig({
  plugins: [
    react(),
    // basicSsl() // Rimuovi o commenta questa riga
  ],
  server: {
    port: 5173,
    // https: true, // Disabilita HTTPS sul frontend
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Punta alla porta HTTP del backend
        changeOrigin: true,
        // secure: false, // Non più necessario se il target è HTTP
      },
    },
  },
})
