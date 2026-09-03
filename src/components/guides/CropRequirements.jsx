export default function CropRequirements({ reqs }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Temp */}
      <div className="bg-white dark:bg-earth-900 border border-earth-100 dark:border-earth-800 rounded-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🌡️</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-600 dark:text-earth-400">Temperature</h4>
        </div>
        <div className="text-2xl font-black text-earth-900 dark:text-earth-50 tracking-tight">
          {reqs.tempIdeal[0]}-{reqs.tempIdeal[1]}<span className="text-base text-earth-500 font-bold">°C</span>
        </div>
        <div className="text-[10px] text-earth-500 mt-1">Survival: {reqs.tempRange[0]}°C to {reqs.tempRange[1]}°C</div>
      </div>

      {/* pH */}
      <div className="bg-white dark:bg-earth-900 border border-earth-100 dark:border-earth-800 rounded-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🧪</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-600 dark:text-earth-400">Soil pH</h4>
        </div>
        <div className="text-2xl font-black text-earth-900 dark:text-earth-50 tracking-tight">
          {reqs.phRange[0]}-{reqs.phRange[1]}
        </div>
        <div className="text-[10px] text-earth-500 mt-1">Ideal Acidity/Alkalinity</div>
      </div>

      {/* Water */}
      <div className="bg-white dark:bg-earth-900 border border-earth-100 dark:border-earth-800 rounded-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💧</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-600 dark:text-earth-400">Water Req.</h4>
        </div>
        <div className="text-lg font-black text-earth-900 dark:text-earth-50 tracking-tight leading-tight">
          {reqs.waterReq}
        </div>
        <div className="text-[10px] text-earth-500 mt-1">Total ETc per season</div>
      </div>

      {/* Soil */}
      <div className="bg-white dark:bg-earth-900 border border-earth-100 dark:border-earth-800 rounded-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🌱</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-600 dark:text-earth-400">Soil Type</h4>
        </div>
        <div className="text-sm font-bold text-earth-900 dark:text-earth-50 leading-tight">
          {reqs.soil}
        </div>
        <div className="text-[10px] text-earth-500 mt-1">Preferred texture</div>
      </div>
    </div>
  );
}
