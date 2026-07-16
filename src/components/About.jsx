function About() {
  return (
    <section id="about" className="bg-earth-50/50 py-16 sm:py-24 text-left transition-colors duration-200 dark:bg-earth-900/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-crop-50 px-3 py-1 text-xs font-semibold text-crop-800 ring-1 ring-crop-100 dark:bg-crop-950/30 dark:text-crop-300 dark:ring-crop-900/30">
            🌱 About CropMedic AI
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl dark:text-earth-50">
            Intelligent Offline Agricultural Assistant
          </h2>
          <p className="mt-4 text-earth-500 max-w-xl mx-auto dark:text-earth-400">
            CropMedic AI empowers farmers with instantaneous, expert-level crop diagnosis and treatment suggestions without requiring internet search operations.
          </p>
        </div>

        <div className="space-y-8">
          {/* Card 1: Core Purpose */}
          <div className="rounded-2xl border border-earth-100 bg-white p-6 sm:p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              <span>🎯</span> Core Purpose
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-earth-650 dark:text-earth-350">
              Modern agriculture is severely impacted by crop diseases that spread rapidly and destroy yields. CropMedic AI was designed specifically for crop advisors, farmers, and extension workers who need high-confidence, actionable diagnostic assistance directly in the field. By utilizing local offline knowledge and strict privacy-focused queries, it ensures immediate support whenever and wherever it is needed.
            </p>
          </div>

          {/* Card 2: How it works */}
          <div className="rounded-2xl border border-earth-100 bg-white p-6 sm:p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              <span>🧠</span> How AI Analysis Works
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-earth-650 dark:text-earth-350">
              CropMedic AI uses the state-of-the-art <strong>meta-llama/llama-4-scout-17b-16e-instruct</strong> vision model via Groq's high-speed API to analyze uploading crop pictures.
            </p>
            <ul className="mt-4 space-y-3 pl-2">
              <li className="text-sm text-earth-650 flex items-start gap-2.5 dark:text-earth-350">
                <span className="text-crop-600 mt-1 select-none text-[8px]">•</span>
                <span className="flex-1"><strong>Vision Recognition</strong>: Evaluates visual patterns, lesions, yellowing, and mold formations.</span>
              </li>
              <li className="text-sm text-earth-650 flex items-start gap-2.5 dark:text-earth-350">
                <span className="text-crop-600 mt-1 select-none text-[8px]">•</span>
                <span className="flex-1"><strong>Structured Outputs</strong>: Enforces strict structured JSON schemas directly at the API completions level.</span>
              </li>
              <li className="text-sm text-earth-650 flex items-start gap-2.5 dark:text-earth-350">
                <span className="text-crop-600 mt-1 select-none text-[8px]">•</span>
                <span className="flex-1"><strong>Non-Crop Rejection</strong>: Instantly ignores non-plant uploads to preserve resources and prevent user accidents.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: The Offline Knowledge Base */}
          <div className="rounded-2xl border border-earth-100 bg-white p-6 sm:p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              <span>📦</span> Local Knowledge Base & Company Scrapers
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-earth-650 dark:text-earth-350">
              Unlike typical tools that perform live web searches during farmer use, CropMedic AI relies strictly on an offline local database indexed locally. This prevents web latency, protects data, and functions correctly regardless of external website availability.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-earth-650 dark:text-earth-350">
              The database is updated periodically using our developer-only update pipeline. This pipeline uses modular crawlers that index crop protection solutions from trusted official manufacturers including:
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-earth-800 dark:text-earth-200">
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">FMC Pakistan</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">Suncrop Group</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">Syngenta Pakistan</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">Bayer Pakistan</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">BASF Pakistan</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">Four Brothers</span>
            </div>
          </div>

          {/* Project Creator Card */}
          <div className="rounded-2xl border border-earth-100 bg-white p-6 sm:p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              <span>👨‍💻</span> Project Creator
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-earth-650 dark:text-earth-350">
              CropMedic AI was developed as a portfolio-ready agricultural intelligence assistant to bridge the gap between advanced deep learning vision models and local, offline-first farmer diagnostic needs.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-earth-100 pt-4 dark:border-earth-800">
              <div>
                <p className="text-sm font-bold text-earth-800 dark:text-earth-200">Muhammad Abdullah Khan</p>
                <p className="text-xs text-earth-450 dark:text-earth-400">Lead AI Engineer & Fullstack Developer</p>
              </div>
              <a
                href="mailto:mabdullahkhan.tech@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl bg-crop-50 px-4 py-2 text-xs font-bold text-crop-800 transition-all hover:bg-crop-100 dark:bg-crop-950/20 dark:text-crop-300 dark:hover:bg-crop-950/40 w-fit"
              >
                <span>✉️</span> mabdullahkhan.tech@gmail.com
              </a>
            </div>
          </div>

          {/* Card 4: Disclaimer */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6 sm:p-8 shadow-soft dark:border-amber-900/40 dark:bg-amber-950/20">
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-400 flex items-center gap-2">
              <span>⚠️</span> Professional Disclaimer
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-amber-900 dark:text-amber-300">
              All diagnosis reports, chemical product listings, and crop treatment recommendations provided by CropMedic AI are for educational and informational purposes only. Artificial intelligence is a helper, not a replacement for on-site expert consultation. Farmers should always contact their local agricultural extension offices and carefully read and follow instructions on official manufacturer product labels before any chemical application.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;
