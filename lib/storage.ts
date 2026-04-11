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
const CITIES = ["北京", "上海", "深圳", "广州", "杭州"] as const;
const SCHOOL_TIERS = ["985", "211", "双一流", "其他"] as const;

function pick<T>(arr: readonly T[], seed: number) {
  return arr[seed % arr.length]!;
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
        alternative_positions: [],
      },
    };
  });

  return candidates.map((a, idx) => withCollaboration(a, idx + 100));
}
