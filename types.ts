
export interface DartReportMeta {
  corp_name: string;
  corp_code: string;
  stock_code: string | null;
  bsns_year: number;
  rcept_no: string;
  report_nm: string;
  rcept_dt: string;
  is_correction: boolean;
}

export interface DartBusinessSection {
  corp_code: string;
  bsns_year: number;
  business_section: string;
}

export interface DartFsItem {
  item_name: string;
  raw_value: number;
  amount: number;
  source_row: string;
}

export interface DartFsTable {
  table_index: number;
  fs_type: string; // 'CONSOLIDATED' | 'SEPARATE' | 'UNKNOWN'
  unit_str: string;
  unit_multiplier: number;
  items: DartFsItem[];
}

export interface DartFsSummary {
  corp_code: string;
  bsns_year: number;
  tables: DartFsTable[];
}

export interface CorpEntry {
  corp_code: string;
  stock_code: string;
  corp_name: string;
  market: string; // 'KOSPI' | 'KOSDAQ' | 'OTHER'
  status: 'NOT_STARTED' | 'DONE' | 'FAILED';
  last_error?: string;
}

export interface ApiError {
  detail: string;
}

export interface SearchParams {
  corpName: string;
  year: number;
}

// Unit 6: PeerBot Interface Types

export interface PeerBotFsFlat {
  revenue?: number;
  operating_income?: number;
  net_income?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_equity?: number;
  operating_cf?: number;
  fs_type?: string;
}

export interface PeerBotCompanyProfile {
  corp_code: string;
  stock_code: string;
  corp_name: string;
  market: string;
  bsns_year: number;
  business_section: string | null;
  fs_summary_flat: PeerBotFsFlat | null;
  fs_summary_raw: DartFsSummary | null;
  report_meta: DartReportMeta | null;
  is_virtual?: boolean; // Unit 9
}

export interface PeerBotSearchResult {
  corp_code: string;
  corp_name: string;
  market: string;
}

// Unit 7: Peer Search Engine Types

export interface PeerBotPeer {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  market: string;
  similarity: number;
  scale_value: number;
  // Unit 10: Score Breakdown
  keyword_score?: number;
  cosine_score?: number;
}

// Unit 9: Virtual Peer Search Types
export interface VirtualCompanyInput {
  name: string;
  description: string;
  revenue?: number;
  total_assets?: number;
}

// Unit 11: Peer Exclusion Diagnostics
export interface PeerExclusionResult {
    corp_name: string;
    status: 'INCLUDED' | 'EXCLUDED';
    reason_code: 'SCALE_MISMATCH' | 'LOW_SIMILARITY' | 'DATA_PARSING_ERROR' | 'MARKET_MISMATCH' | 'NOT_FOUND';
    details: {
        metric_name?: string;
        target_value?: string; // e.g., "500B"
        company_value?: string; // e.g., "5000B"
        threshold_range?: string; // e.g., "100B - 1000B"
        score?: number;
        parsing_error_msg?: string;
    };
}

// Unit 12: Peer Explanation & Valuation Report Types
export interface PeerExplanation {
  corpCode: string;
  stockCode?: string;
  corpName: string;
  market?: string;

  // Scores & metrics used as basis
  similarity?: number;
  keywordScore?: number;
  cosineScore?: number;
  scaleMetric?: "revenue" | "totalAssets" | "totalEquity";
  scaleTarget?: number | null;   // e.g., target revenue
  scalePeer?: number | null;     // e.g., peer revenue

  // Generated text (Korean, full sentence)
  summary: string;        // “A사는 ~하기 때문에 피어로 선정되었습니다…”
  bulletPoints?: string[]; // optional, extra detail bullets
}

export interface PeerValuationReport {
  targetLabel: string;  // e.g. “삼성전자 (2024)” or “Virtual – 비상장 소비자금융사”
  year: number;

  // Tabular data used for tables / CSV export
  peersTable: Array<{
    corpCode: string;
    stockCode?: string;
    corpName: string;
    market?: string;

    similarity?: number;
    revenue?: number | null;
    operatingIncome?: number | null;
    netIncome?: number | null;
    totalAssets?: number | null;
    totalEquity?: number | null;
  }>;

  // Per-peer explanations
  peerExplanations: PeerExplanation[];

  // Text blocks for Word/Markdown
  rationaleText: string;        // 피어 셋 선정 사유 요약
  limitationsText: string;      // 한계 및 고려사항 (예: 데이터 누락/특수 케이스 등)
  notesText?: string;           // 추가 메모
}

// Unit 13: Peer Quality Lab Types

export interface GoldenPeerSet {
  id: string;                 // e.g. uuid
  targetCorpCode?: string;    // for listed target
  targetLabel: string;        // human-readable, e.g. "삼성전자 (2024)" or "Virtual – P2P 대출사"
  createdAt: string;          // ISO timestamp

  // Identifiers for peers considered "ground truth" for this target
  goldenPeers: Array<{
    corpCode: string;
    stockCode?: string;
    corpName?: string;
  }>;
}

export interface PeerQualityMetrics {
  k: number;

  // Basic
  precisionAtK: number;   // 0~1
  recallAtK: number;      // 0~1
  hitAtK: boolean;        // any golden peer in top-K?

  // Raw counts
  numGolden: number;
  numHits: number;
}

export interface PeerTuningParams {
  alpha: number;          // keyword weight (0~1)
  beta: number;           // cosine weight (0~1)
  sizeBandLow: number;    // e.g. 0.5
  sizeBandHigh: number;   // e.g. 2.0
  market?: "KOSPI" | "KOSDAQ" | "ALL";
  topK: number;           // e.g. 10
}

export interface PeerQualityEvalResult {
  targetLabel: string;
  targetCorpCode?: string;

  tuning: PeerTuningParams;

  golden: GoldenPeerSet;
  peers: PeerBotPeer[];
  metrics: PeerQualityMetrics;
}
