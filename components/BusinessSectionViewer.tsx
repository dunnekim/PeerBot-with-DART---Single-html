import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { DartBusinessSection } from '../types';

interface BusinessSectionViewerProps {
  data: DartBusinessSection | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessSectionViewer: React.FC<BusinessSectionViewerProps> = ({ data, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.business_section);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Business Overview</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {data.corp_code} | {data.bsns_year} Business Report
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white font-sans text-slate-800 leading-relaxed text-sm md:text-base">
          <pre className="whitespace-pre-wrap font-sans text-slate-700">
            {data.business_section}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 flex justify-between">
           <span>Unit 2: Business Section Parser</span>
           <span>Length: {data.business_section.length.toLocaleString()} chars</span>
        </div>
      </div>
    </div>
  );
};
