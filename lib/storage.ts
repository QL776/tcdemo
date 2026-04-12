import type { Application } from "./types";

export interface OperationLog {
  timestamp: string;
  operator: {
    role: "AI" | "HR" | "业务方" | "HR主管" | "雇主品牌";
    name: string;
    department?: string;
  };
  action: string;
  reason: string;
  resultStatus?: string;
}

export interface Candidate extends Application {
  current_owner: {
    role: string;
    name: string;
  };
  collaboration_stage:
    | "待 AI 分析"
    | "待 HR 复查"
    | "业务方精筛中"
    | "待 HR 主管决策"
    | "雇主品牌审核中"
    | "已完成";
  operation_logs: OperationLog[];
  interview_status?: "pending" | "notified" | null;
  final_decision?: "pass" | "reject" | null;
  audit_sampled?: boolean;
  channel?: "官网" | "内推" | "校招平台" | "宣讲会";
  city?: "北京" | "上海" | "深圳" | "广州" | "杭州";
  school_tier?: "985" | "211" | "双一流" | "其他";
  has_appeal?: boolean;
  missing_materials?: boolean;
  last_updated_at?: string;
}

const OPERATORS = {
  AI: [{ name: "AI 系统", role: "AI" as const, department: "" }],
  HR: [
    { name: "李四", role: "HR" as const, department: "招聘组" },
    { name: "王五", role: "HR" as const, department: "招聘组" },
    { name: "孙七", role: "HR" as const, department: "招聘组" },
  ],
  业务方: [
    { name: "张三", role: "业务方" as const, department: "产品中心" },
    { name: "陈八", role: "业务方" as const, department: "技术中心" },
  ],
  HR主管: [{ name: "王小明", role: "HR主管" as const, department: "人力资源" }],
  雇主品牌: [
    { name: "周九", role: "雇主品牌" as const, department: "雇主品牌" },
    { name: "林十", role: "雇主品牌" as const, department: "雇主品牌" },
  ],
} as const;

const CHANNELS = ["官网", "内推", "校招平台", "宣讲会"] as const;

const ALTERNATIVE_POSITIONS: Record<string, Array<{ position: string; reason: string }[]>> = {
  产品经理: [
    [
      { position: "运营策略专员", reason: "候选人对用户增长路径有清晰认知，具备数据驱动的运营思维，适合负责增长策略与用户生命周期管理。" },
      { position: "用户研究员", reason: "简历中体现出较强的定性研究能力与用户洞察，适合深度参与用户访谈与需求挖掘工作。" },
    ],
    [
      { position: "商业分析师", reason: "对业务模型及商业逻辑理解到位，具备结构化分析能力，可胜任跨部门业务拆解与决策支持。" },
      { position: "项目经理（技术方向）", reason: "有推动跨职能协作的经验，对研发流程理解较好，建议考虑技术 PM 方向以发挥协调优势。" },
    ],
    [
      { position: "增长产品经理", reason: "数据分析工具使用熟练，有 A/B 测试经验，转向增长方向有较强竞争力。" },
    ],
  ],
  前端开发: [
    [
      { position: "全栈工程师（Node.js 方向）", reason: "候选人具备较扎实的前端工程化能力，适当补充后端基础后可承担全栈职责，拓展职业成长空间。" },
      { position: "移动端开发工程师（RN）", reason: "React 技能栈与 React Native 高度重合，转型移动端成本较低，可考虑跨平台方向。" },
    ],
    [
      { position: "音视频前端工程师", reason: "简历中涉及 WebRTC 与媒体流处理经验，与音视频前端岗位高度匹配，建议重点考虑。" },
    ],
    [
      { position: "前端架构师（基础设施方向）", reason: "有组件库与工程化平台建设经验，技术深度较好，适合基础设施和工程效能方向的高级岗位。" },
      { position: "互动游戏前端", reason: "Canvas/WebGL 相关经验突出，游戏业务线对此需求明确，建议同时考虑。" },
    ],
  ],
  后端开发: [
    [
      { position: "数据工程师", reason: "有数据处理流水线搭建经验，熟悉大数据工具链，转型数据工程方向有明确优势。" },
      { position: "平台工程师（DevOps 方向）", reason: "对 CI/CD 和容器化部署有实践经验，适合承担内部基础平台建设职责。" },
    ],
    [
      { position: "算法工程师（工程落地方向）", reason: "后端工程能力扎实，有模型服务化部署经验，可作为算法与工程之间的桥梁角色。" },
    ],
    [
      { position: "服务端开发工程师（游戏业务）", reason: "高并发与状态管理经验与游戏服务端场景契合，建议考虑游戏业务线的服务端岗位。" },
      { position: "安全工程师（后端方向）", reason: "对系统安全有一定了解，结合后端经验可转型为应用安全方向。" },
    ],
  ],
  数据分析师: [
    [
      { position: "数据产品经理", reason: "具备将数据洞察转化为产品功能的思维，沟通能力较强，适合数据产品方向。" },
      { position: "机器学习工程师（特征工程方向）", reason: "特征工程与建模基础较好，可向 MLE 方向发展，补充工程化能力即可胜任。" },
    ],
    [
      { position: "商业智能工程师", reason: "BI 报表开发与数仓建模经验丰富，建议直接考虑 BI 专项岗位，匹配度更高。" },
    ],
    [
      { position: "风控数据分析师", reason: "对异常识别和规则设计有基础认知，风控数据分析对其经验有较好承接。" },
      { position: "增长数据分析师", reason: "熟悉用户行为埋点与漏斗分析，增长团队对此类经验需求明确。" },
    ],
  ],
};
const CITIES = ["北京", "上海", "深圳", "广州", "杭州"] as const;
const SCHOOL_TIERS = ["985", "211", "双一流", "其他"] as const;

