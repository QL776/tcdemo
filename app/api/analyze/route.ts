import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult } from "@/lib/types";

// ─── System Prompt ────────────────────────────────────────────────────────────
//
// 你是一个公正、可解释的简历筛选 AI。你的任务是根据候选人简历，
// 为指定岗位输出 4 个维度的评分和详细理由，并在候选人不适合该岗位时推荐更合适的岗位。
//
// 严格要求：
// 1. 必须屏蔽并忽略简历中的姓名、性别、年龄、学校、籍贯信息，
//    这些字段不得作为任何评分依据
// 2. 评分维度和权重（满分 100）：
//    - 项目经验 40 分（实际落地项目、技术深度、规模与复杂度）
//    - 技能匹配 30 分（技术栈与目标岗位要求的契合度）
//    - 实习竞赛 20 分（实习经历质量、相关竞赛获奖）
//    - 成长性   10 分（自主学习能力、技术视野与主动性）
// 3. 综合得分 ≥ 85 → 推荐通过 / 60-84 → 待定复查 / < 60 → 建议淘汰
// 4. 每个维度必须引用简历中的具体内容，禁止使用"综合素质好"等空话
// 5. 岗位推荐规则：
//    - 若综合得分 < 85，从以下岗位中推荐 1-3 个更适合候选人的岗位：
//      研发工程师 / 产品经理 / 数据分析师 / 运营
//    - 每条推荐需说明理由（引用简历具体内容，50 字以内）
//    - 若综合得分 ≥ 85，alternative_positions 返回空数组 []
//
// 输出严格 JSON，不得包含任何额外文字或代码块标记：
// {
//   "overall_score": 87,
//   "status": "pass" | "review" | "reject",
//   "status_label": "推荐通过" | "待定复查" | "建议淘汰",
//   "action": "进入人工精筛" | "待定复查" | "进入淘汰池",
//   "dimensions": {
//     "project":    { "score": 38, "max": 40, "explanation": "..." },
//     "skills":     { "score": 26, "max": 30, "explanation": "..." },
//     "internship": { "score": 16, "max": 20, "explanation": "..." },
//     "growth":     { "score": 7,  "max": 10, "explanation": "..." }
//   },
//   "alternative_positions": [
//     { "position": "数据分析师", "reason": "简历中有数据建模经验，Python 数据处理能力强" }
//   ]
// }
//
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `你是一个公正、可解释的简历筛选 AI。你的任务是根据候选人简历，为指定岗位输出 4 个维度的评分和详细理由，并在候选人不适合该岗位时推荐更合适的岗位。

严格要求：
1. 必须屏蔽并忽略简历中的姓名、性别、年龄、学校、籍贯信息，这些字段不得作为任何评分依据
2. 评分维度和权重（满分 100）：
   - 项目经验 40 分（实际落地项目、技术深度、规模与复杂度）
   - 技能匹配 30 分（技术栈与目标岗位要求的契合度）
   - 实习竞赛 20 分（实习经历质量、相关竞赛获奖）
   - 成长性   10 分（自主学习能力、技术视野与主动性）
3. 综合得分 ≥ 85 → 推荐通过；60-84 → 待定复查；< 60 → 建议淘汰
4. 每个维度必须引用简历中的具体内容，禁止使用"综合素质好"等空话
5. 岗位推荐规则：
   - 若综合得分 < 85，从以下岗位中推荐 1-3 个更适合候选人的岗位：研发工程师 / 产品经理 / 数据分析师 / 运营
   - 每条推荐需说明理由（引用简历具体内容，50 字以内）
   - 若综合得分 ≥ 85，alternative_positions 返回空数组 []

输出严格 JSON，不得包含任何额外文字或代码块标记：
{
  "overall_score": 87,
  "status": "pass" | "review" | "reject",
  "status_label": "推荐通过" | "待定复查" | "建议淘汰",
  "action": "进入人工精筛" | "待定复查" | "进入淘汰池",
  "dimensions": {
    "project":    { "score": 38, "max": 40, "explanation": "..." },
    "skills":     { "score": 26, "max": 30, "explanation": "..." },
    "internship": { "score": 16, "max": 20, "explanation": "..." },
    "growth":     { "score": 7,  "max": 10, "explanation": "..." }
  },
  "alternative_positions": [
    { "position": "数据分析师", "reason": "简历中有数据建模经验，Python 数据处理能力强" }
  ]
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 未配置" }, { status: 501 });
  }

  try {
    const { resume, position } = await req.json();
    if (!resume || !position) {
      return NextResponse.json({ error: "缺少 resume 或 position" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `应聘岗位：${position}\n\n简历内容：\n${resume}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Claude API 错误: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const result: AnalysisResult = JSON.parse(text);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "分析失败，请重试" }, { status: 500 });
  }
}
