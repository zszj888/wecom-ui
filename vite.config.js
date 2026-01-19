import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // const BASE_URL  = 'https://proda-kip-service-internal.kerryplus.com'
    const BASE_URL  = 'https://qa-kip-service-internal.kerryplus.com'
    console.log(`Starting Vite dev server in ${BASE_URL} mode with network access enabled`)
    
    return {
        plugins: [react()],
        build: {
            outDir: './dist',
            emptyOutDir: true
        },
        define: {
            'import.meta.env.VITE_ENV': JSON.stringify(mode),
            'import.meta.env.VITE_API_BASE': JSON.stringify(BASE_URL)
        },
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: false, // 允许端口自动切换
            proxy: {
                '/db-manager/api': {
                    target: `${BASE_URL}/wshot-ka-jiali-service`,
                    changeOrigin: true,
                    secure: false,
                    configure: (proxy, _options) => {
                        proxy.on('proxyReq', (_proxyReq, req) => {
                            console.log(`Proxying to: ${req.url}`);
                        });

                        proxy.on('proxyRes', (_proxyRes, req) => {
                            console.log('Response:', {
                                statusCode: _proxyRes.statusCode,
                                headers: _proxyRes.headers,
                                url: req.url
                            });
                        });

                        proxy.on('error', (err) => {
                            console.error('Proxy Error:', err);
                        });
                    }
                },
                '/admin/aad_users': {
                    target: `${BASE_URL}/aad-database-syncer`,
                    changeOrigin: true,
                    secure: false
                },
                '/admin/user-sync': {
                    target: `${BASE_URL}/wshoto-user-sync-service`,
                    changeOrigin: true,
                    secure: false
                },
                '/syncDept': {
                    target: `${BASE_URL}/wshot-ka-jiali-service`,
                    changeOrigin: true,
                    secure: false
                },
                '/initUser': {
                    target: `${BASE_URL}/wshot-ka-jiali-service`,
                    changeOrigin: true,
                    secure: false
                }
            },
            hmr: {
                overlay: false,
                protocol: 'ws',
                timeout: 30000
            },
            cors: {
                origin: '*'
            },
            middlewares: [
                (req, _res, next) => {
                    const clientIP = req.socket.remoteAddress
                    console.log(`[${new Date().toISOString()}] Access from ${clientIP}: ${req.method} ${req.url}`)
                    next()
                }
            ]
        }
    }
})