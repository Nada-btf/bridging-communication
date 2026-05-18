import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { translationAPI, historyAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const SpeechToSign = ({ isLocked }) => {
  const { showToast } = useAuth();

  const [isMicActive, setIsMicActive] = useState(false);
  const [result, setResult] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => { stopMicrophone(); };
  }, []);

  const handleTranslationResult = (text, signVideoUrl) => {
    setResult(text);
    setVideoUrl(signVideoUrl || null);

    try {
      historyAPI.add({
        direction: 'speech-to-sign',
        phrase: text,
        type: 'live',
      });
    } catch (e) {
      console.error('History save error', e);
    }
  };

  const convertToWav = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const numOfChannels = 1;
    const sampleRate = 16000;
    const format = 1; // PCM
    const bitDepth = 16;

    const channelData = audioBuffer.getChannelData(0);
    const dataLength = channelData.length * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * (bitDepth / 8), true);
    view.setUint16(32, numOfChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      let sample = Math.max(-1, Math.min(1, channelData[i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const startMicrophone = async () => {
    if (isLocked) {
      showToast('Please log in to use speech recognition', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);
        try {
          const wavBlob = await convertToWav(rawBlob);
          const response = await translationAPI.speechToSignLive(wavBlob, 'en');
          const { text, videoUrl: signUrl } = response.data;
          handleTranslationResult(text, signUrl);
          showToast(`Recognized: "${text}"`);
        } catch (error) {
          showToast('Failed to process speech', 'error');
        } finally {
          setIsProcessing(false);
        }
        stream.getTracks().forEach(track => track.stop());
        setIsMicActive(false);
      };

      mediaRecorderRef.current.start();
      setIsMicActive(true);
      showToast('Microphone active. Start speaking...');
    } catch (error) {
      showToast('Unable to access microphone. Please check permissions.', 'error');
    }
  };

  const stopMicrophone = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsMicActive(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isLocked) {
      showToast('Please log in to upload audio', 'error');
      return;
    }
    const validExtensions = ['.m4a', '.mp3', '.wav', '.ogg', '.webm', '.aac', '.mp4'];
    const isValidType = file.type.startsWith('audio/') || file.type.startsWith('video/mp4') || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValidType) {
      showToast('Please upload a valid audio file', 'error');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const wavBlob = await convertToWav(file);
      const wavFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, "") + ".wav", { type: 'audio/wav' });

      const response = await translationAPI.speechToSignUpload(wavFile, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });
      const { text, videoUrl: signUrl } = response.data;
      handleTranslationResult(text, signUrl);
      showToast('Audio processed successfully!');
    } catch (error) {
      showToast('Failed to process audio', 'error');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="speech-to-sign">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🖐️</span>
          <h2>Speech to Sign</h2>
        </div>
      </div>

      <div className="panel-content">
        <div className="mic-container">
          <div className={`mic-icon ${isMicActive ? 'recording' : ''}`}>🎤</div>
          {!isMicActive && (
            <p className="mic-hint">
              {isLocked ? 'Sign up to use speech recognition' : 'Click "Start Speaking" to begin voice input'}
            </p>
          )}
          {isMicActive && (
            <p className="mic-recording-hint">Recording… Click "Stop Recording" when done</p>
          )}
        </div>

        {isProcessing && uploadProgress > 0 && (
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span className="progress-text">{uploadProgress}% uploaded</span>
          </div>
        )}

        <div className="action-buttons">
          {!isMicActive ? (
            <button className="btn-primary action-btn" onClick={startMicrophone} disabled={isLocked}>
              🎙️ Start Speaking
            </button>
          ) : (
            <button className="btn-outline action-btn" onClick={stopMicrophone}>
              ⏹️ Stop Recording
            </button>
          )}

          <label className="btn-outline action-btn file-upload-label">
            🎵 Upload Audio
            <input
              type="file"
              accept="audio/*,.m4a,.mp4"
              onChange={handleAudioUpload}
              disabled={isLocked || isProcessing}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {(result || isProcessing) && (
          <div className="result-container">
            <div className="result-label">Translation Result:</div>
            {isProcessing ? (
              <div className="result-loading">
                <LoadingSpinner size="small" text="Converting speech to sign…" />
              </div>
            ) : (
              <div className="result-text">
                <span className="result-phrase">{result}</span>

                {/* Sign language video player — shown when the backend returns a matching clip */}
                {videoUrl ? (
                  <div className="sign-video-container">
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      controls
                      autoPlay
                      loop
                      className="sign-video"
                      style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', marginTop: '12px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <p className="sign-video-label">🖐️ Sign language video for "{result}"</p>
                  </div>
                ) : (
                  <div className="sign-animation-hint">
                    🖐️ No sign video found for this phrase in the database
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechToSign;