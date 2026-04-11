
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { Application, AnalysisResult } from "@/lib/types";
import AnalyticsView from "@/components/analytics-view";
import type { Candidate, OperationLog } from "@/lib/storage";
import { enrichApplications, generateMockCandidates } from "@/lib/storage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pass: "#10b981",
  review: "#f59e0b",
  reject: "#ef4444",
};

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function candidateName(app: Application) {
  if (app.candidateName && app.candidateName.trim()) return app.candidateName.trim();
  const emailName = app.email?.includes("@") ? app.email.split("@")[0] : "";
  const pdfBase = app.pdfName.replace(/\.pdf$/i, "");
  const cleaned = pdfBase.replaceAll("简历", "").replaceAll("-", "_").replaceAll(" ", "_");
  const parts = cleaned.split("_").map((p) => p.trim()).filter((p) => p && p !== "PDF");
  if (parts.length >= 2 && parts[0] === "候选人") return `候选人 ${parts[1]}`;
  if (parts.length >= 1 && parts[0]) return parts[0];
  if (emailName) return emailName;
  return `候选人-${app.id.substring(0, 6)}`;
}

function getDecisionBg(decision: string) {
  if (decision === 'pass') return '#d1fae5';
  if (decision === 'review') return '#fef3c7';
  return '#fee2e2';
}

function getDecisionText(decision: string) {
  if (decision === 'pass') return '#065f46';
  if (decision === 'review') return '#92400e';
  return '#991b1b';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CANDIDATES: Candidate[] = generateMockCandidates(80);

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{children}</span>
      {badge && (
        <span style={{ fontSize: 11, color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Result Modules ───────────────────────────────────────────────────────────

function OverallModule({ r }: { r: AnalysisResult }) {
  const color = STATUS_COLOR[r.status];
  return (
    <Card>
      <CardTitle>① 综合判断</CardTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 600, color, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10 }}>●</span>
            {r.status_label}
          </span>
        </div>
        <div style={{ width: 1, height: 44, backgroundColor: "#e5e7eb" }} />
        <div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 3 }}>综合得分</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#111827", lineHeight: 1 }}>
            {r.overall_score}
            <span style={{ fontSize: 14, fontWeight: 400, color: "#9ca3af" }}> / 100</span>
          </div>
        </div>
        <div style={{ width: 1, height: 44, backgroundColor: "#e5e7eb" }} />
        <div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 3 }}>建议动作</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{r.action}</div>
        </div>
      </div>
    </Card>
  );
}

const DIM_MAP = [
  { key: "project" as const, label: "项目经验" },
  { key: "skills" as const, label: "技能匹配" },
  { key: "internship" as const, label: "实习竞赛" },
  { key: "growth" as const, label: "成长潜力" },
];

