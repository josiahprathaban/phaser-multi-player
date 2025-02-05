import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        open: true,
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
                changeOrigin: true,
            },
        },
        host: '0.0.0.0', // Ensure Vite listens on all network interfaces
        port: process.env.PORT || 8080, // Use DigitalOcean's PORT
    },
    preview: {
        allowedHosts: ['lobster-app-e6kaq.ondigitalocean.app'], // Add your DigitalOcean domain here
    },
    build: {
        outDir: 'dist',
    },
});
