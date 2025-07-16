// src/VideoUpload.js
import React, { useState } from 'react';
import AWS from 'aws-sdk';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Refresh AWS credentials
      await new Promise((resolve, reject) => {
        AWS.config.credentials.refresh((error) => {
          if (error) {
            console.error('Error refreshing AWS credentials:', error);
            reject(error);
          } else {
            console.log('AWS credentials refreshed');
            resolve();
          }
        });
      });

      // Check if credentials are available
      if (!AWS.config.credentials || !AWS.config.credentials.identityId) {
        setMessage('User not authenticated');
        setUploading(false);
        return;
      }

      const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: { Bucket: 'viral-hive-video-uploads' },
      });

      const fileName = `${AWS.config.credentials.identityId}/${file.name}`;

      const params = {
        Key: fileName,
        Body: file,
        ContentType: file.type,
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error('Error uploading file:', err);
          setMessage('Error uploading file.');
        } else {
          console.log('Upload success:', data);
          setMessage('File uploaded successfully!');
        }
        setUploading(false);
      });
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error uploading file.');
      setUploading(false);
    }
  };

  return (
    <div>
      <br></br>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default VideoUpload;
