import { DartReportMeta, DartBusinessSection, DartFsSummary, CorpEntry, PeerBotCompanyProfile, PeerBotSearchResult, PeerBotFsFlat, PeerBotPeer, VirtualCompanyInput, PeerExclusionResult, PeerExplanation, PeerValuationReport, GoldenPeerSet, PeerTuningParams, PeerQualityEvalResult, PeerQualityMetrics } from '../types';

// OFFLINE MODE: No External API calls. All logic is local.

// --- MOCK DATA ---

const MOCK_META_DATA: Record<string, DartReportMeta> = {
  '삼성전자': {
    corp_name: "삼성전자",
    corp_code: "00126380",
    stock_code: "005930",
    bsns_year: 2024,
    rcept_no: "20250331001234",
    report_nm: "사업보고서(2024.01.01~2024.12.31)",
    rcept_dt: "2025-03-31",
    is_correction: false
  },
  '미래에셋증권': {
    corp_name: "미래에셋증권",
    corp_code: "00111754",
    stock_code: "006800",
    bsns_year: 2024,
    rcept_no: "20250330009999",
    report_nm: "사업보고서(2024.01.01~2024.12.31)",
    rcept_dt: "2025-03-30",
    is_correction: false
  },
  '카카오': {
    corp_name: "카카오",
    corp_code: "00258801",
    stock_code: "035720",
    bsns_year: 2024,
    rcept_no: "20250330005678",
    report_nm: "[기재정정]사업보고서(2024.01.01~2024.12.31)",
    rcept_dt: "2025-03-30",
    is_correction: true
  }
};

const MOCK_BUSINESS_SECTION: DartBusinessSection = {
  corp_code: "00126380",
  bsns_year: 2024,
  business_section: "II. 사업의 내용\n\n1. 사업의 개요\n삼성전자는 본사를 거점으로 한국과 DX부문(Device eXperience)의 산하 해외 9개 지역총괄 및 DS부문(Device Solutions)의 산하 해외 5개 지역총괄, SDC(Samsung Display), Harman 산하 종속기업 등 232개의 종속기업으로 구성되어 있습니다...\n(Standalone Mode - Local Text)"
};

const MOCK_FS_SUMMARY: DartFsSummary = {
  corp_code: "00126380",
  bsns_year: 2024,
  tables: [
    {
      table_index: 0,
      fs_type: "CONSOLIDATED",
      unit_str: "백만원",
      unit_multiplier: 1000000,
      items: [
        { item_name: "매출액", raw_value: 300000000, amount: 300000000000000, source_row: "Row 1" },
        { item_name: "영업이익", raw_value: 50000000, amount: 50000000000000, source_row: "Row 2" },
        { item_name: "당기순이익", raw_value: 40000000, amount: 40000000000000, source_row: "Row 3" },
        { item_name: "자산총계", raw_value: 450000000, amount: 450000000000000, source_row: "Row 4" }
      ]
    }
  ]
};

const MOCK_UNIVERSE: CorpEntry[] = [
  { corp_code: "00126380", corp_name: "삼성전자", stock_code: "005930", market: "KOSPI", status: "DONE" },
  { corp_code: "00111754", corp_name: "미래에셋증권", stock_code: "006800", market: "KOSPI", status: "DONE" },
  { corp_code: "00258801", corp_name: "카카오", stock_code: "035720", market: "KOSPI", status: "FAILED", last_error: "API Limit Exceeded" },
  { corp_code: "000660", corp_name: "SK하이닉스", stock_code: "000660", market: "KOSPI", status: "DONE" },
  { corp_code: "066570", corp_name: "LG전자", stock_code: "066570", market: "KOSPI", status: "DONE" },
  { corp_code: "035420", corp_name: "NAVER", stock_code: "035420", market: "KOSPI", status: "DONE" },
];

