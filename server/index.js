#!/usr/bin/env node
import handler from 'serve-handler';
import { createServer } from 'http';
import { networkInterfaces } from 'os';

// O objeto de rotas do seu framework
const routes = {
  '/api/status': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // Use JSON (maiúsculo) que é o nativo do JS
    res.end(JSON.stringify({
      status: 'online',
      uptime: process.uptime()
    }));
  },
};
const getLocalIP = () => {
  const nets = networkInterfaces();
  for (const interfaces of Object.values(nets)) {
      for (const net of interfaces) {
          if (net.family === 'IPv4' && !net.internal) {
              return net.address;
          }
      }
  }
  return 'localhost';
};

const server = createServer((request, response) => {
  const url = request.url;

  // Verifica se a rota existe
  if (routes[url]) {
    return routes[url](request, response); // Corrigido para (request, response)
  }

  // Se não for rota, serve os arquivos da pasta 'public' do usuário
  return handler(request, response, {
    public: 'public'
  });
});


const PORT = 3000;
const nameFramework = 'mini framework';

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`\x1b[34m%s\x1b[0m`, `🚀 ${nameFramework} v1.0.0`);
  console.log(`✔️ Servidor ativo em http://localhost:${PORT}`);
  console.log(`✔️  Network: http://${ip}:${PORT}`);
});