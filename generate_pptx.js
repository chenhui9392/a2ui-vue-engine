const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9"; // 10" x 5.625"
pptx.author = "陈辉";
pptx.title = "A2UI 驱动下的前端开发实践";

// ─── Color Constants (NO "#" prefix!) ───
const C = {
  bg: "0F172A",
  card: "1E3A5F",
  mint: "02C39A",
  cyan: "06B6D4",
  amber: "F59E0B",
  teal: "1C7293",
  white: "FFFFFF",
  sub: "94A3B8",
  footer: "64748B",
  codeBg: "0D1117",
  red: "EF4444",
};

// ─── Shadow helper (fresh object each time) ───
function shadow() {
  return { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.25 };
}

// ─── Slide dimensions ───
const SW = 10;
const SH = 5.625;

// ─── Total page count (for page numbers) ───
const TOTAL_PAGES = 22;

// ─── Helper: add left dual bars ───
function addLeftBars(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.03, h: SH,
    fill: { color: C.mint },
    line: { width: 0 },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.03, y: 0, w: 0.015, h: SH,
    fill: { color: C.teal },
    line: { width: 0 },
  });
}

// ─── Helper: add page number ───
function addPageNum(slide, num) {
  slide.addText(`${num} / ${TOTAL_PAGES}`, {
    x: 8.5, y: SH - 0.35, w: 1.2, h: 0.3,
    fontSize: 9, color: C.footer, fontFace: "Calibri",
    align: "right",
  });
}

// ─── Helper: add title with underline ───
function addTitle(slide, title, y) {
  y = y || 0.3;
  slide.addText(title, {
    x: 0.35, y: y, w: 9, h: 0.45,
    fontSize: 24, fontFace: "Calibri", bold: true, color: C.mint,
  });
  // Mint green semi-transparent underline
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.35, y: y + 0.45, w: 9, h: 0.02,
    fill: { color: C.mint, transparency: 65 },
    line: { width: 0 },
  });
}

// ─── Helper: rounded card ───
function addCard(slide, x, y, w, h, opts) {
  opts = opts || {};
  const accentColor = opts.accentColor || C.mint;
  const barW = opts.barWidth || 0.04;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: x, y: y, w: w, h: h,
    fill: { color: C.card },
    rectRadius: 0.1,
    shadow: shadow(),
    line: { width: 0 },
  });
  // Inner left accent bar
  if (opts.showBar !== false) {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.04, y: y + 0.1, w: barW, h: h - 0.2,
      fill: { color: accentColor },
      line: { width: 0 },
    });
  }
}

// ─── Helper: add arrow between shapes ───
function addArrow(slide, x1, y1, x2, y2, color) {
  color = color || C.mint;
  slide.addShape(pptx.shapes.LINE, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color: color, width: 2, endArrowType: "triangle" },
  });
}

// ─── Helper: horizontal arrow ───
function addHArrow(slide, x1, y, x2, color) {
  addArrow(slide, x1, y, x2, y, color);
}

// ═══════════════════════════════════════════
// SLIDE 1: Cover Page
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  // Left dual bars
  addLeftBars(slide);

  // Title
  slide.addText("A2UI 驱动下的前端开发实践", {
    x: 0.6, y: 1.4, w: 8.5, h: 0.8,
    fontSize: 40, fontFace: "Calibri", bold: true, color: C.white,
  });

  // Mint green semi-transparent line under title
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 2.25, w: 6, h: 0.03,
    fill: { color: C.mint, transparency: 65 },
    line: { width: 0 },
  });

  // Subtitle
  slide.addText("从业务痛点到 AI 驱动的 UI 基础设施", {
    x: 0.6, y: 2.5, w: 8, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: C.sub,
  });

  // Department
  slide.addText("添可 AIT 中心 · 国内营销智能部", {
    x: 0.6, y: 3.2, w: 5, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: C.sub,
  });

  // Date
  slide.addText("陈辉    2026.06", {
    x: 0.6, y: 3.6, w: 5, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: C.sub,
  });

  // Decorative icon (top-right, 85% transparency)
  slide.addText("A2UI", {
    x: 7.8, y: 0.5, w: 1.8, h: 0.8,
    fontSize: 28, fontFace: "Calibri", bold: true, color: C.mint,
    align: "center", transparency: 85,
  });
}

// ═══════════════════════════════════════════
// SLIDE 2: Table of Contents
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);

  // Title
  slide.addText("分享内容", {
    x: 0.35, y: 0.25, w: 5, h: 0.55,
    fontSize: 32, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.35, y: 0.78, w: 3, h: 0.025,
    fill: { color: C.mint, transparency: 65 },
    line: { width: 0 },
  });

  // 4 TOC cards
  const tocItems = [
    { num: "01", title: "背景与痛点", desc: "国内营销 APP 开发挑战 · 传统方案的技术瓶颈", color: C.mint },
    { num: "02", title: "A2UI 的引入", desc: "从痛点到方案 · A2UI 协议解读 · 核心价值定位", color: C.mint },
    { num: "03", title: "项目落地应用", desc: "国内营销 APP · 运维小搭档桌面端 · 使用进阶", color: C.cyan },
    { num: "04", title: "从实现到赋能", desc: "核心架构 · 价值场景 · 未来展望", color: C.amber },
  ];

  tocItems.forEach((item, i) => {
    const cy = 1.1 + i * 1.08;
    addCard(slide, 0.5, cy, 8.8, 0.92, { accentColor: item.color });

    // Chapter number
    slide.addText(item.num, {
      x: 0.75, y: cy + 0.1, w: 0.8, h: 0.7,
      fontSize: 32, fontFace: "Calibri", bold: true, color: item.color,
    });

    // Title
    slide.addText(item.title, {
      x: 1.7, y: cy + 0.1, w: 3.5, h: 0.4,
      fontSize: 20, fontFace: "Calibri", bold: true, color: C.white,
    });

    // Description
    slide.addText(item.desc, {
      x: 1.7, y: cy + 0.5, w: 7, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: C.sub,
    });
  });

  addPageNum(slide, 2);
}

