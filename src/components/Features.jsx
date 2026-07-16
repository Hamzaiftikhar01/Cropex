const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'AI-Powered Detection',
    description: 'Advanced machine learning models identify crop diseases from a single photo with high accuracy.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Results',
    description: 'Get diagnosis, treatment plans, and prevention tips in seconds — no waiting for lab reports.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Expert Guidance',
    description: 'Detailed causes, treatments, and prevention strategies tailored to each detected disease.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Mobile Friendly',
    description: 'Works seamlessly on any device — analyze crops directly from the field on your phone.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Multi-Crop Support',
    description: 'Supports a wide range of crops including wheat, rice, corn, tomatoes, and more.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure & Private',
    description: 'Your crop images are processed securely. We respect farmer privacy and data ownership.',
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-16 sm:py-24 dark:bg-earth-950 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-crop-600 dark:text-crop-400">
            Platform
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl dark:text-earth-50">
            Built for modern agriculture
          </h2>
          <p className="mt-4 text-earth-500 dark:text-earth-450">
            From detection to treatment, our platform gives farmers the tools to act fast and protect their harvest.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all duration-300 hover:border-earth-200 hover:shadow-card dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700 text-left"
            >
              <div className="mb-4 inline-flex rounded-xl bg-earth-50 p-3 text-earth-600 ring-1 ring-earth-100 transition-colors group-hover:bg-crop-50 group-hover:text-crop-600 group-hover:ring-crop-100 dark:bg-earth-900 dark:text-earth-300 dark:ring-earth-800 dark:group-hover:bg-crop-950/30 dark:group-hover:text-crop-400 dark:group-hover:ring-crop-900/30">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-earth-900 dark:text-earth-100">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-earth-500 dark:text-earth-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
