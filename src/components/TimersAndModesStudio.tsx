import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Zap, 
  Power, 
  Sliders, 
  Sun, 
  Radio, 
  Plug, 
  Coins,
  CheckCircle2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  BatteryCharging,
  ArrowRightLeft
} from 'lucide-react';
import { InverterState, InverterTimerRule } from '../types/tollpower';
import { sfx } from '../utils/sfx';

interface TimersAndModesStudioProps {
  inverterState: InverterState;
  timers: InverterTimerRule[];
  onControl: (action: string, value?: string, relay?: string) => Promise<void>;
  onAddTimer: (timer: Partial<InverterTimerRule>) => Promise<void>;
  onToggleTimer: (timerId: string, enabled?: boolean) => Promise<void>;
  onDeleteTimer: (timerId: string) => Promise<void>;
}

export const TimersAndModesStudio: React.FC<TimersAndModesStudioProps> = ({
  inverterState,
  timers,
  onControl,
  onAddTimer,
  onToggleTimer,
  onDeleteTimer,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerTime, setNewTimerTime] = useState('08:00');
  const [newTimerDays, setNewTimerDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [newTimerAction, setNewTimerAction] = useState<'outputPriority' | 'chargerPriority' | 'powerState' | 'relay'>('outputPriority');
  const [newTimerValue, setNewTimerValue] = useState('SBU');
  const [newTimerRelay, setNewTimerRelay] = useState<'mainAc' | 'auxLoad' | 'usbPorts' | 'coolingFan'>('auxLoad');
  const [newTimerRelayState, setNewTimerRelayState] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    sfx.playClick();
    if (newTimerDays.includes(day)) {
      if (newTimerDays.length > 1) {
        setNewTimerDays(newTimerDays.filter(d => d !== day));
      }
    } else {
      setNewTimerDays([...newTimerDays, day]);
    }
  };

  const handleCreateTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    sfx.playPowerUp();
    setSubmitting(true);
    try {
      await onAddTimer({
        name: newTimerName.trim() || `Schedule at ${newTimerTime}`,
        time: newTimerTime,
        days: newTimerDays,
        action: newTimerAction,
        value: newTimerAction === 'relay' ? (newTimerRelayState ? 'on' : 'off') : newTimerValue,
        relayName: newTimerAction === 'relay' ? newTimerRelay : undefined,
        relayValue: newTimerAction === 'relay' ? newTimerRelayState : undefined,
      });
      setShowAddModal(false);
      setNewTimerName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Google Pixel clean + subtle Nintendo coin icon) */}
      <div className="p-6 rounded-3xl bg-[#151822] border border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-400/15 text-amber-300 border border-amber-400/30">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Inverter Timers & Time-of-Use Schedules
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Automate your Voltacon inverter routines! Switch to off-peak battery charging overnight, prioritize solar during the day, and save on peak UK tariffs.
            </p>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Schedules List (Material 3 Cards) */}
      <div className="bg-[#151822] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/10 bg-[#10121a] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-white">Active Routines ({timers.length})</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Evaluated continuously on Pi</span>
        </div>

        {timers.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">No schedules created yet. Tap "Add Schedule" to create your first timer.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {timers.map(timer => (
              <div
                key={timer.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-2xl bg-[#10121a] border border-white/10 text-center font-mono min-w-[70px]">
                    <span className="text-base font-bold text-white block">{timer.time}</span>
                    <span className="text-[10px] text-slate-400 uppercase mt-0.5 block">Daily</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white">{timer.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        {timer.action === 'outputPriority' ? `Output: ${timer.value}` : timer.action === 'chargerPriority' ? `Charger: ${timer.value}` : `${timer.action}: ${timer.value}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {daysList.map(d => {
                        const isDayActive = timer.days.includes(d);
                        return (
                          <span
                            key={d}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              isDayActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/5 text-slate-500'
                            }`}
                          >
                            {d}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <button
                    onClick={() => {
                      sfx.playClick();
                      onToggleTimer(timer.id, !timer.enabled);
                    }}
                    className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      timer.enabled
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {timer.enabled ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      sfx.playClick();
                      onDeleteTimer(timer.id);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete timer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Schedule Modal (Soft Material Dialog) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#151822] border border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <span>Create Schedule</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTimer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Label</label>
                <input
                  type="text"
                  required
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="e.g. Midnight Battery Recharge"
                  className="w-full bg-[#10121a] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={newTimerTime}
                    onChange={(e) => setNewTimerTime(e.target.value)}
                    className="w-full bg-[#10121a] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Action Type</label>
                  <select
                    value={newTimerAction}
                    onChange={(e) => setNewTimerAction(e.target.value as any)}
                    className="w-full bg-[#10121a] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="outputPriority">Output Source Priority</option>
                    <option value="chargerPriority">Charger Source Priority</option>
                    <option value="powerState">Power State</option>
                    <option value="relay">Toggle Relay</option>
                  </select>
                </div>
              </div>

              {/* Specific Action selectors */}
              {newTimerAction === 'outputPriority' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Output Priority</label>
                  <select
                    value={newTimerValue}
                    onChange={(e) => setNewTimerValue(e.target.value)}
                    className="w-full bg-[#10121a] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="SBU">SBU: Solar → Battery → Grid</option>
                    <option value="SOL">SOL: Solar First</option>
                    <option value="UTI">UTI: Grid Utility Priority</option>
                  </select>
                </div>
              )}

              {newTimerAction === 'chargerPriority' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Charger Priority</label>
                  <select
                    value={newTimerValue}
                    onChange={(e) => setNewTimerValue(e.target.value)}
                    className="w-full bg-[#10121a] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="SNU">SNU: Solar & Grid (Fast Off-Peak)</option>
                    <option value="CSO">CSO: Solar First Charge</option>
                    <option value="OSO">OSO: Only Solar</option>
                  </select>
                </div>
              )}

              {/* Days selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysList.map(d => {
                    const isSelected = newTimerDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'bg-[#10121a] text-slate-400 border border-white/10'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-2xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
