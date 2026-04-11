"use client";

import { useMemo, useState } from "react";
import { PROJECT_STATS } from "@/lib/mock-stats";

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SmallCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 14,
        backgroundColor: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>✓</div>
      </div>
      <div style={{ marginTop: 10, fontSize: 20, fontWeight: 700, color: "#111827" }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>{sub}</div>
    </div>
  );
}

function FunnelSvg({
  data,
}: {
  data: ReadonlyArray<{ stage: string; count: number; percent: number }>;
}) {
  const w = 760;
  const hPer = 56;
  const h = Math.max(1, data.length) * hPer;
  const maxFunnelWidth = 560;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => {
        const topPct = Math.max(0, Math.min(100, d.percent));
        const nextPct = i < data.length - 1 ? data[i + 1].percent : Math.max(8, d.percent * 0.55);
        const bottomPct = Math.max(0, Math.min(100, nextPct));

        const topW = (maxFunnelWidth * topPct) / 100;
        const botW = (maxFunnelWidth * bottomPct) / 100;

        const y0 = i * hPer;
        const y1 = y0 + hPer - 8;
        const x0 = (w - topW) / 2;
        const x1 = x0 + topW;
        const x3 = (w - botW) / 2;
        const x2 = x3 + botW;

        const alpha = 1 - i * 0.1;
        const fill = `rgba(30,64,175,${Math.max(0.4, Math.min(1, alpha))})`;
        const showDetail = topW >= 240;

        return (
          <g key={d.stage}>
            <polygon points={`${x0},${y0} ${x1},${y0} ${x2},${y1} ${x3},${y1}`} fill={fill} />
            <text
              x={w / 2}
              y={y0 + 22}
              textAnchor="middle"
              fontSize="13"
              fill="#ffffff"
              fontWeight="700"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={3}
              style={{ paintOrder: "stroke" }}
            >
              {d.stage}
            </text>
            {showDetail && (
              <text
                x={w / 2}
                y={y0 + 42}
                textAnchor="middle"
                fontSize="12"
                fill="rgba(255,255,255,0.95)"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={3}
                style={{ paintOrder: "stroke" }}
              >
                {d.count.toLocaleString()} · {d.percent.toFixed(1)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ProgressBar({
  percent,
  color,
  height = 12,
}: {
  percent: number;
  color: string;
  height?: number;
}) {
  return (
    <div style={{ height, borderRadius: 999, backgroundColor: "#f3f4f6", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: color }} />
    </div>
  );
}

function MetricBarRow({
  label,
  color,
  count,
  percent,
}: {
  label: string;
  color: string;
  count: number;
  percent: number;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 120px", gap: 12, alignItems: "center", height: 32 }}>
      <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{label}</div>
      <ProgressBar percent={percent} color={color} height={10} />
      <div style={{ fontSize: 13, color: "#111827", textAlign: "right" }}>
        {count.toLocaleString()} <span style={{ color: "#6b7280" }}>{percent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function ReviewProgressRow({
  label,
  color,
  done,
  total,
}: {
  label: string;
  color: string;
  done: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label}</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {done.toLocaleString()} / {total.toLocaleString()} ({percent}%)
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <ProgressBar percent={percent} color={color} height={10} />
      </div>
    </div>
  );
}

function RiskRow({
  title,
  ok,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  ok: boolean;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: ok ? "#10b981" : "#f59e0b", marginTop: 1 }}>
            {ok ? "✓" : "⚠️"}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.6 }}>{summary}</div>
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "#6b7280",
            padding: 0,
            whiteSpace: "nowrap",
          }}
        >
          {open ? "收起 ▲" : "展开 ▼"}
        </button>
      </div>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

export default function AnalyticsView() {
  const s = PROJECT_STATS;
  const [openDiversity, setOpenDiversity] = useState(false);
  const [openCompliance, setOpenCompliance] = useState(false);
  const [openAppeals, setOpenAppeals] = useState(false);

  const progressPercent = useMemo(() => Math.round((s.current_day / s.total_days) * 100), [s.current_day, s.total_days]);
  const totalManualDone = useMemo(
    () => s.manual_review_progress.yellow.done + s.manual_review_progress.green.done + s.manual_review_progress.red.done,
    [s.manual_review_progress]
  );
  const totalManualTotal = useMemo(
    () => s.manual_review_progress.yellow.total + s.manual_review_progress.green.total + s.manual_review_progress.red.total,
    [s.manual_review_progress]
  );
  const diversityWarn = useMemo(() => {
    const genderMax = Math.max(s.diversity.gender.male, s.diversity.gender.female);
    const locMax = Math.max(...s.diversity.location.map((x) => x.value));
    const schoolMax = Math.max(...s.diversity.school.map((x) => x.value));
    return genderMax >= 60 || locMax >= 60 || schoolMax >= 60;
  }, [s.diversity]);

  const complianceOk = useMemo(() => {
    return s.compliance.field_masking >= 100 && s.compliance.traceability >= 100 && s.compliance.complaints === 0 && s.compliance.diversity_alerts === 0;
  }, [s.compliance]);

  const appealsOk = useMemo(() => s.appeals.sla_rate >= 100, [s.appeals.sla_rate]);

  const yellowLeft = useMemo(() => s.manual_review_progress.yellow.total - s.manual_review_progress.yellow.done, [s.manual_review_progress.yellow]);
  const redLeft = useMemo(() => s.manual_review_progress.red.total - s.manual_review_progress.red.done, [s.manual_review_progress.red]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 980, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", fontSize: 18, fontWeight: 600, color: "#111827" }}>项目健康度</div>
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#10b981" }} />
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 24, fontWeight: 700, color: "#111827" }}>健康</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>5 项核心指标全部正常</div>
          </div>
          <div style={{ marginTop: 18, width: "100%", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            <SmallCard label="进度" value={`${progressPercent}%`} sub={`D${s.current_day}/${s.total_days}`} />
            <SmallCard label="效率" value={`${s.manual_review_rate.toFixed(1)}%`} sub="复查率" />
            <SmallCard label="质量" value={`${s.interview_ratio.toFixed(1)}:1`} sub="面录比" />
            <SmallCard label="合规" value={`${s.compliance.complaints}`} sub="投诉数" />
            <SmallCard label="储备" value={`${s.interview_pool.total}人`} sub="待面试" />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>项目进度</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Day {s.current_day} of {s.total_days}</div>
        </div>
        <div style={{ marginTop: 18 }}>
          <ProgressBar percent={progressPercent} color="#1e40af" height={12} />
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>{progressPercent}%</div>
        </div>

        <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color: "#111827" }}>阶段进展</div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 13 }}>
              <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> AI 打标签已完成
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{s.total_submissions.toLocaleString()}/{s.total_submissions.toLocaleString()}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 13 }}>
              <span style={{ color: "#1e40af", fontWeight: 700 }}>▶</span> 人工复查进行中
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {totalManualDone.toLocaleString()}/{totalManualTotal.toLocaleString()} ({totalManualTotal === 0 ? 0 : Math.round((totalManualDone / totalManualTotal) * 100)}%)
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 13 }}>
              <span style={{ color: "#9ca3af", fontWeight: 700 }}>○</span> 业务精筛未开始
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>0/2,100</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 13 }}>
              <span style={{ color: "#9ca3af", fontWeight: 700 }}>○</span> 面试通知未发送
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>—</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 13 }}>
              <span style={{ color: "#9ca3af", fontWeight: 700 }}>○</span> Offer 决策未开始
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>—</div>
          </div>
        </div>

        <div style={{ marginTop: 16, backgroundColor: "#eff6ff", border: "1px solid #dbeafe", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 12, color: "#1e40af", fontWeight: 700 }}>预计完成：Day 13（提前 1 天）</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 16 }}>AI 分类分布</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <MetricBarRow
              label="推荐通过"
              color="#10b981"
              count={s.ai_distribution.green.count}
              percent={s.ai_distribution.green.percent}
            />
            <MetricBarRow
              label="待定复查"
              color="#f59e0b"
              count={s.ai_distribution.yellow.count}
              percent={s.ai_distribution.yellow.percent}
            />
            <MetricBarRow
              label="建议淘汰"
              color="#ef4444"
              count={s.ai_distribution.red.count}
              percent={s.ai_distribution.red.percent}
            />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>人工复查进度</div>
          <div style={{ marginTop: 12, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>抽检策略说明</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", lineHeight: 1.8 }}>
              <div>• 待定复查：100% 全部复查</div>
              <div>• 推荐通过：随机抽样 10%</div>
              <div>• 建议淘汰：随机抽样 5%</div>
            </div>
          </div>

          <ReviewProgressRow
            label="待定复查（全量）"
            color="#f59e0b"
            done={s.manual_review_progress.yellow.done}
            total={s.manual_review_progress.yellow.total}
          />
          <ReviewProgressRow
            label="推荐通过（随机抽 10%）"
            color="#10b981"
            done={s.manual_review_progress.green.done}
            total={s.manual_review_progress.green.total}
          />
          <ReviewProgressRow
            label="建议淘汰（随机抽 5%）"
            color="#ef4444"
            done={s.manual_review_progress.red.done}
            total={s.manual_review_progress.red.total}
          />

          <div style={{ height: 1, backgroundColor: "#e5e7eb", marginTop: 14 }} />
          <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>总计</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {totalManualDone.toLocaleString()} / {totalManualTotal.toLocaleString()} (
              {totalManualTotal === 0 ? 0 : Math.round((totalManualDone / totalManualTotal) * 100)}%)
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar
              percent={totalManualTotal === 0 ? 0 : Math.round((totalManualDone / totalManualTotal) * 100)}
              color="#1e40af"
              height={10}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>12,000 份简历的旅程</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, marginBottom: 16 }}>从投递到录用，每一步都数据可见</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <FunnelSvg data={s.funnel} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.funnel.map((f) => (
              <div key={f.stage} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{f.stage}</div>
                <div style={{ fontSize: 13, color: "#111827", fontWeight: 700 }}>
                  {f.count.toLocaleString()}{" "}
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>{f.percent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>风险监控</div>
          <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>当前风险等级：✓ 低</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <RiskRow
            title="多样性正常"
            ok={!diversityWarn}
            summary={`男女 ${s.diversity.gender.male}/${s.diversity.gender.female}，地域/院校无异常倾斜`}
            open={openDiversity}
            onToggle={() => setOpenDiversity((v) => !v)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>性别比</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 46, fontSize: 12, color: "#374151" }}>男</div>
                  <ProgressBar percent={s.diversity.gender.male} color="#1e40af" height={10} />
                  <div style={{ width: 44, fontSize: 12, color: "#6b7280", textAlign: "right" }}>{s.diversity.gender.male}%</div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                  <div style={{ width: 46, fontSize: 12, color: "#374151" }}>女</div>
                  <ProgressBar percent={s.diversity.gender.female} color="#93c5fd" height={10} />
                  <div style={{ width: 44, fontSize: 12, color: "#6b7280", textAlign: "right" }}>{s.diversity.gender.female}%</div>
                </div>
              </div>
              <div style={{ height: 1, backgroundColor: "#e5e7eb" }} />
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>地域分布</div>
                {s.diversity.location.map((x) => (
                  <div key={x.name} style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                    <div style={{ width: 46, fontSize: 12, color: "#374151" }}>{x.name}</div>
                    <ProgressBar percent={x.value} color="#1e40af" height={10} />
                    <div style={{ width: 44, fontSize: 12, color: "#6b7280", textAlign: "right" }}>{x.value}%</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, backgroundColor: "#e5e7eb" }} />
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>院校分布</div>
                {s.diversity.school.map((x) => (
                  <div key={x.name} style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                    <div style={{ width: 46, fontSize: 12, color: "#374151" }}>{x.name}</div>
                    <ProgressBar percent={x.value} color="#1e40af" height={10} />
                    <div style={{ width: 44, fontSize: 12, color: "#6b7280", textAlign: "right" }}>{x.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </RiskRow>
          <div style={{ height: 1, backgroundColor: "#e5e7eb" }} />
          <RiskRow
            title="合规正常"
            ok={complianceOk}
            summary={`屏蔽 ${s.compliance.field_masking}%，溯源 ${s.compliance.traceability}%，投诉 ${s.compliance.complaints}`}
            open={openCompliance}
            onToggle={() => setOpenCompliance((v) => !v)}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>✓ 屏蔽字段：{s.compliance.field_masking}%</div>
              <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>✓ 决策溯源：{s.compliance.traceability}%</div>
              <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>✓ 投诉数：{s.compliance.complaints}</div>
              <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>✓ 多样性预警：{s.compliance.diversity_alerts}</div>
            </div>
          </RiskRow>
          <div style={{ height: 1, backgroundColor: "#e5e7eb" }} />
          <RiskRow
            title="申诉正常"
            ok={appealsOk}
            summary={`${s.appeals.pending} 条待处理，平均响应 ${s.appeals.avg_response_hours}h`}
            open={openAppeals}
            onToggle={() => setOpenAppeals((v) => !v)}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>待处理</div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>{s.appeals.pending}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>已响应</div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>{s.appeals.resolved}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>平均响应</div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>{s.appeals.avg_response_hours}h</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>SLA 达标率</div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>{s.appeals.sla_rate}%</div>
              </div>
            </div>
          </RiskRow>
        </div>
      </Card>

      <Card style={{ backgroundColor: "#eff6ff", borderColor: "#dbeafe" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>系统建议</div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, color: "#1e3a8a" }}>1. 待定复查还有 {yellowLeft.toLocaleString()} 份未处理，建议今日完成</div>
          <div style={{ fontSize: 13, color: "#1e3a8a" }}>2. 建议淘汰抽查剩余 {redLeft.toLocaleString()} 份，建议适当加快</div>
          <div style={{ fontSize: 13, color: "#1e3a8a" }}>3. 申诉队列有 {s.appeals.pending} 条待处理</div>
        </div>
      </Card>
    </div>
  );
}
