import { defineConfig } from "vite";

export default defineConfig({
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
                configure: (proxy) => {
                    proxy.on('error', (err, req, res) => {
                        console.warn(`Proxy error: ${req.url} -> ${err.message}`);
                        if (res.writeHead && !res.headersSent) {
                            res.writeHead(502, { 'Content-Type': 'text/plain' });
                        }
                        res.end('Backend temporarily unavailable.');
                    });
                },
            }
        }
    }
});
