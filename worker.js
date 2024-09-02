import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';
import mongodb from 'mongodb';
import fs from 'fs';
import dbClient from './utils/db.js';

const fileQueue = new Bull('fileQueue', { redis: { port: 6379, host: 'localhost' } });

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;
  if (!userId) {
    throw new Error('Missing userId');
  }
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  const file = await dbClient.filesCollection().findOne({ _id: mongodb.ObjectId(fileId), userId: mongodb.ObjectId(userId) });
  if (!file) {
    throw new Error('File not found');
  }
  const size = [500, 250, 100];
  for (const s of size) {
    const thumbnail = await imageThumbnail(file.localPath, { width: s, height: s });
    const thumbnailPath = `${file.localPath}_${s}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  }
});
console.log('worker is runnung');