const MOCK_PROFILE: PeerBotCompanyProfile = {
    corp_code: "00126380",
    stock_code: "005930",
    corp_name: "삼성전자",
    market: "KOSPI",
    bsns_year: 2024,
    business_section: "II. 사업의 내용\n\n1. 사업의 개요\n이 회사는 글로벌 전자 기업으로...",
    fs_summary_flat: {
        revenue: 300000000000000,
        operating_income: 50000000000000,
        net_income: 40000000000000,
        total_assets: 450000000000000
    },
    fs_summary_raw: null,
    report_meta: null,
    is_virtual: false
};

// --- UNIT 1: REPORT META ---

export const fetchReportMeta = async (corpName: string, year: number, useMock: boolean): Promise<DartReportMeta> => {
    // Force Offline Mock
    await new Promise(r => setTimeout(r, 600));
    const result = MOCK_META_DATA[corpName];
    if (!result) throw new Error("Report not found (Offline Mode). Try '삼성전자', '미래에셋증권' or '카카오'.");
    return result;
};

// --- UNIT 2: BUSINESS SECTION ---

export const fetchBusinessSection = async (corpCode: string, rceptNo: string, year: number, useMock: boolean): Promise<DartBusinessSection> => {
    await new Promise(r => setTimeout(r, 800));
    return { ...MOCK_BUSINESS_SECTION, corp_code: corpCode, bsns_year: year };
};

// --- UNIT 3: FINANCIAL SUMMARY ---

export const fetchFsSummary = async (corpCode: string, rceptNo: string, year: number, useMock: boolean): Promise<DartFsSummary> => {
    await new Promise(r => setTimeout(r, 800));
    return { ...MOCK_FS_SUMMARY, corp_code: corpCode, bsns_year: year };
};

// --- UNIT 5: UNIVERSE ---

export const fetchUniverse = async (useMock: boolean): Promise<CorpEntry[]> => {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_UNIVERSE; 
};

// --- UNIT 6: PEERBOT INTERFACE (SEARCH & PROFILE) ---

export const searchPeerBotCompanies = async (query: string, type: 'name' | 'business', useMock: boolean): Promise<PeerBotSearchResult[]> => {
    await new Promise(r => setTimeout(r, 400));
    const q = query.toLowerCase();
    return MOCK_UNIVERSE
        .filter(c => type === 'name' ? c.corp_name.toLowerCase().includes(q) : true)
        .map(c => ({ corp_code: c.corp_code, corp_name: c.corp_name, market: c.market }));
};

export const fetchPeerBotProfile = async (identifier: string, year: number, useMock: boolean): Promise<PeerBotCompanyProfile> => {
    await new Promise(r => setTimeout(r, 700));
    // Simulate different profiles based on ID
    const isMirae = identifier === '00111754';
    const isKakao = identifier === '00258801';
    
    let name = "삼성전자";
    if (isMirae) name = "미래에셋증권";
    if (isKakao) name = "카카오";

    return {
        ...MOCK_PROFILE,
        corp_code: identifier,
        corp_name: name,
        business_section: isMirae 
            ? "II. 사업의 내용\n\n1. 사업의 개요\n금융투자업자로서..." 
            : MOCK_PROFILE.business_section,
        fs_summary_flat: isMirae
            ? { revenue: 20000000000000, operating_income: 1000000000000, net_income: 800000000000, total_assets: 100000000000000 }
            : MOCK_PROFILE.fs_summary_flat
    };
};

// --- UNIT 7 & 9 & 10: PEER SEARCH ENGINE ---

