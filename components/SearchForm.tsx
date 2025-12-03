import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface SearchFormProps {
  onSearch: (corpName: string, year: number) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [corpName, setCorpName] = useState('');
  const [year, setYear] = useState(2024);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (corpName.trim()) {
      onSearch(corpName.trim(), year);
    }
  };

  const handleSampleClick = (name: string) => {
    setCorpName(name);
    onSearch(name, year);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">데이터 탐색기 (수집봇)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="corpName" className="block text-sm font-medium text-slate-700 mb-1">
            회사명
          </label>
          <div className="relative">
            <input
              type="text"
              id="corpName"
              className="block w-full rounded-lg border-slate-300 border bg-slate-50 p-3 pl-10 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all"
              placeholder="예: 삼성전자"
              value={corpName}
              onChange={(e) => setCorpName(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1">
            사업연도
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="block w-full rounded-lg border-slate-300 border bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {[2024, 2023, 2022, 2021, 2020].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !corpName.trim()}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              DART 검색 중...
            </>
          ) : (
            '보고서 메타 조회'
          )}
        </button>
      </form>

      {/* Quick Samples for Unit 4 */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">빠른 샘플 (Unit 4)</p>
        <div className="grid grid-cols-2 gap-2">
            <button 
                type="button"
                onClick={() => handleSampleClick("삼성전자")}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-sm text-slate-600 transition-colors"
                disabled={isLoading}
            >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>삼성전자</span>
            </button>
            <button 
                type="button"
                onClick={() => handleSampleClick("미래에셋증권")}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-sm text-slate-600 transition-colors"
                disabled={isLoading}
            >
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span>미래에셋증권</span>
            </button>
        </div>
      </div>
    </div>
  );
};