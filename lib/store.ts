import type { Application, AnalysisResult } from "./types";

// In-memory store — persists within process lifetime (demo purposes)
const applications: Application[] = [
  {
    id: "demo_001",
    jobId: "rd-engineer",
    jobTitle: "研发工程师",
    email: "demo@example.com",
    pdfName: "候选人_A_简历.pdf",
    resumeText: "",
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    reviewedAt: new Date(Date.now() - 1800000).toISOString(),
    reviewDecision: "pass",
    reviewNote: "项目经历较完整，建议进入人工精筛。",
    status: "analyzed",
    analysisResult: {
      overall_score: 87,
      status: "pass",
      status_label: "推荐通过",
      action: "进入人工精筛",
      dimensions: {
        project: {
          score: 38,
          max: 40,
          explanation:
            "参与了 3 个完整工程项目，含亿级数据量后端服务，Go + Kubernetes 技术栈，有明确性能优化数据（接口响应时间从 800ms 降至 120ms）。",
        },
        skills: {
          score: 26,
          max: 30,
          explanation:
            "技术栈覆盖 Go、Python、MySQL、Redis、消息队列，与研发工程师岗位高度匹配。K8s 仅作运维协作而非主导，略有扣分。",
        },
        internship: {
          score: 16,
          max: 20,
          explanation:
            "有头部互联网公司 6 个月实习经历，参与真实线上服务开发，贡献描述具体。未发现竞赛获奖记录。",
        },
        growth: {
          score: 7,
          max: 10,
          explanation:
            "技术博客持续更新，体现自主学习意愿。从实习到正式工作技术跨度清晰，成长曲线稳定。",
        },
      },
      alternative_positions: [],
    },
  },
  {
    id: "demo_002",
    jobId: "product-manager",
    jobTitle: "产品经理",
    email: "",
    pdfName: "候选人_B_简历.pdf",
    resumeText: "",
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    status: "analyzed",
    analysisResult: {
      overall_score: 62,
      status: "review",
      status_label: "待定复查",
      action: "待定复查",
      dimensions: {
        project: {
          score: 22,
          max: 40,
          explanation:
            "有 C 端产品经历，但 B 端经验不足，项目描述中缺乏量化数据，难以评估实际贡献深度。",
        },
        skills: {
          score: 18,
          max: 30,
          explanation:
            "具备基础需求分析能力，但数据驱动决策的案例描述较薄弱，未体现数据工具使用经验。",
        },
        internship: {
          score: 15,
          max: 20,
          explanation: "有两段实习经历，均为初级产品助理职位，项目参与程度有限。",
        },
        growth: {
          score: 7,
          max: 10,
          explanation:
            "有主动学习记录，参加过产品相关培训课程，展现一定的自驱力。",
        },
      },
      alternative_positions: [
        {
          position: "运营",
          reason: "C 端用户洞察能力强，内容策划经验可直接复用",
        },
      ],
    },
  },
];

let counter = 3;

export function listApplications(): Application[] {
  return [...applications].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export function getApplication(id: string): Application | undefined {
  return applications.find((a) => a.id === id);
}

export function addApplication(app: Omit<Application, "id">): Application {
  const id = `app_${String(counter++).padStart(3, "0")}`;
  const newApp: Application = { id, ...app };
  applications.unshift(newApp);
  return newApp;
}

export function updateAnalysis(id: string, result: AnalysisResult): void {
  const app = applications.find((a) => a.id === id);
  if (app) {
    app.analysisResult = result;
    app.status = "analyzed";
  }
}

export function updateApplication(
  id: string,
  patch: Partial<Omit<Application, "id" | "analysisResult">> & {
    analysisResult?: Partial<AnalysisResult> | null;
  }
): Application | undefined {
  const app = applications.find((a) => a.id === id);
  if (!app) return;

  const { analysisResult, ...rest } = patch;
  Object.assign(app, rest);

  if (analysisResult !== undefined) {
    if (analysisResult === null) {
      app.analysisResult = null;
    } else {
      const base: AnalysisResult =
        app.analysisResult ??
        ({
          overall_score: 0,
          status: "review",
          status_label: "待定复查",
          action: "待人工处理",
          dimensions: {
            project: { score: 0, max: 40, explanation: "" },
            skills: { score: 0, max: 30, explanation: "" },
            internship: { score: 0, max: 20, explanation: "" },
            growth: { score: 0, max: 10, explanation: "" },
          },
          alternative_positions: [],
        } satisfies AnalysisResult);
      app.analysisResult = { ...base, ...analysisResult };
    }
  }

  return app;
}
