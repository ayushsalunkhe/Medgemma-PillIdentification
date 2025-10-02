import React, { useCallback, useState, useRef, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { useTranslations, LANGUAGES } from '../hooks/useTranslations';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onClearImage: () => void;
  imagePreview: string | null;
  language: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onClearImage, imagePreview, language }) => {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { t } = useTranslations(language as keyof typeof LANGUAGES);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setCameraError("Camera access was denied. Please enable camera permissions in your browser settings.");
      }
    };

    if (mode === 'camera' && !imagePreview) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, imagePreview, stopCamera]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            onImageSelect(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  if (imagePreview) {
    return (
      <div className="relative group">
        <img src={imagePreview} alt="Medicine preview" className="object-contain h-64 w-full rounded-lg" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center rounded-lg">
          <button
            onClick={onClearImage}
            className="px-4 py-2 bg-white text-gray-800 font-semibold rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
          >
            Change Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center border-b border-gray-200 mb-4">
        <TabButton title="Upload File" icon={<UploadIcon className="w-5 h-5 mr-2" />} isActive={mode === 'upload'} onClick={() => setMode('upload')} />
        <TabButton title="Use Camera" icon={<CameraIcon className="w-5 h-5 mr-2" />} isActive={mode === 'camera'} onClick={() => setMode('camera')} />
      </div>

      {mode === 'upload' && (
        <label
          htmlFor="file-upload"
          onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
                      ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">{t('clickToUpload')}</span> {t('dragAndDrop')}
            </p>
            <p className="text-xs text-gray-500">{t('fileTypes')}</p>
          </div>
          <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </label>
      )}

      {mode === 'camera' && (
        <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="text-center text-white p-4">
              <CameraIcon className="w-10 h-10 mx-auto mb-2 text-gray-500"/>
              <p className="font-semibold">Camera Error</p>
              <p className="text-sm text-gray-400">{cameraError}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover"></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
              <div className="absolute bottom-4">
                <button
                  onClick={handleCapture}
                  className="w-16 h-16 rounded-full bg-white/30 border-4 border-white backdrop-blur-sm hover:bg-white/50 transition"
                  aria-label="Capture photo"
                ></button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ title: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ title, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
  >
    {icon}
    {title}
  </button>
);
