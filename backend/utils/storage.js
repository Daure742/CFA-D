// utils/storage.js
// Helpers for uploading to Cloudinary and S3
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

async function uploadToCloudinary(filePath, options = {}) {
  if (!filePath) throw new Error('filePath required');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

// S3 helper (requires @aws-sdk/client-s3 installed and proper env vars)
async function uploadToS3(filePath, bucket, key, s3Client) {
  if (!filePath || !bucket || !key) throw new Error('filePath, bucket and key are required');
  // Lazy import to avoid requiring AWS SDK if not installed
  const { PutObjectCommand } = require('@aws-sdk/client-s3');
  const body = fs.createReadStream(filePath);
  const params = { Bucket: bucket, Key: key, Body: body };
  const client = s3Client || new (require('@aws-sdk/client-s3').S3)();
  const cmd = new PutObjectCommand(params);
  return client.send(cmd);
}

module.exports = { uploadToCloudinary, uploadToS3 };