function RadarModule({ r }: { r: AnalysisResult }) {
  const data = DIM_MAP.map(({ key, label }) => ({
    subject: label,
    score: (r.dimensions[key].score / r.dimensions[key].max) * 100,
    fullMark: 100,
  }));

  return (
    <Card>
      <CardTitle>② 能力维度评分</CardTitle>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <div style={{ width: 180, height: 170, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Radar dataKey="score" stroke="#0052D9" fill="#0052D9" fillOpacity={0.12} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textAlign: "left", paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>维度</th>
                <th style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textAlign: "right", paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>得分</th>
              </tr>
            </thead>
            <tbody>
              {DIM_MAP.map(({ key, label }) => (
                <tr key={key}>
                  <td style={{ fontSize: 13, color: "#374151", padding: "7px 0", borderBottom: "1px solid #f9fafb" }}>{label}</td>
                  <td style={{ fontSize: 13, color: "#111827", fontWeight: 500, textAlign: "right", padding: "7px 0", borderBottom: "1px solid #f9fafb" }}>
                    {r.dimensions[key].score}
                    <span style={{ color: "#9ca3af", fontWeight: 400 }}>/{r.dimensions[key].max}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function ExplainModule({ r }: { r: AnalysisResult }) {
  return (
    <Card>
      <CardTitle badge="可溯源">③ AI 为什么这么判断？</CardTitle>
      {DIM_MAP.map(({ key, label }, idx) => (
        <div key={key}>
          {idx > 0 && <div style={{ height: 1, backgroundColor: "#f3f4f6", margin: "14px 0" }} />}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
            {label}{" "}
            <span style={{ color: "#9ca3af", fontWeight: 400 }}>
              · {r.dimensions[key].score}/{r.dimensions[key].max}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7, margin: 0 }}>
            {r.dimensions[key].explanation}
          </p>
        </div>
      ))}
    </Card>
  );
}

function AlternativeModule({ r }: { r: AnalysisResult }) {
  if (!r.alternative_positions || r.alternative_positions.length === 0) return null;
  return (
    <Card>
      <CardTitle>④ 岗位匹配建议</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {r.alternative_positions.map((alt) => (
          <div
            key={alt.position}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 14px",
              backgroundColor: "#f9fafb",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#0052D9",
                backgroundColor: "#eff6ff",
                padding: "3px 10px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {alt.position}
            </span>
            <p style={{ fontSize: 13, color: "#4b5563", margin: 0, lineHeight: 1.6 }}>
              {alt.reason}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OperationLogsModule({ logs }: { logs: OperationLog[] }) {
  if (!logs || logs.length === 0) return null;

  const roleColor: Record<OperationLog["operator"]["role"], string> = {
    AI: "#9ca3af",
    HR: "#1e40af",
    业务方: "#7c3aed",
    HR主管: "#059669",
    雇主品牌: "#10b981",
  };

  return (
    <Card>
      <CardTitle>⑤ 操作记录</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {logs.map((l, idx) => {
          const color = roleColor[l.operator.role] ?? "#6b7280";
          return (
            <div key={`${l.timestamp}-${idx}`} style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: color, marginTop: 4 }} />
                {idx < logs.length - 1 && <div style={{ width: 2, flex: 1, backgroundColor: "#e5e7eb", marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    {l.operator.role} · {l.operator.name}
                    {l.operator.department ? `（${l.operator.department}）` : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(l.timestamp)}</div>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#374151", fontWeight: 700 }}>{l.action}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280", lineHeight: 1.7, fontStyle: "italic" }}>
                  “{l.reason}”
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ComplianceModule() {
  return (
    <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>⑥ 合规承诺</div>
      <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.8 }}>
        已屏蔽 5 类敏感字段：姓名 / 性别 / 年龄 / 学校 / 籍贯
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"pool" | "analytics">("pool");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  
  const [apps, setApps] = useState<Candidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [collabNotes, setCollabNotes] = useState<Record<string, string>>({});
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  
  const [listSearch, setListSearch] = useState("");
  const [listJob, setListJob] = useState("all");
  const [listStatus, setListStatus] = useState<"all" | "review" | "pass" | "reject" | "done">("all");
  const [listOwner, setListOwner] = useState("all");
  const [scoreSort, setScoreSort] = useState<"none" | "asc" | "desc">("none");
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [assignRole, setAssignRole] = useState<"HR" | "业务方" | "HR主管" | "雇主品牌">("HR");
  const [assignName, setAssignName] = useState("王五");
  const [collabOpen, setCollabOpen] = useState(false);
  const [collabToast, setCollabToast] = useState<{ id: string; text: string } | null>(null);

  const [groupOpen, setGroupOpen] = useState<Record<"review" | "pass" | "reject" | "done", boolean>>({
    review: true,
    pass: false,
    reject: false,
    done: false,
  });
  
  const [draftDecision, setDraftDecision] = useState<{ id: string; value: "pass" | "review" | "reject" } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const undoRef = useRef<Record<string, Candidate>>({});

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data: Application[]) => {
        // Merge real data with mock data
        const real = enrichApplications(data);
        const combined: Candidate[] = [...real, ...MOCK_CANDIDATES];
        const sorted = combined
          .slice()
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setApps(sorted);
        setReviewNotes(
          Object.fromEntries(sorted.filter((a) => a.reviewNote).map((a) => [a.id, a.reviewNote ?? ""]))
        );
        setCollabNotes(
          Object.fromEntries(sorted.filter((a) => a.reviewNote).map((a) => [a.id, a.reviewNote ?? ""]))
        );
      });
  }, []);

  const jobOptions = useMemo(() => {
    return Array.from(new Set(apps.map((a) => a.jobTitle))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, [apps]);

  const ownerOptions = useMemo(() => {
    return Array.from(new Set(apps.map((a) => a.current_owner?.name).filter(Boolean) as string[])).sort((a, b) =>
      a.localeCompare(b, "zh-Hans-CN")
    );
  }, [apps]);

  const effectiveSelectedId = selectedId;
  const selected = apps.find((a) => a.id === effectiveSelectedId) ?? null;
  const pdfPreviewUrl = selected ? `/api/applications?id=${encodeURIComponent(selected.id)}&pdf=1` : "";

  // ─── Grouping & Filtering for Left Panel in Detail View ───────────────────────
  const pendingLists = useMemo(() => {
    const base = apps
      .filter((a) => !a.reviewedAt)
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const review: Candidate[] = [];
    const pass: Candidate[] = [];
    const reject: Candidate[] = [];

    for (const a of base) {
      const score = a.analysisResult?.overall_score ?? 0;
      if (score >= 85) pass.push(a);
      else if (score < 60) reject.push(a);
      else review.push(a);
    }

    const done = apps
      .filter((a) => !!a.reviewedAt)
      .slice()
      .sort((a, b) => new Date(b.reviewedAt!).getTime() - new Date(a.reviewedAt!).getTime());

    return { review, pass, reject, done, totalPending: review.length + pass.length + reject.length };
  }, [apps]);

  // ─── List View Filtering ──────────────────────────────────────────────────────
  const listData = useMemo(() => {
    const filtered = apps.filter((a) => {
      const isDone = Boolean(a.reviewedAt);

      if (listStatus === "done") {
        if (!isDone) return false;
      } else if (listStatus !== "all") {
        if (isDone) return false;
        const aiStatus = a.analysisResult?.status ?? "review";
        if (aiStatus !== listStatus) return false;
      }

      if (listSearch.trim()) {
        const q = listSearch.trim().toLowerCase();
        const j = (a.jobTitle || "").toLowerCase();
        const id = a.id.toLowerCase();
        if (!id.includes(q) && !j.includes(q)) return false;
      }

      if (listJob !== "all" && a.jobTitle !== listJob) return false;
      if (listOwner !== "all" && a.current_owner?.name !== listOwner) return false;

      return true;
    });

    if (scoreSort === "none") return filtered;
    const dir = scoreSort === "asc" ? 1 : -1;
    return filtered
      .slice()
      .sort((a, b) => {
        const sa = typeof a.analysisResult?.overall_score === "number" ? a.analysisResult.overall_score : -1;
        const sb = typeof b.analysisResult?.overall_score === "number" ? b.analysisResult.overall_score : -1;
        if (sa !== sb) return (sa - sb) * dir;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
  }, [apps, listJob, listOwner, listSearch, listStatus, scoreSort]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(listData.length / pageSize)), [listData.length, pageSize]);
  const pagedListData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return listData.slice(start, start + pageSize);
  }, [listData, page, pageSize]);

  useEffect(() => {
    setPage(1);
    setSelectedMap({});
  }, [listSearch, listJob, listStatus, listOwner, scoreSort, pageSize]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const sampleStats = useMemo(() => {
    const sampled = apps.filter((a) => Boolean(a.audit_sampled));
    const total = sampled.length;
    const done = sampled.filter((a) => Boolean(a.reviewedAt)).length;
    const pending = total - done;
    return { total, done, pending };
  }, [apps]);

  function aiSummary(a: Candidate) {
    const r = a.analysisResult;
    if (!r) return "-";
    const text =
      r.dimensions.project.explanation ||
      r.dimensions.skills.explanation ||
      r.dimensions.internship.explanation ||
      r.dimensions.growth.explanation ||
      "";
    const cleaned = text.replaceAll("\n", " ").replace(/\s+/g, " ").trim();
    const short = cleaned.length > 44 ? `${cleaned.slice(0, 44)}…` : cleaned || "-";
    const flags: string[] = [];
    if (a.audit_sampled) flags.push("抽查");
    if (a.missing_materials) flags.push("缺材料");
    if (a.has_appeal) flags.push("申诉");
    return flags.length > 0 ? `${short}（${flags.join(" / ")}）` : short;
  }

  function lastOpText(a: Candidate) {
    const log = a.operation_logs?.[0];
    if (!log) return "-";
    const who = `${log.operator.role}·${log.operator.name}`;
    const time = fmt(log.timestamp);
    const action = log.action.length > 18 ? `${log.action.slice(0, 18)}…` : log.action;
    return `${who} ${time} ${action}`;
  }

  function toggleSelectOne(id: string, checked: boolean) {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (checked) next[id] = true;
      else delete next[id];
      return next;
    });
  }

  function toggleSelectAll(ids: string[], checked: boolean) {
    setSelectedMap((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (checked) next[id] = true;
        else delete next[id];
      }
      return next;
    });
  }

  // ─── Decision Logic ───────────────────────────────────────────────────────────
  function patchLocal(id: string, updates: Partial<Candidate>) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }

  function saveUndoSnapshot(c: Candidate) {
    undoRef.current[c.id] = JSON.parse(JSON.stringify(c)) as Candidate;
  }

  function undoLast() {
    if (!selected) return;
    const prev = undoRef.current[selected.id];
    if (!prev) return;
    patchLocal(selected.id, prev);
    setReviewNotes((p) => ({ ...p, [selected.id]: prev.reviewNote ?? "" }));
    setCollabNotes((p) => ({ ...p, [selected.id]: prev.reviewNote ?? "" }));
    setDraftDecision(null);
  }

  function transferTo(role: "HR" | "业务方" | "HR主管" | "雇主品牌", name: string, reason: string) {
    if (!selected) return;
    saveUndoSnapshot(selected);
    const nowIso = new Date().toISOString();
    const stage =
      role === "业务方"
        ? "业务方精筛中"
        : role === "HR主管"
          ? "待 HR 主管决策"
          : role === "雇主品牌"
            ? "雇主品牌审核中"
            : "待 HR 复查";
    const log: OperationLog = {
      timestamp: nowIso,
      operator: { role: "HR", name: "李四" },
      action: role === "HR主管" ? `加签至 HR主管 · ${name}` : `转派给 ${role} · ${name}`,
      reason,
      resultStatus: stage,
    };
    patchLocal(selected.id, {
      current_owner: { role, name },
      collaboration_stage: stage,
      operation_logs: [log, ...(selected.operation_logs ?? [])],
      last_updated_at: nowIso,
    });
    setCollabNotes((p) => ({ ...p, [selected.id]: "" }));
    setCollabToast({ id: selected.id, text: `转派成功：已转派给 ${role} · ${name}` });
    setCollabOpen(false);
    window.setTimeout(() => {
      setCollabToast((t) => (t?.id === selected.id ? null : t));
    }, 2200);
  }

  function sendBackForMaterials(reason: string) {
    if (!selected) return;
    saveUndoSnapshot(selected);
    const nowIso = new Date().toISOString();
    const log: OperationLog = {
      timestamp: nowIso,
      operator: { role: "HR", name: "李四" },
      action: "打回补材",
      reason,
      resultStatus: "待 HR 复查",
    };
    patchLocal(selected.id, {
      missing_materials: true,
      collaboration_stage: "待 HR 复查",
      reviewedAt: undefined,
      reviewDecision: undefined,
      operation_logs: [log, ...(selected.operation_logs ?? [])],
      last_updated_at: nowIso,
    });
  }

  function saveRejudge(reason: string) {
    if (!selected) return;
    saveUndoSnapshot(selected);
    const nowIso = new Date().toISOString();
    
    const actionMap = {
      pass: "推荐通过",
      review: "待定复查",
      reject: "建议淘汰"
    };
    const finalLabel = actionMap[currentDecision];

    const actionText = `改判为 ${finalLabel}`;
    const log: OperationLog = {
      timestamp: nowIso,
      operator: { role: "HR", name: "李四" },
      action: actionText,
      reason,
      resultStatus: finalLabel,
    };
    patchLocal(selected.id, {
      reviewDecision: currentDecision,
      reviewNote: reason,
      reviewedAt: nowIso,
      collaboration_stage: "已完成",
      operation_logs: [log, ...(selected.operation_logs ?? [])],
      last_updated_at: nowIso,
    });
  }

  const currentDecision = draftDecision?.id === effectiveSelectedId && draftDecision
    ? draftDecision.value
    : selected?.reviewDecision ?? selected?.analysisResult?.status ?? "review";

  const effectiveSelectedAnalysis = selected?.analysisResult ?? null;

  function applyDecisionToOverall(base: AnalysisResult, decision: "pass" | "review" | "reject"): AnalysisResult {
    const map = {
      pass: { status: "pass" as const, status_label: "推荐通过" as const, action: "进入人工精筛" },
      review: { status: "review" as const, status_label: "待定复查" as const, action: "待定复查" },
      reject: { status: "reject" as const, status_label: "建议淘汰" as const, action: "进入淘汰池" },
    }[decision];
    return { ...base, ...map };
  }

  const effectiveOverall =
    effectiveSelectedAnalysis ? applyDecisionToOverall(effectiveSelectedAnalysis, currentDecision) : null;



  function setDraft(value: "pass" | "review" | "reject") {
    if (!effectiveSelectedId) return;
    setDraftDecision({ id: effectiveSelectedId, value });
  }

  async function confirmAndNext() {
    if (!selected) return;
    const note = (reviewNotes[selected.id] ?? selected.reviewNote ?? "").trim();
    const needReason = currentDecision === "review";
    if (needReason && !note) return;
    const reasonUsed = needReason ? note : note || "快速确认";

    const nowIso = new Date().toISOString();
    const actionMap = { pass: "推荐通过", review: "待定复查", reject: "建议淘汰" };
    const finalLabel = actionMap[currentDecision];
    const actionText =
      currentDecision === "pass"
        ? "升级到推荐通过"
        : currentDecision === "reject"
          ? "降级到建议淘汰"
          : "标记待定复查";
    const newLog: OperationLog = {
      timestamp: nowIso,
      operator: { role: "HR", name: "李四" },
      action: actionText,
      reason: reasonUsed,
      resultStatus: finalLabel,
    };
    
    const combined = [
      ...pendingLists.review.map((a) => a.id),
      ...pendingLists.pass.map((a) => a.id),
      ...pendingLists.reject.map((a) => a.id),
    ];
    const idx = combined.findIndex((id) => id === selected.id);
    const nextId = combined[idx + 1] ?? combined.find((id) => id !== selected.id) ?? null;

    saveUndoSnapshot(selected);
    setIsConfirming(true);
    try {
      patchLocal(selected.id, {
        reviewNote: reasonUsed,
        reviewDecision: currentDecision,
        reviewedAt: nowIso,
        collaboration_stage: "已完成",
        current_owner: { role: "HR", name: "李四" },
        operation_logs: [newLog, ...(selected.operation_logs ?? [])],
      });
      if (!needReason && !note) {
        setReviewNotes((p) => ({ ...p, [selected.id]: reasonUsed }));
      }
      // if it's a real item, persist it
      if (!selected.id.startsWith("mock-")) {
        await fetch("/api/applications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selected.id, decision: currentDecision, reviewNote: reasonUsed, confirm: true }),
        });
      }
      setDraftDecision(null);
      setShowPdfPreview(false);
      if (nextId) setSelectedId(nextId);
      
      // scroll to top
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsConfirming(false);
    }
  }

  function openDetail(app: Candidate) {
    setSelectedId(app.id);
    setViewMode("detail");
    setDraftDecision(null);
  }

  // ─── Render List View ─────────────────────────────────────────────────────────
  function renderListView() {
    const visibleIds = pagedListData.map((c) => c.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => Boolean(selectedMap[id]));

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff" }}>
        {/* Toolbar */}
        <div
          style={{
            height: 80,
            padding: "0 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 56,
            zIndex: 40,
            backgroundColor: "#fff",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>候选人池 · 共 {apps.length.toLocaleString()} 份</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <input 
              placeholder="搜索候选人编号 / 投递岗位" 
              value={listSearch}
              onChange={e => setListSearch(e.target.value)}
              style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 4, width: 200, fontSize: 13 }} 
            />
            <select value={listJob} onChange={e => setListJob(e.target.value)} style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, backgroundColor: "#fff" }}>
              <option value="all">全部岗位</option>
              {jobOptions.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <select value={listStatus} onChange={e => setListStatus(e.target.value as typeof listStatus)} style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, backgroundColor: "#fff" }}>
              <option value="all">全部状态</option>
              <option value="review">待定复查</option>
              <option value="pass">推荐通过</option>
              <option value="reject">建议淘汰</option>
              <option value="done">已处理</option>
            </select>
            <select value={listOwner} onChange={(e) => setListOwner(e.target.value)} style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, backgroundColor: "#fff" }}>
              <option value="all">全部责任人</option>
              {ownerOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 24px", maxHeight: "calc(100vh - 192px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
              <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: 13 }}>
                 <th style={{ padding: "16px 12px", width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(e) => toggleSelectAll(visibleIds, e.target.checked)}
                  />
                 </th>
                 <th style={{ padding: "16px 12px" }}>编号</th>
                 <th style={{ padding: "16px 12px" }}>投递岗位</th>
                 <th style={{ padding: "16px 12px" }}>投递时间</th>
                 <th
                   onClick={() =>
                     setScoreSort((s) => (s === "none" ? "desc" : s === "desc" ? "asc" : "none"))
                   }
                   style={{ padding: "16px 12px", cursor: "pointer", userSelect: "none" }}
                 >
                   得分{scoreSort === "asc" ? " ↑" : scoreSort === "desc" ? " ↓" : ""}
                 </th>
                 <th style={{ padding: "16px 12px" }}>状态</th>
                 <th style={{ padding: "16px 12px" }}>责任人</th>
                 <th style={{ padding: "16px 12px", textAlign: "right" }}>操作</th>
              </tr>
            </thead>
            <tbody>
               {pagedListData.map(c => {
                 const score = c.analysisResult?.overall_score;
                 const isDone = Boolean(c.reviewedAt);
                 const decision = (isDone ? c.reviewDecision : c.analysisResult?.status) ?? "review";
                 const bg = getDecisionBg(decision);
                 const text = getDecisionText(decision);
                 const sampled = Boolean(c.audit_sampled) && (decision === "pass" || decision === "reject");
                 const baseLabel = isDone ? "已处理" : (c.analysisResult?.status_label ?? "待定复查");
                 const label = sampled ? `${baseLabel} · 抽查` : baseLabel;

                 return (
                  <tr 
                    key={c.id} 
                    onClick={() => openDetail(c)}
                    style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", transition: "background-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                     <td style={{ padding: "16px 12px" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedMap[c.id])}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => toggleSelectOne(c.id, e.target.checked)}
                      />
                     </td>
                     <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>#{c.id.replace(/\D/g, "").slice(-4).padStart(4, "0")}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{candidateName(c)}</div>
                     </td>
                     <td style={{ padding: "16px 12px", color: "#4b5563", fontSize: 13 }}>{c.jobTitle}</td>
                     <td style={{ padding: "16px 12px", color: "#6b7280", fontSize: 13 }}>{fmt(c.submittedAt)}</td>
                     <td style={{ padding: "16px 12px", fontWeight: 600, fontSize: 14 }}>{score || '-'}</td>
                     <td style={{ padding: "16px 12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, backgroundColor: bg, color: text, padding: "4px 8px", borderRadius: 4, fontWeight: 500 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: STATUS_COLOR[decision], display: "inline-block" }} />
                          {label}
                          {sampled && <span title="随机抽中">🎲</span>}
                        </span>
                     </td>
                     <td style={{ padding: "16px 12px", color: "#4b5563", fontSize: 13 }}>
                      {c.current_owner?.role} · {c.current_owner?.name}
                     </td>
                     <td style={{ padding: "16px 12px", textAlign: "right" }}>
                        <button style={{ color: "#1e40af", fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); openDetail(c); }}>查看</button>
                     </td>
                  </tr>
                 );
               })}
            </tbody>
          </table>
          {listData.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280", fontSize: 14 }}>没有找到匹配的记录</div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid #e5e7eb", color: "#6b7280", fontSize: 13, position: "sticky", bottom: 0, backgroundColor: "#fff", zIndex: 30 }}>
          <div>共 {listData.length} 条记录 · 第 {page} / {pageCount} 页</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
             <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", backgroundColor: "#fff" }}>
                <option value={10}>10 条/页</option>
                <option value={15}>15 条/页</option>
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
             </select>
             <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
               <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", color: page <= 1 ? "#9ca3af" : "#374151" }}>上一页</button>
               <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount} style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: page >= pageCount ? "not-allowed" : "pointer", color: page >= pageCount ? "#9ca3af" : "#374151" }}>下一页</button>
               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                 <span>跳转</span>
                 <input
                   value={String(page)}
                   onChange={(e) => {
                     const v = Number(e.target.value.replace(/\D/g, "")) || 1;
                     setPage(Math.max(1, Math.min(pageCount, v)));
                   }}
                   style={{ width: 56, padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4 }}
                 />
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Detail View ───────────────────────────────────────────────────────
  function renderDetailView() {
    const cur = selected;
    const code = cur ? `#${cur.id.replace(/\D/g, "").slice(-4).padStart(4, "0")}` : "#----";
    const score = cur?.analysisResult?.overall_score ?? 0;
    const group = !cur
      ? { label: "待定复查", list: [] as Candidate[] }
      : cur.reviewedAt
        ? { label: "已处理", list: pendingLists.done }
        : score >= 85
          ? { label: cur.audit_sampled ? "推荐通过 · 抽查" : "推荐通过", list: pendingLists.pass }
          : score < 60
            ? { label: cur.audit_sampled ? "建议淘汰 · 抽查" : "建议淘汰", list: pendingLists.reject }
            : { label: "待定复查", list: pendingLists.review };
    const idx = cur ? group.list.findIndex((x) => x.id === cur.id) : -1;
    const posText = idx >= 0 ? `${idx + 1}/${group.list.length}` : `-/${group.list.length}`;

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Breadcrumb */}
        <div style={{ height: 48, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, fontSize: 13, backgroundColor: "#fff", flexShrink: 0 }}>
          <button onClick={() => setViewMode("list")} style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回列表
          </button>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span style={{ fontWeight: 500, color: "#111827" }}>候选人 {code}</span>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span style={{ color: "#6b7280" }}>当前 {posText} {group.label}</span>
        </div>

        {/* 3-column Layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left: Pool */}
          <div style={{ width: 280, backgroundColor: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 20px 16px" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 12 }}>候选人池</div>
              <div style={{ fontSize: 12, color: "#6b7280", display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>今日已处理</span>
                <span style={{ fontWeight: 500, color: "#111827" }}>{pendingLists.done.length} / {apps.length}</span>
              </div>
              <div style={{ height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(pendingLists.done.length / Math.max(1, apps.length)) * 100}%`, backgroundColor: "#1e40af" }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 20px" }}>
              {(
                [
                  { key: "review" as const, title: "待定复查", data: pendingLists.review },
                  { key: "pass" as const, title: "推荐通过", data: pendingLists.pass },
                  { key: "reject" as const, title: "建议淘汰", data: pendingLists.reject },
                  { key: "done" as const, title: "已处理", data: pendingLists.done },
                ] as const
              ).map((g) => (
                <div key={g.key} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setGroupOpen((p) => ({ ...p, [g.key]: !p[g.key] }))}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", borderRadius: 6 }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{groupOpen[g.key] ? "▼" : "▶"}</span>
                      {g.title}
                    </span>
                    <span style={{ color: "#9ca3af", fontWeight: 400 }}>({g.data.length})</span>
                  </button>
                  {groupOpen[g.key] && g.data.length > 0 && (
                    <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                      {g.data.map((a) => {
                        const isSel = a.id === selectedId;
                        return (
                          <div
                            key={a.id}
                            onClick={() => openDetail(a)}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 6,
                              cursor: "pointer",
                              backgroundColor: isSel ? "#eff6ff" : "transparent",
                              borderLeft: isSel ? "3px solid #1e40af" : "3px solid transparent",
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 500, color: isSel ? "#1e40af" : "#374151", marginBottom: 4 }}>
                              {candidateName(a)}
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                              <span>{a.jobTitle}</span>
                              <span style={{ fontWeight: 500 }}>{a.analysisResult?.overall_score || '-'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Middle: Analysis */}
          <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
            {!selected ? (
              <div style={{ margin: "auto", color: "#6b7280" }}>请在左侧选择候选人</div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                      {candidateName(selected)}
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1e40af", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: 4 }}>{selected.jobTitle}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      #{selected.id} · 投递 {fmt(selected.submittedAt)} · 👤 {selected.current_owner?.role ?? "HR"}·{selected.current_owner?.name ?? "李四"} · ⏳ {selected.collaboration_stage ?? "待 HR 复查"}
                    </div>
                  </div>
                  <button onClick={() => setShowPdfPreview(!showPdfPreview)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#1e40af", background: "#eff6ff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>
                    📄 {showPdfPreview ? "收起简历 PDF" : "预览简历 PDF"}
                  </button>
                </div>

                {showPdfPreview && (
                  <div style={{ height: 600, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", backgroundColor: "#f9fafb" }}>
                    {pdfPreviewUrl ? (
                      <iframe src={pdfPreviewUrl} width="100%" height="100%" style={{ border: "none" }} title="PDF Preview" />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                        暂无 PDF 预览
                      </div>
                    )}
                  </div>
                )}

                {effectiveSelectedAnalysis && (
                  <>
                    {effectiveOverall && <OverallModule r={effectiveOverall} />}
                    <RadarModule r={effectiveSelectedAnalysis} />
                    <ExplainModule r={effectiveSelectedAnalysis} />
                    <AlternativeModule r={effectiveSelectedAnalysis} />
                    <OperationLogsModule logs={selected.operation_logs ?? []} />
                  </>
                )}
                
                <ComplianceModule />
              </>
            )}
          </div>

          {/* Right: Actions */}
          <div style={{ width: 320, backgroundColor: "#f9fafb", borderLeft: "1px solid #e5e7eb", padding: 16 }}>
            <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <Card style={{ padding: 16 }}>
                <CardTitle>复查决策</CardTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  <button
                    onClick={() => setDraft("pass")}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: currentDecision === "pass" ? "2px solid #10b981" : "1px solid #d1d5db",
                      backgroundColor: "#fff",
                      color: currentDecision === "pass" ? "#065f46" : "#374151",
                    }}
                  >
                    推荐通过
                  </button>
                  <button
                    onClick={() => setDraft("review")}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: currentDecision === "review" ? "2px solid #f59e0b" : "1px solid #d1d5db",
                      backgroundColor: "#fff",
                      color: currentDecision === "review" ? "#92400e" : "#374151",
                    }}
                  >
                    待定复查
                  </button>
                  <button
                    onClick={() => setDraft("reject")}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: currentDecision === "reject" ? "2px solid #ef4444" : "1px solid #d1d5db",
                      backgroundColor: "#fff",
                      color: currentDecision === "reject" ? "#991b1b" : "#374151",
                    }}
                  >
                    建议淘汰
                  </button>
                </div>

                {currentDecision === "review" && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>复查理由 (必填)</div>
                    <textarea
                      value={selected ? (reviewNotes[selected.id] ?? "") : ""}
                      onChange={(e) => selected && setReviewNotes({ ...reviewNotes, [selected.id]: e.target.value })}
                      placeholder="请输入判断依据..."
                      style={{ width: "100%", height: 100, padding: 12, borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                )}

                <button
                  disabled={!selected || isConfirming || (currentDecision === "review" && !(reviewNotes[selected.id] ?? "").trim())}
                  onClick={confirmAndNext}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: !selected || isConfirming || (currentDecision === "review" && !(reviewNotes[selected?.id ?? ""] ?? "").trim()) ? "not-allowed" : "pointer",
                    border: "none",
                    backgroundColor: !selected || isConfirming || (currentDecision === "review" && !(reviewNotes[selected.id] ?? "").trim()) ? "#9ca3af" : "#1e40af",
                    color: "#fff",
                    opacity: isConfirming ? 0.7 : 1,
                  }}
                >
                  {isConfirming ? "处理中..." : "确认并查看下一份 →"}
                </button>
              </Card>

              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "#fff", overflow: "hidden" }}>
                <button
                  onClick={() => setCollabOpen((v) => !v)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>协作操作</span>
                    {selected && collabToast?.id === selected.id && (
                      <span style={{ marginTop: 4, fontSize: 12, color: "#059669", fontWeight: 500 }}>{collabToast.text}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{collabOpen ? "收起 ▲" : "展开 ▼"}</span>
                </button>

                {collabOpen && (
                  <div style={{ padding: 14, borderTop: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>转派给</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <select
                        value={assignRole}
                        onChange={(e) => {
                          const v = e.target.value as typeof assignRole;
                          setAssignRole(v);
                          setAssignName(v === "业务方" ? "张三" : v === "HR主管" ? "王小明" : v === "雇主品牌" ? "周九" : "李四");
                        }}
                        style={{ height: 34, borderRadius: 8, border: "1px solid #d1d5db", padding: "0 10px", backgroundColor: "#fff", fontSize: 13 }}
                      >
                        <option value="HR">HR</option>
                        <option value="业务方">业务方</option>
                        <option value="HR主管">HR 主管</option>
                        <option value="雇主品牌">雇主品牌</option>
                      </select>
                      <select
                        value={assignName}
                        onChange={(e) => setAssignName(e.target.value)}
                        style={{ height: 34, borderRadius: 8, border: "1px solid #d1d5db", padding: "0 10px", backgroundColor: "#fff", fontSize: 13 }}
                      >
                        {(assignRole === "业务方"
                          ? ["张三", "陈八"]
                          : assignRole === "HR主管"
                            ? ["王小明"]
                            : assignRole === "雇主品牌"
                              ? ["周九", "林十"]
                              : ["李四", "王五", "孙七"]
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>协作备注</div>
                    <textarea
                      value={selected ? (collabNotes[selected.id] ?? "") : ""}
                      onChange={(e) => selected && setCollabNotes({ ...collabNotes, [selected.id]: e.target.value })}
                      placeholder="请输入协作说明..."
                      style={{ width: "100%", height: 80, padding: 12, borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit", marginBottom: 12 }}
                    />

                    <button
                      disabled={!selected || !(collabNotes[selected.id] ?? "").trim()}
                      onClick={() => transferTo(assignRole, assignName, (collabNotes[selected!.id] ?? "").trim())}
                      style={{
                        width: "100%",
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        backgroundColor: "#fff",
                        cursor: !selected || !(collabNotes[selected.id] ?? "").trim() ? "not-allowed" : "pointer",
                        color: "#111827",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      执行转派
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <header
        style={{
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 24px",
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>腾讯简历系统</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <button
            onClick={() => setTab("pool")}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: tab === "pool" ? "#1e40af" : "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              height: 56,
              borderBottom: tab === "pool" ? "2px solid #1e40af" : "2px solid transparent",
            }}
          >
            候选人池
          </button>
          <button
            onClick={() => setTab("analytics")}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: tab === "analytics" ? "#1e40af" : "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              height: 56,
              borderBottom: tab === "analytics" ? "2px solid #1e40af" : "2px solid transparent",
            }}
          >
            数据看板
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>A</div>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{ fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
          >
            退出
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tab === "analytics" ? (
          <div style={{ flex: 1, overflow: "auto" }}>
            <AnalyticsView />
          </div>
        ) : (
          viewMode === "list" ? renderListView() : renderDetailView()
        )}
      </main>
    </div>
  );
}