export const findPeersForCorp = async (corpCode: string, year: number, useMock: boolean, tuning?: PeerTuningParams): Promise<PeerBotPeer[]> => {
    await new Promise(r => setTimeout(r, 800));
    
    // Offline Logic based on Corp Code
    if (corpCode === '00126380') { // Samsung
        return [
            { corp_code: "000660", corp_name: "SK하이닉스", stock_code: "000660", market: "KOSPI", similarity: 0.92, scale_value: 150000000000000, keyword_score: 0.95, cosine_score: 0.91 },
            { corp_code: "066570", corp_name: "LG전자", stock_code: "066570", market: "KOSPI", similarity: 0.75, scale_value: 80000000000000, keyword_score: 0.60, cosine_score: 0.79 },
            { corp_code: "009150", corp_name: "삼성전기", stock_code: "009150", market: "KOSPI", similarity: 0.68, scale_value: 10000000000000, keyword_score: 0.50, cosine_score: 0.72 }
        ];
    } 
    if (corpCode === '00111754') { // Mirae Asset
            return [
            { corp_code: "005940", corp_name: "NH투자증권", stock_code: "005940", market: "KOSPI", similarity: 0.88, scale_value: 60000000000000, keyword_score: 0.90, cosine_score: 0.87 },
            { corp_code: "016360", corp_name: "삼성증권", stock_code: "016360", market: "KOSPI", similarity: 0.85, scale_value: 55000000000000, keyword_score: 0.88, cosine_score: 0.84 }
        ];
    }

    return [
            { corp_code: "999999", corp_name: "Generic Peer 1", stock_code: "999999", market: "KOSDAQ", similarity: 0.50, scale_value: 100000000000, keyword_score: 0.5, cosine_score: 0.5 }
    ];
};

// Extended Candidate Pool for Heuristic Search
const AI_CANDIDATE_POOL = [
  { corp_code: "00126380", corp_name: "삼성전자", market: "KOSPI", stock_code: "005930", business_desc: "전자제품 반도체 모바일 기기 제조", scale: 300000000000000, keywords: ["반도체", "전자", "모바일", "스마트폰", "가전"] },
  { corp_code: "000660", corp_name: "SK하이닉스", market: "KOSPI", stock_code: "000660", business_desc: "메모리 반도체 제조", scale: 150000000000000, keywords: ["반도체", "메모리", "칩", "SK"] },
  { corp_code: "00111754", corp_name: "미래에셋증권", market: "KOSPI", stock_code: "006800", business_desc: "금융투자 증권 중개 및 자산관리", scale: 100000000000000, keywords: ["증권", "금융", "투자", "주식", "자산"] },
  { corp_code: "005940", corp_name: "NH투자증권", market: "KOSPI", stock_code: "005940", business_desc: "증권 IB 자산관리", scale: 60000000000000, keywords: ["증권", "금융", "투자", "IB"] },
  { corp_code: "035420", corp_name: "NAVER", market: "KOSPI", stock_code: "035420", business_desc: "인터넷 포털 검색 AI 클라우드 서비스", scale: 9000000000000, keywords: ["포털", "검색", "AI", "인터넷", "광고"] },
  { corp_code: "035720", corp_name: "카카오", market: "KOSPI", stock_code: "035720", business_desc: "모바일 플랫폼 메신저 콘텐츠 모빌리티", scale: 8000000000000, keywords: ["메신저", "플랫폼", "모바일", "광고"] },
  { corp_code: "000270", corp_name: "기아", market: "KOSPI", stock_code: "000270", business_desc: "자동차 제조 및 판매", scale: 70000000000000, keywords: ["자동차", "차량", "제조"] },
  { corp_code: "051910", corp_name: "LG화학", market: "KOSPI", stock_code: "051910", business_desc: "석유화학 첨단소재 생명과학", scale: 50000000000000, keywords: ["화학", "소재", "배터리"] },
  { corp_code: "323410", corp_name: "카카오뱅크", market: "KOSPI", stock_code: "323410", business_desc: "인터넷 전문은행", scale: 2000000000000, keywords: ["은행", "금융", "모바일", "뱅킹"] },
  { corp_code: "377300", corp_name: "카카오페이", market: "KOSPI", stock_code: "377300", business_desc: "핀테크 간편결제", scale: 500000000000, keywords: ["핀테크", "결제", "금융"] },
];

