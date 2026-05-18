import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { translationAPI, historyAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const SignToSpeech = ({ isLocked }) => {
  const { showToast } = useAuth();

  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [result, setResult] = useState('');
  // isUploading is ONLY used for file uploads — never set during webcam mode
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);

  const webcamVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const lastSavedPhraseRef = useRef('');

  useEffect(() => {
    return () => { stopWebcam(); };
  }, []);

  const startWebcam = async () => {
    if (isLocked) {
      showToast('Please log in to use sign language recognition', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      webcamVideoRef.current.srcObject = stream;
      mediaStreamRef.current = stream;
      setIsWebcamActive(true);
      setResult('');
      setUploadedVideoUrl(null);
      showToast('Webcam started. Sign language recognition active.');
      startFrameCapture();
    } catch (error) {
      showToast('Unable to access webcam. Please check permissions.', 'error');
    }
  };

  const stopWebcam = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    setResult('');
    setUploadedVideoUrl(null);
    lastSavedPhraseRef.current = '';
  };

  const startFrameCapture = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!webcamVideoRef.current || !webcamVideoRef.current.videoWidth) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = webcamVideoRef.current.videoWidth;
      canvas.height = webcamVideoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(webcamVideoRef.current, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);

      try {
        const response = await translationAPI.signToSpeechLive(frameData, 'ASL');
        if (response.data && response.data.text) {
          const phrase = response.data.text.replace(/"/g, '');
          setResult(phrase);
          if (phrase && phrase !== lastSavedPhraseRef.current) {
            lastSavedPhraseRef.current = phrase;
            try {
              historyAPI.add({ direction: 'sign-to-speech', phrase, type: 'live' });
            } catch (e) { /* silent */ }
          }
        }
      } catch (error) { /* silent on per-frame errors */ }
    }, 800);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedVideoUrl(URL.createObjectURL(file));
    setIsWebcamActive(false);
    setResult('');

    if (isLocked) {
      showToast('Please log in to upload videos', 'error');
      return;
    }
    if (!file.type.startsWith('video/')) {
      showToast('Please upload a valid video file', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await translationAPI.signToSpeechUpload(file, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      const phrase = (response.data.text || '').replace(/"/g, '');
      setResult(phrase);
      showToast('Video processed successfully!');

      if (phrase) {
        const utterance = new SpeechSynthesisUtterance(phrase);
        window.speechSynthesis.speak(utterance);
      }
      try {
        historyAPI.add({ direction: 'sign-to-speech', phrase, type: 'file' });
      } catch (e) { /* silent */ }
    } catch (error) {
      showToast('Error processing video. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const speakResult = () => {
    if (result) {
      const utterance = new SpeechSynthesisUtterance(result.replace(/"/g, ''));
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="sign-to-speech">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🗣️</span>
          <h2>Sign to Speech</h2>
        </div>
      </div>

      <div className="panel-content">
        <div className="webcam-container">
          <video
            ref={webcamVideoRef}
            autoPlay
            muted
            playsInline
            className={`webcam-preview ${!isWebcamActive ? 'inactive' : ''}`}
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {uploadedVideoUrl && !isWebcamActive && (
            <video
              src={uploadedVideoUrl}
              controls
              className="webcam-preview"
              autoPlay
            />
          )}

          {!isWebcamActive && !uploadedVideoUrl && (
            <div className="webcam-placeholder">
              <div className="placeholder-icon">🎥</div>
              <p>Camera preview will appear here</p>
              <small>Click "Start Webcam" or "Upload Video" to begin</small>
            </div>
          )}
        </div>

        {/* Progress bar — file uploads only */}
        {isUploading && (
          <div className="modern-progress-container">
            <div className="progress-info">
              <span className="status-badge">
                {uploadProgress < 100 ? 'Uploading' : 'Processing'}
              </span>
              <span className="percent-text">{uploadProgress}%</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-glow-fill ${uploadProgress === 100 ? 'pulsing' : ''}`}
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          {!isWebcamActive ? (
            <button
              className="btn-primary action-btn"
              onClick={startWebcam}
              disabled={isLocked}
            >
              🎥 Start Webcam
            </button>
          ) : (
            <button className="btn-outline action-btn" onClick={stopWebcam}>
              ⏹️ Stop Webcam
            </button>
          )}

          <label className="btn-outline action-btn file-upload-label">
            📁 Upload Video
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={isLocked || isUploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Result box — updates instantly during live webcam mode */}
        {result && (
          <div className="result-container">
            <div className="result-label">Translation Result:</div>
            <div className="result-text">
              <span className="result-phrase">{result}</span>
              <button className="speak-btn" onClick={speakResult}>
                🔊 Speak
              </button>
            </div>
          </div>
        )}

        {/* Spinner only shown when file is fully uploaded and backend is still processing */}
        {isUploading && uploadProgress === 100 && !result && (
          <div className="result-container">
            <div className="result-loading">
              <LoadingSpinner size="small" text="Processing sign language..." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignToSpeech;