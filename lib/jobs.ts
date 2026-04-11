export type Job = {
  id: string;
  title: string;
  department: string;
  headcount: number;
  tags: string[];
  requirements: string[];
  description: string;
};

export const JOBS: Job[] = [
  {
    id: "rd-engineer",
    title: "研发工程师",
    department: "技术部",
    headcount: 3,
    tags: ["全职", "北京"],
    requirements: [
      "熟练掌握 Go 或 Python 至少一门语言，具备良好的工程化能力与代码规范意识",
      "具备 3 年以上后端开发经验，理解常见架构模式（分层、DDD、微服务等）",
      "熟悉分布式系统基础：一致性、幂等、限流熔断、重试退避、分布式锁等",
      "熟悉常见存储与中间件：MySQL/PostgreSQL、Redis、消息队列（Kafka/RocketMQ）",
      "掌握服务性能优化方法：压测、指标分析、慢查询与热点问题定位、GC/内存分析",
      "了解云原生与工程体系：Docker、K8s、CI/CD、可观测性（日志/指标/链路）优先",
      "具备良好的跨团队协作与沟通能力，能推动问题闭环与持续交付",
    ],
    description:
      "负责核心平台服务的设计与研发，参与高可用架构建设，持续优化系统性能与稳定性。",
  },
  {
    id: "product-manager",
    title: "产品经理",
    department: "产品部",
    headcount: 2,
    tags: ["全职", "北京"],
    requirements: [
      "具备 3 年以上 B 端/企业服务产品经验，有从 0 到 1 或复杂系统迭代经验",
      "能够独立完成需求调研、PRD/原型、方案评审、排期与上线验收闭环",
      "具备较强的需求抽象与流程梳理能力，能拆解复杂业务并形成可落地方案",
      "数据驱动：能设计埋点、指标体系与 A/B 验证，基于数据推进迭代决策",
      "理解 AI/模型相关产品形态（例如简历解析、匹配、推荐、风控等）者优先",
      "具备良好的沟通与推动能力，能与研发/设计/运营高效协作",
      "有合规与隐私意识，理解数据最小化、权限控制、审计与可解释性诉求",
    ],
    description:
      "负责 AI 工具产品的规划与迭代，深度理解业务场景，与技术团队高效协作交付。",
  },
  {
    id: "data-analyst",
    title: "数据分析师",
    department: "数据部",
    headcount: 2,
    tags: ["全职", "上海"],
    requirements: [
      "熟练使用 SQL 进行数据抽取与分析，掌握常见窗口函数、分组聚合与性能优化",
      "熟练使用 Python 做分析与建模（pandas/numpy 等），能完成自动化分析与报表产出",
      "具备指标体系与数据建模能力（星型模型、宽表、主题域等），理解口径管理",
      "熟悉常见 BI 工具（如 Tableau/PowerBI/Looker 等）或可视化能力（ECharts）优先",
      "具备实验设计与因果分析基础（A/B、漏斗、留存、分群、对照）",
      "具备数据质量意识：异常检测、缺失处理、采集链路核对与数据一致性校验",
      "良好的业务理解与沟通能力，能够把分析结论转化为可执行建议",
    ],
    description:
      "负责业务数据的挖掘与分析，构建数据看板，为产品与运营决策提供量化支持。",
  },
  {
    id: "operation",
    title: "运营",
    department: "运营部",
    headcount: 1,
    tags: ["全职", "上海"],
    requirements: [
      "2 年以上互联网运营经验，熟悉增长/留存/内容/活动等至少一个方向",
      "具备内容策划与表达能力：能独立产出选题、文案、活动页方案与传播节奏",
      "具备数据分析基础：能读懂核心指标（曝光/点击/转化/留存），并提出优化动作",
      "了解用户分层与精细化运营方法（标签体系、触达策略、自动化运营）",
      "熟悉常见运营工具与渠道（公众号、社群、邮件/短信、投放）者优先",
      "具备项目管理能力：跨团队协作、资源协调、风险预判与复盘沉淀",
      "具备较强的责任心与自驱力，能够快速响应业务需求并持续迭代",
    ],
    description:
      "负责用户增长与留存策略的制定与执行，通过内容与活动运营提升产品影响力。",
  },
];

export function getJobById(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
