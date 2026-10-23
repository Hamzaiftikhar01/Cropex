import { useCallback, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { AlertTriangle, Zap } from 'lucide-react';
import { validateImageFile, compressImage, ACCEPTED_IMAGE_TYPES } from '../services/aiService';
import { isLowBandwidthMode, compressImageForLowBandwidth } from '../lib/offlineQueue';

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
  const [localError, setLocalError] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef(null);

  const lowBandwidthActive = isLowBandwidthMode();

  const handleFile = useCallback(async (selectedFile) => {
    setLocalError(null);

    // Validate type & raw size
    try {
      validateImageFile(selectedFile);
    } catch (err) {
      setLocalError(err.message);
      return;
    }

    // Compress client-side (resize to max 1024px, JPEG 0.82)
    setIsCompressing(true);
    try {
      let compressedDataUrl = await compressImage(selectedFile);
      if (isLowBandwidthMode()) {
        // Phase 6: Extra compression for rural 2G/EDGE networks (< 200KB)
        compressedDataUrl = await compressImageForLowBandwidth(compressedDataUrl, 720, 0.55);
      }
      onFileChange(selectedFile, compressedDataUrl);
    } catch {
      setLocalError('Failed to process image. Please try a different file.');
    } finally {
      setIsCompressing(false);
    }
  }, [onFileChange]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };
  const handleInputChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };
  const handleClearClick = () => {
    setLocalError(null);
    onClear();
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = error || localError;
  const busy = isAnalyzing || isCompressing;

  return (
    <div className="rounded-2xl border border-earth-100 dark:border-earth-800 bg-white dark:bg-earth-900 p-5 sm:p-6 shadow-soft transition-colors duration-200">
      {lowBandwidthActive && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <Zap size={13} className="shrink-0" />
          <span>2G Low-Bandwidth Mode Active — High Compression (&lt;200KB)</span>
        </div>
      )}

      {displayError && (
        <div className="mb-5 rounded-xl bg-red-50 p-3.5 text-xs text-red-800 ring-1 ring-red-100 flex items-start gap-3 text-left dark:bg-red-950/20 dark:text-red-300 dark:ring-red-900/30">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-bold text-red-900 dark:text-red-400">
              {error ? 'Analysis Failed' : 'Invalid File'}
            </p>
            <p className="mt-0.5 text-red-700 dark:text-red-300">{displayError}</p>
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
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload crop image"
        />

        {isCompressing ? (
          <div className="flex flex-col items-center px-6 py-10 gap-3">
            <LoadingSpinner size="sm" />
            <p className="text-xs text-earth-500 dark:text-earth-300">Optimising image…</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center p-5">
            <img
              src={preview}
              alt="Crop preview"
              className="max-h-60 w-full rounded-xl object-contain"
            />
            <p className="mt-3 text-xs font-semibold text-earth-700 dark:text-earth-300">{file?.name}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClearClick(); }}
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
            <p className="mt-2 text-[10px] text-earth-400 dark:text-earth-350 font-medium">JPG, PNG, WebP · Auto-compressed · Max 20MB</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!file || busy}
          className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-crop-600 px-7 text-xs sm:text-sm font-bold text-white shadow-sm shadow-crop-600/30 transition-all hover:bg-crop-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
              Analyzing Leaf…
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

      {/* Safety disclaimer */}
      <p className="mt-4 text-center text-[10px] text-earth-400 dark:text-earth-500 leading-relaxed">
        ⚠️ AI diagnosis is indicative only. Always verify with a certified agronomist before applying any treatment.
      </p>
    </div>
  );
}

export default UploadCard;