function pick<T>(arr: readonly T[], seed: number) {
  return arr[seed % arr.length]!;
}

function pickAlternativePositions(jobTitle: string, seed: number): { position: string; reason: string }[] {
  const key = Object.keys(ALTERNATIVE_POSITIONS).find((k) => jobTitle.includes(k)) ?? "后端开发";
  const pool = ALTERNATIVE_POSITIONS[key]!;
  return pool[seed % pool.length]!;
}

function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

function buildAiLog(ts: string, statusLabel: string, score: number): OperationLog {
  return {
    timestamp: ts,
    operator: { role: "AI", name: OPERATORS.AI[0].name },
    action: `打标签：${statusLabel}（${score} 分）`,
    reason: "基于简历结构化解析与维度评分自动生成",
    resultStatus: statusLabel,
  };
}

function buildHrLog(ts: string, name: string, department: string, action: string, reason: string, resultStatus?: string): OperationLog {
  return {
    timestamp: ts,
    operator: { role: "HR", name, department },
    action,
    reason,
    resultStatus,
  };
}

function buildBizLog(ts: string, name: string, department: string, action: string, reason: string, resultStatus?: string): OperationLog {
  return {
    timestamp: ts,
    operator: { role: "业务方", name, department },
    action,
    reason,
    resultStatus,
  };
}

function buildLeadLog(ts: string, name: string, department: string, action: string, reason: string, resultStatus?: string): OperationLog {
  return {
    timestamp: ts,
    operator: { role: "HR主管", name, department },
    action,
    reason,
    resultStatus,
  };
}

