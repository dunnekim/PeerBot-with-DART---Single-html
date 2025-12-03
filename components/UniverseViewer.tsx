import React, { useState, useEffect } from 'react';
import { fetchUniverse } from '../services/dartService';
import { CorpEntry } from '../types';
import { Search, Loader2, CheckCircle2, XCircle, Clock, Filter, PlayCircle, BarChart3 } from 'lucide-react';

interface UniverseViewerProps {
  useMockMode: boolean;
  onSelectCorp: (corpName: string) => void;
}

export const UniverseViewer: React.FC<UniverseViewerProps> = ({ useMockMode, onSelectCorp }) => {
  const [data, setData] = useState<CorpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'KOSPI' | 'KOSDAQ'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DONE' | 'FAILED' | 'NOT_STARTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchUniverse(useMockMode);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [useMockMode]);

  // Derived Data
  const filteredData = data.filter(item => {
    const matchesMarket = filterMarket === 'ALL' || item.market === filterMarket;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = item.corp_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.corp_code.includes(searchTerm) || 
                          item.stock_code.includes(searchTerm);
    return matchesMarket && matchesStatus && matchesSearch;
  });

  const stats = {
    total: data.length,
    done: data.filter(i => i.status === 'DONE').length,
    failed: data.filter(i => i.status === 'FAILED').length,
    pending: data.filter(i => i.status === 'NOT_STARTED').length,
  };

  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Batch Progress</p>
             <p className="text-2xl font-bold text-slate-800">{progress}%</p>
           </div>
           <div className="p-3 bg-blue-50 rounded-lg">
             <BarChart3 className="w-6 h-6 text-blue-600" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Completed</p>
             <p className="text-2xl font-bold text-green-600">{stats.done}</p>
           </div>
           <div className="p-3 bg-green-50 rounded-lg">
             <CheckCircle2 className="w-6 h-6 text-green-600" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Failed</p>
             <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
           </div>
           <div className="p-3 bg-red-50 rounded-lg">
             <XCircle className="w-6 h-6 text-red-600" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Pending</p>
             <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
           </div>
           <div className="p-3 bg-slate-100 rounded-lg">
             <Clock className="w-6 h-6 text-slate-500" />
           </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search company..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                    />
                </div>
                
                <div className="h-8 w-px bg-slate-300 mx-2 hidden md:block"></div>
                
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select 
                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                        value={filterMarket}
                        onChange={(e) => setFilterMarket(e.target.value as any)}
                    >
                        <option value="ALL">All Markets</option>
                        <option value="KOSPI">KOSPI</option>
                        <option value="KOSDAQ">KOSDAQ</option>
                    </select>
                    <select 
                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="DONE">Done</option>
                        <option value="FAILED">Failed</option>
                        <option value="NOT_STARTED">Not Started</option>
                    </select>
                </div>
            </div>
            <div className="text-xs text-slate-500">
                Showing {filteredData.length} companies
            </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Market</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name / Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Error</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span>Loading Universe Data...</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredData.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                No companies found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        filteredData.map((corp) => (
                            <tr key={corp.corp_code} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        corp.market === 'KOSPI' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                            : 'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                        {corp.market}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-900">{corp.corp_name}</span>
                                        <span className="text-xs text-slate-500 font-mono">{corp.corp_code} ({corp.stock_code})</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {corp.status === 'DONE' && (
                                        <span className="inline-flex items-center text-xs font-medium text-green-700">
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Done
                                        </span>
                                    )}
                                    {corp.status === 'FAILED' && (
                                        <span className="inline-flex items-center text-xs font-medium text-red-700">
                                            <XCircle className="w-4 h-4 mr-1.5" /> Failed
                                        </span>
                                    )}
                                    {corp.status === 'NOT_STARTED' && (
                                        <span className="inline-flex items-center text-xs font-medium text-slate-400">
                                            <Clock className="w-4 h-4 mr-1.5" /> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-red-500 max-w-xs truncate">
                                    {corp.last_error || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => onSelectCorp(corp.corp_name)}
                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        View Report <PlayCircle className="w-4 h-4 ml-1" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
