/*********************************************************************************
 ** Copyright (C), 2019-2029, OPLUS Mobile Comm Corp., Ltd
 ** All rights reserved.
 **
 ** File: - create_agent_future_ppt.js
 ** Description: Generate Agent future development directions presentation
 ** Version: 1.0
 ** Date: 2026/06/04
 ** Author: limao2@Apps.Gallery
 **
 ** ------------------------------- Revision History: ----------------------------
 ** <author>                <date>       <version>   <desc>
 ** ------------------------------------------------------------------------------
 ** limao2@Apps.Gallery     2026/06/04   1.0         INIT
 *********************************************************************************/

const pptxgen = require("pptxgenjs");
const path = require("path");

/** @type {Record<string, string>} */
const C = {
  indigo: "1E1B4B",
  violet: "7C3AED",
  lightViolet: "A78BFA",
  lavender: "E9D5FF",
  mint: "14B8A6",
  white: "FFFFFF",
  offWhite: "F8F7FF",
  textDark: "1E293B",
  textMuted: "64748B",
  coral: "F96167",
  gold: "F59E0B",
  slate: "475569",
};

const FONT_TITLE = "Arial Black";
const FONT_BODY = "Calibri";
const OUTPUT = path.join(__dirname, "..", "..", "..", "..", "Agent未来发展方向.pptx");

function makeShadow() {
  return { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.12 };
}

function addFooter(slide, text) {
  slide.addText(text, {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.3,
    fontSize: 9,
    fontFace: FONT_BODY,
    color: C.textMuted,
    align: "right",
    margin: 0,
  });
}

function addSlideTitle(slide, title, subtitle) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.12,
    h: 5.625,
    fill: { color: C.violet },
    line: { color: C.violet, width: 0 },
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: FONT_TITLE,
    color: C.indigo,
    bold: true,
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.55,
      y: 1.0,
      w: 9,
      h: 0.4,
      fontSize: 14,
      fontFace: FONT_BODY,
      color: C.textMuted,
      italic: true,
      margin: 0,
    });
  }
}

function addStatCard(slide, x, y, w, h, number, label, accent) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: C.white },
    line: { color: C.lavender, width: 1 },
    shadow: makeShadow(),
  });
  slide.addShape("rect", {
    x,
    y,
    w: 0.08,
    h,
    fill: { color: accent },
    line: { color: accent, width: 0 },
  });
  slide.addText(number, {
    x: x + 0.2,
    y: y + 0.15,
    w: w - 0.3,
    h: 0.7,
    fontSize: 34,
    fontFace: FONT_TITLE,
    color: accent,
    bold: true,
    margin: 0,
  });
  slide.addText(label, {
    x: x + 0.2,
    y: y + 0.85,
    w: w - 0.3,
    h: 0.55,
    fontSize: 11,
    fontFace: FONT_BODY,
    color: C.textMuted,
    margin: 0,
  });
}

