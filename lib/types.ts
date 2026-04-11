export type AnalysisDimension = {
  score: number;
  max: number;
  explanation: string;
};

export type AlternativePosition = {
  position: string;
  reason: string;
};

export type AnalysisResult = {
  overall_score: number;
  status: "pass" | "review" | "reject";
  status_label: "推荐通过" | "待定复查" | "建议淘汰";
  action: string;
  dimensions: {
    project: AnalysisDimension;
    skills: AnalysisDimension;
    internship: AnalysisDimension;
    growth: AnalysisDimension;
  };
  alternative_positions: AlternativePosition[];
};

export type ApplicationStatus = "pending" | "analyzed" | "error";

export type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  email: string;
  pdfName: string;
  pdfBase64?: string;
  candidateName?: string;
  reviewNote?: string;
  reviewDecision?: "pass" | "review" | "reject";
  reviewedAt?: string;
  resumeText: string;
  submittedAt: string;
  status: ApplicationStatus;
  analysisResult: AnalysisResult | null;
};
