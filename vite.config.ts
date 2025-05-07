import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Tracker/', // <-- Add this line, use your repo name
  plugins: [react()],
});