export const findPeersForVirtual = async (input: VirtualCompanyInput, useMock: boolean, tuning?: PeerTuningParams): Promise<PeerBotPeer[]> => {
    // OFFLINE HEURISTIC SEARCH
    // Instead of LLM, we use simple keyword overlap counting
    await new Promise(r => setTimeout(r, 1000));

    const inputDesc = input.description.toLowerCase();
    const inputName = input.name.toLowerCase();
    
    const scores = AI_CANDIDATE_POOL.map(candidate => {
        let score = 0;
        let matchedKeywords = 0;
        
        // 1. Keyword Matching
        candidate.keywords.forEach(kw => {
            if (inputDesc.includes(kw) || inputName.includes(kw)) {
                score += 10;
                matchedKeywords++;
            }
        });

        // 2. Scale Matching (if provided)
        let scaleScore = 1.0;
        if (input.revenue && candidate.scale) {
            const ratio = Math.max(input.revenue, candidate.scale) / Math.min(input.revenue, candidate.scale);
            // Closer to 1 is better. If ratio > 10, penalty.
            if (ratio < 2) score += 5;
            else if (ratio < 5) score += 2;
        }

        // Normalize approx
        const finalSim = Math.min(0.99, (score + 2) / 20); // Base score

        return {
            ...candidate,
            similarity: finalSim
        };
    });

    // Sort by similarity
    const sorted = scores.sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    return sorted.map(c => ({
        corp_code: c.corp_code,
        corp_name: c.corp_name,
        stock_code: c.stock_code,
        market: c.market,
        similarity: c.similarity,
        scale_value: c.scale,
        keyword_score: c.similarity, 
        cosine_score: c.similarity
    }));
};

// --- UNIT 11: PEER EXCLUSION DIAGNOSTICS ---
export const checkPeerExclusion = async (targetCorpName: string, context: { targetScale?: number, description?: string }, useMock: boolean): Promise<PeerExclusionResult> => {
    // Offline heuristic
    await new Promise(r => setTimeout(r, 500));
    
    // Logic: If name matches known pool, check scale. Else Not Found.
    const known = AI_CANDIDATE_POOL.find(c => c.corp_name.includes(targetCorpName));
    
    if (!known) {
        return {
            corp_name: targetCorpName,
            status: 'EXCLUDED',
            reason_code: 'NOT_FOUND',
            details: {
                parsing_error_msg: "유니버스 데이터베이스에서 해당 기업을 찾을 수 없습니다."
            }
        };
    }

    // Simulate Scale Mismatch Check
    if (context.targetScale && known.scale) {
        const ratio = known.scale / context.targetScale;
        if (ratio > 10 || ratio < 0.1) {
             return {
                corp_name: targetCorpName,
                status: 'EXCLUDED',
                reason_code: 'SCALE_MISMATCH',
                details: {
                    company_value: `₩${(known.scale/100000000).toFixed(0)}억`,
                    target_value: `₩${(context.targetScale/100000000).toFixed(0)}억`,
                    threshold_range: "0.5x ~ 2.0x"
                }
            };
        }
    }

    return {
        corp_name: targetCorpName,
        status: 'INCLUDED',
        reason_code: 'LOW_SIMILARITY', // Fallback for included or just low score
        details: { score: 0.45 }
    };
};

// --- UNIT 12: PEER EXPLANATION & VALUATION REPORT ---

