import cropImages from '../assets/cropImages';
import { useLanguage } from '../context/LanguageContext';

const stats = [
  { value: '7+', label: 'Strategic crop models' },
  { value: '18+', label: 'Combinatorial matrix tests' },
  { value: '3', label: 'Local languages supported' },
];

function Hero() {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative overflow-hidden bg-white dark:bg-earth-950 transition-colors duration-200">
      {/* Decorative dot matrix grid background ornament */}
      <div className="absolute left-0 top-0 -z-10 h-[500px] w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_0%_0%,#000_70%,transparent_100%)] opacity-70 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]" />

      <div className="pointer-events-none absolute inset-0">
        {/* Top-left decorative light-green glow */}
        <div className="absolute -left-32 -top-32 h-[350px] w-[350px] rounded-full bg-crop-100/60 blur-3xl dark:bg-crop-900/10" />
        {/* Top-right decorative light-green glow */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-crop-50/60 blur-3xl dark:bg-crop-950/20" />
        {/* Bottom-left decorative earth glow */}
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-earth-50 blur-3xl dark:bg-earth-900/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 sm:pt-6 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-24">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 lg:pt-6">
          <div className="max-w-xl lg:max-w-none text-left">
            {/* Subtle leaf icon ornament */}
            <div className="mb-6 flex items-center gap-1.5 text-crop-600 dark:text-crop-400">
              <span className="text-xl">🍃</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-crop-600/90 dark:text-crop-400/90">
                Your AI Companion for Smarter Farming
              </span>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-earth-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-earth-600 shadow-sm dark:border-earth-800 dark:bg-earth-850 dark:text-earth-300">
              <span className="h-1.5 w-1.5 rounded-full bg-crop-500" />
              Agricultural Operating System
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight text-earth-900 sm:text-5xl lg:text-[3.25rem] xl:text-6xl dark:text-earth-50">
              Predict Early. <br className="hidden sm:inline" />
              <span className="text-crop-600 dark:text-crop-400">Protect Crops. Empower Farmers.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-earth-500 dark:text-earth-400 font-medium">
              Cropex is an AI-powered smart farming platform built to help farmers predict crop diseases before major symptoms appear, prevent crop losses, optimize irrigation, understand weather impacts, and receive voice-assisted agricultural guidance in English, Urdu, and Punjabi.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#upload"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-crop-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-crop-500 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('scanLeaf')}
              </a>
              <a
                href="#upload"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center rounded-xl border border-earth-200 bg-white px-7 py-3.5 text-sm font-semibold text-earth-700 shadow-sm transition-all hover:border-earth-300 hover:bg-earth-50 hover:shadow-md dark:border-earth-800 dark:bg-earth-850 dark:text-earth-200 dark:hover:bg-earth-800 cursor-pointer"
              >
                Explore Modules
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-4 border-t border-earth-100 pt-10 dark:border-earth-850">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold tracking-tight text-earth-900 sm:text-3xl dark:text-earth-100">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-earth-500 sm:text-sm dark:text-earth-450 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="grid min-h-[320px] grid-cols-12 grid-rows-6 gap-3 sm:min-h-[380px] sm:gap-4 lg:min-h-[420px]">
              <div className="relative col-span-7 row-span-4 overflow-hidden rounded-2xl shadow-lg shadow-earth-900/8 ring-1 ring-earth-100 dark:ring-earth-850">
                <img
                  src={cropImages.wheat.src}
                  alt={cropImages.wheat.alt}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-earth-700 backdrop-blur-sm dark:bg-earth-900/90 dark:text-earth-200">
                  {cropImages.wheat.label}
                </span>
              </div>

              <div className="relative col-span-5 row-span-3 overflow-hidden rounded-2xl shadow-md shadow-earth-900/6 ring-1 ring-earth-100 dark:ring-earth-850">
                <img
                  src={cropImages.tomato.src}
                  alt={cropImages.tomato.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-earth-700 backdrop-blur-sm sm:text-xs dark:bg-earth-900/90 dark:text-earth-200">
                  {cropImages.tomato.label}
                </span>
              </div>

              <div className="relative col-span-5 row-span-3 overflow-hidden rounded-2xl shadow-md shadow-earth-900/6 ring-1 ring-earth-100 dark:ring-earth-850">
                <img
                  src={cropImages.corn.src}
                  alt={cropImages.corn.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-earth-700 backdrop-blur-sm sm:text-xs dark:bg-earth-900/90 dark:text-earth-200">
                  {cropImages.corn.label}
                </span>
              </div>

              <div className="relative col-span-12 row-span-2 overflow-hidden rounded-2xl shadow-md shadow-earth-900/6 ring-1 ring-earth-100 dark:ring-earth-850">
                <img
                  src={cropImages.leaves.src}
                  alt={cropImages.leaves.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-earth-700 backdrop-blur-sm dark:bg-earth-900/90 dark:text-earth-200">
                  {cropImages.leaves.label}
                </span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-earth-100 bg-white p-4 shadow-xl shadow-earth-900/8 sm:block dark:border-earth-800 dark:bg-earth-850">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-crop-50 text-crop-600 dark:bg-crop-950/20 dark:text-crop-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-earth-900 dark:text-earth-100">AI Verified</p>
                  <p className="text-xs text-earth-500 dark:text-earth-400 font-medium">Smart Agriculture System</p>
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
