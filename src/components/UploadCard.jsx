import { useCallback, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function UploadCard({
  file,
  preview,
  isAnalyzing,
  error,
  onFileChange,
  onClear,
  onAnalyze,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile || !ACCEPTED_TYPES.includes(selectedFile.type)) return;

    const reader = new FileReader();
    reader.onload = (e) => onFileChange(selectedFile, e.target.result);
    reader.readAsDataURL(selectedFile);
  }, [onFileChange]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClearClick = () => {
    onClear();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="rounded-2xl border border-earth-100 dark:border-earth-800 bg-white dark:bg-earth-900 p-5 sm:p-6 shadow-soft transition-colors duration-200">
      {error && (
        <div className="mb-5 rounded-xl bg-red-50 p-3.5 text-xs text-red-800 ring-1 ring-red-100 flex items-start gap-3 text-left dark:bg-red-950/20 dark:text-red-300 dark:ring-red-900/30">
          <span className="text-sm">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-red-900 dark:text-red-400">Analysis Failed</p>
            <p className="mt-0.5 text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-crop-500 ${
          isDragging
            ? 'border-crop-500 bg-crop-50/50 dark:border-crop-400 dark:bg-crop-950/20'
            : preview
              ? 'border-earth-200 bg-earth-50/50 dark:border-earth-800 dark:bg-earth-950/30'
              : 'border-earth-200 bg-earth-50/30 hover:border-earth-300 hover:bg-white dark:border-earth-800 dark:bg-earth-950/20 dark:hover:bg-earth-950/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload crop image"
        />

        {preview ? (
          <div className="flex flex-col items-center p-5">
            <img
              src={preview}
              alt="Crop preview"
              className="max-h-60 w-full rounded-xl object-contain"
            />
            <p className="mt-3 text-xs font-semibold text-earth-700 dark:text-earth-300">{file?.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearClick();
              }}
              className="mt-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-semibold cursor-pointer"
            >
              Remove image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-10 sm:py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-earth-400 shadow-soft ring-1 ring-earth-100 dark:bg-earth-800 dark:text-earth-300 dark:ring-earth-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-bold text-earth-800 dark:text-earth-200">
              {isDragging ? 'Drop your image here' : 'Drag & drop your crop leaf image'}
            </p>
            <p className="mt-1 text-xs text-earth-500 dark:text-earth-300">or click to browse files from device</p>
            <p className="mt-2 text-[10px] text-earth-400 dark:text-earth-350 font-medium">Supports JPG, PNG, WEBP up to 10MB</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!file || isAnalyzing}
          className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-crop-600 px-7 text-xs sm:text-sm font-bold text-white shadow-sm shadow-crop-600/30 transition-all hover:bg-crop-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
              Analyzing Leaf...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Run AI Diagnosis
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default UploadCard;
