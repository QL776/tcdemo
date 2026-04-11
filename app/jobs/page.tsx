"use client";

import Link from "next/link";
import { useMemo, useState, useRef } from "react";
import { JOBS, type Job } from "@/lib/jobs";

// ─── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("jobId", job.id);
      fd.append("email", email);
      fd.append("pdf", file);

      const res = await fetch("/api/applications", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("提交失败");
      setDone(true);
    } catch {
      setError("提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 440,
          backgroundColor: "#fff",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          padding: 32,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 18,
                color: "#10b981",
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                margin: "0 0 8px",
              }}
            >
              投递成功
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 24px" }}>
              已收到您的简历，我们会在 3 个工作日内与您联系。
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                height: 38,
                backgroundColor: "#0052D9",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              关闭
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 4px",
                }}
              >
                投递简历
              </h3>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                岗位：{job.title} · {job.department}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 联系邮箱 */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  联系邮箱{" "}
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                    （选填）
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: 36,
                    padding: "0 12px",
                    fontSize: 13,
                    color: "#111827",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0052D9")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              {/* PDF 上传 */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  简历 PDF
                  <span style={{ color: "#ef4444" }}> *</span>
                </label>
                <div
                  onClick={() => inputRef.current?.click()}
                  style={{
                    border: `1px dashed ${file ? "#0052D9" : "#d1d5db"}`,
                    borderRadius: 6,
                    padding: "20px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: file ? "#eff6ff" : "#fafafa",
                    transition: "all 0.15s",
                  }}
                >
                  {file ? (
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#0052D9",
                          fontWeight: 500,
                        }}
                      >
                        {file.name}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
                      >
                        {(file.size / 1024).toFixed(0)} KB · 点击重新上传
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        点击上传简历 PDF
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}
                      >
                        仅支持 .pdf 格式，大小不超过 10MB
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                  }}
                />
              </div>

              {error && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#ef4444",
                    marginBottom: 12,
                  }}
                >
                  {error}
                </p>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    height: 38,
                    backgroundColor: "#fff",
                    color: "#374151",
                    fontSize: 14,
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!file || submitting}
                  style={{
                    flex: 2,
                    height: 38,
                    backgroundColor:
                      !file || submitting ? "#d1d5db" : "#0052D9",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    borderRadius: 6,
                    cursor: !file || submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "提交中..." : "提交简历"}
                </button>
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  textAlign: "center",
                  marginTop: 12,
                  marginBottom: 0,
                }}
              >
                简历将经过 AI 匿名化处理，姓名、性别、年龄等信息不参与评估
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({
  job,
  onApply,
}: {
  job: Job;
  onApply: () => void;
}) {
  const meta = `${job.department} · ${job.tags.join(" · ")}`;
  const city = job.tags.find((t) => ["北京", "上海", "深圳", "广州", "杭州"].includes(t));

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #eef2f7",
        borderRadius: 12,
        padding: 18,
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        boxShadow: "0 6px 20px rgba(17,24,39,0.06)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
            {job.title}
          </h2>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{job.headcount} 个名额</span>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{meta}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {city && (
            <span style={{ fontSize: 12, color: "#374151", backgroundColor: "#f3f4f6", padding: "3px 10px", borderRadius: 999 }}>
              工作地点：{city}
            </span>
          )}
          {job.requirements.slice(0, 3).map((req) => (
            <span
              key={req}
              style={{
                fontSize: 12,
                color: "#0052D9",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              {req}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#4b5563", marginTop: 12, lineHeight: 1.6 }}>
          {job.description}
        </div>
      </div>

      <button
        onClick={onApply}
        style={{
          flexShrink: 0,
          height: 34,
          padding: "0 14px",
          backgroundColor: "#0052D9",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          borderRadius: 999,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#0047BF")}
        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#0052D9")}
      >
        立即投递
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedProject, setSelectedProject] = useState("2026校园招聘");
  const [selectedDepartments, setSelectedDepartments] = useState<Record<string, boolean>>({});
  const [selectedCities, setSelectedCities] = useState<Record<string, boolean>>({});
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    project: true,
    dept: true,
    city: true,
    type: true,
  });

  const allDepartments = useMemo(() => {
    return Array.from(new Set(JOBS.map((j) => j.department))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, []);

  const allTags = useMemo(() => {
    return Array.from(new Set(JOBS.flatMap((j) => j.tags))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, []);

  const allCities = useMemo(() => {
    const knownCities = ["北京", "上海", "深圳", "广州", "杭州", "成都", "武汉", "西安", "南京", "苏州"];
    return allTags.filter((t) => knownCities.includes(t));
  }, [allTags]);

  const allTypes = useMemo(() => {
    const typeKeywords = ["全职", "实习", "校招", "社招"];
    return allTags.filter((t) => typeKeywords.includes(t));
  }, [allTags]);

  const filteredJobs = useMemo(() => {
    const kw = keyword.trim();
    const deptKeys = Object.keys(selectedDepartments).filter((k) => selectedDepartments[k]);
    const cityKeys = Object.keys(selectedCities).filter((k) => selectedCities[k]);
    const typeKeys = Object.keys(selectedTypes).filter((k) => selectedTypes[k]);

    return JOBS.filter((job) => {
      if (kw) {
        const hay = [job.title, job.department, job.description, ...job.requirements, ...job.tags].join(" ");
        if (!hay.toLowerCase().includes(kw.toLowerCase())) return false;
      }
      if (deptKeys.length > 0 && !deptKeys.includes(job.department)) return false;
      if (cityKeys.length > 0 && !cityKeys.some((c) => job.tags.includes(c))) return false;
      if (typeKeys.length > 0 && !typeKeys.some((t) => job.tags.includes(t))) return false;
      return true;
    });
  }, [keyword, selectedDepartments, selectedCities, selectedTypes]);

  const activeFilters = useMemo(() => {
    const dept = Object.keys(selectedDepartments).filter((k) => selectedDepartments[k]).map((v) => ({ key: `dept:${v}`, label: v }));
    const city = Object.keys(selectedCities).filter((k) => selectedCities[k]).map((v) => ({ key: `city:${v}`, label: v }));
    const type = Object.keys(selectedTypes).filter((k) => selectedTypes[k]).map((v) => ({ key: `type:${v}`, label: v }));
    const kw = keyword.trim() ? [{ key: `kw:${keyword.trim()}`, label: `关键词：${keyword.trim()}` }] : [];
    return [...kw, ...dept, ...city, ...type];
  }, [keyword, selectedDepartments, selectedCities, selectedTypes]);

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function clearAll() {
    setKeyword("");
    setSelectedDepartments({});
    setSelectedCities({});
    setSelectedTypes({});
    setSelectedProject("2026校园招聘");
  }

  function removeFilter(key: string) {
    if (key.startsWith("kw:")) {
      setKeyword("");
      return;
    }
    if (key.startsWith("dept:")) {
      const v = key.slice("dept:".length);
      setSelectedDepartments((prev) => ({ ...prev, [v]: false }));
      return;
    }
    if (key.startsWith("city:")) {
      const v = key.slice("city:".length);
      setSelectedCities((prev) => ({ ...prev, [v]: false }));
      return;
    }
    if (key.startsWith("type:")) {
      const v = key.slice("type:".length);
      setSelectedTypes((prev) => ({ ...prev, [v]: false }));
      return;
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "linear-gradient(90deg, #0052D9 0%, #0a3aa6 55%, #071a4a 100%)",
          color: "#fff",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.2 }}>Tencent</span>
            <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>腾讯校招</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, opacity: 0.95 }}>
            <Link href="/jobs" style={{ color: "#fff", textDecoration: "none" }}>岗位投递</Link>
            <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>登录</Link>
          </nav>
        </div>
      </header>

      <div
        style={{
          background: "linear-gradient(135deg, #0b2a7a 0%, #0b4fd1 42%, #06204d 100%)",
          color: "#fff",
          padding: "40px 0 56px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 0.5, lineHeight: 1.1 }}>
                腾讯2026校园招聘
              </div>
              <div style={{ marginTop: 10, fontSize: 14, opacity: 0.92 }}>
                让世界看到你的影响力
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1180,
          margin: "-26px auto 64px",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 16,
        }}
      >
        <aside
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            border: "1px solid #eef2f7",
            boxShadow: "0 6px 20px rgba(17,24,39,0.06)",
            padding: 14,
            height: "fit-content",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: "#eaf2ff",
                color: "#0052D9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              T
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>岗位筛选</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>按项目 / 部门 / 城市筛选</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => toggleSection("project")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "transparent",
                border: "none",
                padding: "10px 6px",
                cursor: "pointer",
                color: "#111827",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              应聘项目
              <span style={{ color: "#6b7280", fontWeight: 700 }}>{openSections.project ? "−" : "+"}</span>
            </button>
            {openSections.project && (
              <div style={{ padding: "0 6px 10px" }}>
                {["2026校园招聘", "应届实习", "社招"].map((p) => (
                  <label key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13, color: "#374151" }}>
                    <input
                      type="radio"
                      name="project"
                      checked={selectedProject === p}
                      onChange={() => setSelectedProject(p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => toggleSection("dept")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "transparent",
                border: "none",
                padding: "10px 6px",
                cursor: "pointer",
                color: "#111827",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              部门
              <span style={{ color: "#6b7280", fontWeight: 700 }}>{openSections.dept ? "−" : "+"}</span>
            </button>
            {openSections.dept && (
              <div style={{ padding: "0 6px 10px" }}>
                {allDepartments.map((d) => (
                  <label key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13, color: "#374151" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedDepartments[d])}
                      onChange={(e) => setSelectedDepartments((prev) => ({ ...prev, [d]: e.target.checked }))}
                    />
                    {d}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => toggleSection("city")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "transparent",
                border: "none",
                padding: "10px 6px",
                cursor: "pointer",
                color: "#111827",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              工作城市
              <span style={{ color: "#6b7280", fontWeight: 700 }}>{openSections.city ? "−" : "+"}</span>
            </button>
            {openSections.city && (
              <div style={{ padding: "0 6px 10px" }}>
                {allCities.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#9ca3af", padding: "6px 0" }}>暂无城市标签</div>
                ) : (
                  allCities.map((c) => (
                    <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13, color: "#374151" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedCities[c])}
                        onChange={(e) => setSelectedCities((prev) => ({ ...prev, [c]: e.target.checked }))}
                      />
                      {c}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => toggleSection("type")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "transparent",
                border: "none",
                padding: "10px 6px",
                cursor: "pointer",
                color: "#111827",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              类型
              <span style={{ color: "#6b7280", fontWeight: 700 }}>{openSections.type ? "−" : "+"}</span>
            </button>
            {openSections.type && (
              <div style={{ padding: "0 6px 10px" }}>
                {allTypes.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#9ca3af", padding: "6px 0" }}>暂无类型标签</div>
                ) : (
                  allTypes.map((t) => (
                    <label key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13, color: "#374151" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedTypes[t])}
                        onChange={(e) => setSelectedTypes((prev) => ({ ...prev, [t]: e.target.checked }))}
                      />
                      {t}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>

        <section>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              border: "1px solid #eef2f7",
              boxShadow: "0 6px 20px rgba(17,24,39,0.06)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                  共 {filteredJobs.length} 个岗位
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>项目：{selectedProject}</div>
              </div>
              <button
                type="button"
                onClick={clearAll}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#0052D9",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                清除全部
              </button>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ position: "relative" }}>
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索工作岗位"
                    style={{
                      width: "100%",
                      height: 36,
                      padding: "0 12px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      outline: "none",
                      fontSize: 13,
                      color: "#111827",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#0052D9")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {activeFilters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => removeFilter(f.key)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 999,
                        border: "1px solid #dbeafe",
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: 12,
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                      title="点击移除筛选"
                    >
                      {f.label}
                      <span style={{ color: "#1d4ed8", fontWeight: 900 }}>×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={() => setApplyingJob(job)} />
            ))}
            {filteredJobs.length === 0 && (
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  border: "1px solid #eef2f7",
                  padding: 24,
                  color: "#6b7280",
                  textAlign: "center",
                }}
              >
                暂无符合条件的岗位
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", padding: "18px 0 0" }}>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              所有简历经 AI 匿名化处理 · 平等机会雇主
            </p>
          </div>
        </section>
      </div>

      {/* Modal */}
      {applyingJob && (
        <ApplyModal job={applyingJob} onClose={() => setApplyingJob(null)} />
      )}
    </div>
  );
}
