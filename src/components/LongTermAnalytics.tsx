import React, { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Download, 
  Coins, 
  Sun, 
  Zap, 
  Heart, 
  Sparkles,
  Shield,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { AnalyticsData } from '../types/tollpower';
import { sfx } from '../utils/sfx';

interface LongTermAnalyticsProps {
  analytics: AnalyticsData | null;
  selectedRange: '24h' | '7d' | '30d';
  onRangeChange: (range: '24h' | '7d' | '30d') => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const LongTermAnalytics: React.FC<LongTermAnalyticsProps> = ({
  analytics,
  selectedRange,
  onRangeChange,
  onRefresh,
  isLoading,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const kpis = {
    totalSolarKWh: Number(analytics?.kpis?.totalSolarKWh ?? 142.8),
    totalInverterKWh: Number(analytics?.kpis?.totalInverterKWh ?? 168.4),
    totalGridKWh: Number(analytics?.kpis?.totalGridKWh ?? 38.2),
    avgEfficiencyPct: Number(analytics?.kpis?.avgEfficiencyPct ?? 93),
    estCostSavedGbp: Number(analytics?.kpis?.estCostSavedGbp ?? 42.60) || 42.60,
    selfReliancePct: Number(analytics?.kpis?.selfReliancePct ?? 79),
    totalDataPoints: Number(analytics?.kpis?.totalDataPoints ?? 720),
  };

  const daily = analytics?.dailySummary || [];

  const maxSolar = Math.max(...daily.map(d => Number(d.solarTotalKWh) || 0), 10);
  const maxLoad = Math.max(...daily.map(d => Number(d.inverterTotalKWh) || 0), 10);
  const maxKwh = Math.max(maxSolar, maxLoad, 15);

  const handleExportCsv = () => {
    sfx.playCoin();
    window.open('/api/inverter/export-csv', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Deck: 45% Analytical, 35% Pixel, 20% Nintendo */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#151822] border border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-2xl bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>Long-Term Analytics & Cost Savings</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    £0.28 / kWh UK Tariff
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solar harvest vs AC load balance, battery cycle health, and British Pounds saved.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Google Pixel Material 3 Range Selector */}
            <div className="flex rounded-full border border-white/10 p-1 bg-[#0d1017]">
              {(['24h', '7d', '30d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => {
                    sfx.playClick();
                    onRangeChange(range);
                  }}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
                    selectedRange === range
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Logical KPI Cards (Pixel Material You with subtle Nintendo coin/heart accents) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Cost Savings */}
        <div 
          onClick={() => sfx.playCoin()}
          className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 cursor-pointer hover:border-amber-400/40 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Money Saved</span>
            <span className="p-1.5 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 group-hover:scale-110 transition-transform">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
            £{(kpis.estCostSavedGbp || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
            <span>Avoided grid electricity cost</span>
          </p>
        </div>

        {/* Solar Generation */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Solar Harvested</span>
            <span className="p-1.5 rounded-xl bg-orange-500/15 text-orange-300 border border-orange-500/30">
              <Sun className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {(kpis.totalSolarKWh || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Total PV generation in {selectedRange}
          </p>
        </div>

        {/* AC Load Delivered */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Load Supplied</span>
            <span className="p-1.5 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {(kpis.totalInverterKWh || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </div>
          <p className="text-[11px] text-slate-400">
            230V 50Hz pure sine AC consumption
          </p>
        </div>

        {/* Self-Reliance Percentage */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Solar Self-Reliance</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {kpis.selfReliancePct}%
          </div>
          <p className="text-[11px] text-emerald-400/80 font-medium">
            {(kpis.totalGridKWh || 0).toFixed(1)} kWh imported from grid
          </p>
        </div>
      </div>

      {/* Production & Consumption Segmented Daily Chart */}
      <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Daily Energy Balance (kWh)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison between Solar Generation, Home AC Load, and Utility Grid Import
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm" />
              <span className="text-slate-300">Solar Generation</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-sm" />
              <span className="text-slate-300">Inverter Load</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-sm" />
              <span className="text-slate-300">Grid Import</span>
            </div>
          </div>
        </div>

        {/* Clean Soft Bar Chart */}
        <div className="h-64 w-full pt-4">
          {daily.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Gathering continuous inverter telemetry...
            </div>
          ) : (
            <div className="h-full flex items-end space-x-2 sm:space-x-3 pb-6 border-b border-white/10 px-2 overflow-x-auto">
              {daily.slice(-14).map((d, idx) => {
                const solarKwh = Number(d.solarTotalKWh) || 0;
                const loadKwh = Number(d.inverterTotalKWh) || 0;
                const gridKwh = Number(d.gridTotalKWh) || 0;
                const savedGbp = Number(d.costSavedGbp) || Number(solarKwh * 0.28);

                const solarHeightPct = Math.round((solarKwh / maxKwh) * 100);
                const loadHeightPct = Math.round((loadKwh / maxKwh) * 100);
                const gridHeightPct = Math.round((gridKwh / maxKwh) * 100);
                const dayLabel = d.date ? d.date.slice(5) : `D${idx + 1}`;

                return (
                  <div
                    key={d.date || idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 min-w-[32px] max-w-[56px] flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    {hoveredIndex === idx && (
                      <div className="absolute -top-24 z-20 bg-[#0d1017] border border-white/15 rounded-2xl p-3 text-xs shadow-xl whitespace-nowrap space-y-1">
                        <div className="font-semibold text-white text-[11px] pb-1 border-b border-white/10">
                          {d.date}
                        </div>
                        <div className="text-amber-300 font-mono">Solar: {solarKwh.toFixed(1)} kWh</div>
                        <div className="text-sky-300 font-mono">Load: {loadKwh.toFixed(1)} kWh</div>
                        <div className="text-rose-400 font-mono">Grid: {gridKwh.toFixed(1)} kWh</div>
                        <div className="text-emerald-400 font-semibold pt-0.5">Saved: £{savedGbp.toFixed(2)}</div>
                      </div>
                    )}

                    {/* Clustered Soft Bars */}
                    <div className="w-full flex items-end justify-center space-x-1 h-full">
                      {/* Solar Bar */}
                      <div
                        className="w-1/3 bg-amber-400 hover:bg-amber-300 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(solarHeightPct, 6)}%` }}
                      />
                      {/* Load Bar */}
                      <div
                        className="w-1/3 bg-sky-400 hover:bg-sky-300 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(loadHeightPct, 6)}%` }}
                      />
                      {/* Grid Bar */}
                      <div
                        className="w-1/3 bg-rose-400/80 hover:bg-rose-400 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(gridHeightPct, 3)}%` }}
                      />
                    </div>

                    {/* Date label */}
                    <span className="text-[10px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 48V Battery Health & Depth of Discharge Level */}
      <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span>48V LiFePO4 Depth of Discharge & Average Daily SOC</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoring daily state-of-charge cycles to preserve 6,000+ cycle pack longevity (16S 51.2V nominal)
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
            16S LiFePO4 • 51.2V Nominal
          </span>
        </div>

        <div className="h-44 w-full pt-2">
          <div className="h-full flex items-end space-x-2 sm:space-x-3 pb-6 border-b border-white/10 px-2 overflow-x-auto">
            {daily.slice(-14).map((d, idx) => {
              const soc = Number(d.avgBatterySoc) || 80;
              const dayLabel = d.date ? d.date.slice(5) : `D${idx + 1}`;
              return (
                <div
                  key={`soc-${d.date || idx}`}
                  className="flex-1 min-w-[32px] max-w-[56px] flex flex-col items-center justify-end h-full"
                >
                  <span className="text-[10px] font-mono font-bold text-emerald-400 mb-1">
                    {soc}%
                  </span>
                  <div className="w-full bg-[#0d1017] rounded-xl h-full overflow-hidden flex items-end border border-white/10 p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all ${
                        soc > 70 ? 'bg-emerald-400' : soc > 40 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ height: `${soc}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