function withCollaboration(app: Application, seed: number): Candidate {
  const score = app.analysisResult?.overall_score ?? 0;
  const status = app.analysisResult?.status ?? "review";
  const baseStatusLabel =
    app.analysisResult?.status_label ??
    (status === "pass" ? "推荐通过" : status === "reject" ? "建议淘汰" : "待定复查");

  const isDone = Boolean(app.reviewedAt);
  const createdAt = app.submittedAt;
  const aiLog = buildAiLog(createdAt, baseStatusLabel, score);

  const hrOp = pick(OPERATORS.HR, seed);
  const bizOp = pick(OPERATORS.业务方, seed);
  const leadOp = pick(OPERATORS.HR主管, seed);

  const hasAppeal = seed % 19 === 0;
  const missingMaterials = !isDone && seed % 17 === 0;

  let collaboration_stage: Candidate["collaboration_stage"] = isDone ? "已完成" : "待 HR 复查";
  let current_owner: Candidate["current_owner"] = { role: "HR", name: hrOp.name };
  let logs: OperationLog[] = [];

  if (isDone) {
    const finalDecision = app.reviewDecision ?? status;
    const hrAction =
      finalDecision === "pass"
        ? "升级到推荐通过"
        : finalDecision === "reject"
          ? "降级到建议淘汰"
          : "维持待定复查";
    const hrReason =
      app.reviewNote ??
      pick(
        [
          "关键项目描述完整，技术栈匹配，建议进入下一轮。",
          "亮点不够突出且缺少量化结果，风险偏高。",
          "核心能力满足，但仍需面试确认业务理解。",
        ] as const,
        seed
      );

    const bizAction = finalDecision === "reject" ? "建议淘汰" : "推荐进入面试";
    const bizReason = pick(
      [
        "从业务落地视角看可直接上手，建议安排面试。",
        "经验偏浅且缺少关键模块负责经历，建议淘汰。",
        "需求拆解清晰，但需要进一步确认协作与推动能力。",
      ] as const,
      seed + 3
    );

    const leadAction = finalDecision === "reject" ? "最终淘汰" : "最终通过";
    const leadReason = pick(
      [
        "综合 AI 评分与业务反馈，结论明确，进入下一阶段。",
        "关键风险点无法闭环，综合判断不建议推进。",
        "建议按岗位优先级推进，并记录后续跟踪点。",
      ] as const,
      seed + 7
    );

    const leadTs = app.reviewedAt ?? new Date().toISOString();
    const bizTs = new Date(new Date(leadTs).getTime() - 2 * 3600000).toISOString();
    const hrTs = new Date(new Date(leadTs).getTime() - 4 * 3600000).toISOString();

    logs = [
      buildLeadLog(leadTs, leadOp.name, leadOp.department, leadAction, leadReason, "已处理"),
      buildBizLog(bizTs, bizOp.name, bizOp.department, bizAction, bizReason, "已处理"),
      buildHrLog(hrTs, hrOp.name, hrOp.department, hrAction, hrReason, "已处理"),
      aiLog,
    ];

    current_owner = { role: "HR主管", name: leadOp.name };
  } else {
    const shouldTransfer = seed % 3 === 0;
    if (shouldTransfer) {
      const rolePick = pick(["业务方", "HR主管", "雇主品牌"] as const, seed);
      const target =
        rolePick === "业务方"
          ? pick(OPERATORS.业务方, seed + 1)
          : rolePick === "HR主管"
            ? pick(OPERATORS.HR主管, seed + 1)
            : pick(OPERATORS.雇主品牌, seed + 1);

      collaboration_stage = rolePick === "业务方" ? "业务方精筛中" : rolePick === "HR主管" ? "待 HR 主管决策" : "雇主品牌审核中";
      current_owner = { role: rolePick, name: target.name };

      const transferReason = pick(
        [
          "需要业务进一步确认项目深度与岗位匹配。",
          "请主管协助定夺优先级与推进节奏。",
          "需要雇主品牌同步候选人沟通策略。",
        ] as const,
        seed + 5
      );
      const transferTs = isoHoursAgo((seed % 12) + 1);
      logs = [buildHrLog(transferTs, hrOp.name, hrOp.department, `转派给${rolePick}`, transferReason, collaboration_stage), aiLog];
    } else {
      logs = [aiLog];
    }
  }

  const lastUpdatedAt = logs[0]?.timestamp ?? app.submittedAt;

  return {
    ...(app as Candidate),
    current_owner,
    collaboration_stage: missingMaterials ? "待 HR 复查" : collaboration_stage,
    operation_logs: logs,
    audit_sampled: false,
    channel: pick(CHANNELS, seed),
    city: pick(CITIES, seed),
    school_tier: pick(SCHOOL_TIERS, seed),
    has_appeal: hasAppeal,
    missing_materials: missingMaterials,
    last_updated_at: lastUpdatedAt,
  };
}

export function enrichApplications(apps: Application[]): Candidate[] {
  return apps.map((a, idx) => withCollaboration(a, idx + 1));
}

