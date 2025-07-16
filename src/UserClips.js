// src/UserClips.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './UserClips.css'; // Optional: For styling

const UserClips = ({ userId, refresh }) => {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Store error message

  // Function to sanitize user_id on the frontend (optional)
  const sanitizeUserId = (user_id) => {
    return user_id.replace(/[^0-9a-zA-Z._-]/g, '_');
  };

  const handleGenerateCaptions = async () => {
    try {
      // Retrieve the JWT access token from localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Access token not found. Please log in again.');
      }

      // API endpoint
      const apiEndpoint = ' https://y44n9atwnk.execute-api.us-east-1.amazonaws.com/prod/generateCap';

      // Make the POST request
      const response = await axios.post(
        apiEndpoint,
        { user_id: userId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Captions generated:', response.data);

      // Optionally refresh the clips
      fetchClips();
    } catch (err) {
      console.error('Error generating captions:', err);
      // Handle error (show message to user)
    }
  };

  // Function to fetch user clips
  const fetchClips = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        throw new Error('User ID is not available.');
      }

      // Retrieve the JWT access token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('Access token not found. Please log in again.');
      }

      // Sanitize the user_id
      const sanitizedUserId = sanitizeUserId(userId);
      console.log('Sanitized User ID:', sanitizedUserId);

      // Construct the API endpoint with the user_id as a query parameter
      // const apiEndpoint = `https://glpkcoxx5d.execute-api.us-east-1.amazonaws.com/prod/clips?user_id=${sanitizedUserId}`;

      const apiEndpoint = `https://59mc28pe61.execute-api.us-east-1.amazonaws.com/prod/clips?user_id=${sanitizedUserId}`;

      const response = await axios.get(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response Data:', response.data); // Inspect the structure

      // Adjust based on the actual response structure
      if (Array.isArray(response.data)) {
        setClips(response.data);
      } else if (response.data.clips && Array.isArray(response.data.clips)) {
        setClips(response.data.clips);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Unexpected API response format.');
      }
    } catch (err) {
      console.error('Error fetching clips:', err);
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data.message || 'Unauthorized access.'}`);
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refresh]); // Re-fetch when userId or refresh changes

  if (loading) {
    return <div>Loading your clips...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!Array.isArray(clips)) {
    console.error('Clips is not an array:', clips);
    return <div className="error-message">Error: Invalid data format received.</div>;
  }

  if (clips.length === 0) {
    return <div className="no-clips">You have no clips yet. Start by uploading a new video!</div>;
  }

  return (
    <div className="user-clips">
      <div className="header-container">
        <h2>Your Clips</h2>
        <button className="generate-captions-btn" onClick={handleGenerateCaptions}>Generate Captions</button>
      </div>
      <div className="clips-grid">
        {clips.map((clip) => (
          <div key={clip.clip_id} className="clip-card">
            <h3>{clip.category}</h3>
            {clip.presigned_url ? (
              <video controls width="400">
                <source src={clip.presigned_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>Unable to load video.</p>
            )}
            {clip.clip_caption ? (
              <p><strong>Caption:</strong> {clip.clip_caption}</p>
            ) : (
              <p><strong>Caption:</strong> Click generate captions</p>
            )}
            <p><strong>Transcript: </strong>{clip.clip_text}</p>
            <p>
              Start Time: {clip.start_time} seconds | End Time: {clip.end_time} seconds
            </p>
            {clip.timestamp && (
              <p>Created At: {new Date(clip.timestamp).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// PropTypes for type checking
UserClips.propTypes = {
  userId: PropTypes.string.isRequired,
  refresh: PropTypes.number.isRequired, // Ensures that refresh is a number
};

// Utility function to decode JWT (if needed elsewhere)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(
      atob(base64Url)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(base64);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return {};
  }
}

export default UserClips;
