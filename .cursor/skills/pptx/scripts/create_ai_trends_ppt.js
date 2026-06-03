/*********************************************************************************
 ** Copyright (C), 2019-2029, OPLUS Mobile Comm Corp., Ltd
 ** All rights reserved.
 **
 ** File: - create_ai_trends_ppt.js
 ** Description: Generate AI technology trends presentation (2025-2026)
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
  midnight: "21295C",
  deepBlue: "065A82",
  teal: "1C7293",
  mint: "02C39A",
  ice: "CADCFC",
  white: "FFFFFF",
  offWhite: "F4F7FB",
  charcoal: "36454F",
  textDark: "1E293B",
  textMuted: "64748B",
  coral: "F96167",
  gold: "F9E795",
};

const FONT_TITLE = "Arial Black";
const FONT_BODY = "Calibri";
const OUTPUT = path.join(__dirname, "..", "..", "..", "..", "人工智能技术发展现状与展望.pptx");

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
    fill: { color: C.mint },
    line: { color: C.mint, width: 0 },
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: FONT_TITLE,
    color: C.midnight,
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

function addIconCircle(slide, x, y, label, desc, circleColor) {
  slide.addShape("ellipse", {
    x,
    y,
    w: 0.55,
    h: 0.55,
    fill: { color: circleColor },
    line: { color: circleColor, width: 0 },
  });
  slide.addText(label, {
    x,
    y: y + 0.08,
    w: 0.55,
    h: 0.4,
    fontSize: 16,
    fontFace: FONT_TITLE,
    color: C.white,
    align: "center",
    valign: "middle",
    margin: 0,
  });
  slide.addText(desc, {
    x: x - 0.15,
    y: y + 0.65,
    w: 0.85,
    h: 0.9,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: C.textDark,
    align: "center",
    margin: 0,
  });
}

function addStatCard(slide, x, y, w, h, number, label, accent) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: C.white },
    line: { color: C.ice, width: 1 },
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
    fontSize: 36,
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

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Verity AISDD";
  pres.title = "人工智能技术发展现状与展望";
  pres.subject = "AI Technology Trends 2025-2026";

  // Slide 1: Title
  {
    const slide = pres.addSlide();
    slide.background = { color: C.midnight };
    slide.addShape("rect", {
      x: 0,
      y: 4.6,
      w: 10,
      h: 1.025,
      fill: { color: C.teal, transparency: 30 },
      line: { color: C.teal, width: 0 },
    });
    slide.addShape("ellipse", {
      x: 7.5,
      y: 0.5,
      w: 2.8,
      h: 2.8,
      fill: { color: C.mint, transparency: 85 },
      line: { color: C.mint, width: 0 },
    });
    slide.addShape("ellipse", {
      x: 8.2,
      y: 1.2,
      w: 1.4,
      h: 1.4,
      fill: { color: C.ice, transparency: 70 },
      line: { color: C.ice, width: 0 },
    });
    slide.addText("人工智能技术发展现状与展望", {
      x: 0.6,
      y: 1.5,
      w: 7.5,
      h: 1.2,
      fontSize: 40,
      fontFace: FONT_TITLE,
      color: C.white,
      bold: true,
      margin: 0,
    });
    slide.addText("从生成式 AI 到 Agentic AI  ·  2025–2026 关键趋势与未来方向", {
      x: 0.6,
      y: 2.75,
      w: 7.5,
      h: 0.5,
      fontSize: 16,
      fontFace: FONT_BODY,
      color: C.ice,
      margin: 0,
    });
    slide.addText("2026 年 6 月", {
      x: 0.6,
      y: 4.85,
      w: 3,
      h: 0.35,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: C.ice,
      margin: 0,
    });
  }

  // Slide 2: Agenda
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "内容概览", "本次分享覆盖 AI 技术演进、产业落地与未来展望");

    const items = [
      ["01", "发展全景", "2025–2026 关键转折"],
      ["02", "核心技术", "LLM · 推理 · Agent · 多模态"],
      ["03", "产业落地", "企业采纳与行业应用"],
      ["04", "治理安全", "合规、可靠性与风险"],
      ["05", "未来展望", "2026–2030 趋势预判"],
    ];

    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.6 + col * 4.7;
      const y = 1.6 + row * 1.75;
      slide.addShape("rect", {
        x,
        y,
        w: 4.3,
        h: 1.45,
        fill: { color: C.white },
        line: { color: C.ice, width: 1 },
        shadow: makeShadow(),
      });
      slide.addShape("rect", {
        x,
        y,
        w: 0.55,
        h: 1.45,
        fill: { color: C.teal },
        line: { color: C.teal, width: 0 },
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
        color: C.midnight,
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
    addFooter(slide, "人工智能技术发展现状与展望");
  }

  // Slide 3: Overview timeline
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "2025–2026：AI 发展的关键转折", "从「实验性工具」迈向「生产级基础设施」");

    const milestones = [
      { year: "2023", label: "ChatGPT 引爆\n生成式 AI", color: C.ice },
      { year: "2024", label: "多模态与\nRAG 普及", color: C.teal },
      { year: "2025", label: "推理模型\nAgent 框架", color: C.mint },
      { year: "2026", label: "Agentic AI\n企业默认能力", color: C.coral },
    ];

    milestones.forEach((m, i) => {
      const x = 0.7 + i * 2.3;
      slide.addShape("ellipse", {
        x: x + 0.55,
        y: 2.0,
        w: 0.9,
        h: 0.9,
        fill: { color: m.color },
        line: { color: C.midnight, width: 1 },
      });
      slide.addText(m.year, {
        x: x + 0.55,
        y: 2.15,
        w: 0.9,
        h: 0.6,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.midnight,
        align: "center",
        margin: 0,
      });
      slide.addText(m.label, {
        x: x,
        y: 3.1,
        w: 2.0,
        h: 0.9,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C.textDark,
        align: "center",
        margin: 0,
      });
      if (i < milestones.length - 1) {
        slide.addShape("line", {
          x: x + 1.45,
          y: 2.45,
          w: 0.85,
          h: 0,
          line: { color: C.teal, width: 2, dashType: "dash" },
        });
      }
    });

    slide.addShape("rect", {
      x: 0.6,
      y: 4.2,
      w: 8.8,
      h: 0.85,
      fill: { color: C.midnight },
      line: { color: C.midnight, width: 0 },
    });
    slide.addText(
      "核心转变：AI 不再是附加功能，而是嵌入企业核心流程的智能基础设施",
      {
        x: 0.8,
        y: 4.35,
        w: 8.4,
        h: 0.55,
        fontSize: 14,
        fontFace: FONT_BODY,
        color: C.white,
        align: "center",
        margin: 0,
      }
    );
    addFooter(slide, "资料来源：Capgemini Top Tech Trends 2026 · International AI Safety Report 2026");
  }

  // Slide 4: LLM advances
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "大语言模型：能力持续跃迁", "上下文、推理、工具调用与开源生态同步进化");

    addStatCard(slide, 0.6, 1.55, 2.8, 1.5, "100万+", "Token 级超长上下文窗口", C.teal);
    addStatCard(slide, 3.6, 1.55, 2.8, 1.5, "7 个月", "Agent 任务复杂度翻倍周期", C.mint);
    addStatCard(slide, 6.6, 1.55, 2.8, 1.5, "85%", "2026 软件从业者使用 GenAI", C.coral);

    slide.addShape("rect", {
      x: 0.6,
      y: 3.35,
      w: 8.8,
      h: 1.65,
      fill: { color: C.white },
      line: { color: C.ice, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText(
      [
        { text: "关键进展", options: { bold: true, breakLine: true, fontSize: 14, color: C.midnight } },
        {
          text: "推理型模型（o系列、DeepSeek-R1 等）通过中间步骤显著提升数学、编程与科学任务表现",
          options: { bullet: true, breakLine: true, fontSize: 12, color: C.textDark },
        },
        {
          text: "开源模型（Llama、Qwen、DeepSeek 等）性能逼近闭源，降低部署成本",
          options: { bullet: true, breakLine: true, fontSize: 12, color: C.textDark },
        },
        {
          text: "工具调用、代码执行、网页浏览成为 LLM 标配能力",
          options: { bullet: true, fontSize: 12, color: C.textDark },
        },
      ],
      { x: 0.85, y: 3.5, w: 8.3, h: 1.4, fontFace: FONT_BODY, valign: "top" }
    );
    addFooter(slide, "资料来源：International AI Safety Report 2026 · Capgemini 2026");
  }

  // Slide 5: Reasoning AI
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "推理型 AI：从快思考到慢思考", "Test-time Compute 开启新 scaling 维度");

    slide.addShape("rect", {
      x: 0.6,
      y: 1.5,
      w: 4.2,
      h: 3.5,
      fill: { color: C.white },
      line: { color: C.ice, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText("传统 LLM", {
      x: 0.85,
      y: 1.7,
      w: 3.5,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_TITLE,
      color: C.textMuted,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "输入 → 直接输出", options: { breakLine: true, fontSize: 13, color: C.textDark } },
        { text: "擅长流畅对话与创意生成", options: { bullet: true, breakLine: true, fontSize: 12 } },
        { text: "复杂推理易出错", options: { bullet: true, fontSize: 12 } },
      ],
      { x: 0.85, y: 2.2, w: 3.7, h: 1.5, fontFace: FONT_BODY }
    );

    slide.addShape("rect", {
      x: 5.2,
      y: 1.5,
      w: 4.2,
      h: 3.5,
      fill: { color: C.midnight },
      line: { color: C.midnight, width: 0 },
      shadow: makeShadow(),
    });
    slide.addText("推理型 AI", {
      x: 5.45,
      y: 1.7,
      w: 3.5,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "输入 → 思考链 → 验证 → 输出", options: { breakLine: true, fontSize: 13, color: C.white } },
        { text: "数学、编程、科学任务大幅提升", options: { bullet: true, breakLine: true, fontSize: 12, color: C.ice } },
        { text: "可自我纠错与迭代优化", options: { bullet: true, fontSize: 12, color: C.ice } },
      ],
      { x: 5.45, y: 2.2, w: 3.7, h: 1.5, fontFace: FONT_BODY }
    );

    slide.addShape("ellipse", {
      x: 4.55,
      y: 2.85,
      w: 0.9,
      h: 0.9,
      fill: { color: C.mint },
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
    addFooter(slide, "资料来源：International AI Safety Report 2026");
  }

  // Slide 6: Agentic AI
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "Agentic AI：从「对话」到「行动」", "2026 年最显著的范式转变");

    slide.addText(
      [
        { text: "Generative AI", options: { bold: true, fontSize: 14, color: C.textMuted, breakLine: true } },
        { text: "机器创造内容——文本、图像、代码", options: { fontSize: 13, color: C.textDark, breakLine: true } },
        { text: "", options: { breakLine: true, fontSize: 6 } },
        { text: "Agentic AI", options: { bold: true, fontSize: 14, color: C.mint, breakLine: true } },
        { text: "机器自主规划、调用工具、执行工作流", options: { fontSize: 13, color: C.textDark, breakLine: true } },
        { text: "多 Agent 协作编排复杂业务任务", options: { fontSize: 13, color: C.textDark } },
      ],
      { x: 0.6, y: 1.5, w: 4.5, h: 2.8, fontFace: FONT_BODY, valign: "top" }
    );

    addStatCard(slide, 5.3, 1.5, 2.0, 1.2, "21%", "2025 运营中使用 AI Agent", C.teal);
    addStatCard(slide, 7.4, 1.5, 2.0, 1.2, "40%", "2028 工作流由 Agent 自动化", C.mint);
    addStatCard(slide, 5.3, 2.85, 2.0, 1.2, "82%", "2027 前计划集成 Agent", C.coral);
    addStatCard(slide, 7.4, 2.85, 2.0, 1.2, "85%", "高管预期 Agent 自主处理流程", C.deepBlue);

    slide.addShape("rect", {
      x: 0.6,
      y: 4.35,
      w: 8.8,
      h: 0.75,
      fill: { color: C.teal },
      line: { color: C.teal, width: 0 },
    });
    slide.addText("Agent 能力：记忆 · 网页浏览 · 代码执行 · 多步规划 · 人机协同审批", {
      x: 0.8,
      y: 4.5,
      w: 8.4,
      h: 0.45,
      fontSize: 13,
      fontFace: FONT_BODY,
      color: C.white,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：Capgemini 2026 · Aisera · International AI Safety Report 2026");
  }

  // Slide 7: Multimodal
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "多模态 AI：统一感知与理解", "文本 · 图像 · 音频 · 视频 · 传感器数据");

    const modes = [
      { icon: "T", label: "文本", desc: "对话、文档、代码" },
      { icon: "I", label: "图像", desc: "视觉问答、OCR" },
      { icon: "A", label: "音频", desc: "语音交互、转录" },
      { icon: "V", label: "视频", desc: "场景理解、监控" },
      { icon: "S", label: "传感", desc: "机器人、IoT" },
    ];
    modes.forEach((m, i) => {
      addIconCircle(slide, 0.8 + i * 1.75, 1.7, m.icon, m.label + "\n" + m.desc, C.teal);
    });

    slide.addShape("rect", {
      x: 0.6,
      y: 3.5,
      w: 4.0,
      h: 1.6,
      fill: { color: C.white },
      line: { color: C.ice, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText("应用场景", {
      x: 0.85,
      y: 3.65,
      w: 3.5,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.midnight,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "拍照提问，自然语言回答", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "语音指令 + 可视化维修指导", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "文生图/视频/3D/音乐创作", options: { bullet: true, fontSize: 11 } },
      ],
      { x: 0.85, y: 4.0, w: 3.5, h: 1.0, fontFace: FONT_BODY, color: C.textDark }
    );

    slide.addShape("rect", {
      x: 5.0,
      y: 3.5,
      w: 4.4,
      h: 1.6,
      fill: { color: C.midnight },
      line: { color: C.midnight, width: 0 },
    });
    slide.addText("2026 趋势", {
      x: 5.25,
      y: 3.65,
      w: 3.9,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "原生多模态模型成为主流架构", options: { bullet: true, breakLine: true, fontSize: 11, color: C.ice } },
        { text: "视频理解驱动安防、质检、教育", options: { bullet: true, breakLine: true, fontSize: 11, color: C.ice } },
        { text: "物理世界交互（机器人、自动驾驶）", options: { bullet: true, fontSize: 11, color: C.ice } },
      ],
      { x: 5.25, y: 4.0, w: 3.9, h: 1.0, fontFace: FONT_BODY }
    );
    addFooter(slide, "资料来源：International AI Safety Report 2026 · Aisera 2026");
  }

  // Slide 8: Enterprise adoption chart
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "企业采纳：从试点到默认能力", "生成式 AI 与 Agent 渗透率快速攀升");

    slide.addChart(
      pres.charts.BAR,
      [
        {
          name: "GenAI 工具使用率 (%)",
          labels: ["2024 基准", "2026 预测"],
          values: [46, 85],
        },
        {
          name: "运营中 AI Agent (%)",
          labels: ["2024", "2025", "2028 预测"],
          values: [10, 21, 40],
        },
      ],
      {
        x: 0.5,
        y: 1.4,
        w: 5.5,
        h: 3.6,
        barDir: "col",
        chartColors: [C.teal, C.mint],
        chartArea: { fill: { color: C.white }, roundedCorners: true },
        catAxisLabelColor: C.textMuted,
        valAxisLabelColor: C.textMuted,
        valGridLine: { color: C.ice, size: 0.5 },
        catGridLine: { style: "none" },
        showValue: true,
        dataLabelPosition: "outEnd",
        dataLabelColor: C.textDark,
        showLegend: true,
        legendPos: "b",
        valAxisMaxVal: 100,
        showTitle: true,
        title: "渗透率 (%)",
        titleColor: C.textMuted,
        titleFontSize: 11,
      }
    );

    slide.addShape("rect", {
      x: 6.3,
      y: 1.5,
      w: 3.1,
      h: 3.4,
      fill: { color: C.white },
      line: { color: C.ice, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText("落地重点领域", {
      x: 6.5,
      y: 1.65,
      w: 2.7,
      h: 0.4,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.midnight,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "IT 运维与 DevOps", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "客户服务与支持", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "HR · 财务 · 法务", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "研发与代码生成", options: { bullet: true, breakLine: true, fontSize: 11 } },
        { text: "供应链与智能运营", options: { bullet: true, fontSize: 11 } },
      ],
      { x: 6.5, y: 2.1, w: 2.7, h: 2.5, fontFace: FONT_BODY, color: C.textDark }
    );
    addFooter(slide, "资料来源：Capgemini Top Tech Trends 2026 · Gartner");
  }

  // Slide 9: Agent frameworks
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "Agent 框架生态：工程化基础设施", "从脚本拼凑到生产级编排平台");

    const frameworks = [
      ["LangGraph", "图状态机\n精确流程控制"],
      ["CrewAI", "角色分工\n多 Agent 协作"],
      ["AutoGen / MAF", "对话式\n企业编排"],
      ["OpenAI Agents", "OpenAI 生态\n快速集成"],
      ["Google ADK", "Gemini 应用\n多 Agent"],
      ["Semantic Kernel", "微软企业\n.NET 集成"],
    ];

    frameworks.forEach((fw, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.6 + col * 3.1;
      const y = 1.55 + row * 1.75;
      slide.addShape("rect", {
        x,
        y,
        w: 2.85,
        h: 1.5,
        fill: { color: C.white },
        line: { color: C.teal, width: 1 },
        shadow: makeShadow(),
      });
      slide.addText(fw[0], {
        x: x + 0.15,
        y: y + 0.2,
        w: 2.55,
        h: 0.4,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.teal,
        bold: true,
        margin: 0,
      });
      slide.addText(fw[1], {
        x: x + 0.15,
        y: y + 0.65,
        w: 2.55,
        h: 0.7,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });

    slide.addShape("rect", {
      x: 0.6,
      y: 4.35,
      w: 8.8,
      h: 0.75,
      fill: { color: C.offWhite },
      line: { color: C.mint, width: 2 },
    });
    slide.addText("工程焦点转移：模型性能 → 上下文管理 · 可靠性 · 可观测性 · 治理", {
      x: 0.8,
      y: 4.5,
      w: 8.4,
      h: 0.45,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: C.midnight,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：Langfuse Agent Framework Comparison 2025");
  }

  // Slide 10: Edge AI
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "边缘 AI 与端侧部署", "低延迟 · 隐私保护 · 离线可用");

    slide.addShape("rect", {
      x: 0.6,
      y: 1.5,
      w: 4.3,
      h: 3.5,
      fill: { color: C.midnight },
      line: { color: C.midnight, width: 0 },
    });
    slide.addText("云端大模型", {
      x: 0.85,
      y: 1.7,
      w: 3.8,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_TITLE,
      color: C.ice,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "最强推理与多模态能力", options: { bullet: true, breakLine: true, fontSize: 12, color: C.white } },
        { text: "依赖网络，延迟较高", options: { bullet: true, breakLine: true, fontSize: 12, color: C.white } },
        { text: "数据需上传，隐私顾虑", options: { bullet: true, fontSize: 12, color: C.white } },
      ],
      { x: 0.85, y: 2.3, w: 3.8, h: 1.5, fontFace: FONT_BODY }
    );

    slide.addShape("rect", {
      x: 5.1,
      y: 1.5,
      w: 4.3,
      h: 3.5,
      fill: { color: C.white },
      line: { color: C.mint, width: 2 },
      shadow: makeShadow(),
    });
    slide.addText("端侧 / 边缘 AI", {
      x: 5.35,
      y: 1.7,
      w: 3.8,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_TITLE,
      color: C.mint,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        { text: "NPU/GPU 本地推理（手机、PC、IoT）", options: { bullet: true, breakLine: true, fontSize: 12 } },
        { text: "模型量化与蒸馏（INT4/INT8）", options: { bullet: true, breakLine: true, fontSize: 12 } },
        { text: "混合架构：端侧快响应 + 云端深推理", options: { bullet: true, fontSize: 12 } },
      ],
      { x: 5.35, y: 2.3, w: 3.8, h: 1.5, fontFace: FONT_BODY, color: C.textDark }
    );

    slide.addText("Apple Intelligence · Qualcomm AI Engine · 联发科 NPU · 华为昇腾", {
      x: 0.6,
      y: 4.55,
      w: 8.8,
      h: 0.4,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C.textMuted,
      italic: true,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：Aisera 2026 · 行业公开资料");
  }

  // Slide 11: Governance
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "AI 治理与安全", "能力越强，治理越成为核心竞争力");

    const pillars = [
      { title: "可靠性", items: "幻觉检测 · 输出验证 · 人工审批", color: C.teal },
      { title: "合规性", items: "PII 检测 · 审计追踪 · 数据主权", color: C.mint },
      { title: "安全性", items: "Prompt 注入防护 · 身份管理 · 沙箱隔离", color: C.coral },
      { title: "透明度", items: "可解释性 · 模型卡片 · 影响评估", color: C.deepBlue },
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
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C.textDark,
        margin: 0,
      });
    });

    slide.addText("International AI Safety Report 2026：Agent 可靠性仍是规模化部署的主要瓶颈", {
      x: 0.6,
      y: 4.75,
      w: 8.8,
      h: 0.4,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C.coral,
      italic: true,
      align: "center",
      margin: 0,
    });
    addFooter(slide, "资料来源：International AI Safety Report 2026 · EU AI Act");
  }

  // Slide 12: Industry applications
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "行业应用：从 POC 到规模价值", "AI 深入核心业务而非边缘实验");

    const industries = [
      ["医疗", "影像诊断 · 药物发现 · 临床助手"],
      ["金融", "风控 · 智能投顾 · 反欺诈"],
      ["制造", "预测性维护 · 质量检测 · 供应链"],
      ["教育", "个性化学习 · 智能辅导 · 内容生成"],
      ["零售", "推荐系统 · 虚拟导购 · 库存优化"],
      ["软件", "Copilot · 自动化测试 · 代码审查"],
    ];

    industries.forEach((ind, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.6 + col * 3.1;
      const y = 1.5 + row * 1.85;
      slide.addShape("ellipse", {
        x: x + 0.1,
        y: y + 0.15,
        w: 0.5,
        h: 0.5,
        fill: { color: C.teal },
        line: { color: C.teal, width: 0 },
      });
      slide.addText(ind[0].charAt(0), {
        x: x + 0.1,
        y: y + 0.22,
        w: 0.5,
        h: 0.35,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addText(ind[0], {
        x: x + 0.75,
        y: y + 0.1,
        w: 2.0,
        h: 0.4,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.midnight,
        bold: true,
        margin: 0,
      });
      slide.addText(ind[1], {
        x: x + 0.75,
        y: y + 0.5,
        w: 2.1,
        h: 0.9,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "资料来源：Capgemini 2026 · 行业实践");
  }

  // Slide 13: Challenges
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "当前挑战与瓶颈", "理性认识技术边界");

    slide.addChart(
      pres.charts.DOUGHNUT,
      [
        {
          name: "主要挑战",
          labels: ["可靠性", "成本", "数据质量", "人才缺口", "治理合规"],
          values: [28, 22, 18, 17, 15],
        },
      ],
      {
        x: 0.4,
        y: 1.3,
        w: 4.5,
        h: 3.8,
        chartColors: [C.coral, C.teal, C.mint, C.deepBlue, C.gold],
        showPercent: true,
        showLegend: true,
        legendPos: "r",
        holeSize: 55,
        chartArea: { fill: { color: C.white } },
      }
    );

    slide.addText(
      [
        { text: "AGI 尚未实现", options: { bold: true, breakLine: true, fontSize: 13, color: C.midnight } },
        { text: "通用人工智能仍无明确时间表，当前系统擅长特定任务", options: { fontSize: 11, color: C.textDark, breakLine: true } },
        { text: "", options: { breakLine: true, fontSize: 4 } },
        { text: "Agent 仍易犯基础错误", options: { bold: true, breakLine: true, fontSize: 13, color: C.midnight } },
        { text: "复杂多步任务中可靠性不足，需人机协同", options: { fontSize: 11, color: C.textDark, breakLine: true } },
        { text: "", options: { breakLine: true, fontSize: 4 } },
        { text: "Scaling 成本与能耗", options: { bold: true, breakLine: true, fontSize: 13, color: C.midnight } },
        { text: "更大模型 ≠ 更好业务结果，集成与治理才是关键", options: { fontSize: 11, color: C.textDark } },
      ],
      { x: 5.2, y: 1.5, w: 4.3, h: 3.5, fontFace: FONT_BODY, valign: "top" }
    );
    addFooter(slide, "资料来源：International AI Safety Report 2026 · 行业调研综合");
  }

  // Slide 14: Future outlook
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "2026–2030 展望", "五大趋势预判");

    const trends = [
      { num: "1", title: "自进化 AI 系统", desc: "Agent 自主习得新技能、集成新工具，无需完整重训" },
      { num: "2", title: "多 Agent 动态编排", desc: "按任务动态创建/退役 Agent，敏捷适应业务变化" },
      { num: "3", title: "领域专用模型", desc: "垂直行业小模型 + RAG，性价比超越通用大模型" },
      { num: "4", title: "AI-Native 架构", desc: "企业核心系统重构为 AI-First 动态模块化平台" },
      { num: "5", title: "全球 AI 治理框架", desc: "各国监管趋同，安全评估成为模型发布前置条件" },
    ];

    trends.forEach((t, i) => {
      const y = 1.45 + i * 0.78;
      slide.addShape("ellipse", {
        x: 0.65,
        y: y + 0.05,
        w: 0.45,
        h: 0.45,
        fill: { color: C.mint },
        line: { color: C.mint, width: 0 },
      });
      slide.addText(t.num, {
        x: 0.65,
        y: y + 0.1,
        w: 0.45,
        h: 0.35,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addText(t.title, {
        x: 1.25,
        y: y,
        w: 2.5,
        h: 0.35,
        fontSize: 13,
        fontFace: FONT_TITLE,
        color: C.midnight,
        bold: true,
        margin: 0,
      });
      slide.addText(t.desc, {
        x: 3.8,
        y: y,
        w: 5.6,
        h: 0.55,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
      if (i < trends.length - 1) {
        slide.addShape("line", {
          x: 0.87,
          y: y + 0.5,
          w: 0,
          h: 0.28,
          line: { color: C.ice, width: 1 },
        });
      }
    });
    addFooter(slide, "资料来源：Aisera 2026 · Capgemini 2026 · 综合研判");
  }

  // Slide 15: Conclusion
  {
    const slide = pres.addSlide();
    slide.background = { color: C.midnight };
    slide.addShape("ellipse", {
      x: -1,
      y: 3.5,
      w: 4,
      h: 4,
      fill: { color: C.teal, transparency: 80 },
      line: { color: C.teal, width: 0 },
    });
    slide.addText("核心结论", {
      x: 0.6,
      y: 0.8,
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
          text: "AI 正从「生成内容」迈向「自主行动」，Agentic AI 是 2026 年主旋律",
          options: { bullet: true, breakLine: true, fontSize: 16, color: C.white },
        },
        {
          text: "成功关键不在模型大小，而在工作流集成、可靠性与治理体系",
          options: { bullet: true, breakLine: true, fontSize: 16, color: C.white },
        },
        {
          text: "多模态 + 推理 + Agent 将重塑软件、运营与人机协作模式",
          options: { bullet: true, breakLine: true, fontSize: 16, color: C.white },
        },
        {
          text: "AGI 仍属远期目标，但 AI 作为默认生产力工具已不可逆",
          options: { bullet: true, fontSize: 16, color: C.white },
        },
      ],
      { x: 0.6, y: 1.7, w: 8.5, h: 2.8, fontFace: FONT_BODY }
    );
    slide.addText("谢谢", {
      x: 0.6,
      y: 4.5,
      w: 3,
      h: 0.6,
      fontSize: 36,
      fontFace: FONT_TITLE,
      color: C.ice,
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
      color: C.ice,
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
