import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables
dotenv.config({ path: join(__dirname, '../.env.test') });

let serverProcess;

export async function startServer() {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', ['src/server.js'], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'inherit'
    });

    // Wait for server to start
    setTimeout(resolve, 2000);
  });
}

export async function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
}

// Handle cleanup on process exit
process.on('exit', stopServer);
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer); 