import { defineConfig } from 'vite';

export default defineConfig({
    root: '.', // Ensure Vite starts from project root
    server: {
        host: '0.0.0.0', // Required for DigitalOcean
        port: process.env.PORT || 8080, // Use DigitalOcean's assigned port
    },
    preview: {
        allowedHosts: ['lobster-app-e6kaq.ondigitalocean.app'], // Allow DigitalOcean domain
    },
    build: {
        outDir: 'dist', // Ensure built files go into "dist"
    },
});
