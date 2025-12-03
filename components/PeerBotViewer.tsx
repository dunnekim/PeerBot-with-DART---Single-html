import React, { useState, useEffect } from 'react';
import { Search, Loader2, Bot, Code2, Users, Play, Sparkles, CheckCircle2, FileText, Settings2, ClipboardList, ChevronRight, Building, FlaskConical, AlertTriangle, RefreshCw } from 'lucide-react';
import { PeerBotCompanyProfile, PeerBotSearchResult, PeerBotPeer, VirtualCompanyInput, PeerExclusionResult, PeerValuationReport, GoldenPeerSet, PeerTuningParams, PeerQualityEvalResult } from '../types';
import { searchPeerBotCompanies, fetchPeerBotProfile, findPeersForCorp, findPeersForVirtual, generatePeerValuationReport, generateMarkdownReport, generateCsvReport, listGoldenPeerSets, runPeerQualityEval, checkPeerExclusion } from '../services/dartService';

interface PeerBotViewerProps {
  useMockMode: boolean;
}

const MetricCard = ({ label, value, isText = false }: { label: string, value: string | number | undefined, isText?: boolean }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-bold text-slate-800 ${isText ? 'text-sm' : 'text-lg'}`}>{value ?? '-'}</p>
    </div>
);

const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    if (Math.abs(amount) >= 1000000000000) return `₩${(amount / 1000000000000).toFixed(1)}T`;
    if (Math.abs(amount) >= 1000000000) return `₩${(amount / 1000000000).toFixed(1)}B`;
    return `₩${amount.toLocaleString()}`;
};

export const PeerBotViewer: React.FC<PeerBotViewerProps> = ({ useMockMode }) => {
  const [mode, setMode] = useState<'virtual' | 'listed'>('virtual');
  
  // Search State (Listed)
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PeerBotSearchResult[]>([]);

  // Virtual Input State
  const [virtualInput, setVirtualInput] = useState<VirtualCompanyInput>({
      name: 'Virtual Corp',
      description: '핀테크 모바일 결제 플랫폼',
      revenue: 500000000000,
      total_assets: 1000000000000
  });

  // Profile & Core State
  const [profile, setProfile] = useState<PeerBotCompanyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'peers' | 'report' | 'lab'>('profile');

  // Peers State
  const [peers, setPeers] = useState<PeerBotPeer[]>([]);
  const [isFindingPeers, setIsFindingPeers] = useState(false);
  const [exclusionResults, setExclusionResults] = useState<Record<string, PeerExclusionResult>>({});

  // Valuation Report State
  const [valuationReport, setValuationReport] = useState<PeerValuationReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [exportCopied, setExportCopied] = useState<string | null>(null);

  // Quality Lab State
  const [goldenSets, setGoldenSets] = useState<GoldenPeerSet[]>([]);
  const [evalResult, setEvalResult] = useState<PeerQualityEvalResult | null>(null);
  const [tuningParams, setTuningParams] = useState<PeerTuningParams>({
      alpha: 0.7,
      beta: 0.3,
      sizeBandLow: 0.5,
      sizeBandHigh: 2.0,
      topK: 5,
      market: 'ALL'
  });

  // Load Golden Sets on mount
  useEffect(() => {
      setGoldenSets(listGoldenPeerSets());
  }, []);

  // --- Handlers ---

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSearching(true);
      try {
          const results = await searchPeerBotCompanies(query, 'name', useMockMode);
          setSearchResults(results);
      } finally {
          setIsSearching(false);
      }
  };

  const handleSelectCorp = async (corpCode: string) => {
      setIsLoadingProfile(true);
      try {
          const p = await fetchPeerBotProfile(corpCode, 2024, useMockMode);
          setProfile(p);
          setPeers([]);
          setValuationReport(null);
          setActiveTab('peers');
      } finally {
          setIsLoadingProfile(false);
      }
  };

  const handleSetVirtualProfile = () => {
      const p: PeerBotCompanyProfile = {
          corp_code: 'VIRTUAL_' + Date.now(),
          stock_code: 'N/A',
          corp_name: virtualInput.name,
          market: 'Private',
          bsns_year: 2024,
          business_section: virtualInput.description,
          fs_summary_flat: {
              revenue: virtualInput.revenue,
              total_assets: virtualInput.total_assets
          },
          fs_summary_raw: null,
          report_meta: null,
          is_virtual: true
      };
      setProfile(p);
      setPeers([]);
      setValuationReport(null);
      setActiveTab('peers');
  };

  const handleFindPeers = async () => {
      if (!profile) return;
      setIsFindingPeers(true);
      setExclusionResults({});
      try {
          let foundPeers: PeerBotPeer[] = [];
          if (profile.is_virtual) {
              const input: VirtualCompanyInput = {
                  name: profile.corp_name,
                  description: profile.business_section || '',
                  revenue: profile.fs_summary_flat?.revenue,
                  total_assets: profile.fs_summary_flat?.total_assets
              };
              foundPeers = await findPeersForVirtual(input, useMockMode, tuningParams);
          } else {
              foundPeers = await findPeersForCorp(profile.corp_code, 2024, useMockMode, tuningParams);
          }
          setPeers(foundPeers);
          
          // Auto run diagnostics for top 3
          foundPeers.slice(0, 3).forEach(p => checkExclusion(p));

      } finally {
          setIsFindingPeers(false);
      }
  };

  const checkExclusion = async (peer: PeerBotPeer) => {
      if (!profile) return;
      const res = await checkPeerExclusion(peer.corp_name, {
          targetScale: profile.fs_summary_flat?.revenue,
          description: profile.business_section || undefined
      }, useMockMode);
      setExclusionResults(prev => ({ ...prev, [peer.corp_code]: res }));
  };

  const handleGenerateReport = async () => {
      if (!profile || peers.length === 0) return;
      setIsGeneratingReport(true);
      try {
          const report = await generatePeerValuationReport({
              target: profile,
              peers: peers,
              year: 2024
          });
          setValuationReport(report);
          setActiveTab('report');
      } finally {
          setIsGeneratingReport(false);
      }
  };

  const handleRunEval = async (goldenSetId: string) => {
      const golden = goldenSets.find(g => g.id === goldenSetId);
      if (!golden || !profile) return;
      
      const res = await runPeerQualityEval({
          target: profile,
          tuning: tuningParams,
          golden,
          useMock: useMockMode
      });
      setEvalResult(res);
  };

  const copyToClipboard = (text: string, type: string) => {
      navigator.clipboard.writeText(text);
      setExportCopied(type);
      setTimeout(() => setExportCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in pb-24">
      
      {/* LEFT SIDEBAR: CONFIG & INPUT */}
      <div className="lg:col-span-4 space-y-6">
          
          {/* Mode Switcher */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex">
              <button 
                onClick={() => setMode('virtual')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'virtual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                  <Code2 className="w-4 h-4" /> Virtual Company
              </button>
              <button 
                onClick={() => setMode('listed')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'listed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                  <Building className="w-4 h-4" /> Listed Company
              </button>
          </div>

          {/* Input Forms */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {mode === 'listed' ? (
                  <div className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Search className="w-5 h-5 text-indigo-600" />
                          Company Search
                      </h2>
                      <form onSubmit={handleSearch} className="relative">
                          <input 
                              type="text" 
                              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Search by name (e.g. Samsung)"
                              value={query}
                              onChange={e => setQuery(e.target.value)}
                          />
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      </form>
                      
                      {isSearching ? (
                          <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                      ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                              {searchResults.map(corp => (
                                  <button
                                      key={corp.corp_code}
                                      onClick={() => handleSelectCorp(corp.corp_code)}
                                      className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group"
                                  >
                                      <div className="flex justify-between items-center">
                                          <span className="font-medium text-slate-800">{corp.corp_name}</span>
                                          <span className="text-xs text-slate-400 group-hover:text-indigo-500">{corp.market}</span>
                                      </div>
                                      <div className="text-xs text-slate-500 mt-1">{corp.corp_code}</div>
                                  </button>
                              ))}
                              {searchResults.length === 0 && query && (
                                  <p className="text-center text-sm text-slate-400 py-2">No results found</p>
                              )}
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Settings2 className="w-5 h-5 text-indigo-600" />
                          Virtual Profile
                      </h2>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                          <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              value={virtualInput.name}
                              onChange={e => setVirtualInput({...virtualInput, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Business Description</label>
                          <textarea 
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 text-sm"
                              value={virtualInput.description}
                              onChange={e => setVirtualInput({...virtualInput, description: e.target.value})}
                              placeholder="Describe the business model, key products, and industry..."
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Revenue (KRW)</label>
                              <input 
                                  type="number" 
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                  value={virtualInput.revenue || ''}
                                  onChange={e => setVirtualInput({...virtualInput, revenue: Number(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Assets (KRW)</label>
                              <input 
                                  type="number" 
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                  value={virtualInput.total_assets || ''}
                                  onChange={e => setVirtualInput({...virtualInput, total_assets: Number(e.target.value)})}
                              />
                          </div>
                      </div>
                      <button 
                          onClick={handleSetVirtualProfile}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                          <Sparkles className="w-4 h-4" /> Set Profile
                      </button>
                  </div>
              )}
          </div>

          {/* Tuning Params Panel (Unit 13) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-slate-500" /> Search Tuning
              </h3>
              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between text-xs mb-1">
                          <span>Alpha (Keyword Weight)</span>
                          <span className="font-mono">{tuningParams.alpha}</span>
                      </div>
                      <input 
                          type="range" min="0" max="1" step="0.1" 
                          value={tuningParams.alpha}
                          onChange={e => setTuningParams({...tuningParams, alpha: parseFloat(e.target.value)})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                  </div>
                  <div>
                      <div className="flex justify-between text-xs mb-1">
                          <span>Size Band (Low/High)</span>
                          <span className="font-mono">{tuningParams.sizeBandLow}x - {tuningParams.sizeBandHigh}x</span>
                      </div>
                      <div className="flex gap-2">
                          <input 
                              type="number" step="0.1"
                              value={tuningParams.sizeBandLow}
                              onChange={e => setTuningParams({...tuningParams, sizeBandLow: parseFloat(e.target.value)})}
                              className="w-full px-2 py-1 text-xs border rounded"
                          />
                          <input 
                              type="number" step="0.1"
                              value={tuningParams.sizeBandHigh}
                              onChange={e => setTuningParams({...tuningParams, sizeBandHigh: parseFloat(e.target.value)})}
                              className="w-full px-2 py-1 text-xs border rounded"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="lg:col-span-8">
          
          {/* Main Tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit overflow-x-auto">
              <button 
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Target Profile
              </button>
              <button 
                  onClick={() => setActiveTab('peers')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'peers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Peer Candidates ({peers.length})
              </button>
              <button 
                  onClick={() => setActiveTab('report')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Valuation Report
              </button>
              <button 
                  onClick={() => setActiveTab('lab')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'lab' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Quality Lab
              </button>
          </div>

          {/* CONTENT: PROFILE */}
          {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                  {!profile ? (
                      <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center text-slate-400">
                          <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>Select a company or set a virtual profile to begin.</p>
                      </div>
                  ) : (
                      <>
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                  <div>
                                      <h2 className="text-xl font-bold text-slate-800">{profile.corp_name}</h2>
                                      <p className="text-sm text-slate-500 flex items-center gap-2">
                                          {profile.is_virtual ? <Code2 className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                                          {profile.market} | {profile.corp_code}
                                      </p>
                                  </div>
                                  <button 
                                      onClick={handleFindPeers}
                                      disabled={isFindingPeers}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-70 transition-colors"
                                  >
                                      {isFindingPeers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                      Find Peers
                                  </button>
                              </div>
                              <div className="p-6">
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Business Overview</h4>
                                  <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto mb-6">
                                      {profile.business_section || "No description available."}
                                  </div>

                                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Financial Scale (2024 Est.)</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <MetricCard label="Revenue" value={formatCurrency(profile.fs_summary_flat?.revenue)} />
                                      <MetricCard label="Op. Income" value={formatCurrency(profile.fs_summary_flat?.operating_income)} />
                                      <MetricCard label="Net Income" value={formatCurrency(profile.fs_summary_flat?.net_income)} />
                                      <MetricCard label="Total Assets" value={formatCurrency(profile.fs_summary_flat?.total_assets)} />
                                  </div>
                              </div>
                          </div>
                      </>
                  )}
              </div>
          )}

          {/* CONTENT: PEERS */}
          {activeTab === 'peers' && (
              <div className="space-y-6 animate-fade-in">
                  {peers.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center text-slate-400">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>No peers found yet. Click "Find Peers" on the Profile tab.</p>
                      </div>
                  ) : (
                      <>
                          <div className="flex justify-between items-center">
                              <h3 className="text-lg font-bold text-slate-800">Peer Candidates</h3>
                              <button 
                                  onClick={handleGenerateReport}
                                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                              >
                                  Generate Valuation Report <ChevronRight className="w-4 h-4" />
                              </button>
                          </div>
                          
                          <div className="grid gap-4">
                              {peers.map((peer, idx) => (
                                  <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-indigo-300 transition-colors">
                                      <div className="flex justify-between items-start">
                                          <div className="flex items-start gap-3">
                                              <div className="bg-indigo-50 text-indigo-700 font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center">
                                                  {idx + 1}
                                              </div>
                                              <div>
                                                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                      {peer.corp_name}
                                                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-normal">{peer.market}</span>
                                                  </h4>
                                                  <p className="text-sm text-slate-500">{peer.stock_code}</p>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <div className="text-2xl font-bold text-indigo-600">{(peer.similarity * 100).toFixed(0)}%</div>
                                              <div className="text-xs text-slate-400">Similarity</div>
                                          </div>
                                      </div>
                                      
                                      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                          <div>
                                              <p className="text-xs text-slate-400">Scale (Revenue)</p>
                                              <p className="font-semibold text-slate-700">{formatCurrency(peer.scale_value)}</p>
                                          </div>
                                          <div>
                                               {/* Diagnostics Badge */}
                                               {exclusionResults[peer.corp_code] ? (
                                                   exclusionResults[peer.corp_code].status === 'EXCLUDED' ? (
                                                       <div className="flex items-center text-red-600 gap-1 text-sm font-medium">
                                                           <AlertTriangle className="w-4 h-4" /> Warning: {exclusionResults[peer.corp_code].reason_code}
                                                       </div>
                                                   ) : (
                                                       <div className="flex items-center text-green-600 gap-1 text-sm font-medium">
                                                           <CheckCircle2 className="w-4 h-4" /> Verified Peer
                                                       </div>
                                                   )
                                               ) : (
                                                   <button 
                                                       onClick={() => checkExclusion(peer)}
                                                       className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                   >
                                                       Run Diagnostics <RefreshCw className="w-3 h-3" />
                                                   </button>
                                               )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </>
                  )}
              </div>
          )}

          {/* CONTENT: REPORT */}
          {activeTab === 'report' && (
              <div className="space-y-6 animate-fade-in">
                  {!valuationReport ? (
                      <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center text-slate-400">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>Generate a report from the Peers tab.</p>
                      </div>
                  ) : (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                              <div>
                                  <h2 className="text-lg font-bold">Peer Valuation Report</h2>
                                  <p className="text-xs text-slate-400">{valuationReport.targetLabel} | {valuationReport.year}</p>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => copyToClipboard(generateMarkdownReport(valuationReport), 'md')} className="p-2 hover:bg-slate-700 rounded transition-colors" title="Copy Markdown">
                                      {exportCopied === 'md' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <FileText className="w-5 h-5" />}
                                  </button>
                                  <button onClick={() => copyToClipboard(generateCsvReport(valuationReport), 'csv')} className="p-2 hover:bg-slate-700 rounded transition-colors" title="Copy CSV">
                                      {exportCopied === 'csv' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <ClipboardList className="w-5 h-5" />}
                                  </button>
                              </div>
                          </div>
                          
                          <div className="p-8 space-y-8">
                              <section>
                                  <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-2">1. Selection Rationale</h3>
                                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{valuationReport.rationaleText}</p>
                              </section>

                              <section>
                                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">2. Peer Comparison</h3>
                                  <div className="overflow-x-auto">
                                      <table className="min-w-full text-sm text-left">
                                          <thead className="bg-slate-50 text-slate-500 font-medium">
                                              <tr>
                                                  <th className="px-4 py-2 rounded-l-lg">Company</th>
                                                  <th className="px-4 py-2">Similarity</th>
                                                  <th className="px-4 py-2">Revenue</th>
                                                  <th className="px-4 py-2 rounded-r-lg">Op. Income</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                              {valuationReport.peersTable.map((p, i) => (
                                                  <tr key={i}>
                                                      <td className="px-4 py-3 font-medium text-slate-800">{p.corpName}</td>
                                                      <td className="px-4 py-3 text-indigo-600 font-bold">{(p.similarity! * 100).toFixed(1)}%</td>
                                                      <td className="px-4 py-3 text-slate-600">{formatCurrency(p.revenue)}</td>
                                                      <td className="px-4 py-3 text-slate-600">{formatCurrency(p.operatingIncome)}</td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  </div>
                              </section>

                              <section>
                                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">3. Detailed Analysis</h3>
                                  <div className="grid gap-4">
                                      {valuationReport.peerExplanations.map((exp, i) => (
                                          <div key={i} className="bg-slate-50 p-4 rounded-lg">
                                              <div className="font-bold text-slate-800 mb-1">{exp.corpName}</div>
                                              <p className="text-sm text-slate-600">{exp.summary}</p>
                                          </div>
                                      ))}
                                  </div>
                              </section>

                              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                                  <strong>Limitations:</strong> {valuationReport.limitationsText}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

           {/* CONTENT: LAB */}
           {activeTab === 'lab' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-800">Peer Quality Lab</h2>
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">Unit 13</span>
                  </div>
                  
                  <div className="grid gap-6">
                      {goldenSets.map(set => (
                          <div key={set.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <h3 className="font-bold text-slate-800">{set.targetLabel}</h3>
                                      <p className="text-xs text-slate-500">Golden Set ID: {set.id}</p>
                                  </div>
                                  <button 
                                      onClick={() => handleRunEval(set.id)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2"
                                  >
                                      <Play className="w-3 h-3" /> Run Eval
                                  </button>
                              </div>

                              <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
                                  <span className="font-semibold text-slate-600 block mb-1">Ground Truth Peers:</span>
                                  <div className="flex flex-wrap gap-2">
                                      {set.goldenPeers.map(gp => (
                                          <span key={gp.corpCode} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs">
                                              {gp.corpName}
                                          </span>
                                      ))}
                                  </div>
                              </div>

                              {evalResult?.golden.id === set.id && (
                                  <div className="border-t border-slate-100 pt-4 animate-fade-in">
                                      <h4 className="text-sm font-bold text-slate-800 mb-3">Evaluation Results</h4>
                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                          <MetricCard label="Precision @ K" value={(evalResult.metrics.precisionAtK * 100).toFixed(1) + '%'} isText />
                                          <MetricCard label="Recall @ K" value={(evalResult.metrics.recallAtK * 100).toFixed(1) + '%'} isText />
                                      </div>
                                      <p className="text-xs text-slate-500 text-center">
                                          Retrieved {evalResult.metrics.numHits} golden peers out of {evalResult.metrics.numGolden} total.
                                      </p>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
           )}

      </div>
    </div>
  );
};