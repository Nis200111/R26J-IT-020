import React from 'react';

const tickerPlants = [
  { name: 'Ahu', scientific: '', status: 'Genuine', image: '/plants/Ahu.jpg' },
  { name: 'Beheth Anoda', scientific: '', status: 'Genuine', image: '/plants/beheth anoda.jpg' },
  { name: 'Binkohomba', scientific: '', status: 'Genuine', image: '/plants/binkohomba.jpg' },
  { name: 'Bu-dettha', scientific: '', status: 'Genuine', image: '/plants/Bu-dettha.jpg' },
  { name: 'Buudadakiriya', scientific: '', status: 'Genuine', image: '/plants/Buudadakiriya.jpg' },
  { name: 'Gansooyia', scientific: '', status: 'Genuine', image: '/plants/Gansooyia.jpg' },
  { name: 'Girapala', scientific: '', status: 'Genuine', image: '/plants/Girapala.jpg' },
  { name: 'Heen Binkohomba', scientific: '', status: 'Genuine', image: '/plants/Heen_Binkohomba.jpg' }
];

/**
 * InfiniteMarquee Component
 * Displays a continuous, auto-scrolling marquee of trained medicinal species.
 * Used for the Plant Authentication System to showcase reference standards.
 */
export default function InfiniteMarquee() {
  return (
    <div className="w-full px-4 lg:px-12 my-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 justify-start">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
          Model Knowledge Base
        </span>
        <span className="text-xs text-slate-500 font-light">Trained medicinal species database & reference standards</span>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-4 shadow-sm">
        
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#f8f9fa] via-[#f8f9fa]/80 to-transparent z-10 pointer-events-none rounded-l-2xl" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#f8f9fa] via-[#f8f9fa]/80 to-transparent z-10 pointer-events-none rounded-r-2xl" />
        
        {/* Animated Flexbox */}
        <div className="flex animate-marquee-infinite whitespace-nowrap gap-6 py-1.5">
          
          {/* First Set */}
          {tickerPlants.map((plant, index) => (
            <div 
              key={`ticker-1-${index}`} 
              className="flex items-center gap-3.5 mx-1 shrink-0 bg-white rounded-xl py-2.5 px-4.5 border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center">
                <img src={plant.image} alt={plant.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800">{plant.name}</h4>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full border shrink-0 font-semibold ${
                    plant.status === 'Genuine' 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                      : plant.status === 'Low'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                  }`}>
                    {plant.status}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-600 italic font-light leading-tight">{plant.scientific}</p>
              </div>
            </div>
          ))}
          
          {/* Second Set for infinite loop */}
          {tickerPlants.map((plant, index) => (
            <div 
              key={`ticker-2-${index}`} 
              className="flex items-center gap-3.5 mx-1 shrink-0 bg-white rounded-xl py-2.5 px-4.5 border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center">
                <img src={plant.image} alt={plant.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800">{plant.name}</h4>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full border shrink-0 font-semibold ${
                    plant.status === 'Genuine' 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                      : plant.status === 'Low'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                  }`}>
                    {plant.status}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-600 italic font-light leading-tight">{plant.scientific}</p>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
