const resultCards = [
  {
    id: 'crop',
    label: 'Crop Name',
    value: 'Tomato (Solanum lycopersicum)',
    icon: '🌿',
    accent: 'bg-earth-50 text-earth-700 ring-earth-100',
  },
  {
    id: 'disease',
    label: 'Disease',
    value: 'Early Blight (Alternaria solani)',
    icon: '🔬',
    accent: 'bg-red-50 text-red-700 ring-red-100',
  },
  {
    id: 'confidence',
    label: 'Confidence',
    value: '92.4%',
    icon: '📊',
    accent: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  {
    id: 'causes',
    label: 'Causes',
    value: 'Fungal spores spread by wind, rain splash, and infected plant debris. Thrives in warm, humid conditions.',
    icon: '⚠️',
    accent: 'bg-amber-50 text-amber-700 ring-amber-100',
    fullWidth: true,
  },
  {
    id: 'treatment',
    label: 'Treatment',
    value: 'Apply copper-based fungicide or chlorothalonil. Remove and destroy infected leaves. Improve air circulation around plants.',
    icon: '💊',
    accent: 'bg-crop-50 text-crop-700 ring-crop-100',
    fullWidth: true,
  },
  {
    id: 'prevention',
    label: 'Prevention',
    value: 'Use disease-resistant varieties. Rotate crops annually. Avoid overhead watering. Mulch around base to prevent soil splash.',
    icon: '🛡️',
    accent: 'bg-earth-50 text-earth-700 ring-earth-100',
    fullWidth: true,
  },
];

function AnalysisResult() {
  return (
    <section id="results" className="border-t border-earth-100 bg-earth-50/50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-crop-600">
            Analysis Preview
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
            Diagnosis Results
          </h2>
          <p className="mt-4 text-earth-500">
            Sample output showing what your analysis will look like. Upload an image to get real results.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-shadow hover:shadow-card ${
                card.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ring-1 ${card.accent}`}
                >
                  {card.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-earth-400">
                    {card.label}
                  </p>
                  <p
                    className={`mt-1.5 font-medium text-earth-800 ${
                      card.fullWidth ? 'text-sm leading-relaxed' : 'text-base'
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-earth-400">
          Placeholder data for demonstration. AI integration coming soon.
        </p>
      </div>
    </section>
  );
}

export default AnalysisResult;
