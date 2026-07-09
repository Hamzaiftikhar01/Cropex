import { useCallback, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function UploadCard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile || !ACCEPTED_TYPES.includes(selectedFile.type)) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

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
    handleFile(e.target.files[0]);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <section id="upload" className="border-t border-earth-100 bg-earth-50/50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-crop-600">
            Get Started
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
            Upload Your Crop Image
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-earth-500">
            Drag and drop or browse to upload a clear photo of the affected crop leaf or plant.
          </p>
        </div>

        <div className="rounded-2xl border border-earth-100 bg-white p-6 shadow-elevated sm:p-8">
          <div
            role="button"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? 'border-crop-500 bg-crop-50/50'
                : preview
                  ? 'border-earth-200 bg-earth-50/50'
                  : 'border-earth-200 bg-earth-50/30 hover:border-earth-300 hover:bg-white'
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
              <div className="flex flex-col items-center p-6">
                <img
                  src={preview}
                  alt="Crop preview"
                  className="max-h-64 w-full rounded-lg object-contain"
                />
                <p className="mt-3 text-sm font-medium text-earth-700">{file?.name}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="mt-2 text-sm text-earth-500 underline transition-colors hover:text-crop-600"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-14">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-earth-400 shadow-soft ring-1 ring-earth-100">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-earth-800">
                  {isDragging ? 'Drop your image here' : 'Drag & drop your crop image'}
                </p>
                <p className="mt-1 text-sm text-earth-500">or click to browse files</p>
                <p className="mt-3 text-xs text-earth-400">Supports JPG, PNG, WEBP up to 10MB</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-crop-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Analyze Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UploadCard;