// ═══════════════════════════════════════════
// SLIDE 3: Chapter 1 Divider
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  // Semi-transparent deep teal overlay
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: SH,
    fill: { color: C.teal, transparency: 80 },
    line: { width: 0 },
  });

  addLeftBars(slide);

  // Large chapter number
  slide.addText("01", {
    x: 0.6, y: 1.2, w: 2.5, h: 1.2,
    fontSize: 72, fontFace: "Calibri", bold: true, color: C.mint,
  });

  // Title
  slide.addText("背景与痛点", {
    x: 0.6, y: 2.5, w: 7, h: 0.7,
    fontSize: 36, fontFace: "Calibri", bold: true, color: C.white,
  });

  // Subtitle
  slide.addText("国内营销 APP 开发挑战 · 传统方案的技术瓶颈", {
    x: 0.6, y: 3.3, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.sub,
  });
}

// ═══════════════════════════════════════════
// SLIDE 4: Challenges
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "01  背景与痛点");

  // Subtitle
  slide.addText("国内营销 APP 开发挑战", {
    x: 0.35, y: 0.9, w: 5, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // 3 stat cards
  const stats = [
    { num: "3+", label: "并行业务线", desc: "多条业务线同时推进，开发资源严重紧张" },
    { num: "10+", label: "报表页面需求", desc: "运营侧需要快速上线各种报表和活动页面" },
    { num: "急", label: "交付压力大", desc: "需求紧急，传统开发模式无法快速响应" },
  ];

  stats.forEach((s, i) => {
    const cx = 0.5 + i * 3.05;
    addCard(slide, cx, 1.5, 2.8, 2.2);

    slide.addText(s.num, {
      x: cx + 0.2, y: 1.65, w: 2.4, h: 0.7,
      fontSize: 36, fontFace: "Calibri", bold: true, color: C.mint,
      align: "center",
    });

    slide.addText(s.label, {
      x: cx + 0.2, y: 2.35, w: 2.4, h: 0.35,
      fontSize: 16, fontFace: "Calibri", bold: true, color: C.white,
      align: "center",
    });

    slide.addText(s.desc, {
      x: cx + 0.2, y: 2.75, w: 2.4, h: 0.7,
      fontSize: 12, fontFace: "Calibri", color: C.sub,
      align: "center",
    });
  });

  // Bottom highlight
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.1, w: 8.8, h: 0.55,
    fill: { color: C.card },
    rectRadius: 0.08,
    shadow: shadow(),
    line: { width: 0 },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.54, y: 4.18, w: 0.04, h: 0.39,
    fill: { color: C.mint },
    line: { width: 0 },
  });
  slide.addText("核心矛盾：活多、人少、需求急", {
    x: 0.75, y: 4.15, w: 8, h: 0.45,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.mint,
  });

  addPageNum(slide, 4);
}

// ═══════════════════════════════════════════
// SLIDE 5: Traditional Bottlenecks
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "01  背景与痛点");

  slide.addText("传统方案的技术瓶颈", {
    x: 0.35, y: 0.9, w: 5, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Flow: 珊瑚工作流 → HTML 模板 → 页面渲染
  const flowItems = ["珊瑚工作流", "HTML 模板", "页面渲染"];
  flowItems.forEach((item, i) => {
    const fx = 1.0 + i * 2.8;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: fx, y: 1.45, w: 2.0, h: 0.55,
      fill: { color: C.card },
      rectRadius: 0.08,
      shadow: shadow(),
      line: { width: 0 },
    });
    slide.addText(item, {
      x: fx, y: 1.45, w: 2.0, h: 0.55,
      fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle",
    });
    if (i < 2) {
      addHArrow(slide, fx + 2.05, 1.72, fx + 2.7, C.mint);
    }
  });

  // 3 problem cards
  const problems = [
    { title: "交互被动", desc: "HTML 渲染对多轮复杂交互支撑弱，状态微调需要重新拉取或整体刷新页面" },
    { title: "适配成本高", desc: "iOS、Android、Web 三端对富文本和 HTML 标签兼容性存在差异，调试繁琐" },
    { title: "安全隐患", desc: "直接在端上渲染注入的外部 HTML，存在 XSS 注入等安全风险" },
  ];

  problems.forEach((p, i) => {
    const px = 0.5 + i * 3.05;
    addCard(slide, px, 2.3, 2.8, 1.7);

    slide.addText(p.title, {
      x: px + 0.25, y: 2.45, w: 2.4, h: 0.35,
      fontSize: 15, fontFace: "Calibri", bold: true, color: C.white,
    });

    slide.addText(p.desc, {
      x: px + 0.25, y: 2.85, w: 2.4, h: 0.95,
      fontSize: 11, fontFace: "Calibri", color: C.sub,
    });
  });

  // Bottom highlight
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.3, w: 8.8, h: 0.65,
    fill: { color: C.card },
    rectRadius: 0.08,
    shadow: shadow(),
    line: { width: 0 },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.54, y: 4.38, w: 0.04, h: 0.49,
    fill: { color: C.mint },
    line: { width: 0 },
  });
  slide.addText("传统 HTML 模板方案已到天花板，需要更灵活、更安全、更智能的 UI 渲染方式", {
    x: 0.75, y: 4.35, w: 8.2, h: 0.55,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.mint,
  });

  addPageNum(slide, 5);
}

// ═══════════════════════════════════════════
// SLIDE 6: Chapter 2 Divider
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: SH,
    fill: { color: C.teal, transparency: 80 },
    line: { width: 0 },
  });

  addLeftBars(slide);

  slide.addText("02", {
    x: 0.6, y: 1.2, w: 2.5, h: 1.2,
    fontSize: 72, fontFace: "Calibri", bold: true, color: C.mint,
  });

  slide.addText("A2UI 的引入", {
    x: 0.6, y: 2.5, w: 7, h: 0.7,
    fontSize: 36, fontFace: "Calibri", bold: true, color: C.white,
  });

  slide.addText("从痛点到方案 · A2UI 协议解读 · 核心价值定位", {
    x: 0.6, y: 3.3, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.sub,
  });
}

