import {
  ChartColumn,
  CloudOff,
  CloudRain,
  Droplet,
  Droplets,
  Gauge,
  Snowflake,
  Sun,
  ThermometerSun,
  Wind,
  Activity,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getWeatherIcon } from '../lib/iconMaps';

export default function WeatherView({ weatherData, loading, error, isFallback, isDegraded, fieldProfile, refData }) {
  const { t, language } = useLanguage();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-crop-600 border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-earth-800 dark:text-earth-400">Loading regional weather intelligence...</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-red-50 text-red-800 p-5 rounded-2xl border border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30 text-left">
        <h4 className="font-bold text-sm">Weather Telemetry Offline</h4>
        <p className="text-xs mt-1">Failed to fetch meteorological data. Please check your internet connection.</p>
      </div>
    );
  }

  const { current, daily } = weatherData;
  const coords = refData?.districtCoordinates?.[fieldProfile.district] || { latitude: 31.4504, longitude: 73.1350 };

  const alerts = [];
  const maxTemp = Math.max(...daily.map(d => d.tempMax));
  const minTemp = Math.min(...daily.map(d => d.tempMin));
  const rainDays = daily.filter(d => d.precipitationProb > 70 && d.precipitationSum > 10);

  const isLocal = language === 'ur' || language === 'pa';
  const isUrdu = language === 'ur';
  const isPunjabi = language === 'pa';

  if (maxTemp >= 40) {
    alerts.push({
      type: 'warning',
      icon: Sun,
      title: isUrdu ? 'شدید گرمی کی لہر کا الرٹ' : isPunjabi ? 'شدید گرمی دی لہر دا الرٹ' : 'Extreme Heatwave Warning',
      desc: isUrdu 
        ? `درجہ حرارت ${maxTemp}°C تک پہنچنے کی پیش گوئی ہے۔ فصل کو مرجھانے سے بچانے کے لیے پانی بڑھائیں۔`
        : isPunjabi
        ? `درجہ حرارت ${maxTemp}°C تیکر جان دا امکان اے۔ فصل نوں سکن توں بچان لئی پانی ودھاؤ۔`
        : `Temperatures are expected to reach ${maxTemp}°C in ${fieldProfile.district}. Increase irrigation frequency to prevent crop wilting.`
    });
  }
  if (minTemp <= 4) {
    alerts.push({
      type: 'danger',
      icon: Snowflake,
      title: isUrdu ? 'کورے کا خطرہ (Frost Risk)' : isPunjabi ? 'کورے دا خطرہ (Frost Risk)' : 'Frost Risk Detected',
      desc: isUrdu 
        ? `درجہ حرارت ${minTemp}°C تک گرنے کا امکان ہے۔ ہلکا پانی دیں یا پودوں کو ڈھانپیں۔`
        : isPunjabi
        ? `درجہ حرارت ${minTemp}°C تیکر ڈگن دا امکان اے۔ ہلکا پانی دیو یا پودیاں نوں ڈھکو۔`
        : `Temperatures will drop as low as ${minTemp}°C. Cover susceptible seedlings or apply light irrigation to raise canopy temperature.`
    });
  }
  if (rainDays.length > 0) {
    const rainVol = Math.max(...rainDays.map(d => d.precipitationSum));
    alerts.push({
      type: 'info',
      icon: CloudRain,
      title: isUrdu ? 'شدید بارش کا امکان' : isPunjabi ? 'تیز بارش دا امکان' : 'Heavy Precipitation Forecasted',
      desc: isUrdu 
        ? `شدید بارش (~${rainVol}mm) متوقع ہے۔ کھاد اور اسپرے کی ایپلی کیشنز ملتوی کریں۔`
        : isPunjabi
        ? `تیز بارش (~${rainVol}mm) دا امکان اے۔ کھاد تے اسپرے دا کم روک دیو۔`
        : `Heavy rain is forecast (totals up to ~${rainVol.toFixed(1)}mm). Delay fertilizer spray applications and ensure field drainage.`
    });
  }

  if (isDegraded) {
    alerts.push({
      type: 'warning',
      icon: CloudOff,
      title: isUrdu ? 'آف لائن موڈ (Cached Data)' : isPunjabi ? 'آف لائن موڈ (Cached Data)' : 'Offline Mode (Cached Data)',
      desc: isUrdu 
        ? 'موسمی ڈیٹا پرانا ہو سکتا ہے۔ آپ کے آخری آن لائن کنکشن کا ڈیٹا دکھایا جا رہا ہے۔'
        : isPunjabi
        ? 'موسمی ڈیٹا پرانا ہو سکدا اے۔ آخری آن لائن کنکشن دا ڈیٹا دکھایا جا رہیا اے۔'
        : 'Weather telemetry is offline. Displaying locally cached data from your last connection.'
    });
  }

  const getWeekday = (dateStr) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (isLocal) {
      const urDays = { Mon: 'پیر', Tue: 'منگل', Wed: 'بدھ', Thu: 'جمعرات', Fri: 'جمعہ', Sat: 'ہفتہ', Sun: 'اتوار' };
      return urDays[dayName] || dayName;
    }
    return dayName;
  };

  const translateWeatherDesc = (desc) => {
    if (!isLocal) return desc;
    const descMap = {
      'Clear Sky': 'صاف آسمان',
      'Clear Sunny': 'صاف دھوپ',
      'Partly Cloudy': 'جزوی ابر آلود',
      'Foggy': 'دھند',
      'Light Drizzle': 'ہلکی بوندا باندی',
      'Rainy': 'بارش',
      'Rain Showers': 'تیز بارش',
      'Thunderstorms': 'گرج چمک',
      'Overcast & Humid': 'ابر آلود اور نمی',
      'Extreme Heat': 'شدید گرمی'
    };
    return descMap[desc] || desc;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Alert Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const AlertIcon = alert.icon;
            return (
              <div
                key={i}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center gap-3 ${
                  alert.type === 'danger'
                    ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300'
                    : alert.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300'
                    : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm flex-1 flex items-center gap-2">
                  <AlertIcon size={18} className="shrink-0" aria-hidden="true" />
                  <span>{alert.title}</span>
                </div>
                <div className="text-xs">{alert.desc}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-earth-100 dark:border-earth-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-earth-900 dark:text-earth-50 tracking-tight font-sans">
            {t('weather')}
          </h2>
          <p className="text-xs text-earth-800 dark:text-earth-300 mt-0.5 font-medium">
            {t('district')}: <span className="font-bold text-earth-700 dark:text-earth-300">{t('dist_' + fieldProfile.district.toLowerCase())}</span> ({coords.latitude}°N, {coords.longitude}°E)
          </p>
        </div>
        {isFallback && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 shadow-xs">
            <Activity size={12} aria-hidden="true" />
            {t('switchPreset')}
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-crop-600 to-crop-700 text-white rounded-2xl p-6 shadow-md md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-semibold text-crop-100 tracking-wider">{t('currentWeather')}</span>
                <h4 className="text-lg font-bold mt-1 text-crop-50">{t('dist_' + fieldProfile.district.toLowerCase())}</h4>
              </div>
              {(() => {
                const CurrentWeatherIcon = getWeatherIcon(current.conditionCode);
                return <CurrentWeatherIcon size={40} className="shrink-0 text-crop-50" aria-hidden="true" />;
              })()}
            </div>
            
            <div className="my-6">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{current.temp}°</span>
              <span className="text-2xl text-crop-100 font-bold">C</span>
              <div className="text-sm font-bold text-crop-50 mt-1">{translateWeatherDesc(current.description)}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-crop-500/50 pt-4 text-center">
            <div>
              <div className="text-[10px] text-crop-200 uppercase font-semibold">{t('humidity')}</div>
              <div className="text-sm font-bold">{current.humidity}%</div>
            </div>
            <div>
              <div className="text-[10px] text-crop-200 uppercase font-semibold">{t('wind')}</div>
              <div className="text-sm font-bold">{current.windSpeed} km/h</div>
            </div>
            <div>
              <div className="text-[10px] text-crop-200 uppercase font-semibold">{t('precip')}</div>
              <div className="text-sm font-bold">{current.precipitation} mm</div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast Strip Card */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 shadow-soft md:col-span-2 dark:bg-earth-900 dark:border-earth-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200 mb-3.5">
              {t('forecastOutlook')}
            </h4>
            
            <div className="overflow-x-auto pb-1">
              <div className="flex sm:grid sm:grid-cols-7 gap-2.5 min-w-[520px] sm:min-w-0">
                {daily.map((day, idx) => {
                  const DayIcon = getWeatherIcon(day.conditionCode);
                  return (
                    <div
                      key={day.date}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all flex flex-col justify-between min-h-[140px] ${
                        idx === 0
                          ? 'border-crop-500 bg-crop-50/20 dark:bg-crop-950/20'
                          : 'border-earth-100 bg-earth-50/30 dark:border-earth-800 dark:bg-earth-950/20'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-bold ${idx === 0 ? 'text-crop-600 dark:text-crop-400' : 'text-earth-600 dark:text-earth-200'}`}>
                          {idx === 0 ? t('today') : getWeekday(day.date)}
                        </div>
                        <div className="text-[9px] text-earth-400 dark:text-earth-350 mb-1.5">{day.date.split('-').slice(1).join('/')}</div>
                      </div>

                      <div className="my-2 flex justify-center text-earth-700 dark:text-earth-200">
                        <DayIcon size={28} aria-hidden="true" />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-earth-800 dark:text-earth-100">
                          {day.tempMax}° / <span className="opacity-75">{day.tempMin}°</span>
                        </div>
                        <div className="inline-flex items-center justify-center gap-1 text-[9px] font-semibold text-blue-500 dark:text-blue-400 mt-1">
                          <Droplets size={10} aria-hidden="true" />
                          {day.precipitationProb}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-earth-500 dark:text-earth-350 mt-4 italic">
            * Precipitation values represent probability max. Temperature data measured at 2 meters canopy height.
          </p>
        </div>
      </div>

      {/* Advanced Agronomic Metrics */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        <div className="bg-white border border-earth-100 rounded-2xl p-5 shadow-soft dark:bg-earth-900 dark:border-earth-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-earth-500 uppercase font-semibold tracking-wider">Evapotranspiration (ET₀)</div>
            <div className="text-xl font-bold mt-1 text-earth-900 dark:text-earth-50">{daily[0].et0} <span className="text-sm font-semibold text-earth-500">mm/day</span></div>
            <div className="text-[10px] text-earth-400 mt-0.5">Crop water loss rate</div>
          </div>
          <Droplets size={30} className="shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        </div>

        <div className="bg-white border border-earth-100 rounded-2xl p-5 shadow-soft dark:bg-earth-900 dark:border-earth-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-earth-500 uppercase font-semibold tracking-wider">UV Index (Max)</div>
            <div className="text-xl font-bold mt-1 text-earth-900 dark:text-earth-50">{daily[0].uvIndex}</div>
            <div className="text-[10px] text-earth-400 mt-0.5">Solar radiation intensity</div>
          </div>
          <Sun size={30} className="shrink-0 text-amber-500 dark:text-amber-400" aria-hidden="true" />
        </div>

        <div className="bg-white border border-earth-100 rounded-2xl p-5 shadow-soft dark:bg-earth-900 dark:border-earth-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-earth-500 uppercase font-semibold tracking-wider">Surface Pressure</div>
            <div className="text-xl font-bold mt-1 text-earth-900 dark:text-earth-50">{current.surfacePressure} <span className="text-sm font-semibold text-earth-500">hPa</span></div>
            <div className="text-[10px] text-earth-400 mt-0.5">Barometric storm indicator</div>
          </div>
          <Gauge size={30} className="shrink-0 text-earth-500 dark:text-earth-300" aria-hidden="true" />
        </div>
      </div>

      {/* Farming Decisions Guide */}
      <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft">
        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200 mb-3">
          {t('farmingAction')}
        </h4>
        <ul className="text-xs text-earth-700 dark:text-earth-300 space-y-2 list-disc pl-4 font-medium leading-relaxed">
          {isUrdu ? (
            <>
              {current.temp > 35 && (
                <li>شدید گرمی کی وجہ سے زمین سے نمی جلدی اڑ جاتی ہے۔ فصلوں کے گرد ملچنگ کریں تاکہ نمی برقرار رہے۔</li>
              )}
              {current.humidity > 80 && (
                <li>ہوا میں زیادہ نمی فنگس پھیلنے میں مدد کرتی ہے۔ پتوں کے نچلے حصے کا باقاعدگی سے معائنہ کریں۔</li>
              )}
              {rainDays.length === 0 && (
                <li>قریبی دنوں میں بارش کا کوئی امکان نہیں ہے۔ مٹی کی نمی اور فصل کی عمر کے مطابق باقاعدگی سے پانی دیں۔</li>
              )}
              <li>فصل کی کاشت کے شیڈول کو مقامی بارشوں کے مطابق ترتیب دیں تاکہ بیج کے اگنے کی شرح زیادہ ہو۔</li>
            </>
          ) : isPunjabi ? (
            <>
              {current.temp > 35 && (
                <li>شدید گرمی دی وجہ توں مٹی وچوں نمی جلدی اڑ جاندی اے۔ فصل دے آس پاس گھاس پھوس پاؤ تاں جے نمی برقرار رہے۔</li>
              )}
              {current.humidity > 80 && (
                <li>ہوا وچ زیادہ نمی فنگس پھیلان وچ مدد کردی اے۔ پتیاں دے ہیٹھلے حصے دی باقاعدگی نال جانچ کرو۔</li>
              )}
              {rainDays.length === 0 && (
                <li>آنے والے دناں وچ بارش دا کوئی امکان نہیں اے۔ مٹی دی نمی تے فصل دی عمر دے مطابق باقاعدگی نال پانی دیو۔</li>
              )}
              <li>فصل دی کاشت دے شیڈول نوں مقامی بارشاں دے مطابق بناؤ تاں جے بیج دا اگاؤ ودھیا ہووے۔</li>
            </>
          ) : (
            <>
              {current.temp > 35 && (
                <li>High heat causes rapid crop evapotranspiration. Soil moisture will deplete fast. Consider mulching crops.</li>
              )}
              {current.humidity > 80 && (
                <li>High relative humidity enhances fungal reproduction. Check leaf undersides for damp spots or powdery spores.</li>
              )}
              {rainDays.length === 0 && (
                <li>No rainfall expected soon. Plan irrigation routines according to crop age and soil requirements.</li>
              )}
              <li>Adjust sowing schedules based on long-term regional moisture trends to maximize seed germination efficiency.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