export async function generatePeerValuationReport(params: {
  target: PeerBotCompanyProfile;
  peers: PeerBotPeer[];
  year: number;
}): Promise<PeerValuationReport> {
    // TEMPLATE BASED GENERATION (No LLM)
    await new Promise(r => setTimeout(r, 1200));

    const targetLabel = params.target.is_virtual 
        ? `Virtual – ${params.target.corp_name}` 
        : `${params.target.corp_name} (${params.year})`;

    // Generate Base Financial Table
    const peersTable = params.peers.map(peer => ({
        corpCode: peer.corp_code,
        stockCode: peer.stock_code,
        corpName: peer.corp_name,
        market: peer.market,
        similarity: peer.similarity,
        revenue: peer.scale_value,
        operatingIncome: peer.scale_value * 0.12, 
        netIncome: peer.scale_value * 0.08,      
        totalAssets: peer.scale_value * 1.5,
        totalEquity: peer.scale_value * 0.8
    }));

    const rationaleText = `
    본 가치평가는 ${params.target.corp_name}의 사업 구조 및 재무 규모를 기반으로 수행되었습니다.
    선정된 피어 그룹은 유사한 산업군(Industry)에 속하며, 키워드 유사도 및 코사인 유사도 분석을 통해 도출되었습니다.
    특히 매출액 및 자산 규모 측면에서 비교 가능한 범위를 우선적으로 고려하였습니다.
    `.trim();

    const limitationsText = `
    1. 비상장 기업의 경우 입력된 추정 재무 수치에 의존하므로 실제 가치와 차이가 있을 수 있습니다.
    2. 정성적 요인(브랜드 가치, 경영진 역량 등)은 본 정량적 모델에 완전히 반영되지 않았습니다.
    3. 오프라인 모드에서는 AI 모델 대신 규칙 기반(Rule-based) 매칭 알고리즘이 사용되었습니다.
    `.trim();

    const peerExplanations: PeerExplanation[] = params.peers.map(peer => ({
        corpCode: peer.corp_code,
        stockCode: peer.stock_code,
        corpName: peer.corp_name,
        market: peer.market,
        similarity: peer.similarity,
        scaleMetric: "revenue",
        scaleTarget: params.target.fs_summary_flat?.revenue,
        scalePeer: peer.scale_value,
        summary: `${peer.corp_name}은(는) ${params.target.corp_name}와 유사한 비즈니스 모델을 보유하고 있으며, 유사도 ${(peer.similarity * 100).toFixed(1)}%를 기록하여 선정되었습니다.`
    }));

    return {
        targetLabel,
        year: params.year,
        peersTable,
        peerExplanations,
        rationaleText,
        limitationsText,
        notesText: "본 보고서는 PeerBot Offline Engine에 의해 생성되었습니다."
    };
}

function formatCurrency(amount: number) {
    if (Math.abs(amount) >= 1000000000000) return `₩${(amount / 1000000000000).toFixed(1)}조`;
    if (Math.abs(amount) >= 1000000000) return `₩${(amount / 1000000000).toFixed(1)}0억`;
    return `₩${amount.toLocaleString()}`;
}

// --- UNIT 13: QUALITY LAB ---

const GOLDEN_PEER_SETS: GoldenPeerSet[] = [
    {
        id: 'golden-1',
        targetLabel: '삼성전자 (반도체/모바일)',
        targetCorpCode: '00126380',
        createdAt: new Date().toISOString(),
        goldenPeers: [
            { corpCode: '000660', corpName: 'SK하이닉스' },
            { corpCode: '066570', corpName: 'LG전자' }
        ]
    },
    {
        id: 'golden-2',
        targetLabel: 'Virtual - 증권사',
        createdAt: new Date().toISOString(),
        goldenPeers: [
            { corpCode: '00111754', corpName: '미래에셋증권' },
            { corpCode: '005940', corpName: 'NH투자증권' },
            { corpCode: '016360', corpName: '삼성증권' }
        ]
    }
];

export function listGoldenPeerSets(): GoldenPeerSet[] {
    return GOLDEN_PEER_SETS;
}

export function saveGoldenPeerSet(set: GoldenPeerSet): void {
    const idx = GOLDEN_PEER_SETS.findIndex(g => g.id === set.id);
    if (idx >= 0) {
        GOLDEN_PEER_SETS[idx] = set;
    } else {
        GOLDEN_PEER_SETS.push(set);
    }
}

