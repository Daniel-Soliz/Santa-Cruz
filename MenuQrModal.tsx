import React, { useState, useEffect } from 'react';
import { X, QrCode, Download, Printer, Copy, Check, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface MenuQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuQrModal: React.FC<MenuQrModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const menuUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/#/cardapio` 
    : 'https://deliciadonordeste.com.br/#/cardapio';

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.getQrCode(menuUrl)
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Error generating QR', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, menuUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'qrcode-cardapio-casa-do-norte-santa-cruz.png';
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-amber-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#722238] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-[#F9D71C]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base">QR Code do Cardápio Digital</h3>
              <p className="text-xs text-amber-200/80">Placas e displays para as mesas</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          <p className="text-xs text-stone-600">
            Aponte a câmera do celular para abrir o cardápio oficial da <strong>Casa do Norte Santa Cruz</strong>.
          </p>

          {/* QR Container ready for Table Display */}
          <div className="p-6 rounded-2xl bg-[#FFF8EC] border-2 border-dashed border-[#D4AF37] inline-block shadow-inner">
            <div className="w-12 h-12 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F9D71C] shadow-sm mb-2">
              <img 
                src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                alt="Logo Casa do Norte" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <p className="font-heading font-extrabold text-[#722238] text-sm uppercase tracking-wider mb-2">
              Cardápio Digital
            </p>

            {isLoading ? (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-stone-400">
                Gerando QR Code oficial...
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code do Cardápio" 
                className="w-48 h-48 object-contain mx-auto rounded-lg shadow-sm bg-white p-2"
              />
            ) : null}

            <p className="text-[11px] text-stone-500 font-semibold mt-2">
              Unidade Santa Cruz • Delícia do Nordeste
            </p>
          </div>

          {/* Link display & copy */}
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between gap-2">
            <span className="truncate text-stone-600 text-left font-mono text-[11px]">
              {menuUrl}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-white text-stone-700 border border-stone-300 rounded-lg text-[11px] font-bold hover:bg-stone-100 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Download & Print buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="py-2.5 px-4 rounded-xl bg-stone-800 text-white font-bold text-xs hover:bg-stone-900 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar PNG (Alta Res)
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs hover:bg-[#E8C60B] border border-amber-400 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Display
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
