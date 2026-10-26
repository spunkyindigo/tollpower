import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Copy, Check, Wifi, Smartphone } from 'lucide-react';
import { sfx } from '../utils/sfx';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lanUrl: string;
  hostname: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  lanUrl,
  hostname,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && lanUrl) {
      QRCode.toDataURL(lanUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0d1017',
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [isOpen, lanUrl]);

  if (!isOpen) return null;

  const copyUrl = async () => {
    sfx.playCoin();
    try {
      await navigator.clipboard.writeText(lanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#151822] border border-white/10 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5 text-white">
            <span className="p-1.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Smartphone className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold tracking-tight">Connect Phone & Tablet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed text-left">
          Scan with your phone or tablet camera while connected to home Wi-Fi to open Tollpower:
        </p>

        {/* Clean Google Pixel style QR Card */}
        <div className="bg-white p-4 rounded-3xl inline-block mx-auto shadow-md">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Wi-Fi QR Code for Tollpower" className="w-48 h-48 mx-auto" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-500 text-xs">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* URL Box */}
        <div className="bg-[#0d1017] p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-sky-300 font-semibold truncate mr-2 select-all">{lanUrl}</span>
          <button
            onClick={copyUrl}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-center space-x-1.5 pt-1">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Home Network • Port 3000</span>
        </div>
      </div>
    </div>
  );
};
