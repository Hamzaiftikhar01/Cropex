import cropImages from '../assets/cropImages';

const stats = [
  { value: '50+', label: 'Crop types supported' },
  { value: '95%', label: 'Detection accuracy' },
  { value: '24/7', label: 'Instant analysis' },
];

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-crop-50/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-earth-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="max-w-xl lg:max-w-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-earth-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-earth-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-crop-500" />
              Agricultural Intelligence
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight text-earth-900 sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              Smarter crop care,{' '}
              <span className="text-crop-600">healthier harvests</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-earth-500 sm:text-xl">
              Upload a photo and receive instant disease detection, treatment
              guidance, and prevention insights — built for modern farming.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#upload"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-crop-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-lg hover:shadow-crop-600/25"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Crop Image
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-earth-200 bg-white px-7 py-3.5 text-sm font-semibold text-earth-700 shadow-sm transition-all hover:border-earth-300 hover:bg-earth-50 hover:shadow-md"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-4 border-t border-earth-100 pt-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold tracking-tight text-earth-900 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-earth-500 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="grid min-h-[320px] grid-cols-12 grid-rows-6 gap-3 sm:min-h-[380px] sm:gap-4 lg:min-h-[420px]">
              <div className="relative col-span-7 row-span-4 overflow-hidden rounded-2xl shadow-lg shadow-earth-900/8 ring-1 ring-earth-100">
                <img
                  src={cropImages.wheat.src}
                  alt={cropImages.wheat.alt}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-earth-700 backdrop-blur-sm">
                  {cropImages.wheat.label}
                </span>
              </div>

              <div className="relative col-span-5 row-span-3 overflow-hidden rounded-2xl shadow-md shadow-earth-900/6 ring-1 ring-earth-100">
                <img
                  src={cropImages.tomato.src}
                  alt={cropImages.tomato.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-earth-700 backdrop-blur-sm sm:text-xs">
                  {cropImages.tomato.label}
                </span>
              </div>

              <div className="relative col-span-5 row-span-3 overflow-hidden rounded-2xl shadow-md shadow-earth-900/6 ring-1 ring-earth-100">
                <img
                  src={cropImages.corn.src}
                  alt={cropImages.corn.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-earth-700 backdrop-blur-sm sm:text-xs">
                  {cropImages.corn.label}
                </span>
              </div>

              <div className="relative col-span-12 row-span-2 overflow-hidden rounded-2xl shadow-md shadow-earth-900/6 ring-1 ring-earth-100">
                <img
                  src={cropImages.leaves.src}
                  alt={cropImages.leaves.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-earth-700 backdrop-blur-sm">
                  {cropImages.leaves.label}
                </span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-earth-100 bg-white p-4 shadow-xl shadow-earth-900/8 sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-crop-50 text-crop-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-earth-900">AI Verified</p>
                  <p className="text-xs text-earth-500">Disease detection ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
