import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

// https://vitejs.dev/config/
export default defineConfig({
    ...viteConfig,
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
    },
});