function addDirectionCard(slide, x, y, w, h, num, title, bullets, accent) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: C.white },
    line: { color: C.lavender, width: 1 },
    shadow: makeShadow(),
  });
  slide.addShape("rect", {
    x,
    y,
    w,
    h: 0.42,
    fill: { color: accent },
    line: { color: accent, width: 0 },
  });
  slide.addShape("ellipse", {
    x: x + 0.12,
    y: y + 0.06,
    w: 0.3,
    h: 0.3,
    fill: { color: C.white, transparency: 25 },
    line: { color: C.white, width: 0 },
  });
  slide.addText(num, {
    x: x + 0.12,
    y: y + 0.08,
    w: 0.3,
    h: 0.26,
    fontSize: 11,
    fontFace: FONT_TITLE,
    color: C.white,
    align: "center",
    margin: 0,
  });
  slide.addText(title, {
    x: x + 0.5,
    y: y + 0.06,
    w: w - 0.65,
    h: 0.32,
    fontSize: 13,
    fontFace: FONT_TITLE,
    color: C.white,
    bold: true,
    margin: 0,
  });
  slide.addText(
    bullets.map((b, i) => ({
      text: b,
      options: { bullet: true, breakLine: i < bullets.length - 1, fontSize: 10, color: C.textDark },
    })),
    { x: x + 0.15, y: y + 0.52, w: w - 0.3, h: h - 0.6, fontFace: FONT_BODY, valign: "top" }
  );
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Verity AISDD";
  pres.title = "Agent 的未来发展方向";
  pres.subject = "AI Agent Future Directions 2026-2030";

  // Slide 1: Title
  {
    const slide = pres.addSlide();
    slide.background = { color: C.indigo };
    slide.addShape("rect", {
      x: 0,
      y: 4.55,
      w: 10,
      h: 1.075,
      fill: { color: C.violet, transparency: 35 },
      line: { color: C.violet, width: 0 },
    });
    slide.addShape("ellipse", {
      x: 7.2,
      y: 0.4,
      w: 3.0,
      h: 3.0,
      fill: { color: C.lightViolet, transparency: 82 },
      line: { color: C.lightViolet, width: 0 },
    });
    slide.addShape("ellipse", {
      x: 8.0,
      y: 1.0,
      w: 1.5,
      h: 1.5,
      fill: { color: C.mint, transparency: 75 },
      line: { color: C.mint, width: 0 },
    });
    slide.addText("Agent 的未来发展方向", {
      x: 0.6,
      y: 1.4,
      w: 7.5,
      h: 1.2,
      fontSize: 42,
      fontFace: FONT_TITLE,
      color: C.white,
      bold: true,
      margin: 0,
    });
    slide.addText("从工具调用到自主协作  ·  2026–2030 趋势展望", {
      x: 0.6,
      y: 2.65,
      w: 7.5,
      h: 0.5,
      fontSize: 16,
      fontFace: FONT_BODY,
      color: C.lavender,
      margin: 0,
    });
    slide.addText("2026 年 6 月", {
      x: 0.6,
      y: 4.8,
      w: 3,
      h: 0.35,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: C.lavender,
      margin: 0,
    });
  }

  // Slide 2: Agenda
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "内容概览", "理解 Agent 范式转变，把握六大未来方向");

    const items = [
      ["01", "Agent 是什么", "从 Chatbot 到自主行动体"],
      ["02", "演进脉络", "2023–2030 关键里程碑"],
      ["03", "六大方向", "协作 · 自主 · 数字员工 · 多模态 · 平台 · 端侧"],
      ["04", "产业数据", "采纳率与落地场景"],
      ["05", "挑战边界", "可靠性与治理"],
      ["06", "未来展望", "2026–2030 路线图"],
    ];

    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.6 + col * 4.7;
      const y = 1.55 + row * 1.75;
      slide.addShape("rect", {
        x,
        y,
        w: 4.3,
        h: 1.45,
        fill: { color: C.white },
        line: { color: C.lavender, width: 1 },
        shadow: makeShadow(),
      });
      slide.addShape("rect", {
        x,
        y,
        w: 0.55,
        h: 1.45,
        fill: { color: C.violet },
        line: { color: C.violet, width: 0 },
      });
      slide.addText(item[0], {
        x: x + 0.05,
        y: y + 0.45,
        w: 0.45,
        h: 0.5,
        fontSize: 18,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addText(item[1], {
        x: x + 0.7,
        y: y + 0.25,
        w: 3.4,
        h: 0.45,
        fontSize: 18,
        fontFace: FONT_TITLE,
        color: C.indigo,
        bold: true,
        margin: 0,
      });
      slide.addText(item[2], {
        x: x + 0.7,
        y: y + 0.75,
        w: 3.4,
        h: 0.45,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "Agent 的未来发展方向");
  }

  // Slide 3: What is Agent
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "什么是 AI Agent？", "具备感知、规划、行动与记忆的智能体");

    slide.addShape("rect", {
      x: 0.6,
      y: 1.5,
      w: 3.8,
      h: 3.55,
      fill: { color: C.white },
      line: { color: C.lavender, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText("传统 LLM / Chatbot", {
      x: 0.85,
      y: 1.65,
      w: 3.3,
      h: 0.4,
      fontSize: 15,
      fontFace: FONT_TITLE,
      color: C.textMuted,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "输入 → 生成文本回复", options: { breakLine: true, fontSize: 12, color: C.textDark } },
        { text: "被动响应，无持久状态", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "无法调用外部工具", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "适合问答与内容创作", options: { bullet: true, fontSize: 11 } },
      ],
      { x: 0.85, y: 2.15, w: 3.3, h: 2.5, fontFace: FONT_BODY }
    );

    slide.addShape("rect", {
      x: 5.6,
      y: 1.5,
      w: 3.8,
      h: 3.55,
      fill: { color: C.indigo },
      line: { color: C.indigo, width: 0 },
      shadow: makeShadow(),
    });
    slide.addText("AI Agent", {
      x: 5.85,
      y: 1.65,
      w: 3.3,
      h: 0.4,
      fontSize: 15,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "目标 → 规划 → 工具调用 → 反馈 → 迭代", options: { breakLine: true, fontSize: 12, color: C.white } },
        { text: "长期记忆与上下文管理", options: { bullet: true, breakLine: true, fontSize: 11, color: C.lavender } },
        { text: "可浏览网页、写代码、操作 API", options: { bullet: true, breakLine: true, fontSize: 11, color: C.lavender } },
        { text: "自主完成多步复杂任务", options: { bullet: true, fontSize: 11, color: C.lavender } },
      ],
      { x: 5.85, y: 2.15, w: 3.3, h: 2.5, fontFace: FONT_BODY }
    );

    slide.addShape("ellipse", {
      x: 4.55,
      y: 2.85,
      w: 0.9,
      h: 0.9,
      fill: { color: C.violet },
      line: { color: C.white, width: 2 },
    });
    slide.addText("→", {
      x: 4.55,
      y: 2.95,
      w: 0.9,
      h: 0.7,
      fontSize: 28,
      color: C.white,
      align: "center",
      margin: 0,
    });

    slide.addShape("rect", {
      x: 0.6,
      y: 4.35,
      w: 8.8,
      h: 0.75,
      fill: { color: C.violet },
      line: { color: C.violet, width: 0 },
    });
    slide.addText("核心能力环：感知 Perceive · 规划 Plan · 行动 Act · 记忆 Remember · 反思 Reflect", {
      x: 0.8,
      y: 4.5,
      w: 8.4,
      h: 0.45,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: C.white,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：International AI Safety Report 2026 · 行业共识");
  }

  // Slide 4: Evolution timeline
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "Agent 演进脉络", "从单轮对话到多 Agent 自主协作");

    const milestones = [
      { year: "2023", label: "Tool\nCalling 萌芽", color: C.lavender },
      { year: "2024", label: "RAG +\nReAct 框架", color: C.lightViolet },
      { year: "2025", label: "Computer\nUse Agent", color: C.violet },
      { year: "2026", label: "Multi-Agent\n企业编排", color: C.mint },
      { year: "2028+", label: "自进化\nAgent 系统", color: C.coral },
    ];

    milestones.forEach((m, i) => {
      const x = 0.45 + i * 1.85;
      slide.addShape("ellipse", {
        x: x + 0.45,
        y: 2.0,
        w: 0.85,
        h: 0.85,
        fill: { color: m.color },
        line: { color: C.indigo, width: 1 },
      });
      slide.addText(m.year, {
        x: x + 0.45,
        y: 2.15,
        w: 0.85,
        h: 0.55,
        fontSize: 12,
        fontFace: FONT_TITLE,
        color: C.indigo,
        align: "center",
        margin: 0,
      });
      slide.addText(m.label, {
        x: x + 0.1,
        y: 3.05,
        w: 1.55,
        h: 0.95,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textDark,
        align: "center",
        margin: 0,
      });
      if (i < milestones.length - 1) {
        slide.addShape("line", {
          x: x + 1.3,
          y: 2.42,
          w: 0.55,
          h: 0,
          line: { color: C.violet, width: 2, dashType: "dash" },
        });
      }
    });

    slide.addShape("rect", {
      x: 0.6,
      y: 4.15,
      w: 8.8,
      h: 0.85,
      fill: { color: C.indigo },
      line: { color: C.indigo, width: 0 },
    });
    slide.addText("范式转变：Agent 任务复杂度约每 7 个月翻倍，从「辅助对话」走向「替代工作流」", {
      x: 0.8,
      y: 4.3,
      w: 8.4,
      h: 0.55,
      fontSize: 13,
      fontFace: FONT_BODY,
      color: C.white,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：International AI Safety Report 2026 · METR 研究");
  }

  // Slide 5: Six directions overview
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "六大未来发展方向", "2026–2030 Agent 技术演进主轴");

    const directions = [
      ["01", "多 Agent 协作", "动态编排 · 角色分工"],
      ["02", "深度自主化", "长程规划 · 自我纠错"],
      ["03", "数字员工", "Computer Use · 业务流程"],
      ["04", "多模态具身", "视觉 · 语音 · 机器人"],
      ["05", "企业 Agent 平台", "治理 · 可观测 · MCP"],
      ["06", "端侧混合 Agent", "本地推理 + 云端深思考"],
    ];

    directions.forEach((d, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.6 + col * 3.1;
      const y = 1.5 + row * 1.85;
      slide.addShape("rect", {
        x,
        y,
        w: 2.85,
        h: 1.55,
        fill: { color: C.white },
        line: { color: C.violet, width: 1 },
        shadow: makeShadow(),
      });
      slide.addShape("ellipse", {
        x: x + 0.15,
        y: y + 0.2,
        w: 0.45,
        h: 0.45,
        fill: { color: C.violet },
        line: { color: C.violet, width: 0 },
      });
      slide.addText(d[0], {
        x: x + 0.15,
        y: y + 0.27,
        w: 0.45,
        h: 0.3,
        fontSize: 12,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addText(d[1], {
        x: x + 0.7,
        y: y + 0.18,
        w: 2.0,
        h: 0.4,
        fontSize: 13,
        fontFace: FONT_TITLE,
        color: C.indigo,
        bold: true,
        margin: 0,
      });
      slide.addText(d[2], {
        x: x + 0.15,
        y: y + 0.75,
        w: 2.55,
        h: 0.65,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "Agent 的未来发展方向");
  }

  // Slide 6: Multi-agent
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "方向一：多 Agent 协作与动态编排", "从单体 Agent 到「Agent 团队」");

    addDirectionCard(
      slide,
      0.6,
      1.5,
      4.2,
      2.0,
      "01",
      "角色化分工",
      ["Researcher / Coder / Reviewer 等专职 Agent", "CrewAI、AutoGen 等框架成熟", "人类设定目标，Agent 团队自主分工"],
      C.violet
    );
    addDirectionCard(
      slide,
      5.2,
      1.5,
      4.2,
      2.0,
      "02",
      "动态编排",
      ["按任务实时创建/退役 Agent 实例", "LangGraph 图状态机精确控制流程", "Supervisor Agent 协调子 Agent 输出"],
      C.mint
    );

    slide.addShape("rect", {
      x: 0.6,
      y: 3.7,
      w: 8.8,
      h: 1.35,
      fill: { color: C.indigo },
      line: { color: C.indigo, width: 0 },
    });
    slide.addText("未来形态：Agent Swarm", {
      x: 0.85,
      y: 3.85,
      w: 3,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "数百个轻量 Agent 并行处理子任务，按需聚合结果", options: { bullet: true, breakLine: true, fontSize: 11, color: C.lavender } },
        { text: "跨组织 Agent 互操作：A2A 协议、MCP 标准化工具接入", options: { bullet: true, breakLine: true, fontSize: 11, color: C.lavender } },
        { text: "企业内「Agent 市场」：可复用、可组合的业务 Agent 模块", options: { bullet: true, fontSize: 11, color: C.lavender } },
      ],
      { x: 0.85, y: 4.2, w: 8.3, h: 0.75, fontFace: FONT_BODY }
    );
    addFooter(slide, "资料来源：LangGraph · Google A2A · Anthropic MCP");
  }

  // Slide 7: Autonomy
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "方向二：深度自主化与自进化", "Agent 从「执行指令」到「习得能力」");

    slide.addShape("rect", {
      x: 0.6,
      y: 1.5,
      w: 4.3,
      h: 3.5,
      fill: { color: C.white },
      line: { color: C.lavender, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText("当前：人工编排", {
      x: 0.85,
      y: 1.65,
      w: 3.8,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.textMuted,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "开发者预定义工具集与工作流", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "Prompt 工程驱动行为边界", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "新能力需重新部署或微调", options: { bullet: true, fontSize: 11 } },
      ],
      { x: 0.85, y: 2.1, w: 3.8, h: 1.5, fontFace: FONT_BODY, color: C.textDark }
    );

    slide.addShape("rect", {
      x: 5.1,
      y: 1.5,
      w: 4.3,
      h: 3.5,
      fill: { color: C.indigo },
      line: { color: C.indigo, width: 0 },
      shadow: makeShadow(),
    });
    slide.addText("未来：自进化 Agent", {
      x: 5.35,
      y: 1.65,
      w: 3.8,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "运行时自主发现与集成新 API / 工具", options: { bullet: true, breakLine: true, fontSize: 11, color: C.lavender } },
        { text: "从失败轨迹中学习，更新策略与记忆", options: { bullet: true, breakLine: true, fontSize: 11, color: C.lavender } },
        { text: "Test-time Compute：推理时扩展思考深度", options: { bullet: true, breakLine: true, fontSize: 11, color: C.lavender } },
        { text: "Voyager 式：通过环境交互持续习得技能", options: { bullet: true, fontSize: 11, color: C.lavender } },
      ],
      { x: 5.35, y: 2.1, w: 3.8, h: 2.0, fontFace: FONT_BODY }
    );

    slide.addText("关键挑战：自主边界与安全护栏如何平衡？", {
      x: 0.6,
      y: 4.55,
      w: 8.8,
      h: 0.4,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C.coral,
      italic: true,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：Aisera 2026 · Voyager · o-series 推理模型");
  }

  // Slide 8: Digital worker
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "方向三：数字员工与 Computer Use", "Agent 直接操作软件界面与业务流程");

    addStatCard(slide, 0.6, 1.55, 2.8, 1.35, "40%", "2028 年工作流由 Agent 自动化", C.violet);
    addStatCard(slide, 3.6, 1.55, 2.8, 1.35, "85%", "高管预期 Agent 自主处理流程", C.mint);
    addStatCard(slide, 6.6, 1.55, 2.8, 1.35, "21%", "2025 年运营中已部署 AI Agent", C.coral);

    slide.addShape("rect", {
      x: 0.6,
      y: 3.15,
      w: 8.8,
      h: 1.85,
      fill: { color: C.white },
      line: { color: C.lavender, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText("典型场景", {
      x: 0.85,
      y: 3.3,
      w: 2,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.indigo,
      bold: true,
      margin: 0,
    });

    const scenes = [
      ["IT 运维", "自动排查告警、执行修复脚本、提交工单"],
      ["客户服务", "跨系统查询订单、处理退款、升级投诉"],
      ["研发 Copilot", "读代码库、提 PR、跑 CI、修复 Bug"],
      ["财务合规", "对账、报表生成、异常标记与审批流"],
    ];
    scenes.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.85 + col * 4.3;
      const y = 3.75 + row * 0.55;
      slide.addText(s[0], {
        x,
        y,
        w: 1.2,
        h: 0.35,
        fontSize: 11,
        fontFace: FONT_TITLE,
        color: C.violet,
        bold: true,
        margin: 0,
      });
      slide.addText(s[1], {
        x: x + 1.25,
        y,
        w: 2.8,
        h: 0.45,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "资料来源：Capgemini 2026 · Gartner · OpenAI Operator / Claude Computer Use");
  }

  // Slide 9: Multimodal embodied
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "方向四：多模态与具身 Agent", "从屏幕操作到物理世界交互");

    const modes = [
      { label: "视觉 Agent", desc: "屏幕理解\nGUI 自动化", color: C.violet },
      { label: "语音 Agent", desc: "实时对话\n情感识别", color: C.mint },
      { label: "视频 Agent", desc: "场景监控\n事件推理", color: C.lightViolet },
      { label: "机器人 Agent", desc: "导航抓取\n人机协作", color: C.coral },
    ];

    modes.forEach((m, i) => {
      const x = 0.7 + i * 2.25;
      slide.addShape("rect", {
        x,
        y: 1.6,
        w: 2.05,
        h: 2.2,
        fill: { color: C.white },
        line: { color: m.color, width: 2 },
        shadow: makeShadow(),
      });
      slide.addShape("rect", {
        x,
        y: 1.6,
        w: 2.05,
        h: 0.5,
        fill: { color: m.color },
        line: { color: m.color, width: 0 },
      });
      slide.addText(m.label, {
        x: x + 0.1,
        y: 1.68,
        w: 1.85,
        h: 0.35,
        fontSize: 12,
        fontFace: FONT_TITLE,
        color: C.white,
        bold: true,
        align: "center",
        margin: 0,
      });
      slide.addText(m.desc, {
        x: x + 0.1,
        y: 2.3,
        w: 1.85,
        h: 1.2,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textDark,
        align: "center",
        margin: 0,
      });
    });

    slide.addShape("rect", {
      x: 0.6,
      y: 4.05,
      w: 8.8,
      h: 0.95,
      fill: { color: C.indigo },
      line: { color: C.indigo, width: 0 },
    });
    slide.addText(
      "统一多模态 Agent：一个 Agent 同时理解文本、图像、音频与传感器流，在数字与物理环境中无缝切换行动",
      {
        x: 0.8,
        y: 4.25,
        w: 8.4,
        h: 0.55,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C.lavender,
        align: "center",
        margin: 0,
      }
    );
    addFooter(slide, "资料来源：International AI Safety Report 2026 · Figure · Tesla FSD");
  }

  // Slide 10: Enterprise platform
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "方向五：企业 Agent 平台与治理", "从实验脚本到生产级基础设施");

    const pillars = [
      { title: "MCP 工具生态", items: "标准化工具接入 · 跨 Agent 共享上下文 · 插件市场", color: C.violet },
      { title: "可观测性", items: "Trace 全链路 · 成本追踪 · 质量评估", color: C.mint },
      { title: "安全治理", items: "权限沙箱 · 人工审批 · Prompt 注入防护", color: C.coral },
      { title: "Agent Ops", items: "版本管理 · A/B 测试 · 回滚与灰度", color: C.gold },
    ];

    pillars.forEach((p, i) => {
      const x = 0.6 + (i % 2) * 4.6;
      const y = 1.5 + Math.floor(i / 2) * 1.85;
      slide.addShape("rect", {
        x,
        y,
        w: 4.3,
        h: 1.6,
        fill: { color: C.white },
        line: { color: p.color, width: 2 },
        shadow: makeShadow(),
      });
      slide.addShape("rect", {
        x,
        y,
        w: 4.3,
        h: 0.45,
        fill: { color: p.color },
        line: { color: p.color, width: 0 },
      });
      slide.addText(p.title, {
        x: x + 0.15,
        y: y + 0.05,
        w: 4.0,
        h: 0.35,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.white,
        bold: true,
        margin: 0,
      });
      slide.addText(p.items, {
        x: x + 0.2,
        y: y + 0.6,
        w: 3.9,
        h: 0.85,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textDark,
        margin: 0,
      });
    });

    slide.addText("工程焦点：模型能力已足够，瓶颈在集成、可靠性与治理", {
      x: 0.6,
      y: 4.75,
      w: 8.8,
      h: 0.35,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C.violet,
      italic: true,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：Anthropic MCP · Langfuse · International AI Safety Report 2026");
  }

  // Slide 11: Edge hybrid
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "方向六：端侧 Agent 与混合架构", "低延迟响应 + 云端深度推理");

    slide.addShape("rect", {
      x: 0.6,
      y: 1.5,
      w: 2.7,
      h: 3.4,
      fill: { color: C.white },
      line: { color: C.mint, width: 2 },
      shadow: makeShadow(),
    });
    slide.addText("端侧 Agent", {
      x: 0.75,
      y: 1.65,
      w: 2.4,
      h: 0.35,
      fontSize: 13,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "本地 NPU 推理", options: { bullet: true, breakLine: true, fontSize: 10 } },
        { text: "隐私数据不出设备", options: { bullet: true, breakLine: true, fontSize: 10 } },
        { text: "离线基础任务", options: { bullet: true, breakLine: true, fontSize: 10 } },
        { text: "毫秒级响应", options: { bullet: true, fontSize: 10 } },
      ],
      { x: 0.75, y: 2.05, w: 2.4, h: 2.5, fontFace: FONT_BODY, color: C.textDark }
    );

    slide.addShape("rect", {
      x: 3.65,
      y: 1.5,
      w: 2.7,
      h: 3.4,
      fill: { color: C.indigo },
      line: { color: C.indigo, width: 0 },
    });
    slide.addText("编排层", {
      x: 3.8,
      y: 1.65,
      w: 2.4,
      h: 0.35,
      fontSize: 13,
      fontFace: FONT_TITLE,
      color: C.lavender,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "任务路由与分解", options: { bullet: true, breakLine: true, fontSize: 10, color: C.white } },
        { text: "端云协同调度", options: { bullet: true, breakLine: true, fontSize: 10, color: C.white } },
        { text: "统一 Agent 状态", options: { bullet: true, breakLine: true, fontSize: 10, color: C.white } },
        { text: "上下文同步", options: { bullet: true, fontSize: 10, color: C.white } },
      ],
      { x: 3.8, y: 2.05, w: 2.4, h: 2.5, fontFace: FONT_BODY }
    );

    slide.addShape("rect", {
      x: 6.7,
      y: 1.5,
      w: 2.7,
      h: 3.4,
      fill: { color: C.white },
      line: { color: C.violet, width: 2 },
      shadow: makeShadow(),
    });
    slide.addText("云端 Agent", {
      x: 6.85,
      y: 1.65,
      w: 2.4,
      h: 0.35,
      fontSize: 13,
      fontFace: FONT_TITLE,
      color: C.violet,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "复杂推理与规划", options: { bullet: true, breakLine: true, fontSize: 10 } },
        { text: "大规模工具调用", options: { bullet: true, breakLine: true, fontSize: 10 } },
        { text: "多 Agent 协作", options: { bullet: true, breakLine: true, fontSize: 10 } },
        { text: "最新模型能力", options: { bullet: true, fontSize: 10 } },
      ],
      { x: 6.85, y: 2.05, w: 2.4, h: 2.5, fontFace: FONT_BODY, color: C.textDark }
    );

    slide.addShape("line", {
      x: 3.3,
      y: 3.2,
      w: 0.35,
      h: 0,
      line: { color: C.violet, width: 2, endArrowType: "triangle" },
    });
    slide.addShape("line", {
      x: 6.35,
      y: 3.2,
      w: 0.35,
      h: 0,
      line: { color: C.violet, width: 2, endArrowType: "triangle" },
    });

    slide.addText("手机 · PC · 车机 · IoT 将成为 Agent 的第一入口", {
      x: 0.6,
      y: 4.55,
      w: 8.8,
      h: 0.35,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C.textMuted,
      italic: true,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：Apple Intelligence · Qualcomm · 行业公开资料");
  }

  // Slide 12: Adoption chart
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "产业采纳：Agent 进入主流", "从试点验证到默认生产力");

    slide.addChart(
      pres.charts.BAR,
      [
        {
          name: "运营中 AI Agent (%)",
          labels: ["2024", "2025", "2028 预测"],
          values: [10, 21, 40],
        },
        {
          name: "计划集成 Agent (%)",
          labels: ["2025", "2027 预测"],
          values: [65, 82],
        },
      ],
      {
        x: 0.5,
        y: 1.4,
        w: 5.3,
        h: 3.5,
        barDir: "col",
        chartColors: [C.violet, C.mint],
        chartArea: { fill: { color: C.white }, roundedCorners: true },
        catAxisLabelColor: C.textMuted,
        valAxisLabelColor: C.textMuted,
        valGridLine: { color: C.lavender, size: 0.5 },
        catGridLine: { style: "none" },
        showValue: true,
        dataLabelPosition: "outEnd",
        dataLabelColor: C.textDark,
        showLegend: true,
        legendPos: "b",
        valAxisMaxVal: 100,
        showTitle: true,
        title: "企业 Agent 采纳率 (%)",
        titleColor: C.textMuted,
        titleFontSize: 11,
      }
    );

    slide.addShape("rect", {
      x: 6.1,
      y: 1.5,
      w: 3.3,
      h: 3.4,
      fill: { color: C.white },
      line: { color: C.lavender, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText("优先落地场景", {
      x: 6.3,
      y: 1.65,
      w: 2.9,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.indigo,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "软件开发与 DevOps", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "客户支持与工单处理", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "知识管理与文档自动化", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "销售线索跟进与 CRM", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "内部流程审批与合规", options: { bullet: true, fontSize: 11 } },
      ],
      { x: 6.3, y: 2.05, w: 2.9, h: 2.6, fontFace: FONT_BODY, color: C.textDark }
    );
    addFooter(slide, "资料来源：Capgemini 2026 · Gartner · Aisera");
  }

  // Slide 13: Roadmap 2026-2030
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "2026–2030 发展路线图", "分阶段能力演进预判");

    const phases = [
      { period: "2026", title: "Agent 成为标配", items: "Computer Use 商用 · MCP 生态爆发 · 多 Agent 编排平台" },
      { period: "2027", title: "深度业务嵌入", items: "80%+ 企业集成 Agent · 垂直领域 Agent 市场 · Agent Ops 成熟" },
      { period: "2028", title: "自主协作规模化", items: "40% 工作流自动化 · Agent Swarm · 跨组织 A2A 互操作" },
      { period: "2029–30", title: "自进化与具身融合", items: "运行时习得新技能 · 机器人 Agent 商用 · 全球治理框架趋同" },
    ];

    phases.forEach((p, i) => {
      const y = 1.45 + i * 0.95;
      slide.addShape("rect", {
        x: 0.6,
        y,
        w: 1.3,
        h: 0.75,
        fill: { color: C.violet },
        line: { color: C.violet, width: 0 },
      });
      slide.addText(p.period, {
        x: 0.6,
        y: y + 0.15,
        w: 1.3,
        h: 0.45,
        fontSize: 13,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addShape("rect", {
        x: 2.05,
        y,
        w: 7.35,
        h: 0.75,
        fill: { color: C.white },
        line: { color: C.lavender, width: 1 },
        shadow: makeShadow(),
      });
      slide.addText(p.title, {
        x: 2.25,
        y: y + 0.08,
        w: 2.5,
        h: 0.3,
        fontSize: 12,
        fontFace: FONT_TITLE,
        color: C.indigo,
        bold: true,
        margin: 0,
      });
      slide.addText(p.items, {
        x: 4.8,
        y: y + 0.1,
        w: 4.4,
        h: 0.55,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "资料来源：Capgemini · Aisera · 综合研判");
  }

  // Slide 14: Challenges
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "挑战与边界", "理性认识 Agent 当前局限");

    slide.addChart(
      pres.charts.DOUGHNUT,
      [
        {
          name: "Agent 规模化瓶颈",
          labels: ["可靠性", "安全治理", "成本", "集成复杂度", "人才"],
          values: [30, 22, 18, 17, 13],
        },
      ],
      {
        x: 0.35,
        y: 1.3,
        w: 4.6,
        h: 3.7,
        chartColors: [C.coral, C.violet, C.mint, C.gold, C.slate],
        showPercent: true,
        showLegend: true,
        legendPos: "r",
        holeSize: 55,
        chartArea: { fill: { color: C.white } },
      }
    );

    slide.addText(
      [
        { text: "可靠性仍是第一瓶颈", options: { bold: true, breakLine: true, fontSize: 13, color: C.indigo } },
        { text: "复杂多步任务中 Agent 仍易犯基础错误，需人机协同审批", options: { fontSize: 11, color: C.textDark, breakLine: true } },
        { text: "", options: { breakLine: true, fontSize: 4 } },
        { text: "自主 ≠ 无监督", options: { bold: true, breakLine: true, fontSize: 13, color: C.indigo } },
        { text: "越自主的 Agent 越需要严格的权限边界与审计机制", options: { fontSize: 11, color: C.textDark, breakLine: true } },
        { text: "", options: { breakLine: true, fontSize: 4 } },
        { text: "AGI 仍属远期", options: { bold: true, breakLine: true, fontSize: 13, color: C.indigo } },
        { text: "当前 Agent 擅长特定工作流，通用自主智能无明确时间表", options: { fontSize: 11, color: C.textDark } },
      ],
      { x: 5.15, y: 1.5, w: 4.35, h: 3.5, fontFace: FONT_BODY, valign: "top" }
    );
    addFooter(slide, "资料来源：International AI Safety Report 2026");
  }

  // Slide 15: Conclusion
  {
    const slide = pres.addSlide();
    slide.background = { color: C.indigo };
    slide.addShape("ellipse", {
      x: -0.8,
      y: 3.8,
      w: 3.5,
      h: 3.5,
      fill: { color: C.violet, transparency: 78 },
      line: { color: C.violet, width: 0 },
    });
    slide.addText("核心结论", {
      x: 0.6,
      y: 0.75,
      w: 8,
      h: 0.6,
      fontSize: 28,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        {
          text: "Agent 是 AI 的下一范式：从「生成内容」到「自主完成工作」",
          options: { bullet: true, breakLine: true, fontSize: 16, color: C.white },
        },
        {
          text: "未来竞争焦点：多 Agent 协作、工具生态、可靠性与治理，而非单纯模型大小",
          options: { bullet: true, breakLine: true, fontSize: 16, color: C.white },
        },
        {
          text: "2026–2028 是 Agent 从试点到规模化的关键窗口期",
          options: { bullet: true, breakLine: true, fontSize: 16, color: C.white },
        },
        {
          text: "人机协同而非完全替代：Agent 负责执行，人类负责目标、审批与价值判断",
          options: { bullet: true, fontSize: 16, color: C.white },
        },
      ],
      { x: 0.6, y: 1.65, w: 8.5, h: 2.7, fontFace: FONT_BODY }
    );
    slide.addText("谢谢", {
      x: 0.6,
      y: 4.5,
      w: 3,
      h: 0.6,
      fontSize: 36,
      fontFace: FONT_TITLE,
      color: C.lavender,
      bold: true,
      margin: 0,
    });
    slide.addText("Q & A", {
      x: 7.5,
      y: 4.6,
      w: 2,
      h: 0.4,
      fontSize: 14,
      fontFace: FONT_BODY,
      color: C.lavender,
      align: "right",
      margin: 0,
    });
  }

  await pres.writeFile({ fileName: OUTPUT });
  console.log("Generated:", OUTPUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
