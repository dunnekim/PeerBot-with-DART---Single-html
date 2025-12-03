import React from 'react';
import { DartReportMeta } from '../types';
import { Building2, Calendar, FileText, Hash, AlertTriangle, CheckCircle2, BookOpen, Loader2, BarChart3 } from 'lucide-react';

interface ReportResultProps {
  data: DartReportMeta | null;
  error: string | null;
  onViewBusiness: () => void;
  isBusinessLoading: boolean;
  onViewFsSummary: () => void;
  isFsLoading: boolean;
}

export const ReportResult: React.FC<ReportResultProps> = ({ 
    data, 
    error, 
    onViewBusiness, 
    isBusinessLoading,
    onViewFsSummary,
    isFsLoading
}) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">검색 실패</h3>
        <p className="text-red-600 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center h-full flex flex-col items-center justify-center text-slate-400">
        <FileText className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg font-medium text-slate-500">선택된 보고서 없음</p>
        <p className="text-sm">회사명과 연도를 입력하여 메타데이터를 조회하세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
      {/* Card Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {data.corp_name}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            코드: <span className="font-mono text-slate-700">{data.corp_code}</span> 
            {data.stock_code && (
                <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                    {data.stock_code}
                </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">사업연도</span>
           <span className="text-2xl font-bold text-slate-800">{data.bsns_year}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Main Report Info */}
            <div className="col-span-1 md:col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">보고서명</p>
                        <p className="text-lg font-semibold text-slate-900 leading-snug">{data.report_nm}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Hash className="h-4 w-4" /> 접수번호
                </p>
                <p className="text-base font-mono text-slate-900 bg-slate-50 p-2 rounded border border-slate-100">
                    {data.rcept_no}
                </p>
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> 제출일자
                </p>
                <p className="text-base font-mono text-slate-900 bg-slate-50 p-2 rounded border border-slate-100">
                    {data.rcept_dt}
                </p>
            </div>

            <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">공시 상태</span>
                    {data.is_correction ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-4 h-4 mr-1.5" />
                            Correction (정정공시)
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Original (최초공시)
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-2 pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                    onClick={onViewBusiness}
                    disabled={isBusinessLoading || isFsLoading}
                    className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isBusinessLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>추출 중...</span>
                        </>
                    ) : (
                        <>
                            <BookOpen className="w-5 h-5" />
                            <span>사업의 내용 (Unit 2)</span>
                        </>
                    )}
                </button>

                <button
                    onClick={onViewFsSummary}
                    disabled={isFsLoading || isBusinessLoading}
                    className="flex items-center justify-center space-x-2 bg-green-700 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isFsLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>추출 중...</span>
                        </>
                    ) : (
                        <>
                            <BarChart3 className="w-5 h-5" />
                            <span>요약재무제표 (Unit 3)</span>
                        </>
                    )}
                </button>
            </div>
            <p className="col-span-1 md:col-span-2 text-xs text-center text-slate-400 mt-0">
                Unit 2는 "II. 사업의 내용" 원문을 추출하며, Unit 3는 요약재무제표를 파싱합니다.
            </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
         <span>출처: DART (금융감독원)</span>
         <span>Units 1, 2, 3 활성화됨</span>
      </div>
    </div>
  );
};