// ═══════════════════════════════════════════
// SLIDE 7: What is A2UI
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "02  A2UI 的引入");

  slide.addText("什么是 A2UI？", {
    x: 0.35, y: 0.9, w: 5, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Description
  slide.addText("A2UI = AI to UI — Google 推出的开放协议，AI Agent 到用户界面的标准化桥梁", {
    x: 0.5, y: 1.35, w: 8.8, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: C.white,
  });

  // 2 concept cards side by side
  addCard(slide, 0.5, 1.85, 4.2, 1.1);
  slide.addText("对话即界面", {
    x: 0.75, y: 1.92, w: 3.8, h: 0.3,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addText("用户通过自然语言与 AI 对话，AI 实时生成可交互的 UI 界面", {
    x: 0.75, y: 2.25, w: 3.8, h: 0.55,
    fontSize: 11, fontFace: "Calibri", color: C.sub,
  });

  addCard(slide, 5.1, 1.85, 4.2, 1.1);
  slide.addText("界面即对话", {
    x: 5.35, y: 1.92, w: 3.8, h: 0.3,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addText("界面上的交互操作直接反馈到 AI 对话流中，形成闭环", {
    x: 5.35, y: 2.25, w: 3.8, h: 0.55,
    fontSize: 11, fontFace: "Calibri", color: C.sub,
  });

  // Timeline: A2UI 发展历程
  slide.addText("A2UI 发展历程", {
    x: 0.5, y: 3.15, w: 3, h: 0.35,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
  });

  // Timeline line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 3.7, w: 8.8, h: 0.02,
    fill: { color: C.mint, transparency: 50 },
    line: { width: 0 },
  });

  const timeline = [
    { date: "2025.12", desc: "v0.8 首次公开发布，Apache 2.0 开源" },
    { date: "2026.04", desc: "v0.9 新增 React/Flutter/Angular 渲染器 + Python Agent SDK" },
    { date: "生产落地", desc: "Google Opal 等生产系统已落地应用" },
  ];

  timeline.forEach((t, i) => {
    const tx = 0.7 + i * 3.1;
    // Dot on timeline
    slide.addShape(pptx.shapes.OVAL, {
      x: tx + 0.5, y: 3.62, w: 0.12, h: 0.12,
      fill: { color: C.mint },
      line: { width: 0 },
    });
    slide.addText(t.date, {
      x: tx, y: 3.85, w: 2.8, h: 0.3,
      fontSize: 12, fontFace: "Calibri", bold: true, color: C.mint,
      align: "center",
    });
    slide.addText(t.desc, {
      x: tx, y: 4.15, w: 2.8, h: 0.6,
      fontSize: 10, fontFace: "Calibri", color: C.sub,
      align: "center",
    });
  });

  addPageNum(slide, 7);
}

// ═══════════════════════════════════════════
// SLIDE 8: Core Value
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "02  A2UI 的引入");

  slide.addText("A2UI 的核心价值", {
    x: 0.35, y: 0.9, w: 5, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Key statement
  slide.addText("大模型赋予了机器理解与生成的能力，但缺乏与用户交互的界面载体", {
    x: 0.5, y: 1.4, w: 8.8, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: C.sub,
  });

  // Highlight
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.85, w: 8.8, h: 0.55,
    fill: { color: C.card },
    rectRadius: 0.08,
    shadow: shadow(),
    line: { width: 0 },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.54, y: 1.93, w: 0.04, h: 0.39,
    fill: { color: C.mint },
    line: { width: 0 },
  });
  slide.addText("A2UI 正是连接大模型与用户的桥梁 — 让 AI 的输出不再局限于文本，而是直接成为可交互的界面", {
    x: 0.75, y: 1.9, w: 8.2, h: 0.45,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.mint,
  });

  // 3 value cards
  const values = [
    { num: "01", title: "规范化输出", desc: "大模型按统一 Schema 生成 UI，确保一致性" },
    { num: "02", title: "即时渲染", desc: "Schema 到界面毫秒级转化，零延迟响应" },
    { num: "03", title: "业务适配", desc: "组件可扩展，灵活适配不同业务场景" },
  ];

  values.forEach((v, i) => {
    const vx = 0.5 + i * 3.05;
    addCard(slide, vx, 2.65, 2.8, 1.6);

    slide.addText(v.num, {
      x: vx + 0.25, y: 2.75, w: 0.6, h: 0.4,
      fontSize: 24, fontFace: "Calibri", bold: true, color: C.mint,
    });

    slide.addText(v.title, {
      x: vx + 0.25, y: 3.15, w: 2.4, h: 0.35,
      fontSize: 15, fontFace: "Calibri", bold: true, color: C.white,
    });

    slide.addText(v.desc, {
      x: vx + 0.25, y: 3.55, w: 2.4, h: 0.55,
      fontSize: 11, fontFace: "Calibri", color: C.sub,
    });
  });

  addPageNum(slide, 8);
}

// ═══════════════════════════════════════════
// SLIDE 9: Chapter 3 Divider
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: SH,
    fill: { color: C.teal, transparency: 80 },
    line: { width: 0 },
  });

  addLeftBars(slide);

  slide.addText("03", {
    x: 0.6, y: 1.2, w: 2.5, h: 1.2,
    fontSize: 72, fontFace: "Calibri", bold: true, color: C.cyan,
  });

  slide.addText("项目落地应用", {
    x: 0.6, y: 2.5, w: 7, h: 0.7,
    fontSize: 36, fontFace: "Calibri", bold: true, color: C.white,
  });

  slide.addText("国内营销 APP · 运维小搭档桌面端 · 使用进阶", {
    x: 0.6, y: 3.3, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.sub,
  });
}

