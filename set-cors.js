import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: './serviceAccount.json'
});

async function setCors() {
  await storage.bucket('quicksync-proj.firebasestorage.app').setCorsConfiguration([
    {
      origin: ['http://localhost:5173', 'https://quicksync-proj.web.app'],
      method: ['GET', 'POST', 'PUT', 'DELETE'],
      maxAgeSeconds: 3600,
    },
  ]);
  console.log('CORS set!');
}
setCors();