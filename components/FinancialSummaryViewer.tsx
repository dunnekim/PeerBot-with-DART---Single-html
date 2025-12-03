import React, { useState } from 'react';
import { X, Table2, Layers, DollarSign } from 'lucide-react';
import { DartFsSummary, DartFsTable } from '../types';

interface FinancialSummaryViewerProps {
  data: DartFsSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
  // Format to Trillions (조), Billions (억), or Millions (백만)
  if (Math.abs(amount) >= 1000000000000) {
    return `₩${(amount / 1000000000000).toFixed(2)} T`; // Trillion
  }
  if (Math.abs(amount) >= 1000000000) {
    return `₩${(amount / 1000000000).toFixed(2)} B`; // Billion
  }
  return `₩${amount.toLocaleString()}`;
};

export const FinancialSummaryViewer: React.FC<FinancialSummaryViewerProps> = ({ data, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen || !data) return null;

  const activeTable = data.tables[activeTab];

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
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Financial Summary
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {data.corp_code} | {data.bsns_year} Business Report
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Table Tabs */}
        {data.tables.length > 0 && (
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 space-x-2 pt-2">
            {data.tables.map((table, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                  activeTab === idx
                    ? 'bg-white text-blue-700 border-t border-x border-slate-200 -mb-px relative z-10'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {table.fs_type === 'CONSOLIDATED' ? (
                  <Layers className="w-4 h-4" />
                ) : (
                  <Table2 className="w-4 h-4" />
                )}
                <span>
                  {table.fs_type === 'CONSOLIDATED' ? 'Consolidated (연결)' : 'Separate (별도)'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-0 overflow-y-auto bg-white flex-grow">
          {activeTable ? (
            <div className="min-w-full">
              {/* Table Meta */}
              <div className="px-6 py-3 bg-blue-50/30 text-xs text-slate-500 flex justify-between items-center border-b border-slate-100">
                <span>Original Unit: <strong>{activeTable.unit_str}</strong> (Multiplier: {activeTable.unit_multiplier.toLocaleString()})</span>
                <span>Values converted to KRW</span>
              </div>

              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Raw Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Calculated Amount (KRW)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {activeTable.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                        {item.item_name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 text-right font-mono">
                        {item.raw_value.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-900 text-right font-mono font-semibold">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="p-12 text-center text-slate-400">
               No summary tables found in this report.
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 flex justify-between">
           <span>Unit 3: Financial Summary Parser</span>
           <span>Table Index: {activeTable?.table_index ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};