// ═══════════════════════════════════════════
// SLIDE 10: Desktop App
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "03  项目落地应用");

  slide.addText("运维小搭档桌面端 — 新挑战与新选型", {
    x: 0.35, y: 0.9, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Left side: 运维痛点
  slide.addText("运维痛点", {
    x: 0.5, y: 1.45, w: 2, h: 0.35,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.cyan,
  });

  const painPoints = [
    { title: "重复性事务", desc: "大量工单、权限申请等重复操作" },
    { title: "经验依赖", desc: "问题排查依赖个人经验，知识难沉淀" },
    { title: "信息孤岛", desc: "各系统割裂，缺乏统一入口" },
    { title: "AI 难触达", desc: "AI 能力无法以交互式界面触达用户" },
  ];

  painPoints.forEach((p, i) => {
    const py = 1.85 + i * 0.65;
    addCard(slide, 0.5, py, 4.2, 0.55, { barWidth: 0.03 });
    slide.addText(p.title, {
      x: 0.75, y: py + 0.02, w: 1.5, h: 0.25,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
    });
    slide.addText(p.desc, {
      x: 0.75, y: py + 0.27, w: 3.7, h: 0.25,
      fontSize: 9, fontFace: "Calibri", color: C.sub,
    });
  });

  // Right side: 技术选型
  slide.addText("技术选型", {
    x: 5.2, y: 1.45, w: 2, h: 0.35,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.cyan,
  });

  const techChoices = [
    { title: "前端框架", desc: "Vue 3 + Vite 6" },
    { title: "UI 组件库", desc: "Element Plus" },
    { title: "桌面端", desc: "Electron 41" },
    { title: "动态渲染", desc: "A2UI Vue Engine" },
  ];

  techChoices.forEach((t, i) => {
    const ty = 1.85 + i * 0.65;
    addCard(slide, 5.2, ty, 4.2, 0.55, { barWidth: 0.03 });
    slide.addText(t.title, {
      x: 5.45, y: ty + 0.02, w: 1.5, h: 0.25,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
    });
    slide.addText(t.desc, {
      x: 5.45, y: ty + 0.27, w: 3.7, h: 0.25,
      fontSize: 9, fontFace: "Calibri", color: C.sub,
    });
  });

  // Bottom highlight
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.55, w: 8.8, h: 0.5,
    fill: { color: C.card },
    rectRadius: 0.08,
    shadow: shadow(),
    line: { width: 0 },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.54, y: 4.63, w: 0.04, h: 0.34,
    fill: { color: C.cyan },
    line: { width: 0 },
  });
  slide.addText("关键选型：A2UI Vue Engine — JSON Schema 驱动 + 零代码扩展", {
    x: 0.75, y: 4.58, w: 8.2, h: 0.4,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.cyan,
  });

  addPageNum(slide, 10);
}

// ═══════════════════════════════════════════
// SLIDE 11: Stage 1 Usage
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "03  项目落地应用");

  slide.addText("A2UI 使用进阶 — 从简单到复杂", {
    x: 0.35, y: 0.9, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Stage label
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.5, w: 1.2, h: 0.4,
    fill: { color: C.cyan },
    rectRadius: 0.06,
    line: { width: 0 },
  });
  slide.addText("阶段一", {
    x: 0.5, y: 1.5, w: 1.2, h: 0.4,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
    align: "center", valign: "middle",
  });

  slide.addText("输入一段话自动生成表单", {
    x: 1.9, y: 1.5, w: 5, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
  });

  slide.addText('用户说"我要申请网络权限"，AI 就能直接生成对应的表单界面', {
    x: 0.5, y: 2.1, w: 8.5, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: C.sub,
  });

  // Simple flow: 用户输入 → AI 理解 → 生成表单
  const flow1 = ["用户输入", "AI 理解", "生成表单"];
  flow1.forEach((item, i) => {
    const fx = 1.5 + i * 2.8;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: fx, y: 2.8, w: 2.0, h: 0.7,
      fill: { color: C.card },
      rectRadius: 0.08,
      shadow: shadow(),
      line: { width: 0 },
    });
    slide.addText(item, {
      x: fx, y: 2.8, w: 2.0, h: 0.7,
      fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle",
    });
    if (i < 2) {
      addHArrow(slide, fx + 2.05, 3.15, fx + 2.7, C.cyan);
    }
  });

  addPageNum(slide, 11);
}

// ═══════════════════════════════════════════
// SLIDE 12: Stage 2 Usage (OPTIMIZED FLOW)
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "03  项目落地应用");

  slide.addText("A2UI 使用进阶 — 从简单到复杂", {
    x: 0.35, y: 0.9, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Stage label
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.45, w: 1.2, h: 0.35,
    fill: { color: C.cyan },
    rectRadius: 0.06,
    line: { width: 0 },
  });
  slide.addText("阶段二", {
    x: 0.5, y: 1.45, w: 1.2, h: 0.35,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.white,
    align: "center", valign: "middle",
  });

  slide.addText("提示词工程驱动复杂业务流程", {
    x: 1.9, y: 1.45, w: 5, h: 0.35,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
  });

  slide.addText("以网络权限申请为例：将所有参数规则写进提示词，大模型按规则收集信息，通过 A2UI 生成完整申请表单，用户填完直接提交到 OA 系统", {
    x: 0.5, y: 1.9, w: 8.8, h: 0.45,
    fontSize: 10, fontFace: "Calibri", color: C.sub,
  });

  // 5-step flow diagram
  const steps = [
    { title: "接口卡片入参", desc: "上传 Excel 文件" },
    { title: "珊瑚流生成", desc: "MD 格式入参" },
    { title: "提示词构建", desc: "MD入参 + 接口URL" },
    { title: "珊瑚生成", desc: "JSON Schema" },
    { title: "UI 渲染", desc: "A2UI 界面呈现" },
  ];

  const stepW = 1.55;
  const stepH = 1.4;
  const gap = 0.25;
  const startX = 0.35;
  const stepY = 2.55;

  steps.forEach((s, i) => {
    const sx = startX + i * (stepW + gap);
    addCard(slide, sx, stepY, stepW, stepH, { accentColor: C.cyan, barWidth: 0.03 });

    // Step number circle
    slide.addShape(pptx.shapes.OVAL, {
      x: sx + stepW / 2 - 0.18, y: stepY + 0.12, w: 0.36, h: 0.36,
      fill: { color: C.cyan },
      line: { width: 0 },
    });
    slide.addText(String(i + 1), {
      x: sx + stepW / 2 - 0.18, y: stepY + 0.12, w: 0.36, h: 0.36,
      fontSize: 12, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle",
    });

    slide.addText(s.title, {
      x: sx + 0.1, y: stepY + 0.55, w: stepW - 0.2, h: 0.35,
      fontSize: 10, fontFace: "Calibri", bold: true, color: C.white,
      align: "center",
    });

    slide.addText(s.desc, {
      x: sx + 0.1, y: stepY + 0.9, w: stepW - 0.2, h: 0.35,
      fontSize: 9, fontFace: "Calibri", color: C.sub,
      align: "center",
    });

    // Arrow between steps
    if (i < 4) {
      addHArrow(slide, sx + stepW + 0.02, stepY + stepH / 2, sx + stepW + gap - 0.02, C.cyan);
    }
  });

  addPageNum(slide, 12);
}