export function generateMockCandidates(total: number): Candidate[] {
  const jobs = ["产品经理", "前端开发", "后端开发", "数据分析师"] as const;

  const candidates: Application[] = Array.from({ length: total }).map((_, i) => {
    const score =
      i < Math.floor(total * 0.15)
        ? 60 + Math.floor((i * 7) % 25)
        : i < Math.floor(total * 0.4)
          ? 85 + Math.floor((i * 11) % 15)
          : 30 + Math.floor((i * 13) % 30);
    const decision = score >= 85 ? "pass" : score >= 60 ? "review" : "reject";
    const status_label = decision === "pass" ? "推荐通过" : decision === "review" ? "待定复查" : "建议淘汰";
    const action = decision === "pass" ? "进入人工精筛" : decision === "review" ? "待定复查" : "进入淘汰池";
    const reviewed = i >= Math.floor(total * 0.75);

    return {
      id: `mock-${String(i + 1).padStart(4, "0")}`,
      jobId: "mock-job",
      jobTitle: jobs[i % jobs.length]!,
      candidateName: `候选人 ${String.fromCharCode(65 + (i % 26))}${i}`,
      email: `c${i}@test.com`,
      resumeText: "",
      pdfName: `resume-${i}.pdf`,
      submittedAt: isoHoursAgo(i + 1),
      status: reviewed ? "analyzed" : "pending",
      reviewedAt: reviewed ? isoHoursAgo(i % 6) : undefined,
      reviewDecision: reviewed ? decision : undefined,
      reviewNote: reviewed ? "结合简历与业务反馈给出最终处理意见。" : undefined,
      analysisResult: {
        overall_score: score,
        status: decision,
        status_label,
        action,
        dimensions: {
          project: { score: Math.round(score * 0.4), max: 40, explanation: "项目经历覆盖核心流程与关键模块，描述较具体。" },
          skills: { score: Math.round(score * 0.3), max: 30, explanation: "技能点与岗位要求匹配度较高，具备可落地经验。" },
          internship: { score: Math.round(score * 0.2), max: 20, explanation: "实习/竞赛经历能支撑岗位判断，但需补充细节。" },
          growth: { score: Math.round(score * 0.1), max: 10, explanation: "成长性表现较好，有持续学习与沉淀的迹象。" },
        },
        alternative_positions: pickAlternativePositions(jobs[i % jobs.length]!, i),
      },
    };
  });

  return candidates.map((a, idx) => withCollaboration(a, idx + 100));
}

export function generateInterviewPoolMock(total = 18): Candidate[] {
  const jobs = ["产品经理", "前端开发", "后端开发", "数据分析师"] as const;
  const notifiedCount = Math.min(6, total);
  const pendingCount = Math.max(0, total - notifiedCount);

  const apps: Application[] = Array.from({ length: total }).map((_, i) => {
    const score = 88 + Math.floor((i * 7) % 12);
    const aiDecision = i % 3 === 0 ? ("review" as const) : ("pass" as const);
    const aiLabel = aiDecision === "pass" ? "推荐通过" : "待定复查";
    const action = aiDecision === "pass" ? "进入人工精筛" : "待定复查";
    const reviewedAt = isoHoursAgo(i % 10);

    return {
      id: `interview-${String(i + 1).padStart(4, "0")}`,
      jobId: "mock-job",
      jobTitle: jobs[i % jobs.length]!,
      candidateName: `候选人 ${String.fromCharCode(78 + (i % 12))}${i + 10}`,
      email: `ip${i}@test.com`,
      resumeText: "",
      pdfName: `interview-${i}.pdf`,
      submittedAt: isoHoursAgo(i + 22),
      status: "analyzed",
      reviewedAt,
      reviewDecision: "pass",
      reviewNote: i % 2 === 0 ? "项目匹配度高，建议推进面试。" : "综合能力较好，建议进入下一轮。",
      analysisResult: {
        overall_score: score,
        status: aiDecision,
        status_label: aiLabel,
        action,
        dimensions: {
          project: { score: Math.round(score * 0.4), max: 40, explanation: "项目经历完整，能支撑面试推进。" },
          skills: { score: Math.round(score * 0.3), max: 30, explanation: "核心技能与岗位需求匹配。" },
          internship: { score: Math.round(score * 0.2), max: 20, explanation: "有相关实习/项目经历，细节较充分。" },
          growth: { score: Math.round(score * 0.1), max: 10, explanation: "成长性良好，具备持续学习能力。" },
        },
        alternative_positions: pickAlternativePositions(jobs[i % jobs.length]!, i + 10),
      },
    };
  });

  const enriched = apps.map((a, idx) => withCollaboration(a, idx + 500));
  return enriched.map((c, idx) => ({
    ...c,
    final_decision: "pass",
    interview_status: idx < pendingCount ? "pending" : "notified",
  }));
}
