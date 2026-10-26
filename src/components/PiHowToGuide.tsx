import React, { useState } from 'react';
import { 
  HelpCircle, 
  Terminal, 
  Copy, 
  Check, 
  Usb, 
  Wifi, 
  HardDrive, 
  Smartphone, 
  Power, 
  ChevronDown,
  ChevronRight,
  BookOpen,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { sfx } from '../utils/sfx';

export const PiHowToGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<number>(0);

  const copyText = async (key: string, text: string) => {
    sfx.playCoin();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const steps = [
    {
      title: 'Step 1: Flash Raspberry Pi OS Lite (64-bit)',
      icon: HardDrive,
      badge: 'SD Card Prep',
      summary: 'Format microSD card with lightweight OS, Wi-Fi and SSH pre-configured.',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            1. Download <strong className="text-white">Raspberry Pi Imager</strong> from{' '}
            <a href="https://www.raspberrypi.com/software/" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
              raspberrypi.com/software
            </a>.
          </p>
          <p>
            2. Under Operating System, select <strong className="text-white">Raspberry Pi OS Lite (64-bit)</strong> (recommended for minimal overhead without desktop lag).
          </p>
          <p>
            3. In the Imager OS Customization settings (gear icon / Edit settings):
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
            <li>Set hostname: <code className="font-mono text-sky-300 bg-[#0d1017] px-2 py-0.5 rounded">tollpower</code></li>
            <li>Set username: <code className="font-mono text-white bg-[#0d1017] px-2 py-0.5 rounded">pi</code> and your preferred password</li>
            <li>Configure your home Wi-Fi SSID and password</li>
            <li>Check <strong className="text-white">Enable SSH</strong> (use password or public-key authentication)</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Step 2: Connect via SSH over Home Wi-Fi',
      icon: Terminal,
      badge: 'Remote Access',
      summary: 'Open a shell session into your Raspberry Pi terminal.',
      command: 'ssh pi@tollpower.local',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Insert the microSD card into the Pi and plug in the power supply. Once booted (approx. 45 seconds), open your computer or phone terminal and run:
          </p>
          <div className="bg-[#0a0d14] p-3 rounded-2xl border border-white/10 font-mono text-sky-300 flex items-center justify-between">
            <span>$ ssh pi@tollpower.local</span>
            <button
              onClick={() => copyText('ssh-cmd', 'ssh pi@tollpower.local')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {copiedKey === 'ssh-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-slate-400">
            Tip: If your router doesn't resolve mDNS (.local), look up the Pi's assigned IP in your router's client list and connect via <code className="font-mono text-slate-300">ssh pi@192.168.1.X</code>.
          </p>
        </div>
      ),
    },
    {
      title: 'Step 3: Connect Direct USB to Voltacon Inverter',
      icon: Usb,
      badge: 'Direct USB Link',
      summary: 'Plug the USB cable directly from your Pi into the Voltacon inverter communication port.',
      command: 'ls -l /dev/ttyUSB*',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Connect a standard USB cable (Type A to Type B or RJ45-to-USB RS232 adapter) directly between the Raspberry Pi USB 2.0/3.0 port and the Voltacon inverter's communication port.
          </p>
          <p>Verify that Linux recognizes the USB serial interface:</p>
          <div className="bg-[#0a0d14] p-3 rounded-2xl border border-white/10 font-mono text-emerald-400 flex items-center justify-between">
            <span>$ ls -l /dev/ttyUSB*</span>
            <button
              onClick={() => copyText('check-usb', 'ls -l /dev/ttyUSB*')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {copiedKey === 'check-usb' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p>Grant permission to read/write serial without sudo:</p>
          <div className="bg-[#0a0d14] p-3 rounded-2xl border border-white/10 font-mono text-amber-300 flex items-center justify-between">
            <span>$ sudo usermod -aG dialout $USER</span>
            <button
              onClick={() => copyText('dialout-cmd', 'sudo usermod -aG dialout $USER')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {copiedKey === 'dialout-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'Step 4: Install Tollpower & Enable Auto-Start on Boot',
      icon: Power,
      badge: 'Auto-Run Daemon',
      summary: 'Setup Node.js and configure systemd so Tollpower starts whenever the Pi powers on.',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Run these commands on the Pi to install Node.js 20 LTS and clone Tollpower:</p>
          <div className="bg-[#0a0d14] p-3 rounded-2xl border border-white/10 font-mono text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-sky-300">
              <span>curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -</span>
              <button
                onClick={() => copyText('node-install', 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs git')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'node-install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-slate-500">sudo apt-get install -y nodejs git</div>
          </div>

          <p>Clone and build Tollpower:</p>
          <div className="bg-[#0a0d14] p-3 rounded-2xl border border-white/10 font-mono text-emerald-400 flex items-center justify-between">
            <span>git clone &lt;your-repo-url&gt; tollpower && cd tollpower && npm install</span>
            <button
              onClick={() => copyText('clone-cmd', 'git clone <your-repo-url> tollpower && cd tollpower && npm install')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {copiedKey === 'clone-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p>Create the systemd service so it boots automatically:</p>
          <div className="bg-[#0a0d14] p-3 rounded-2xl border border-white/10 font-mono text-amber-300 flex items-center justify-between">
            <span>sudo systemctl enable --now tollpower</span>
            <button
              onClick={() => copyText('service-cmd', 'sudo systemctl enable --now tollpower')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {copiedKey === 'service-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'Step 5: Access Dashboard on Mobile & Tablet',
      icon: Smartphone,
      badge: 'Everyday Use',
      summary: 'Open the responsive web app in Safari, Chrome or Firefox on your phone or tablet.',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Connect your phone or tablet to the same home Wi-Fi network as your Raspberry Pi.
          </p>
          <p>
            In your mobile browser, simply navigate to:
          </p>
          <div className="bg-[#0a0d14] p-3 rounded-2xl border border-white/10 font-mono text-sky-300 flex items-center justify-between">
            <span className="font-bold">http://tollpower.local:3000</span>
            <button
              onClick={() => copyText('browser-url', 'http://tollpower.local:3000')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {copiedKey === 'browser-url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-slate-400">
            Tip: You can use the <strong className="text-white">QR Code</strong> button in the top navigation bar to instantly open Tollpower on your phone with your camera app. Add it to your home screen for full-screen PWA app mode!
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#151822] border border-white/10 shadow-sm space-y-3">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 rounded-2xl bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Raspberry Pi Hardware Setup & Installation Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete steps to format the Pi, connect directly to the Voltacon inverter via USB, and run Tollpower 24/7.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isOpen = openSection === idx;
          const Icon = step.icon;

          return (
            <div
              key={idx}
              className="bg-[#151822] border border-white/10 rounded-3xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => {
                  sfx.playClick();
                  setOpenSection(isOpen ? -1 : idx);
                }}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isOpen 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white tracking-tight truncate">
                        {step.title}
                      </h3>
                      <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {step.summary}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 flex items-center">
                  {isOpen ? <ChevronDown className="w-5 h-5 text-amber-300" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-white/5">
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
