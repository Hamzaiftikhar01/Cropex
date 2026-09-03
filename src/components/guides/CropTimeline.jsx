export default function CropTimeline({ lifecycle }) {
  return (
    <div className="relative border-l-2 border-crop-200 dark:border-crop-800 ml-3 md:ml-4 space-y-8 pb-4">
      {lifecycle.map((stage, idx) => (
        <div key={idx} className="relative pl-6 md:pl-8">
          {/* Node */}
          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-crop-500 border-4 border-white dark:border-earth-900 shadow-sm"></div>
          
          <div className="bg-white dark:bg-earth-800 border border-earth-100 dark:border-earth-700 rounded-xl p-4 shadow-soft transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h4 className="font-bold text-earth-900 dark:text-earth-50 text-base">{stage.stage}</h4>
              <span className="bg-crop-100 text-crop-800 dark:bg-crop-900 dark:text-crop-300 text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide w-max">
                Day {stage.days}
              </span>
            </div>
            
            <p className="text-sm text-earth-600 dark:text-earth-300 mb-3">{stage.desc}</p>
            
            <div className="bg-earth-50 dark:bg-earth-900/50 rounded-lg p-3">
              <span className="text-[10px] font-bold text-earth-500 dark:text-earth-400 uppercase tracking-wider mb-2 block">Key Actions</span>
              <ul className="space-y-1.5">
                {stage.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-earth-700 dark:text-earth-200">
                    <span className="text-crop-500 mt-0.5">✓</span>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
