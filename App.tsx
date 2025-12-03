import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { ReportResult } from './components/ReportResult';
import { BusinessSectionViewer } from './components/BusinessSectionViewer';
import { FinancialSummaryViewer } from './components/FinancialSummaryViewer';
import { UniverseViewer } from './components/UniverseViewer';
import { PeerBotViewer } from './components/PeerBotViewer';
import { fetchReportMeta, fetchBusinessSection, fetchFsSummary } from './services/dartService';
import { DartReportMeta, DartBusinessSection, DartFsSummary } from './types';
import { Server, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  // Unit 8: PeerBot is now the main view
  const [activeView, setActiveView] = useState<'search' | 'universe' | 'peerbot'>('peerbot');

  // Search View State
  const [reportData, setReportData] = useState<DartReportMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Unit 2 State
  const [businessData, setBusinessData] = useState<DartBusinessSection | null>(null);
  const [isBusinessLoading, setIsBusinessLoading] = useState(false);
  const [isBusinessViewerOpen, setIsBusinessViewerOpen] = useState(false);

  // Unit 3 State (Financial Summary)
  const [fsData, setFsData] = useState<DartFsSummary | null>(null);
  const [isFsLoading, setIsFsLoading] = useState(false);
  const [isFsViewerOpen, setIsFsViewerOpen] = useState(false);

  // Standalone Mode: Always True
  const useMockMode = true;

  const handleSearch = async (corpName: string, year: number) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    setBusinessData(null);
    setIsBusinessViewerOpen(false);
    setFsData(null);
    setIsFsViewerOpen(false);

    try {
      const data = await fetchReportMeta(corpName, year, useMockMode);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBusiness = async () => {
    if (!reportData) return;

    if (businessData) {
        setIsBusinessViewerOpen(true);
        return;
    }

    setIsBusinessLoading(true);
    try {
        const data = await fetchBusinessSection(
            reportData.corp_code, 
            reportData.rcept_no, 
            reportData.bsns_year, 
            useMockMode
        );
        setBusinessData(data);
        setIsBusinessViewerOpen(true);
    } catch (err: any) {
        alert(err.message || "Failed to load Business Section.");
    } finally {
        setIsBusinessLoading(false);
    }
  };

  const handleViewFsSummary = async () => {
    if (!reportData) return;

    if (fsData) {
        setIsFsViewerOpen(true);
        return;
    }

    setIsFsLoading(true);
    try {
        const data = await fetchFsSummary(
            reportData.corp_code, 
            reportData.rcept_no, 
            reportData.bsns_year, 
            useMockMode
        );
        setFsData(data);
        setIsFsViewerOpen(true);
    } catch (err: any) {
        alert(err.message || "Failed to load Financial Summary.");
    } finally {
        setIsFsLoading(false);
    }
  };

  const handleSelectFromUniverse = (corpName: string) => {
    setActiveView('search');
    handleSearch(corpName, 2024);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection Status Bar */}
        <div className="flex justify-between items-center mb-6">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800">
                     {activeView === 'peerbot' && 'PeerBot 워크스페이스'}
                     {activeView === 'search' && '데이터 탐색기 (수집봇)'}
                     {activeView === 'universe' && '수집 현황 대시보드'}
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">
                    {activeView === 'peerbot' && '메인 앱: 기업 분석 및 피어 탐색'}
                    {activeView === 'search' && '서브 도구: DART 원문 데이터 탐색 및 추출 로직 검증'}
                    {activeView === 'universe' && '서브 도구: 배치 수집 현황 모니터링'}
                 </p>
            </div>
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <WifiOff className="w-4 h-4" /> Standalone Mode
                </span>
                <div className="h-4 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center text-xs text-slate-400">
                    <Server className="w-3 h-3 mr-1" />
                    Offline / Browser-only
                </div>
            </div>
        </div>

        {activeView === 'search' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              <div className="lg:col-span-4 space-y-6">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                <div className="bg-slate-200/50 rounded-lg p-4 text-sm text-slate-600 border border-slate-200">
                    <h4 className="font-semibold mb-2 text-slate-700">데이터 소스 (수집봇)</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>이 화면은 <strong>DART 인제스트 봇</strong> 레이어에 연결됩니다.</li>
                        <li>Unit 1: 보고서 메타데이터 (Mock)</li>
                        <li>Unit 2: 사업의 내용 텍스트 (Mock)</li>
                    </ul>
                </div>
              </div>

              <div className="lg:col-span-8">
                 <ReportResult 
                    data={reportData} 
                    error={error} 
                    onViewBusiness={handleViewBusiness}
                    isBusinessLoading={isBusinessLoading}
                    onViewFsSummary={handleViewFsSummary}
                    isFsLoading={isFsLoading}
                 />
              </div>
            </div>
        )}

        {activeView === 'universe' && (
            <UniverseViewer 
                useMockMode={useMockMode} 
                onSelectCorp={handleSelectFromUniverse} 
            />
        )}

        {activeView === 'peerbot' && (
            <PeerBotViewer useMockMode={useMockMode} />
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} PeerBot. Standalone Offline Version.
            </p>
        </div>
      </footer>

      <BusinessSectionViewer 
        data={businessData}
        isOpen={isBusinessViewerOpen}
        onClose={() => setIsBusinessViewerOpen(false)}
      />

      <FinancialSummaryViewer
        data={fsData}
        isOpen={isFsViewerOpen}
        onClose={() => setIsFsViewerOpen(false)}
      />
    </div>
  );
};

export default App;