// ═══════════════════════════════════════════
// SLIDE 13: Chapter 4 Divider
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: SH,
    fill: { color: C.teal, transparency: 80 },
    line: { width: 0 },
  });

  addLeftBars(slide);

  slide.addText("04", {
    x: 0.6, y: 1.2, w: 2.5, h: 1.2,
    fontSize: 72, fontFace: "Calibri", bold: true, color: C.amber,
  });

  slide.addText("从实现到赋能", {
    x: 0.6, y: 2.5, w: 7, h: 0.7,
    fontSize: 36, fontFace: "Calibri", bold: true, color: C.white,
  });

  slide.addText("核心架构 · 价值场景 · 未来展望", {
    x: 0.6, y: 3.3, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.sub,
  });
}

// ═══════════════════════════════════════════
// SLIDE 14: Core Architecture
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "04  从实现到赋能");

  slide.addText("a2ui-vue-engine 核心架构", {
    x: 0.35, y: 0.9, w: 6, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // 4 architecture cards (2x2 grid)
  const archItems = [
    { num: "01", title: "Schema 驱动渲染", desc: "JSON Schema 声明式描述 UI，引擎解析渲染为 Vue 组件", highlight: "AI 直接生成 JSON 即可产出界面" },
    { num: "02", title: "双格式 + 流式协议", desc: "扁平格式（AI 友好）与树形格式（渲染友好）自动转换", highlight: "JSONL 流式增量渲染，支持逐节点输出" },
    { num: "03", title: "声明式数据绑定", desc: "path / literal / expression 三种绑定类型", highlight: "支持 transform 变换链，表单数据自动提取" },
    { num: "04", title: "组件映射 + 可扩展", desc: "16 个内置组件 + 组件映射表", highlight: "支持 registerComponent 动态注册自定义组件" },
  ];

  archItems.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = 0.5 + col * 4.6;
    const ay = 1.45 + row * 1.95;
    addCard(slide, ax, ay, 4.3, 1.75, { accentColor: C.amber });

    slide.addText(a.num, {
      x: ax + 0.25, y: ay + 0.1, w: 0.6, h: 0.35,
      fontSize: 22, fontFace: "Calibri", bold: true, color: C.amber,
    });

    slide.addText(a.title, {
      x: ax + 0.25, y: ay + 0.45, w: 3.8, h: 0.3,
      fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
    });

    slide.addText(a.desc, {
      x: ax + 0.25, y: ay + 0.75, w: 3.8, h: 0.4,
      fontSize: 10, fontFace: "Calibri", color: C.sub,
    });

    slide.addText(a.highlight, {
      x: ax + 0.25, y: ay + 1.2, w: 3.8, h: 0.35,
      fontSize: 10, fontFace: "Calibri", bold: true, color: C.amber,
    });
  });

  addPageNum(slide, 14);
}