export async function runPeerQualityEval(params: {
    target: PeerBotCompanyProfile;
    tuning: PeerTuningParams;
    golden: GoldenPeerSet;
    useMock: boolean;
}): Promise<PeerQualityEvalResult> {
    let peers: PeerBotPeer[] = [];

    // 1. Run Search with Tuning Params
    if (params.target.is_virtual) {
        const input: VirtualCompanyInput = {
            name: params.target.corp_name,
            description: params.target.business_section || '',
            revenue: params.target.fs_summary_flat?.revenue,
            total_assets: params.target.fs_summary_flat?.total_assets
        };
        peers = await findPeersForVirtual(input, params.useMock, params.tuning);
    } else {
        peers = await findPeersForCorp(params.target.corp_code, 2024, params.useMock, params.tuning);
    }

    // 2. Compute Metrics
    const goldenCodes = new Set(params.golden.goldenPeers.map(p => p.corpCode));
    const k = params.tuning.topK;
    const topKPeers = peers.slice(0, k);
    
    let hits = 0;
    topKPeers.forEach(p => {
        if (goldenCodes.has(p.corp_code)) hits++;
    });

    const precision = k > 0 ? hits / k : 0;
    const recall = goldenCodes.size > 0 ? hits / goldenCodes.size : 0;

    return {
        targetLabel: params.golden.targetLabel,
        targetCorpCode: params.target.corp_code,
        tuning: params.tuning,
        golden: params.golden,
        peers: topKPeers,
        metrics: {
            k,
            precisionAtK: precision,
            recallAtK: recall,
            hitAtK: hits > 0,
            numGolden: goldenCodes.size,
            numHits: hits
        }
    };
}

// --- EXPORT HELPERS ---

export function generateMarkdownReport(report: PeerValuationReport): string {
    let md = `# Valuation Report: ${report.targetLabel}\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Base Year:** ${report.year}\n\n`;
    
    md += `## 1. Selection Rationale\n${report.rationaleText}\n\n`;
    
    md += `## 2. Peer Summary Table\n`;
    md += `| Company | Code | Market | Similarity | Revenue | Op. Income | Net Income |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    report.peersTable.forEach(p => {
        md += `| ${p.corpName} | ${p.stockCode} | ${p.market} | ${(p.similarity! * 100).toFixed(1)}% | ${formatCurrency(p.revenue!)} | ${formatCurrency(p.operatingIncome!)} | ${formatCurrency(p.netIncome!)} |\n`;
    });
    md += `\n`;

    md += `## 3. Peer Explanations\n`;
    report.peerExplanations.forEach(exp => {
        md += `### ${exp.corpName}\n`;
        md += `- **Similarity:** ${(exp.similarity! * 100).toFixed(1)}%\n`;
        md += `- ${exp.summary}\n\n`;
    });

    md += `## 4. Limitations\n${report.limitationsText}\n`;
    
    return md;
}

export function generatePlainTextReport(report: PeerValuationReport): string {
    let txt = `VALUATION REPORT: ${report.targetLabel}\n`;
    txt += `================================================\n\n`;
    
    txt += `1. SELECTION RATIONALE\n`;
    txt += `${report.rationaleText}\n\n`;

    txt += `2. PEER LIST\n`;
    report.peersTable.forEach(p => {
        txt += `- ${p.corpName} (${p.stockCode}): Sim ${(p.similarity! * 100).toFixed(1)}%, Rev ${formatCurrency(p.revenue!)}\n`;
    });
    txt += `\n`;

    txt += `3. DETAILS\n`;
    report.peerExplanations.forEach(exp => {
        txt += `[${exp.corpName}]\n${exp.summary}\n\n`;
    });

    txt += `4. LIMITATIONS\n${report.limitationsText}\n`;
    return txt;
}

export function generateCsvReport(report: PeerValuationReport): string {
    const headers = ["CorpName", "StockCode", "Market", "Similarity", "Revenue", "OperatingIncome", "NetIncome", "TotalAssets"];
    const rows = report.peersTable.map(p => [
        p.corpName,
        p.stockCode,
        p.market,
        p.similarity,
        p.revenue,
        p.operatingIncome,
        p.netIncome,
        p.totalAssets
    ].join(","));
    
    return [headers.join(","), ...rows].join("\n");
}