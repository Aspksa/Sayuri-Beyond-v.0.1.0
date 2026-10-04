import path from 'node:path'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const enableMock = env.VITE_ENABLE_MOCK === 'true'
  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        generatedRouteTree: './src/routeTree.gen.ts',
        routesDirectory: './src/routes',
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: mode === 'production',
      rollupOptions: {
        ...(enableMock ? {} : { external: (id: string) => id.includes('/mocks') }),
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['@tanstack/react-router'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-ui': ['@base-ui/react'],
          },
        },
      },
    },
  }
})