// ═══════════════════════════════════════════
// SLIDE 15: Technical Architecture Diagram
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "04  从实现到赋能");

  slide.addText("技术架构全景图", {
    x: 0.35, y: 0.9, w: 6, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  const layerX = 0.8;
  const layerW = 8.2;
  const layerH = 0.65;
  const gap = 0.15;

  // Layer 1: AI / 珊瑚工作流
  const ly1 = 1.5;
  addCard(slide, layerX, ly1, layerW, layerH, { accentColor: C.mint, barWidth: 0.04 });
  slide.addText("AI / 珊瑚工作流", {
    x: layerX + 0.25, y: ly1 + 0.05, w: 3, h: 0.3,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addText("AI Agent 输出 JSON Schema", {
    x: layerX + 0.25, y: ly1 + 0.32, w: 5, h: 0.25,
    fontSize: 10, fontFace: "Calibri", color: C.sub,
  });

  // Arrow 1→2
  addArrow(slide, layerX + layerW / 2, ly1 + layerH, layerX + layerW / 2, ly1 + layerH + gap, C.mint);

  // Layer 2: A2UI 协议层
  const ly2 = ly1 + layerH + gap + gap;
  addCard(slide, layerX, ly2, layerW, layerH, { accentColor: C.mint, barWidth: 0.04 });
  slide.addText("A2UI 协议层", {
    x: layerX + 0.25, y: ly2 + 0.05, w: 3, h: 0.3,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addText("JSON Schema (Flat/Tree) + JSONL Stream", {
    x: layerX + 0.25, y: ly2 + 0.32, w: 6, h: 0.25,
    fontSize: 10, fontFace: "Calibri", color: C.sub,
  });

  // Arrow 2→3
  addArrow(slide, layerX + layerW / 2, ly2 + layerH, layerX + layerW / 2, ly2 + layerH + gap, C.mint);

  // Layer 3: a2ui-vue-engine 核心引擎 (with 3 modules)
  const ly3 = ly2 + layerH + gap + gap;
  const layer3H = 1.0;
  addCard(slide, layerX, ly3, layerW, layer3H, { accentColor: C.amber, barWidth: 0.04 });
  slide.addText("a2ui-vue-engine 核心引擎", {
    x: layerX + 0.25, y: ly3 + 0.05, w: 4, h: 0.3,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
  });

  // 3 module sub-cards
  const modules = ["Schema Parser\n解析器", "Component Mapper\n组件映射", "Data Binder\n数据绑定"];
  modules.forEach((m, mi) => {
    const mx = layerX + 0.25 + mi * 2.65;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: mx, y: ly3 + 0.4, w: 2.35, h: 0.45,
      fill: { color: "0D2847" },
      rectRadius: 0.06,
      line: { color: C.amber, width: 0.5 },
    });
    slide.addText(m, {
      x: mx, y: ly3 + 0.4, w: 2.35, h: 0.45,
      fontSize: 9, fontFace: "Calibri", color: C.white,
      align: "center", valign: "middle",
    });
  });

  // Arrow 3→4
  addArrow(slide, layerX + layerW / 2, ly3 + layer3H, layerX + layerW / 2, ly3 + layer3H + gap, C.mint);

  // Layer 4: Vue 组件层
  const ly4 = ly3 + layer3H + gap + gap;
  addCard(slide, layerX, ly4, layerW, layerH, { accentColor: C.mint, barWidth: 0.04 });
  slide.addText("Vue 组件层", {
    x: layerX + 0.25, y: ly4 + 0.05, w: 3, h: 0.3,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addText("Built-in Components + Custom Components", {
    x: layerX + 0.25, y: ly4 + 0.32, w: 6, h: 0.25,
    fontSize: 10, fontFace: "Calibri", color: C.sub,
  });

  // Arrow 4→5
  addArrow(slide, layerX + layerW / 2, ly4 + layerH, layerX + layerW / 2, ly4 + layerH + gap, C.mint);

  // Layer 5: 渲染输出
  const ly5 = ly4 + layerH + gap + gap;
  addCard(slide, layerX, ly5, layerW, layerH, { accentColor: C.mint, barWidth: 0.04 });
  slide.addText("渲染输出", {
    x: layerX + 0.25, y: ly5 + 0.05, w: 3, h: 0.3,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addText("Web / Desktop / Mobile", {
    x: layerX + 0.25, y: ly5 + 0.32, w: 5, h: 0.25,
    fontSize: 10, fontFace: "Calibri", color: C.sub,
  });

  addPageNum(slide, 15);
}

// ═══════════════════════════════════════════
// SLIDE 16: Rendering Mechanism
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "04  从实现到赋能");

  slide.addText("JSON Schema 驱动的 UI 渲染机制", {
    x: 0.35, y: 0.9, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Flow: 4 steps
  const renderFlow = [
    "1.珊瑚系统输出\nJSON Schema",
    "2.A2UIRoot解析\n为树形结构",
    "3.Renderer映射\nVue VNodes",
    "4.用户交互\nAction事件",
  ];

  renderFlow.forEach((item, i) => {
    const fx = 0.5 + i * 2.35;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: fx, y: 1.4, w: 2.0, h: 0.7,
      fill: { color: C.card },
      rectRadius: 0.08,
      shadow: shadow(),
      line: { width: 0 },
    });
    slide.addText(item, {
      x: fx, y: 1.4, w: 2.0, h: 0.7,
      fontSize: 10, fontFace: "Calibri", color: C.white,
      align: "center", valign: "middle",
    });
    if (i < 3) {
      addHArrow(slide, fx + 2.05, 1.75, fx + 2.3, C.amber);
    }
  });

  // Code example card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 2.3, w: 4.5, h: 2.3,
    fill: { color: C.codeBg },
    rectRadius: 0.08,
    shadow: shadow(),
    line: { width: 0 },
  });

  const codeLines = [
    '{',
    '  "type": "Card",',
    '  "props": { "title": "运维工单" },',
    '  "children": [',
    '    { "type": "TextField",',
    '      "props": { "label": "问题描述",',
    '                 "field": "desc" } },',
    '    { "type": "Button",',
    '      "props": { "label": "提交",',
    '                 "action": "submit" } }',
    '  ]',
    '}',
  ];

  slide.addText(codeLines.map(l => ({ text: l, options: { fontSize: 9, fontFace: "Consolas", color: C.white, breakLine: true } })), {
    x: 0.7, y: 2.4, w: 4.1, h: 2.1,
    valign: "top",
  });

  // Schema → UI mapping
  const mappings = [
    { schema: '"type": "Card"', ui: "卡片容器组件" },
    { schema: '"type": "TextField"', ui: "文本输入框" },
    { schema: '"type": "Button"', ui: "操作按钮" },
    { schema: '"props.field"', ui: "数据绑定字段" },
    { schema: '"props.action"', ui: "点击事件处理" },
  ];

  slide.addText("Schema → UI 映射", {
    x: 5.3, y: 2.3, w: 4, h: 0.35,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.amber,
  });

  mappings.forEach((m, i) => {
    const my = 2.75 + i * 0.38;
    slide.addText(m.schema, {
      x: 5.3, y: my, w: 2.2, h: 0.3,
      fontSize: 10, fontFace: "Consolas", color: C.mint,
    });
    slide.addText("→", {
      x: 7.5, y: my, w: 0.3, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: C.sub,
      align: "center",
    });
    slide.addText(m.ui, {
      x: 7.8, y: my, w: 1.8, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: C.white,
    });
  });

  addPageNum(slide, 16);
}

// ═══════════════════════════════════════════
// SLIDE 17: JSON Format Comparison
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "04  从实现到赋能");

  slide.addText("JSON 格式定义 — 为什么这么设计？", {
    x: 0.35, y: 0.9, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // LEFT COLUMN - Traditional
  const leftX = 0.5;
  const colW = 4.3;

  addCard(slide, leftX, 1.45, colW, 3.8, { accentColor: C.red, barWidth: 0.04 });

  slide.addText("传统方式", {
    x: leftX + 0.25, y: 1.55, w: 2, h: 0.3,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.red,
  });

  slide.addText("传统 HTML 模板", {
    x: leftX + 0.25, y: 1.85, w: 3.5, h: 0.25,
    fontSize: 11, fontFace: "Calibri", color: C.sub,
  });

  // Code block
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: leftX + 0.2, y: 2.2, w: colW - 0.4, h: 1.1,
    fill: { color: C.codeBg },
    rectRadius: 0.06,
    line: { width: 0 },
  });

  const htmlCode = [
    '<div class="form">',
    '  <input type="text" name="desc" />',
    '  <button onclick="submit()">',
    '    提交',
    '  </button>',
    '</div>',
  ];

  slide.addText(htmlCode.map(l => ({ text: l, options: { fontSize: 9, fontFace: "Consolas", color: C.white, breakLine: true } })), {
    x: leftX + 0.35, y: 2.25, w: colW - 0.7, h: 1.0,
    valign: "top",
  });

  // Pain points
  const painPts = [
    "强耦合：HTML结构与样式混合",
    "不安全：直接渲染外部HTML有XSS风险",
    "难扩展：三端适配成本高",
    "非AI友好：大模型难以生成精确HTML",
  ];

  painPts.forEach((p, i) => {
    slide.addText([
      { text: "✗ ", options: { fontSize: 10, color: C.red, bold: true } },
      { text: p, options: { fontSize: 9, color: C.sub } },
    ], {
      x: leftX + 0.25, y: 3.45 + i * 0.35, w: colW - 0.5, h: 0.3,
    });
  });

  // RIGHT COLUMN - A2UI
  const rightX = 5.1;

  addCard(slide, rightX, 1.45, colW, 3.8, { accentColor: C.mint, barWidth: 0.04 });

  slide.addText("A2UI 方式", {
    x: rightX + 0.25, y: 1.55, w: 2, h: 0.3,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.mint,
  });

  slide.addText("A2UI JSON Schema", {
    x: rightX + 0.25, y: 1.85, w: 3.5, h: 0.25,
    fontSize: 11, fontFace: "Calibri", color: C.sub,
  });

  // Code block
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: rightX + 0.2, y: 2.2, w: colW - 0.4, h: 1.1,
    fill: { color: C.codeBg },
    rectRadius: 0.06,
    line: { width: 0 },
  });

  const jsonCode = [
    '{',
    '  "type": "Card",',
    '  "children": [',
    '    { "type": "TextField",',
    '      "props": { "field": "desc" } },',
    '    { "type": "Button",',
    '      "props": { "action": "submit" } }',
    '  ]',
    '}',
  ];

  slide.addText(jsonCode.map(l => ({ text: l, options: { fontSize: 9, fontFace: "Consolas", color: C.white, breakLine: true } })), {
    x: rightX + 0.35, y: 2.25, w: colW - 0.7, h: 1.0,
    valign: "top",
  });

  // Advantages
  const advantages = [
    "声明式：描述UI而非实现细节",
    "安全：Schema白名单渲染，无注入风险",
    "跨端：一套Schema多端渲染",
    "AI友好：大模型可直接生成JSON",
  ];

  advantages.forEach((a, i) => {
    slide.addText([
      { text: "✓ ", options: { fontSize: 10, color: C.mint, bold: true } },
      { text: a, options: { fontSize: 9, color: C.sub } },
    ], {
      x: rightX + 0.25, y: 3.45 + i * 0.35, w: colW - 0.5, h: 0.3,
    });
  });

  addPageNum(slide, 17);
}

