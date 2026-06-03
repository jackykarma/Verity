/*********************************************************************************
 ** Copyright (C), 2019-2029, OPLUS Mobile Comm Corp., Ltd
 ** All rights reserved.
 **
 ** File: - create_hdr_history_ppt.js
 ** Description: Generate HDR technology development history presentation
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

/** HDR-themed palette: deep shadow + warm highlight */
const C = {
  void: "0D0D12",
  charcoal: "1C1C28",
  slate: "2D2D3A",
  amber: "FF9500",
  gold: "FFD60A",
  coral: "FF6B35",
  cream: "F5E6D3",
  offWhite: "FAF7F2",
  white: "FFFFFF",
  textDark: "1E1E24",
  textMuted: "6B6B7B",
  ice: "E8E4DF",
};

const FONT_TITLE = "Arial Black";
const FONT_BODY = "Calibri";
const OUTPUT = path.join(__dirname, "..", "..", "..", "..", "HDR技术发展史.pptx");

function makeShadow() {
  return { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.15 };
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
    fill: { color: C.amber },
    line: { color: C.amber, width: 0 },
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: FONT_TITLE,
    color: C.charcoal,
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
    fontSize: 32,
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

function addTimelineNode(slide, x, y, year, title, desc, isLast) {
  slide.addShape("ellipse", {
    x: x - 0.08,
    y: y - 0.02,
    w: 0.35,
    h: 0.35,
    fill: { color: C.amber },
    line: { color: C.amber, width: 0 },
  });
  if (!isLast) {
    slide.addShape("line", {
      x: x + 0.09,
      y: y + 0.33,
      w: 0,
      h: 0.55,
      line: { color: C.ice, width: 2 },
    });
  }
  slide.addText(year, {
    x: x + 0.45,
    y: y - 0.02,
    w: 1.2,
    h: 0.35,
    fontSize: 14,
    fontFace: FONT_TITLE,
    color: C.amber,
    bold: true,
    margin: 0,
  });
  slide.addText(title, {
    x: x + 0.45,
    y: y + 0.32,
    w: 8,
    h: 0.35,
    fontSize: 13,
    fontFace: FONT_BODY,
    color: C.textDark,
    bold: true,
    margin: 0,
  });
  slide.addText(desc, {
    x: x + 0.45,
    y: y + 0.62,
    w: 8.2,
    h: 0.35,
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
  pres.title = "HDR技术发展史";
  pres.subject = "High Dynamic Range Technology History";

  // Slide 1: Title
  {
    const slide = pres.addSlide();
    slide.background = { color: C.void };
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: 10,
      h: 5.625,
      fill: { color: C.charcoal, transparency: 40 },
      line: { color: C.charcoal, width: 0 },
    });
    slide.addShape("ellipse", {
      x: 6.5,
      y: -0.5,
      w: 4.5,
      h: 4.5,
      fill: { color: C.amber, transparency: 75 },
      line: { color: C.amber, width: 0 },
    });
    slide.addShape("ellipse", {
      x: 7.8,
      y: 0.8,
      w: 2,
      h: 2,
      fill: { color: C.gold, transparency: 60 },
      line: { color: C.gold, width: 0 },
    });
    slide.addShape("rect", {
      x: 0,
      y: 4.55,
      w: 10,
      h: 1.075,
      fill: { color: C.amber, transparency: 70 },
      line: { color: C.amber, width: 0 },
    });
    slide.addText("HDR 技术发展史", {
      x: 0.6,
      y: 1.4,
      w: 7.5,
      h: 1.1,
      fontSize: 42,
      fontFace: FONT_TITLE,
      color: C.white,
      bold: true,
      margin: 0,
    });
    slide.addText("High Dynamic Range · 从胶片暗房到全链路高动态影像", {
      x: 0.6,
      y: 2.55,
      w: 7.8,
      h: 0.5,
      fontSize: 15,
      fontFace: FONT_BODY,
      color: C.cream,
      margin: 0,
    });
    slide.addText("摄影 · 显示 · 移动 · 流媒体", {
      x: 0.6,
      y: 3.15,
      w: 6,
      h: 0.4,
      fontSize: 13,
      fontFace: FONT_BODY,
      color: C.gold,
      margin: 0,
    });
    slide.addText("2026 年 6 月", {
      x: 0.6,
      y: 4.75,
      w: 3,
      h: 0.35,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: C.cream,
      margin: 0,
    });
  }

  // Slide 2: Agenda
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "内容概览", "从概念起源到当代全链路 HDR 生态");

    const items = [
      ["01", "概念与度量", "动态范围、亮度与感知"],
      ["02", "起源与奠基", "胶片时代到数字 HDR"],
      ["03", "格式与采集", "Radiance、曝光合成"],
      ["04", "显示与广播", "HDR10 · DV · HLG"],
      ["05", "移动与影像", "手机、相机与 Ultra HDR"],
      ["06", "展望", "全链路 HDR 的未来"],
    ];

    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.6 + col * 4.7;
      const y = 1.55 + row * 1.7;
      slide.addShape("rect", {
        x,
        y,
        w: 4.3,
        h: 1.4,
        fill: { color: C.white },
        line: { color: C.ice, width: 1 },
        shadow: makeShadow(),
      });
      slide.addShape("rect", {
        x,
        y,
        w: 0.55,
        h: 1.4,
        fill: { color: C.amber },
        line: { color: C.amber, width: 0 },
      });
      slide.addText(item[0], {
        x: x + 0.05,
        y: y + 0.42,
        w: 0.45,
        h: 0.5,
        fontSize: 18,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addText(item[1], {
        x: x + 0.65,
        y: y + 0.25,
        w: 3.5,
        h: 0.45,
        fontSize: 16,
        fontFace: FONT_TITLE,
        color: C.charcoal,
        bold: true,
        margin: 0,
      });
      slide.addText(item[2], {
        x: x + 0.65,
        y: y + 0.75,
        w: 3.5,
        h: 0.5,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "HDR Technology History");
  }

  // Slide 3: What is HDR
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "什么是 HDR？", "高动态范围：同时保留极暗与极亮细节");

    addStatCard(slide, 0.55, 1.55, 2.85, 1.35, "1:1000+", "典型 HDR 场景对比度", C.amber);
    addStatCard(slide, 3.55, 1.55, 2.85, 1.35, "1000 nits", "高端 HDR 显示峰值亮度", C.coral);
    addStatCard(slide, 6.55, 1.55, 2.85, 1.35, "10-bit+", "色深与平滑渐变", C.gold);

    slide.addShape("rect", {
      x: 0.55,
      y: 3.1,
      w: 8.9,
      h: 1.85,
      fill: { color: C.white },
      line: { color: C.ice, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText(
      [
        {
          text: "动态范围（DR）：最亮与最暗可分辨亮度之比，人眼瞬时可达约 10⁶:1",
          options: { bullet: true, breakLine: true, fontSize: 13, color: C.textDark },
        },
        {
          text: "SDR 显示约 100 nits；HDR 目标 400–1000+ nits，配合宽色域（BT.2020 / P3）",
          options: { bullet: true, breakLine: true, fontSize: 13, color: C.textDark },
        },
        {
          text: "全链路 HDR = 采集 → 编码 → 传输 → 显示 → 感知，各环节需统一传递曲线与元数据",
          options: { bullet: true, fontSize: 13, color: C.textDark },
        },
      ],
      { x: 0.75, y: 3.25, w: 8.5, h: 1.6, fontFace: FONT_BODY }
    );
    addFooter(slide, "参考：SMPTE ST 2084 (PQ) · ITU-R BT.2100");
  }

  // Slide 4: Photography origins
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "起源：摄影与暗房时代", "在数字之前，HDR 思想已存在于曝光控制");

    const cards = [
      ["1930s", "安塞尔·亚当斯分区曝光法", "将场景亮度分为 11 区，通过曝光与显影控制局部对比"],
      ["1970s", "减淡与加深（Dodge & Burn）", "手工调节底片不同区域曝光，扩展可感知动态范围"],
      ["1980s", "多曝光合成萌芽", "风光摄影中开始尝试多张不同曝光合成一张图像"],
    ];

    cards.forEach((c, i) => {
      const y = 1.55 + i * 1.25;
      slide.addShape("rect", {
        x: 0.55,
        y,
        w: 8.9,
        h: 1.05,
        fill: { color: C.white },
        line: { color: C.ice, width: 1 },
        shadow: makeShadow(),
      });
      slide.addShape("rect", {
        x: 0.55,
        y,
        w: 1.1,
        h: 1.05,
        fill: { color: C.charcoal },
        line: { color: C.charcoal, width: 0 },
      });
      slide.addText(c[0], {
        x: 0.6,
        y: y + 0.28,
        w: 1,
        h: 0.45,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.gold,
        align: "center",
        margin: 0,
      });
      slide.addText(c[1], {
        x: 1.85,
        y: y + 0.15,
        w: 7.3,
        h: 0.4,
        fontSize: 14,
        fontFace: FONT_BODY,
        color: C.textDark,
        bold: true,
        margin: 0,
      });
      slide.addText(c[2], {
        x: 1.85,
        y: y + 0.52,
        w: 7.3,
        h: 0.45,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "摄影史：Zone System · Ansel Adams");
  }

  // Slide 5: Digital foundations
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "数字奠基：1990s–2000s", "HDR 从学术走向可交换的数字格式");

    const milestones = [
      ["1985", "Greg Ward 辐射度研究", "为后续 Radiance 渲染与 HDR 格式奠定基础"],
      ["1997", "RGBE / Radiance .hdr", "Ward 发布可存储 HDR 像素的紧凑格式，成为学界标准"],
      ["1999", "Paul Debevec 光照恢复", "从多角度照片估计场景光照，推动 IBL 与 CG 合成"],
      ["2003", "曝光合成摄影", "Debevec 等发表多曝光合成算法，现代相机 HDR 模式前身"],
      ["2005", "OpenEXR 开放", "ILM 发布 16-bit 浮点 EXR，电影工业广泛采用"],
    ];

    milestones.forEach((m, i) => {
      addTimelineNode(slide, 0.7, 1.45 + i * 0.78, m[0], m[1], m[2], i === milestones.length - 1);
    });
    addFooter(slide, "Greg Ward · Paul Debevec · ILM OpenEXR");
  }

  // Slide 6: Capture & formats
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "采集与文件格式演进", "从科研格式到消费级相机内置 HDR");

    slide.addTable(
      [
        [
          { text: "格式 / 技术", options: { bold: true, fill: { color: C.charcoal }, color: C.white } },
          { text: "年份", options: { bold: true, fill: { color: C.charcoal }, color: C.white } },
          { text: "特点", options: { bold: true, fill: { color: C.charcoal }, color: C.white } },
        ],
        ["Radiance RGBE (.hdr)", "1997", "32-bit 紧凑 HDR，学界与全景常用"],
        ["OpenEXR", "2005", "半浮点多通道，VFX / 电影管线标准"],
        ["Adobe DNG HDR", "2012", "相机 RAW 内嵌多曝光或 HDR 合成"],
        ["HEIF 10-bit HDR", "2017", "Apple 推动，手机静态 HDR 照片主流载体"],
        ["Ultra HDR (JPEG-R)", "2023", "Google/Android 14，SDR 兼容 + HDR 增益图"],
      ],
      {
        x: 0.55,
        y: 1.5,
        w: 8.9,
        h: 3.2,
        fontSize: 11,
        fontFace: FONT_BODY,
        border: { pt: 0.5, color: C.ice },
        colW: [2.8, 0.9, 5.2],
        rowH: 0.48,
        align: "left",
        valign: "middle",
      }
    );
    addFooter(slide, "JPEG XT / JPEG XL HDR 仍在标准化与生态推广中");
  }

  // Slide 7: Display standards
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "显示与广播标准", "2014 起消费级 HDR 电视与流媒体爆发");

    const standards = [
      {
        name: "HDR10",
        year: "2015",
        desc: "开源 PQ + 静态元数据，UHD Blu-ray 与流媒体基线",
        color: C.amber,
      },
      {
        name: "Dolby Vision",
        year: "2014",
        desc: "动态元数据逐场景调光，12-bit，高端影院与电视",
        color: C.coral,
      },
      {
        name: "HLG",
        year: "2016",
        desc: "混合对数伽马，BBC/NHK 推动，直播向后兼容 SDR",
        color: C.gold,
      },
      {
        name: "HDR10+",
        year: "2017",
        desc: "三星主导动态元数据，与 DV 竞争的开源方案",
        color: C.charcoal,
      },
    ];

    standards.forEach((s, i) => {
      const x = 0.55 + (i % 2) * 4.55;
      const y = 1.55 + Math.floor(i / 2) * 1.85;
      slide.addShape("rect", {
        x,
        y,
        w: 4.25,
        h: 1.6,
        fill: { color: C.white },
        line: { color: C.ice, width: 1 },
        shadow: makeShadow(),
      });
      slide.addShape("rect", {
        x,
        y,
        w: 4.25,
        h: 0.12,
        fill: { color: s.color },
        line: { color: s.color, width: 0 },
      });
      slide.addText(s.name, {
        x: x + 0.2,
        y: y + 0.25,
        w: 2.5,
        h: 0.45,
        fontSize: 18,
        fontFace: FONT_TITLE,
        color: C.textDark,
        bold: true,
        margin: 0,
      });
      slide.addText(s.year, {
        x: x + 3.2,
        y: y + 0.28,
        w: 0.9,
        h: 0.4,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: s.color,
        align: "right",
        margin: 0,
      });
      slide.addText(s.desc, {
        x: x + 0.2,
        y: y + 0.75,
        w: 3.85,
        h: 0.7,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });

    slide.addText("传递函数：PQ (ST 2084) 用于 HDR10/DV；HLG (ARIB STD-B67) 用于广播", {
      x: 0.55,
      y: 4.85,
      w: 8.9,
      h: 0.35,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C.textMuted,
      italic: true,
      margin: 0,
    });
    addFooter(slide, "HDMI 2.0a (2015) 起支持 HDR 元数据传递");
  }

  // Slide 8: Master timeline
  {
    const slide = pres.addSlide();
    slide.background = { color: C.charcoal };
    slide.addText("HDR 发展里程碑时间轴", {
      x: 0.6,
      y: 0.35,
      w: 9,
      h: 0.6,
      fontSize: 28,
      fontFace: FONT_TITLE,
      color: C.gold,
      bold: true,
      margin: 0,
    });

    const events = [
      ["1930s", "分区曝光法"],
      ["1997", "RGBE 格式"],
      ["2003", "曝光合成"],
      ["2014", "Dolby Vision"],
      ["2015", "HDR10"],
      ["2016", "HLG / UHD Premium"],
      ["2017", "iPhone HEIF HDR"],
      ["2023", "Ultra HDR"],
    ];

    slide.addShape("line", {
      x: 0.8,
      y: 3.2,
      w: 8.4,
      h: 0,
      line: { color: C.amber, width: 3 },
    });

    events.forEach((e, i) => {
      const x = 0.95 + i * 1.08;
      slide.addShape("ellipse", {
        x: x + 0.15,
        y: 3.05,
        w: 0.28,
        h: 0.28,
        fill: { color: C.gold },
        line: { color: C.gold, width: 0 },
      });
      slide.addText(e[0], {
        x: x - 0.05,
        y: 2.55,
        w: 1.1,
        h: 0.4,
        fontSize: 9,
        fontFace: FONT_TITLE,
        color: C.cream,
        align: "center",
        margin: 0,
      });
      slide.addText(e[1], {
        x: x - 0.2,
        y: 3.45,
        w: 1.4,
        h: 0.7,
        fontSize: 8,
        fontFace: FONT_BODY,
        color: C.ice,
        align: "center",
        margin: 0,
      });
    });

    slide.addText(
      [
        {
          text: "左侧：摄影与计算机图形学积累理论",
          options: { bullet: true, breakLine: true, fontSize: 12, color: C.cream },
        },
        {
          text: "中部：数字格式与多曝光合成使 HDR 可量产",
          options: { bullet: true, breakLine: true, fontSize: 12, color: C.cream },
        },
        {
          text: "右侧：显示标准 + 移动生态推动全民 HDR",
          options: { bullet: true, fontSize: 12, color: C.cream },
        },
      ],
      { x: 0.6, y: 4.35, w: 8.8, h: 1.0, fontFace: FONT_BODY }
    );
    addFooter(slide, "综合时间线 · 非穷尽");
  }

  // Slide 9: Mobile & consumer
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "移动与消费电子", "HDR 从客厅电视进入口袋里的相机");

    const bullets = [
      "2016：UHD Alliance 发布 Ultra HD Premium 认证（≥1000 nits 峰值、90% P3 色域）",
      "2017：iPhone 8 / X 支持 HEIF 10-bit HDR 静态照片与 4K HDR 视频录制",
      "2018–2020：Android 旗舰逐步支持 HDR10 视频播放与 HLG 拍摄",
      "2021：Netflix / Disney+ / YouTube 全面提供 HDR10 / DV 流媒体",
      "2023：Android 14 Ultra HDR — 单文件同时服务 SDR 与 HDR 显示",
      "2024–2026：AI 计算摄影 + HDR 深度融合，夜景与逆光场景实时合成",
    ];

    slide.addShape("rect", {
      x: 0.55,
      y: 1.5,
      w: 5.5,
      h: 3.5,
      fill: { color: C.white },
      line: { color: C.ice, width: 1 },
      shadow: makeShadow(),
    });
    slide.addText(
      bullets.map((b, i) => ({
        text: b,
        options: {
          bullet: true,
          breakLine: i < bullets.length - 1,
          fontSize: 12,
          color: C.textDark,
        },
      })),
      { x: 0.7, y: 1.65, w: 5.2, h: 3.2, fontFace: FONT_BODY }
    );

    addStatCard(slide, 6.3, 1.55, 3.15, 1.2, "76%", "2025 高端机支持 HDR 视频录制", C.amber);
    addStatCard(slide, 6.3, 2.95, 3.15, 1.2, "BT.2020", "广色域成为旗舰屏幕标配", C.coral);

    slide.addShape("rect", {
      x: 6.3,
      y: 4.25,
      w: 3.15,
      h: 0.75,
      fill: { color: C.charcoal },
      line: { color: C.charcoal, width: 0 },
    });
    slide.addText("关键：采集 HDR ≠ 显示 HDR\n需系统级色调映射（Tone Mapping）", {
      x: 6.4,
      y: 4.32,
      w: 2.95,
      h: 0.65,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C.gold,
      align: "center",
      valign: "middle",
      margin: 0,
    });
    addFooter(slide, "Counterpoint / Display Supply Chain 行业报告综合");
  }

  // Slide 10: Video codec pipeline
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "视频编码与传输", "HDR 视频依赖 10-bit 编码与元数据侧车");

    const pipeline = ["采集\n传感器 HDR", "编码\nHEVC/AV1\nMain10", "容器\nMP4/MKV", "传输\nHDMI/DP\n流媒体", "显示\nTone Map\nPQ/HLG"];

    pipeline.forEach((label, i) => {
      const x = 0.5 + i * 1.85;
      slide.addShape("rect", {
        x,
        y: 2.0,
        w: 1.55,
        h: 1.5,
        fill: { color: C.white },
        line: { color: C.amber, width: 1.5 },
        shadow: makeShadow(),
      });
      slide.addText(label, {
        x,
        y: 2.15,
        w: 1.55,
        h: 1.2,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textDark,
        align: "center",
        valign: "middle",
        margin: 0,
      });
      if (i < pipeline.length - 1) {
        slide.addText("→", {
          x: x + 1.55,
          y: 2.55,
          w: 0.3,
          h: 0.4,
          fontSize: 18,
          color: C.amber,
          align: "center",
          margin: 0,
        });
      }
    });

    slide.addText(
      [
        {
          text: "HEVC Main 10 / VP9 Profile 2 / AV1 HDR：10-bit 色深是 HDR 流媒体的事实标准",
          options: { bullet: true, breakLine: true, fontSize: 12, color: C.textDark },
        },
        {
          text: "SEI / 元数据：MaxCLL、MaxFALL 指导 tone mapping，避免高光裁切或暗部糊死",
          options: { bullet: true, breakLine: true, fontSize: 12, color: C.textDark },
        },
        {
          text: "Android MediaCodec + SurfaceFlinger 负责解码后至屏幕的色彩管理与 HDR 层合成",
          options: { bullet: true, fontSize: 12, color: C.textDark },
        },
      ],
      { x: 0.55, y: 3.75, w: 8.9, h: 1.4, fontFace: FONT_BODY }
    );
    addFooter(slide, "Android CDD · HDMI Forum · VESA DisplayHDR");
  }

  // Slide 11: Android graphics
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "Android 图形管线中的 HDR", "从 API 24 到 Android 14 Ultra HDR 的演进");

    const apis = [
      ["API 24", "Window COLOR_MODE_HDR", "应用可请求 HDR 显示窗口"],
      ["API 26", "HEIF 解码", "静态 HDR 照片解码支持"],
      ["API 31", "Display.getHdrCapabilities()", "查询设备支持的 HDR 类型"],
      ["API 33", "Photo HDR / 10-bit UI", "系统相机与部分 OEM 10-bit 显示路径"],
      ["API 34", "Ultra HDR (JPEG-R)", "增益图 + SDR 底图，相册与分享兼容"],
    ];

    apis.forEach((a, i) => {
      const y = 1.5 + i * 0.72;
      slide.addShape("rect", {
        x: 0.55,
        y,
        w: 1.35,
        h: 0.58,
        fill: { color: C.amber },
        line: { color: C.amber, width: 0 },
      });
      slide.addText(a[0], {
        x: 0.55,
        y: y + 0.1,
        w: 1.35,
        h: 0.4,
        fontSize: 11,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addText(a[1], {
        x: 2.05,
        y: y + 0.05,
        w: 2.5,
        h: 0.35,
        fontSize: 13,
        fontFace: FONT_BODY,
        color: C.textDark,
        bold: true,
        margin: 0,
      });
      slide.addText(a[2], {
        x: 2.05,
        y: y + 0.32,
        w: 7.2,
        h: 0.3,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });

    slide.addShape("rect", {
      x: 6.0,
      y: 1.5,
      w: 3.45,
      h: 3.55,
      fill: { color: C.charcoal },
      line: { color: C.charcoal, width: 0 },
    });
    slide.addText("色彩管理栈", {
      x: 6.15,
      y: 1.65,
      w: 3.15,
      h: 0.4,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C.gold,
      margin: 0,
    });
    const stackLines = [
      "Camera2 / HAL",
      "↓",
      "GPU / HDR 合成",
      "↓",
      "Skia / HWUI",
      "↓",
      "SurfaceFlinger",
      "↓",
      "HWC / Panel",
    ];
    slide.addText(
      stackLines.map((line, i) => ({
        text: line,
        options: {
          breakLine: i < stackLines.length - 1,
          fontSize: 11,
          color: C.cream,
          align: "center",
        },
      })),
      {
        x: 6.15,
        y: 2.1,
        w: 3.15,
        h: 2.7,
        fontFace: FONT_BODY,
        align: "center",
        margin: 0,
      }
    );
    addFooter(slide, "Android Developers · AOSP HDR documentation");
  }

  // Slide 12: Challenges
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "当前挑战与争议", "HDR 普及仍面临标准碎片与体验不一致");

    const challenges = [
      ["标准碎片化", "HDR10 / HDR10+ / DV / HLG 并存，内容方需多次母版"],
      ["亮度虚标", "部分面板峰值亮度营销与实际可持续亮度差距大"],
      ["Tone Mapping 主观性", "不同设备/应用映射策略不同，同一内容观感差异明显"],
      ["兼容性", "社交分享链路常降级为 SDR，Ultra HDR 生态仍在建设"],
      ["功耗与发热", "移动设备实时 HDR 视频编码对 ISP / GPU 压力大"],
    ];

    challenges.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.55 + col * 4.55;
      const y = 1.5 + row * 1.35;
      const w = 4.25;
      const h = 1.15;
      slide.addShape("rect", {
        x,
        y,
        w,
        h,
        fill: { color: C.white },
        line: { color: C.coral, width: 1 },
        shadow: makeShadow(),
      });
      slide.addText(c[0], {
        x: x + 0.15,
        y: y + 0.12,
        w: w - 0.3,
        h: 0.35,
        fontSize: 13,
        fontFace: FONT_TITLE,
        color: C.coral,
        bold: true,
        margin: 0,
      });
      slide.addText(c[1], {
        x: x + 0.15,
        y: y + 0.48,
        w: w - 0.3,
        h: 0.55,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "DisplayHDR / VESA 认证有助于规范市场宣传");
  }

  // Slide 13: Future
  {
    const slide = pres.addSlide();
    slide.background = { color: C.offWhite };
    addSlideTitle(slide, "未来展望", "全链路、可感知、计算驱动的 HDR");

    const trends = [
      { title: "端到端 HDR", desc: "从相机到云到屏统一色彩空间与元数据" },
      { title: "AI 计算 HDR", desc: "单帧重建动态范围，降低多帧合成伪影" },
      { title: "更高亮度", desc: "Micro-LED / OLED 向 2000+ nits 峰值演进" },
      { title: "格式统一", desc: "JPEG XL / Ultra HDR 或成为跨平台静态 HDR 共识" },
      { title: "空间视频 HDR", desc: "Vision Pro 等头显推动 3D + HDR 内容生产" },
      { title: "实时 HDR 直播", desc: "5G + HLG / HDR10+ 直播体育赛事常态化" },
    ];

    trends.forEach((t, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.55 + col * 3.1;
      const y = 1.55 + row * 1.85;
      slide.addShape("ellipse", {
        x: x + 0.05,
        y: y + 0.15,
        w: 0.45,
        h: 0.45,
        fill: { color: C.amber },
        line: { color: C.amber, width: 0 },
      });
      slide.addText(String(i + 1), {
        x: x + 0.05,
        y: y + 0.22,
        w: 0.45,
        h: 0.35,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C.white,
        align: "center",
        margin: 0,
      });
      slide.addText(t.title, {
        x: x + 0.6,
        y: y + 0.12,
        w: 2.35,
        h: 0.4,
        fontSize: 13,
        fontFace: FONT_BODY,
        color: C.textDark,
        bold: true,
        margin: 0,
      });
      slide.addText(t.desc, {
        x: x + 0.05,
        y: y + 0.65,
        w: 2.9,
        h: 0.95,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C.textMuted,
        margin: 0,
      });
    });
    addFooter(slide, "趋势研判 · 2026–2030");
  }

  // Slide 14: Conclusion
  {
    const slide = pres.addSlide();
    slide.background = { color: C.void };
    slide.addShape("ellipse", {
      x: 7,
      y: -0.5,
      w: 3.5,
      h: 3.5,
      fill: { color: C.amber, transparency: 80 },
      line: { color: C.amber, width: 0 },
    });
    slide.addText("核心结论", {
      x: 0.6,
      y: 0.8,
      w: 8,
      h: 0.6,
      fontSize: 28,
      fontFace: FONT_TITLE,
      color: C.gold,
      bold: true,
      margin: 0,
    });
    slide.addText(
      [
        {
          text: "HDR 思想源于摄影曝光控制，在数字时代通过格式标准与显示规范完成产业化",
          options: { bullet: true, breakLine: true, fontSize: 15, color: C.cream },
        },
        {
          text: "2015 年后 HDR10 / Dolby Vision / HLG 三分天下，推动电视与流媒体革命",
          options: { bullet: true, breakLine: true, fontSize: 15, color: C.cream },
        },
        {
          text: "移动端以 HEIF 与 Ultra HDR 将 HDR 带入日常拍照，计算摄影是下一波驱动力",
          options: { bullet: true, breakLine: true, fontSize: 15, color: C.cream },
        },
        {
          text: "全链路一致的色彩科学与元数据互操作，仍是生态成熟的关键瓶颈",
          options: { bullet: true, fontSize: 15, color: C.cream },
        },
      ],
      { x: 0.6, y: 1.65, w: 8.5, h: 2.6, fontFace: FONT_BODY }
    );
    slide.addText("谢谢", {
      x: 0.6,
      y: 4.5,
      w: 3,
      h: 0.6,
      fontSize: 36,
      fontFace: FONT_TITLE,
      color: C.amber,
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
      color: C.cream,
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
