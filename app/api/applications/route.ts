import { NextRequest, NextResponse } from "next/server";
import { addApplication, getApplication, listApplications, updateApplication } from "@/lib/store";
import { getJobById } from "@/lib/jobs";
import type { AnalysisResult } from "@/lib/types";

// Mock result used when Claude API is not configured
const MOCK_RESULT: AnalysisResult = {
  overall_score: 74,
  status: "review",
  status_label: "待定复查",
  action: "待定复查",
  dimensions: {
    project: {
      score: 28,
      max: 40,
      explanation: "（演示数据）有项目经历，但细节描述有限，待人工核实。",
    },
    skills: {
      score: 22,
      max: 30,
      explanation: "（演示数据）技能列表与岗位部分匹配，核心技术栈需进一步确认。",
    },
    internship: {
      score: 16,
      max: 20,
      explanation: "（演示数据）有实习经历，内容较为基础。",
    },
    growth: {
      score: 8,
      max: 10,
      explanation: "（演示数据）体现一定学习意愿。",
    },
  },
  alternative_positions: [
    {
      position: "运营",
      reason: "（演示数据）综合能力较好，可考虑业务侧岗位",
    },
  ],
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const pdf = url.searchParams.get("pdf");

  if (id && pdf === "1") {
    const app = getApplication(id);
    if (!app?.pdfBase64) {
      return NextResponse.json({ error: "PDF 不存在" }, { status: 404 });
    }

    const buf = Buffer.from(app.pdfBase64, "base64");
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(app.pdfName)}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(listApplications());
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const jobId = formData.get("jobId") as string;
    const email = (formData.get("email") as string) ?? "";
    const file = formData.get("pdf") as File | null;

    if (!jobId || !file) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const job = getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: "岗位不存在" }, { status: 400 });
    }

    const pdfName = file.name;

    // Extract text from PDF
    let resumeText = "";
    let pdfBase64 = "";
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pdfBase64 = buffer.toString("base64");
      // Dynamic import to avoid Next.js build issues with pdf-parse
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const parsed = await pdfParse(buffer);
      resumeText = parsed.text;
    } catch {
      resumeText = `[PDF 内容提取失败，文件名：${pdfName}]`;
    }

    // Try to get real analysis, fall back to mock
    let analysisResult: AnalysisResult = MOCK_RESULT;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && resumeText && !resumeText.startsWith("[PDF")) {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: resumeText, position: job.title }),
        });
        if (res.ok) {
          analysisResult = await res.json();
        }
      } catch {
        // fall back to mock
      }
    }

    const app = addApplication({
      jobId,
      jobTitle: job.title,
      email,
      pdfName,
      pdfBase64,
      resumeText,
      submittedAt: new Date().toISOString(),
      status: "analyzed",
      analysisResult,
    });

    return NextResponse.json({ success: true, applicationId: app.id });
  } catch {
    return NextResponse.json({ error: "提交失败，请重试" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      id?: string;
      reviewNote?: string;
      decision?: "pass" | "review" | "reject";
      confirm?: boolean;
    };

    if (!body.id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }

    let analysisPatch: Partial<AnalysisResult> | undefined;
    if (body.decision) {
      if (body.decision === "pass") {
        analysisPatch = {
          status: "pass",
          status_label: "推荐通过",
          action: "进入人工精筛",
        };
      } else if (body.decision === "review") {
        analysisPatch = {
          status: "review",
          status_label: "待定复查",
          action: "待定复查",
        };
      } else {
        analysisPatch = {
          status: "reject",
          status_label: "建议淘汰",
          action: "进入淘汰池",
        };
      }
    }

    const updated = updateApplication(body.id, {
      reviewNote: body.reviewNote,
      reviewDecision: body.confirm ? body.decision : undefined,
      reviewedAt: body.confirm ? new Date().toISOString() : undefined,
      analysisResult: analysisPatch,
    });

    if (!updated) {
      return NextResponse.json({ error: "未找到投递记录" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "更新失败，请重试" }, { status: 500 });
  }
}