// ═══════════════════════════════════════════
// SLIDE 18: Capability Encapsulation
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "04  从实现到赋能");

  slide.addText("能力封装 — 让团队零门槛使用", {
    x: 0.35, y: 0.9, w: 8, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Left card: SKILL.md
  addCard(slide, 0.5, 1.5, 4.3, 3.5, { accentColor: C.amber });

  slide.addText("SKILL.md", {
    x: 0.75, y: 1.6, w: 2, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true, color: C.amber,
  });

  slide.addText("核心规范与使用指南", {
    x: 0.75, y: 1.95, w: 3.5, h: 0.25,
    fontSize: 11, fontFace: "Calibri", color: C.sub,
  });

  const skillItems = [
    "两种 JSON 格式：Nested 与 Flat（推荐）",
    "四大组件类：Layout / Form / Display / Action",
    "数据绑定规则：value.path + value.default",
    "布局模式：Card+Column 表单、Row+Column 网格",
    "交互配置：按钮 Action 事件定义",
    "10 条最佳实践",
  ];

  skillItems.forEach((item, i) => {
    slide.addText([
      { text: "▸ ", options: { fontSize: 10, color: C.amber } },
      { text: item, options: { fontSize: 10, color: C.white } },
    ], {
      x: 0.75, y: 2.35 + i * 0.38, w: 3.8, h: 0.35,
    });
  });

  // Right card: reference.md
  addCard(slide, 5.1, 1.5, 4.3, 3.5, { accentColor: C.amber });

  slide.addText("reference.md", {
    x: 5.35, y: 1.6, w: 2.5, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true, color: C.amber,
  });

  slide.addText("组件 API 参考手册", {
    x: 5.35, y: 1.95, w: 3.5, h: 0.25,
    fontSize: 11, fontFace: "Calibri", color: C.sub,
  });

  const refItems = [
    "Layout: A2Card A2Row A2Column A2List",
    "Form: A2TextField A2Input A2Select A2SelectField A2DatePicker A2DateTimeInput A2ChoicePicker",
    "Display: A2Text A2Icon A2InfoField",
    "Action: A2Button",
  ];

  refItems.forEach((item, i) => {
    slide.addText([
      { text: "▸ ", options: { fontSize: 10, color: C.amber } },
      { text: item, options: { fontSize: 10, color: C.white } },
    ], {
      x: 5.35, y: 2.35 + i * 0.45, w: 3.8, h: 0.4,
    });
  });

  // Bottom summary
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y: 4.15, w: 3.9, h: 0.55,
    fill: { color: "0D2847" },
    rectRadius: 0.06,
    line: { color: C.amber, width: 0.5 },
  });
  slide.addText("15 个组件 · 4 大分类 · Props 表格 + JSON 示例", {
    x: 5.35, y: 4.2, w: 3.8, h: 0.45,
    fontSize: 10, fontFace: "Calibri", bold: true, color: C.amber,
    align: "center", valign: "middle",
  });

  addPageNum(slide, 18);
}

// ═══════════════════════════════════════════
// SLIDE 19: npm Open Source
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);
  addTitle(slide, "04  从实现到赋能");

  slide.addText("npm 组件库开源发布", {
    x: 0.35, y: 0.9, w: 6, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: C.white,
  });

  // Command code card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.5, w: 8.8, h: 0.6,
    fill: { color: C.codeBg },
    rectRadius: 0.08,
    shadow: shadow(),
    line: { width: 0 },
  });
  slide.addText("npm install a2ui-vue-engine", {
    x: 0.7, y: 1.5, w: 8.4, h: 0.6,
    fontSize: 16, fontFace: "Consolas", color: C.mint,
    valign: "middle",
  });

  // 4 benefit cards
  const benefits = [
    { title: "开箱即用", desc: "npm install 即可引入，无需重复开发" },
    { title: "版本管控", desc: "语义化版本，升级可控可追溯" },
    { title: "跨项目复用", desc: "一次开发，多系统复用" },
    { title: "生态开放", desc: "开源可扩展，社区共建" },
  ];

  benefits.forEach((b, i) => {
    const bx = 0.5 + i * 2.3;
    addCard(slide, bx, 2.4, 2.1, 1.8, { accentColor: C.amber });

    slide.addText(b.title, {
      x: bx + 0.2, y: 2.55, w: 1.7, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
      align: "center",
    });

    slide.addText(b.desc, {
      x: bx + 0.2, y: 2.95, w: 1.7, h: 0.9,
      fontSize: 11, fontFace: "Calibri", color: C.sub,
      align: "center",
    });
  });

  addPageNum(slide, 19);
}

// ═══════════════════════════════════════════
// SLIDE 20: Value & Use Cases
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);

  // Title
  slide.addText("A2UI 的价值与应用场景", {
    x: 0.35, y: 0.3, w: 9, h: 0.45,
    fontSize: 24, fontFace: "Calibri", bold: true, color: C.mint,
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.35, y: 0.75, w: 9, h: 0.02,
    fill: { color: C.mint, transparency: 65 },
    line: { width: 0 },
  });

  // Left section: 核心价值
  slide.addText("核心价值", {
    x: 0.5, y: 1.0, w: 2, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true, color: C.mint,
  });

  const coreValues = [
    { title: "零代码生成", desc: "AI 输出 JSON Schema 即可生成界面，无需手写前端代码" },
    { title: "安全可控", desc: "Schema 白名单渲染机制，杜绝 XSS 等注入风险" },
    { title: "跨端复用", desc: "一套 Schema 多端渲染，Web / 桌面端 / 移动端通用" },
  ];

  coreValues.forEach((v, i) => {
    const vy = 1.5 + i * 1.15;
    addCard(slide, 0.5, vy, 4.2, 0.95, { barWidth: 0.04 });

    slide.addText(v.title, {
      x: 0.75, y: vy + 0.08, w: 3.8, h: 0.3,
      fontSize: 14, fontFace: "Calibri", bold: true, color: C.white,
    });
    slide.addText(v.desc, {
      x: 0.75, y: vy + 0.42, w: 3.8, h: 0.4,
      fontSize: 11, fontFace: "Calibri", color: C.sub,
    });
  });

  // Right section: 适用场景
  slide.addText("适用场景", {
    x: 5.2, y: 1.0, w: 2, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true, color: C.mint,
  });

  const scenarios = [
    { title: "智能审批 / 流程申请", desc: "权限申请、工单提交、审批流程，AI 自动生成表单" },
    { title: "智能运维", desc: "故障排查、服务重启、日志查看，对话即操作" },
    { title: "数据分析", desc: "运营看板、报表展示、多维筛选，AI 按需生成" },
    { title: "智能客服", desc: "产品咨询、售后工单、进度查询，交互式界面即时呈现" },
  ];

  scenarios.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 5.2 + col * 2.25;
    const sy = 1.5 + row * 1.75;
    addCard(slide, sx, sy, 2.05, 1.5, { barWidth: 0.03 });

    slide.addText(s.title, {
      x: sx + 0.2, y: sy + 0.1, w: 1.7, h: 0.3,
      fontSize: 13, fontFace: "Calibri", bold: true, color: C.white,
      align: "center",
    });
    slide.addText(s.desc, {
      x: sx + 0.2, y: sy + 0.45, w: 1.7, h: 0.8,
      fontSize: 10, fontFace: "Calibri", color: C.sub,
      align: "center",
    });
  });

  addPageNum(slide, 20);
}

// ═══════════════════════════════════════════
// SLIDE 21: Summary
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };
  addLeftBars(slide);

  // Title
  slide.addText("总结", {
    x: 0.35, y: 0.25, w: 5, h: 0.55,
    fontSize: 32, fontFace: "Calibri", bold: true, color: C.white,
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.35, y: 0.78, w: 3, h: 0.025,
    fill: { color: C.mint, transparency: 65 },
    line: { width: 0 },
  });

  // 4 summary cards connected with arrows
  const summaryItems = [
    { title: "背景与痛点", desc: "国内营销 APP 开发挑战 / 传统 HTML 方案瓶颈", color: C.mint },
    { title: "A2UI 引入", desc: "Google 开放协议 / AI 与 UI 的桥梁", color: C.mint },
    { title: "项目落地", desc: "国内营销 APP / 运维小搭档桌面端", color: C.cyan },
    { title: "从实现到赋能", desc: "核心架构与渲染机制 / 价值场景与未来展望", color: C.amber },
  ];

  summaryItems.forEach((s, i) => {
    const sx = 0.4 + i * 2.38;
    addCard(slide, sx, 1.15, 2.15, 1.6, { accentColor: s.color, barWidth: 0.04 });

    slide.addText(s.title, {
      x: sx + 0.2, y: 1.3, w: 1.8, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true, color: s.color,
      align: "center",
    });

    slide.addText(s.desc, {
      x: sx + 0.2, y: 1.7, w: 1.8, h: 0.8,
      fontSize: 10, fontFace: "Calibri", color: C.sub,
      align: "center",
    });

    // Arrow between cards
    if (i < 3) {
      addHArrow(slide, sx + 2.2, 1.95, sx + 2.35, C.mint);
    }
  });

  // Bottom quotes
  const quotes = [
    "我们不是在做一个项目，而是在沉淀一种能力",
    '让 AI 不只能说话，还能\u201C画出\u201D界面',
    "让大模型的能力真正触达每一个业务场景",
  ];

  quotes.forEach((q, i) => {
    const qy = 3.1 + i * 0.55;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.5, y: qy, w: 7, h: 0.42,
      fill: { color: C.card },
      rectRadius: 0.06,
      shadow: shadow(),
      line: { width: 0 },
    });
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.54, y: qy + 0.06, w: 0.04, h: 0.3,
      fill: { color: C.mint },
      line: { width: 0 },
    });
    slide.addText(q, {
      x: 1.75, y: qy, w: 6.5, h: 0.42,
      fontSize: 12, fontFace: "Calibri", color: C.white,
      valign: "middle",
    });
  });

  addPageNum(slide, 21);
}

// ═══════════════════════════════════════════
// SLIDE 22: Thank You
// ═══════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  addLeftBars(slide);

  slide.addText("感谢聆听", {
    x: 0, y: 1.8, w: SW, h: 1.0,
    fontSize: 40, fontFace: "Calibri", bold: true, color: C.white,
    align: "center", valign: "middle",
  });

  slide.addText("添可 AIT 中心 · 国内营销智能部 · 陈辉", {
    x: 0, y: 3.0, w: SW, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: C.sub,
    align: "center",
  });

  slide.addText("2026.06", {
    x: 0, y: 3.5, w: SW, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: C.footer,
    align: "center",
  });
}

// ─── Generate ───
const outputPath = "d:\\work\\program\\tineco\\UI\\a2ui-vue-engine\\A2UI技术分享-v5.pptx";
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log("✅ PPTX generated successfully:", outputPath);
}).catch(err => {
  console.error("❌ Error generating PPTX:", err);
});
