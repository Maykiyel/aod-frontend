/* @ds-bundle: {"namespace":"AODComms","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"GrooveStrip","sourcePath":"components/core/GrooveStrip.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"NotchedCard","sourcePath":"components/core/NotchedCard.jsx"},{"name":"Surface","sourcePath":"components/core/Surface.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"AnnotationCard","sourcePath":"components/data/AnnotationCard.jsx"},{"name":"HexSlot","sourcePath":"components/data/HexSlot.jsx"},{"name":"StatBar","sourcePath":"components/data/StatBar.jsx"},{"name":"TimelineTrack","sourcePath":"components/data/TimelineTrack.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"PlateFrame","sourcePath":"components/navigation/PlateFrame.jsx"},{"name":"SectionHeader","sourcePath":"components/navigation/SectionHeader.jsx"},{"name":"ReviewBoard","sourcePath":"ui_kits/review-board/ReviewBoard.jsx"},{"name":"SessionsList","sourcePath":"ui_kits/review-board/SessionsList.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"6e8b67894523","components/core/Badge.d.ts":"b04428a6548c","components/core/Badge.prompt.md":"27e91ec948b8","components/core/Button.jsx":"fb53b9e6cd72","components/core/Button.d.ts":"69b25baf356a","components/core/Button.prompt.md":"3c028a904c06","components/core/GrooveStrip.jsx":"058960abfb33","components/core/GrooveStrip.d.ts":"9e09bacc813f","components/core/GrooveStrip.prompt.md":"0639729d6cbc","components/core/Icon.jsx":"37bd68e3ede4","components/core/Icon.d.ts":"f5d4cb97c081","components/core/Icon.prompt.md":"c40fbcdd649d","components/core/IconButton.jsx":"66996d8e9fca","components/core/IconButton.d.ts":"b6d3b2859783","components/core/IconButton.prompt.md":"03189f35910a","components/core/Input.jsx":"4a87368d8236","components/core/Input.d.ts":"11677d939ba4","components/core/Input.prompt.md":"ca957d83c6fc","components/core/NotchedCard.jsx":"d77b0e5dbd4a","components/core/NotchedCard.d.ts":"4fc5dc0c9d16","components/core/NotchedCard.prompt.md":"abc08ed66fbd","components/core/Surface.jsx":"c2505be04a56","components/core/Surface.d.ts":"382e487b909c","components/core/Surface.prompt.md":"991dc3ba25d7","components/core/Tag.jsx":"5cc9e656abf2","components/core/Tag.d.ts":"437559c2b8c3","components/core/Tag.prompt.md":"34e339dfd576","components/data/AnnotationCard.jsx":"5d9ce9c814cd","components/data/AnnotationCard.d.ts":"2db13a655c85","components/data/AnnotationCard.prompt.md":"e84c654c91b8","components/data/HexSlot.jsx":"ae78ed53d0bc","components/data/HexSlot.d.ts":"144dcea33262","components/data/HexSlot.prompt.md":"a2f9485ed839","components/data/StatBar.jsx":"a3dcea425c9d","components/data/StatBar.d.ts":"0c825a31faf4","components/data/StatBar.prompt.md":"d0aed2363228","components/data/TimelineTrack.jsx":"705b8e0ce80b","components/data/TimelineTrack.d.ts":"a24bbc54c7ff","components/data/TimelineTrack.prompt.md":"aca2ac6f9c1a","components/navigation/NavItem.jsx":"e92bf4a24408","components/navigation/NavItem.d.ts":"6f3235ff5e73","components/navigation/NavItem.prompt.md":"4e554780938d","components/navigation/PlateFrame.jsx":"9828f2b96bf3","components/navigation/PlateFrame.d.ts":"fa315141531a","components/navigation/PlateFrame.prompt.md":"37f1c754a662","components/navigation/SectionHeader.jsx":"faf4a4a45db9","components/navigation/SectionHeader.d.ts":"c768f791bd44","components/navigation/SectionHeader.prompt.md":"1112c8b95e86"},"inlinedExternals":[],"builtBy":"aod-comms-design-sync (off-script)"} */
var AODComms = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // rg:react
  var require_react = __commonJS({
    "rg:react"(exports, module) {
      module.exports = window.React;
    }
  });

  // .bundle-entry.mjs
  var bundle_entry_exports = {};
  __export(bundle_entry_exports, {
    AnnotationCard: () => AnnotationCard,
    Badge: () => Badge,
    Button: () => Button,
    GrooveStrip: () => GrooveStrip,
    HexSlot: () => HexSlot,
    Icon: () => Icon,
    IconButton: () => IconButton,
    Input: () => Input,
    NavItem: () => NavItem,
    NotchedCard: () => NotchedCard,
    PlateFrame: () => PlateFrame,
    ReviewBoard: () => ReviewBoard,
    SectionHeader: () => SectionHeader,
    SessionsList: () => SessionsList,
    StatBar: () => StatBar,
    Surface: () => Surface,
    Tag: () => Tag,
    TimelineTrack: () => TimelineTrack
  });

  // components/core/Badge.jsx
  var import_react = __toESM(require_react());
  function Badge({ size = 28, tone = "var(--red)", hollow = true, style, children, ...rest }) {
    return /* @__PURE__ */ import_react.default.createElement(
      "span",
      {
        ...rest,
        style: {
          width: size,
          height: size,
          borderRadius: "var(--radius-pill)",
          background: hollow ? "var(--void)" : tone,
          border: hollow ? "var(--border-width) solid var(--border-raised)" : "none",
          color: hollow ? tone : "var(--text-on-accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          ...style
        }
      },
      children
    );
  }

  // components/core/Button.jsx
  var import_react2 = __toESM(require_react());
  function Button({ variant = "primary", icon, disabled, style, children, ...rest }) {
    const base = {
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-data)",
      fontSize: 12,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      padding: "12px 20px",
      border: "none",
      background: "transparent",
      opacity: disabled ? 0.4 : 1,
      transition: "background 120ms linear, border-color 120ms linear, color 120ms linear"
    };
    const variants = {
      primary: { background: "var(--red)", color: "var(--text-on-accent)", fontWeight: 500 },
      secondary: {
        color: "var(--text-primary)",
        border: "var(--border-width) solid var(--border-raised)",
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - var(--clip-button)), calc(100% - var(--clip-button)) 100%, 0 100%)"
      },
      ghost: { color: "var(--text-secondary)", padding: "12px 16px" },
      live: {
        color: "var(--cyan)",
        border: "var(--border-width) solid rgba(63,225,214,.4)",
        padding: "11px 16px"
      }
    };
    return /* @__PURE__ */ import_react2.default.createElement("button", { ...rest, disabled, style: { ...base, ...variants[variant], ...style } }, icon, children && /* @__PURE__ */ import_react2.default.createElement("span", null, children));
  }

  // components/core/GrooveStrip.jsx
  var import_react3 = __toESM(require_react());
  function GrooveStrip({
    count = 2,
    behind = "var(--void)",
    borderColor = "var(--border-soft)",
    width = "var(--groove-divider-width)",
    depth = "var(--groove-divider-depth)",
    inset = "0",
    divider = false,
    style,
    ...rest
  }) {
    const slots = [];
    for (let i = 0; i < count; i++) {
      slots.push(
        /* @__PURE__ */ import_react3.default.createElement(
          "span",
          {
            key: i,
            style: {
              width,
              height: depth,
              background: behind,
              border: `var(--border-width) solid ${borderColor}`,
              borderTop: "none",
              display: "block"
            }
          }
        )
      );
    }
    return /* @__PURE__ */ import_react3.default.createElement(
      "div",
      {
        ...rest,
        style: {
          position: "relative",
          borderTop: divider ? `var(--border-width) solid ${borderColor}` : "none",
          ...style
        }
      },
      /* @__PURE__ */ import_react3.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "calc(var(--border-width) * -1)",
            left: inset,
            display: "flex",
            gap: "var(--groove-gap)"
          }
        },
        slots
      )
    );
  }

  // components/core/Icon.jsx
  var import_react4 = __toESM(require_react());
  var GLYPHS = {
    sync: { spin: true, dash: "3.6 3.2", d: null, circle: 9 },
    target: { d: "M7.5 7.5l9 9M16.5 7.5l-9 9", circle: 9 },
    add: { d: "M12 7.5v9M7.5 12h9", circle: 9 },
    aperture: { d: null, circle: 9, dash: "2.5 2.5", dot: 4.5 },
    split: { d: "M12 3v9l7 4.5M12 12l-8.6 2.6", circle: 9 },
    close: { d: "M5 5l14 14M19 5L5 19" },
    tracks: { d: "M3 6.5h18M3 12h18M3 17.5h18" },
    burst: { d: "M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" },
    frame: { d: "M3.5 8V3.5H8M16 3.5h4.5V8M20.5 16v4.5H16M8 20.5H3.5V16" },
    lens: { d: null, rect: [3.5, 3.5, 17, 17], circle2: 4 },
    role: { d: "M12 2.5l8.2 4.75v9.5L12 21.5 3.8 16.75v-9.5z", fillPath: "M12 7.5l4 2.3v4.4l-4 2.3-4-2.3V9.8z" },
    feed: { d: "M16 12h5", rect: [3, 7, 13, 10], dots: [[7.5, 12], [12, 12]] },
    filter: { solid: "M3 4h18l-7 8v8l-4-3v-5z" },
    play: { solid: "M6 3.5l14 8.5-14 8.5z" },
    flagAdd: { solid: "M4 20V4l12 7-12 9z", d: "M17 15h6M20 12v6" }
  };
  function Icon({ name = "target", size = 24, color = "currentColor", style, ...rest }) {
    const g = GLYPHS[name] || GLYPHS.target;
    const stroke = { fill: "none", stroke: color, strokeWidth: 2 };
    return /* @__PURE__ */ import_react4.default.createElement(
      "svg",
      {
        ...rest,
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        style: { ...g.spin ? { animation: "aod-spin 3.4s linear infinite" } : null, ...style }
      },
      g.solid && /* @__PURE__ */ import_react4.default.createElement("path", { d: g.solid, fill: color }),
      g.fillPath && /* @__PURE__ */ import_react4.default.createElement("path", { d: g.fillPath, fill: color }),
      g.circle && /* @__PURE__ */ import_react4.default.createElement("circle", { cx: "12", cy: "12", r: g.circle, ...stroke, strokeDasharray: g.dash || void 0 }),
      g.circle2 && /* @__PURE__ */ import_react4.default.createElement("circle", { cx: "12", cy: "12", r: g.circle2, ...stroke }),
      g.dot && /* @__PURE__ */ import_react4.default.createElement("circle", { cx: "12", cy: "12", r: g.dot, fill: color }),
      g.rect && /* @__PURE__ */ import_react4.default.createElement("rect", { x: g.rect[0], y: g.rect[1], width: g.rect[2], height: g.rect[3], ...stroke }),
      g.dots && g.dots.map((p, i) => /* @__PURE__ */ import_react4.default.createElement("circle", { key: i, cx: p[0], cy: p[1], r: "1.6", fill: color })),
      g.d && /* @__PURE__ */ import_react4.default.createElement("path", { d: g.d, ...stroke, strokeLinecap: "square" })
    );
  }

  // components/core/IconButton.jsx
  var import_react5 = __toESM(require_react());
  function IconButton({ label, active, size = 34, style, children, ...rest }) {
    return /* @__PURE__ */ import_react5.default.createElement(
      "button",
      {
        ...rest,
        "aria-label": label,
        style: {
          cursor: "pointer",
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? "var(--red)" : "transparent",
          color: active ? "var(--text-on-accent)" : "var(--text-secondary)",
          border: active ? "none" : "var(--border-width) solid var(--border-raised)",
          padding: 0,
          ...style
        }
      },
      children
    );
  }

  // components/core/Input.jsx
  var import_react6 = __toESM(require_react());
  function Input({ label, unit, mono, width, style, ...rest }) {
    const field = /* @__PURE__ */ import_react6.default.createElement(
      "input",
      {
        ...rest,
        style: {
          width: width || "100%",
          background: "var(--e0-surface)",
          border: "var(--border-width) solid var(--e0-border)",
          boxShadow: "var(--e0-shadow)",
          color: "var(--text-primary)",
          font: mono ? "var(--type-data-l)" : "var(--type-body)",
          padding: "11px 13px",
          outline: "none",
          ...style
        }
      }
    );
    return /* @__PURE__ */ import_react6.default.createElement("div", null, label && /* @__PURE__ */ import_react6.default.createElement(
      "label",
      {
        style: {
          display: "block",
          font: "var(--type-label)",
          fontSize: 12,
          letterSpacing: "var(--track-label)",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: 7
        }
      },
      label
    ), unit ? /* @__PURE__ */ import_react6.default.createElement("div", { style: { display: "flex", gap: "var(--space-3)", alignItems: "center" } }, field, /* @__PURE__ */ import_react6.default.createElement("span", { style: { font: "var(--type-data)", color: "var(--text-muted)" } }, unit)) : field);
  }

  // components/core/NotchedCard.jsx
  var import_react7 = __toESM(require_react());
  function NotchedCard({
    badge,
    level = 3,
    padding = "var(--notch-clearance) var(--space-4) var(--space-4)",
    badgeSize = "var(--notch-badge-size)",
    style,
    children,
    ...rest
  }) {
    const surface = level === 2 ? "var(--e2-surface)" : "var(--e3-surface)";
    const shadow = level === 2 ? "0 2px 6px rgba(0,0,0,.5)" : "0 6px 18px rgba(0,0,0,.55)";
    const mask = "var(--notch-mask)";
    return /* @__PURE__ */ import_react7.default.createElement("div", { style: { position: "relative", ...style } }, /* @__PURE__ */ import_react7.default.createElement(
      "div",
      {
        ...rest,
        style: {
          background: surface,
          boxShadow: shadow,
          padding,
          borderRadius: "0 var(--notch-radius) var(--notch-radius) var(--notch-radius)",
          WebkitMask: mask,
          mask
        }
      },
      children
    ), badge && /* @__PURE__ */ import_react7.default.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "var(--notch-badge-offset)",
          left: "var(--notch-badge-offset)",
          width: badgeSize,
          height: badgeSize,
          borderRadius: "var(--radius-pill)",
          background: "var(--void)",
          border: "var(--border-width) solid var(--border-raised)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      badge
    ));
  }

  // components/core/Surface.jsx
  var import_react8 = __toESM(require_react());
  var LEVELS = {
    0: { surface: "var(--e0-surface)", border: "var(--e0-border)", shadow: "var(--e0-shadow)", grooves: 0 },
    1: { surface: "var(--e1-surface)", border: "var(--e1-border)", shadow: "var(--e1-shadow)", grooves: 1 },
    2: { surface: "var(--e2-surface)", border: "var(--e2-border)", shadow: "var(--e2-shadow)", grooves: 2 },
    3: { surface: "var(--e3-surface)", border: "var(--e3-border)", shadow: "var(--e3-shadow)", grooves: 3 },
    4: { surface: "var(--e4-surface)", border: "var(--e4-border)", shadow: "var(--e4-shadow)", grooves: 4 }
  };
  function Surface({
    level = 2,
    grooves,
    behind = "var(--void)",
    padding = "var(--space-6)",
    as: Tag2 = "div",
    style,
    children,
    ...rest
  }) {
    const L = LEVELS[level] || LEVELS[2];
    const count = grooves === void 0 ? L.grooves : grooves;
    const slots = [];
    for (let i = 0; i < count; i++) {
      slots.push(
        /* @__PURE__ */ import_react8.default.createElement(
          "span",
          {
            key: i,
            style: {
              width: "var(--groove-width)",
              height: "var(--groove-depth)",
              background: behind,
              border: `var(--border-width) solid ${L.border}`,
              borderTop: "none",
              display: "block"
            }
          }
        )
      );
    }
    return /* @__PURE__ */ import_react8.default.createElement(
      Tag2,
      {
        ...rest,
        style: {
          position: "relative",
          background: L.surface,
          border: `var(--border-width) solid ${L.border}`,
          boxShadow: L.shadow,
          padding,
          ...style
        }
      },
      count > 0 && /* @__PURE__ */ import_react8.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "calc(var(--border-width) * -1)",
            left: "var(--groove-inset)",
            display: "flex",
            gap: "var(--groove-gap)",
            zIndex: 2
          }
        },
        slots
      ),
      children
    );
  }

  // components/core/Tag.jsx
  var import_react9 = __toESM(require_react());
  var TONES = {
    neutral: { color: "var(--text-secondary)", border: "var(--border-raised)", bg: "var(--void)" },
    live: { color: "var(--cyan)", border: "rgba(63,225,214,.35)", bg: "rgba(63,225,214,.1)" },
    alert: { color: "var(--red)", border: "rgba(255,46,62,.4)", bg: "rgba(255,46,62,.12)" },
    aligned: { color: "var(--aligned)", border: "rgba(46,213,115,.35)", bg: "rgba(46,213,115,.1)" },
    informative: { color: "var(--informative)", border: "rgba(139,127,255,.35)", bg: "rgba(139,127,255,.1)" },
    declarative: { color: "var(--declarative)", border: "rgba(255,176,32,.35)", bg: "rgba(255,176,32,.1)" },
    compound: { color: "var(--compound)", border: "rgba(255,111,168,.35)", bg: "rgba(255,111,168,.1)" }
  };
  function Tag({ tone = "neutral", dot, style, children, ...rest }) {
    const t = TONES[tone] || TONES.neutral;
    return /* @__PURE__ */ import_react9.default.createElement(
      "span",
      {
        ...rest,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "calc(var(--space-2) - 1px)",
          font: "var(--type-data)",
          fontSize: 11,
          letterSpacing: "var(--track-tag)",
          padding: "5px 10px",
          color: t.color,
          background: t.bg,
          border: `var(--border-width) solid ${t.border}`,
          ...style
        }
      },
      dot && /* @__PURE__ */ import_react9.default.createElement(
        "span",
        {
          style: {
            width: 6,
            height: 6,
            borderRadius: "var(--radius-pill)",
            background: t.color,
            animation: "aod-pulse 1.8s ease-in-out infinite",
            display: "block"
          }
        }
      ),
      children
    );
  }

  // components/data/AnnotationCard.jsx
  var import_react10 = __toESM(require_react());
  function AnnotationCard({ author, timestamp, body, selected, style, ...rest }) {
    return /* @__PURE__ */ import_react10.default.createElement(
      Surface,
      {
        ...rest,
        level: selected ? 3 : 2,
        behind: "var(--ash)",
        padding: "11px 12px",
        style
      },
      /* @__PURE__ */ import_react10.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 5 } }, /* @__PURE__ */ import_react10.default.createElement("span", { style: { font: "var(--type-label)", fontSize: 12 } }, author), /* @__PURE__ */ import_react10.default.createElement("span", { style: { font: "var(--type-micro)", fontSize: 10, color: "var(--text-muted)" } }, timestamp)),
      /* @__PURE__ */ import_react10.default.createElement("p", { style: { font: "var(--type-body-s)", fontSize: 12.5, color: "var(--text-secondary)", margin: 0 } }, body)
    );
  }

  // components/data/HexSlot.jsx
  var import_react11 = __toESM(require_react());
  function HexSlot({ initials, role, state = "idle", width = 62, height = 70, style, ...rest }) {
    const states = {
      active: { bg: "var(--red)", color: "var(--text-on-accent)" },
      idle: { bg: "var(--steel-3)", color: "var(--text-secondary)" },
      offline: { bg: "var(--e0-surface)", color: "var(--text-muted)" }
    };
    const s = states[state] || states.idle;
    return /* @__PURE__ */ import_react11.default.createElement(
      "div",
      {
        ...rest,
        style: {
          width,
          height,
          background: s.bg,
          color: s.color,
          clipPath: "var(--clip-hex)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          ...style
        }
      },
      /* @__PURE__ */ import_react11.default.createElement("span", { style: { font: "var(--type-display-s)", fontSize: Math.round(height * 0.31) } }, initials),
      role && /* @__PURE__ */ import_react11.default.createElement("span", { style: { font: "var(--type-micro)", fontSize: 8.5, letterSpacing: "var(--track-tag)" } }, role)
    );
  }

  // components/data/StatBar.jsx
  var import_react12 = __toESM(require_react());
  var FILLS = {
    red: { bg: "var(--red)", color: "var(--text-on-accent)" },
    white: { bg: "var(--text-primary)", color: "var(--text-on-light)" },
    aligned: { bg: "var(--aligned)", color: "var(--text-on-light)" }
  };
  function StatBar({
    label,
    value,
    unit,
    fill = "white",
    height = 44,
    valueWidth = 150,
    skew = "var(--clip-statbar-skew)",
    style,
    ...rest
  }) {
    const f = FILLS[fill] || FILLS.white;
    return /* @__PURE__ */ import_react12.default.createElement("div", { ...rest, style: { display: "flex", alignItems: "stretch", height, ...style } }, /* @__PURE__ */ import_react12.default.createElement(
      "div",
      {
        style: {
          flex: 1,
          background: "var(--e0-surface)",
          border: "var(--border-width) solid var(--e0-border)",
          display: "flex",
          alignItems: "center",
          padding: `0 calc(${skew} + 4px) 0 14px`,
          clipPath: `polygon(0 0, 100% 0, calc(100% - ${skew}) 100%, 0 100%)`,
          font: "var(--type-data)",
          fontSize: 11.5,
          letterSpacing: ".12em",
          color: "var(--text-secondary)"
        }
      },
      label
    ), /* @__PURE__ */ import_react12.default.createElement(
      "div",
      {
        style: {
          width: `calc(${valueWidth}px + ${skew})`,
          marginLeft: `calc(${skew} * -1)`,
          clipPath: `polygon(${skew} 0, 100% 0, 100% 100%, 0 100%)`,
          background: f.bg,
          color: f.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 16px",
          font: "var(--type-stat)",
          fontSize: Math.round(height * 0.68)
        }
      },
      value,
      unit && /* @__PURE__ */ import_react12.default.createElement("span", { style: { font: "var(--type-data)", fontSize: 13, marginLeft: 5 } }, unit)
    ));
  }

  // components/data/TimelineTrack.jsx
  var import_react13 = __toESM(require_react());
  var COMM = {
    informative: "var(--informative)",
    declarative: "var(--declarative)",
    compound: "var(--compound)",
    event: "var(--text-muted)"
  };
  function TimelineTrack({
    label,
    markers = [],
    absence,
    selectedAt,
    labelWidth = "var(--size-track-label)",
    height = "var(--size-track-row)",
    style,
    ...rest
  }) {
    return /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        ...rest,
        style: {
          display: "flex",
          alignItems: "center",
          height,
          borderTop: "var(--border-width) solid var(--border-recessed)",
          ...style
        }
      },
      /* @__PURE__ */ import_react13.default.createElement(
        "div",
        {
          style: {
            width: labelWidth,
            flex: "none",
            font: "var(--type-data)",
            fontSize: 10.5,
            letterSpacing: ".06em",
            color: "var(--text-secondary)"
          }
        },
        label
      ),
      /* @__PURE__ */ import_react13.default.createElement(
        "div",
        {
          style: {
            flex: 1,
            position: "relative",
            height: "100%",
            borderLeft: "var(--border-width) solid var(--border-soft)"
          }
        },
        absence && /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              position: "absolute",
              top: 5,
              bottom: 5,
              left: absence.from,
              width: absence.width,
              backgroundColor: "var(--absence-fill)",
              backgroundImage: "var(--absence-hatch)",
              borderLeft: "var(--border-width) solid var(--absence)",
              borderRight: "var(--border-width) solid var(--absence)"
            }
          }
        ),
        markers.map((m, i) => /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            key: i,
            title: m.type,
            style: {
              position: "absolute",
              top: "50%",
              left: m.at,
              width: "var(--size-marker)",
              height: "var(--size-marker)",
              transform: "translate(-50%,-50%) rotate(45deg)",
              background: COMM[m.type] || COMM.event
            }
          }
        )),
        selectedAt && /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              position: "absolute",
              top: "50%",
              left: selectedAt.at,
              width: "var(--size-marker-selected)",
              height: "var(--size-marker-selected)",
              transform: "translate(-50%,-50%) rotate(45deg)",
              background: COMM[selectedAt.type] || COMM.compound,
              boxShadow: "0 0 0 4px rgba(255,111,168,.22)"
            }
          }
        )
      )
    );
  }

  // components/navigation/NavItem.jsx
  var import_react14 = __toESM(require_react());
  function NavItem({ icon, active, label, style, ...rest }) {
    return /* @__PURE__ */ import_react14.default.createElement(
      "div",
      {
        ...rest,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: active ? "10px 18px" : "10px 18px",
          font: active ? "var(--type-label)" : "var(--type-body-s)",
          fontSize: 13,
          color: active ? "var(--text-primary)" : "var(--text-secondary)",
          background: active ? "var(--steel)" : "transparent",
          borderLeft: active ? "2px solid var(--red)" : "2px solid transparent",
          cursor: "pointer",
          ...style
        }
      },
      icon,
      /* @__PURE__ */ import_react14.default.createElement("span", null, label)
    );
  }

  // components/navigation/PlateFrame.jsx
  var import_react15 = __toESM(require_react());
  function PlateFrame({
    level = 1,
    corner = "bottom-left",
    ring = true,
    padding = "var(--space-6)",
    style,
    children,
    ...rest
  }) {
    const surface = level === 0 ? "var(--e0-surface)" : level === 2 ? "var(--e2-surface)" : "var(--e1-surface)";
    const border = level === 0 ? "var(--e0-border)" : level === 2 ? "var(--border)" : "var(--border-soft)";
    const shadow = level === 0 ? "var(--e0-shadow)" : level === 2 ? "var(--e2-shadow)" : "var(--e1-shadow)";
    const pos = {
      "bottom-left": { left: -30, bottom: -24 },
      "bottom-right": { right: -40, bottom: -30 },
      "top-right": { right: -46, top: -30 }
    }[corner];
    const dot = {
      position: "absolute",
      width: 3,
      height: 3,
      borderRadius: "var(--radius-pill)",
      background: "var(--plate-bolt)"
    };
    return /* @__PURE__ */ import_react15.default.createElement(
      "div",
      {
        ...rest,
        style: {
          position: "relative",
          overflow: "hidden",
          background: surface,
          border: `var(--border-width) solid ${border}`,
          boxShadow: shadow,
          padding,
          ...style
        }
      },
      /* @__PURE__ */ import_react15.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            width: 190,
            height: 140,
            background: "var(--plate-silhouette)",
            clipPath: "polygon(0 30%, 26% 30%, 34% 10%, 72% 10%, 84% 32%, 100% 32%, 100% 100%, 48% 100%, 40% 72%, 0 72%)",
            ...pos
          }
        }
      ),
      ring && /* @__PURE__ */ import_react15.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            width: 110,
            height: 110,
            border: "var(--border-width) solid var(--plate-ring)",
            borderRadius: "var(--radius-pill)",
            ...pos,
            ...pos.left !== void 0 ? { left: pos.left + 50 } : {},
            ...pos.bottom !== void 0 ? { bottom: pos.bottom + 34 } : {}
          }
        }
      ),
      /* @__PURE__ */ import_react15.default.createElement("span", { style: { ...dot, top: 7, left: 7 } }),
      /* @__PURE__ */ import_react15.default.createElement("span", { style: { ...dot, top: 7, right: 7 } }),
      /* @__PURE__ */ import_react15.default.createElement("span", { style: { ...dot, bottom: 7, left: 7 } }),
      /* @__PURE__ */ import_react15.default.createElement("span", { style: { ...dot, bottom: 7, right: 7 } }),
      /* @__PURE__ */ import_react15.default.createElement("div", { style: { position: "relative" } }, children)
    );
  }

  // components/navigation/SectionHeader.jsx
  var import_react16 = __toESM(require_react());
  function SectionHeader({ eyebrow, index, title, lede, style, ...rest }) {
    return /* @__PURE__ */ import_react16.default.createElement("div", { ...rest, style }, (eyebrow || index) && /* @__PURE__ */ import_react16.default.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 } }, eyebrow && /* @__PURE__ */ import_react16.default.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          font: "var(--type-eyebrow)",
          letterSpacing: "var(--track-eyebrow)",
          textTransform: "uppercase",
          color: "var(--red)"
        }
      },
      /* @__PURE__ */ import_react16.default.createElement("span", { style: { width: 5, height: 5, background: "var(--red)", display: "block" } }),
      /* @__PURE__ */ import_react16.default.createElement("span", null, eyebrow)
    ), index && /* @__PURE__ */ import_react16.default.createElement("span", { style: { font: "var(--type-eyebrow)", fontSize: 11, color: "var(--text-muted)" } }, index)), /* @__PURE__ */ import_react16.default.createElement(
      "h2",
      {
        style: {
          font: "var(--type-display-l)",
          textTransform: "uppercase",
          margin: "0 0 12px"
        }
      },
      title
    ), lede && /* @__PURE__ */ import_react16.default.createElement(
      "p",
      {
        style: {
          font: "var(--type-body)",
          fontSize: 15,
          color: "var(--text-secondary)",
          maxWidth: 680,
          textWrap: "pretty",
          margin: 0
        }
      },
      lede
    ));
  }

  // ui_kits/review-board/ReviewBoard.jsx
  var import_react17 = __toESM(require_react());
  var TRACKS = [
    { label: "EVENTS", markers: [{ at: "14%", type: "event" }, { at: "38%", type: "event" }, { at: "62%", type: "event" }, { at: "91%", type: "event" }] },
    { label: "PA_WALKER", markers: [{ at: "9%", type: "informative" }, { at: "22%", type: "declarative" }, { at: "74%", type: "informative" }, { at: "88%", type: "declarative" }], selectedAt: { at: "41%", type: "compound" } },
    { label: "PB_REYES", markers: [{ at: "12%", type: "declarative" }, { at: "31%", type: "informative" }, { at: "86%", type: "informative" }], absence: { from: "56%", width: "11%" } },
    { label: "PC_CARETO", markers: [{ at: "6%", type: "informative" }, { at: "36%", type: "compound" }, { at: "55%", type: "declarative" }, { at: "81%", type: "informative" }] },
    { label: "PD_MOORE", markers: [{ at: "19%", type: "informative" }, { at: "48%", type: "informative" }, { at: "69%", type: "declarative" }] }
  ];
  function ReviewBoard({ sessionId = "SESSION_047", onBack }) {
    const [playing, setPlaying] = import_react17.default.useState(true);
    const [nudge, setNudge] = import_react17.default.useState(0.32);
    return /* @__PURE__ */ import_react17.default.createElement("div", { style: { padding: "26px 32px 40px", position: "relative" }, "data-screen-label": "Review Board" }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", top: 6, right: 96, zIndex: 3 } }, /* @__PURE__ */ import_react17.default.createElement(Surface, { level: 3, grooves: 0, padding: "7px 12px", style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { width: 6, height: 6, background: "var(--cyan)", borderRadius: "var(--radius-pill)", animation: "aod-pulse 1.8s ease-in-out infinite", display: "block" } }), /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-micro)", letterSpacing: ".1em", color: "var(--cyan)" } }, "2 REVIEWING"), /* @__PURE__ */ import_react17.default.createElement("span", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ import_react17.default.createElement(HexSlot, { initials: "EW", width: 20, height: 22, state: "active" }), /* @__PURE__ */ import_react17.default.createElement(HexSlot, { initials: "SR", width: 20, height: 22 })))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { background: "var(--ash)", border: "var(--border-width) solid var(--border-raised)", boxShadow: "var(--bezel-shadow)", overflowX: "auto" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "var(--size-sidebar) minmax(520px,1fr) var(--size-rail)", minHeight: 660, minWidth: 1060 } }, /* @__PURE__ */ import_react17.default.createElement(PlateFrame, { padding: "22px 0 18px", style: { borderTop: "none", borderLeft: "none", borderBottom: "none", borderRight: "var(--border-width) solid var(--border-soft)" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { padding: "0 18px 20px", borderBottom: "var(--border-width) solid var(--border-soft)", marginBottom: 16 } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, marginBottom: 14 } }, /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "role", size: 18, color: "var(--red)" }), /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-display-s)", fontSize: 22, textTransform: "uppercase" } }, "AOD Comms")), /* @__PURE__ */ import_react17.default.createElement("div", { style: { background: "var(--e0-surface)", border: "var(--border-width) solid var(--e0-border)", boxShadow: "var(--e0-shadow)", padding: "9px 11px", cursor: "pointer" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { font: "var(--type-micro)", fontSize: 9.5, color: "var(--text-muted)" } }, "WORKSPACE"), /* @__PURE__ */ import_react17.default.createElement("div", { style: { font: "var(--type-label)", fontSize: 12.5 } }, "Sentinel Academy"))), /* @__PURE__ */ import_react17.default.createElement(NavItem, { label: "Dashboard", icon: /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "tracks", size: 16 }), onClick: onBack }), /* @__PURE__ */ import_react17.default.createElement(NavItem, { label: "Sessions", active: true, icon: /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "aperture", size: 16, color: "var(--red)" }) }), /* @__PURE__ */ import_react17.default.createElement(NavItem, { label: "Team", icon: /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "role", size: 16 }) }), /* @__PURE__ */ import_react17.default.createElement(NavItem, { label: "Settings", icon: /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "lens", size: 16 }) }), /* @__PURE__ */ import_react17.default.createElement("div", { style: { margin: "22px 18px 0", paddingTop: 16, borderTop: "var(--border-width) solid var(--border-soft)", font: "var(--type-micro)", fontSize: 10, color: "var(--text-muted)", lineHeight: 2 } }, /* @__PURE__ */ import_react17.default.createElement("div", null, "BUILD:4.0.2"), /* @__PURE__ */ import_react17.default.createElement("div", null, "RIOT_API", /* @__PURE__ */ import_react17.default.createElement("span", { style: { color: "var(--aligned)" } }, ":OK")))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { background: "var(--void)", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "var(--border-width) solid var(--border-soft)", background: "var(--ash)" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-display-s)", textTransform: "uppercase" } }, "Ascent // Round 14"), /* @__PURE__ */ import_react17.default.createElement(Tag, null, sessionId)), /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", gap: 5 } }, ["PA", "PB", "PC", "PD", "PE"].map((p, i) => /* @__PURE__ */ import_react17.default.createElement(HexSlot, { key: p, initials: p, width: 34, height: 38, state: i === 0 ? "active" : i === 4 ? "offline" : "idle" })))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { padding: 20 } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "relative", background: "var(--void)", border: "var(--border-width) solid var(--border-soft)", boxShadow: "var(--e0-shadow)", aspectRatio: "16/9", overflow: "hidden" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,var(--plate-grid) 0 1px,transparent 1px 44px),repeating-linear-gradient(0deg,var(--plate-grid) 0 1px,transparent 1px 44px)" } }), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: "var(--type-display-xl)", fontSize: 120, color: "rgba(255,255,255,.035)", textTransform: "uppercase" } }, "VOD_PA"), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", top: 16, left: 18, display: "flex", alignItems: "center", gap: 8, font: "var(--type-micro)", letterSpacing: ".1em", color: "var(--cyan)" } }, /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "sync", size: 12, color: "var(--cyan)" }), /* @__PURE__ */ import_react17.default.createElement("span", null, "SYNCED TO RIOT CLOCK")), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", top: "38%", left: "31%", display: "flex", alignItems: "center", gap: 7, background: "var(--steel-2)", border: "var(--border-width) solid var(--compound)", boxShadow: "0 6px 18px rgba(0,0,0,.55)", padding: "6px 10px" } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { width: 8, height: 8, background: "var(--compound)", transform: "rotate(45deg)", display: "block" } }), /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-micro)", fontSize: 10.5, letterSpacing: ".06em", color: "var(--text-primary)" } }, `"THEY'RE ROTATING B \u2014 TAKE MID NOW"`)), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", top: "calc(38% + 26px)", left: "calc(31% + 12px)", width: 1, height: 54, background: "linear-gradient(var(--compound),rgba(255,111,168,0))" } }), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", top: "calc(38% + 78px)", left: "calc(31% + 6px)", width: 13, height: 13, border: "var(--border-width) solid var(--compound)", borderRadius: "50%" } }), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", bottom: "16%", right: "22%", display: "flex", alignItems: "center", gap: 7, background: "var(--steel)", border: "var(--border-width) solid var(--border-raised)", padding: "5px 9px" } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { width: 7, height: 7, background: "var(--declarative)", transform: "rotate(45deg)", display: "block" } }), /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-micro)", fontSize: 10, color: "var(--text-secondary)" } }, "SPIKE PLANT 00:14:19")), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", bottom: 14, left: 18, font: "var(--type-data)", color: "var(--text-secondary)" } }, "00:14:22.480 ", /* @__PURE__ */ import_react17.default.createElement("span", { style: { color: "var(--text-muted)" } }, "/ 00:41:06.000"))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-micro)", letterSpacing: "var(--track-micro)", textTransform: "uppercase", color: "var(--text-muted)" } }, "Game start anchor"), /* @__PURE__ */ import_react17.default.createElement(Button, { variant: "secondary", style: { padding: "7px 12px", clipPath: "none" }, onClick: () => setNudge((n) => +(n - 1).toFixed(2)) }, "\u22121s"), /* @__PURE__ */ import_react17.default.createElement("div", { style: { font: "var(--type-data)", color: "var(--text-primary)", background: "var(--e0-surface)", border: "var(--border-width) solid var(--e0-border)", boxShadow: "var(--e0-shadow)", padding: "7px 14px" } }, nudge > 0 ? "+" : "", nudge.toFixed(3), "s"), /* @__PURE__ */ import_react17.default.createElement(Button, { variant: "secondary", style: { padding: "7px 12px", clipPath: "none" }, onClick: () => setNudge((n) => +(n + 1).toFixed(2)) }, "+1s"), /* @__PURE__ */ import_react17.default.createElement(Button, { variant: "live", icon: /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "sync", size: 12, color: "var(--cyan)" }), onClick: () => setNudge(0.32) }, "Reset to Riot sync"), /* @__PURE__ */ import_react17.default.createElement(Button, { style: { marginLeft: "auto" }, onClick: () => setPlaying((p) => !p) }, playing ? "\u275A\u275A Pause" : "\u25B6 Play"))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { margin: "0 20px 20px", background: "var(--e0-surface)", border: "var(--border-width) solid var(--e0-border)", boxShadow: "var(--e0-shadow)", padding: "14px 16px" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-micro)", letterSpacing: "var(--track-micro)", textTransform: "uppercase", color: "var(--text-muted)" } }, "Canonical timeline"), /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-micro)", fontSize: 10, color: "var(--text-muted)" } }, "TIMELINE_ID:0043-A")), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "relative" } }, TRACKS.map((t) => /* @__PURE__ */ import_react17.default.createElement(TimelineTrack, { key: t.label, ...t })), /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, left: "var(--size-track-label)", right: 0, overflow: "hidden", pointerEvents: "none" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, left: "41%", width: 1, background: "var(--text-primary)", boxShadow: "0 0 8px rgba(255,255,255,.5)", opacity: playing ? 1 : 0.45 } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { position: "absolute", top: -4, left: -3, width: 7, height: 7, background: "var(--text-primary)", transform: "rotate(45deg)", display: "block" } })))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", marginTop: 8 } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { width: "var(--size-track-label)", flex: "none" } }), /* @__PURE__ */ import_react17.default.createElement("div", { style: { flex: 1, display: "flex", justifyContent: "space-between", font: "var(--type-micro)", fontSize: 9.5, color: "var(--text-muted)" } }, ["13:40", "14:00", "14:20", "14:40", "15:00"].map((t) => /* @__PURE__ */ import_react17.default.createElement("span", { key: t }, t)))))), /* @__PURE__ */ import_react17.default.createElement(PlateFrame, { corner: "top-right", padding: "18px", style: { borderTop: "none", borderRight: "none", borderBottom: "none", borderLeft: "var(--border-width) solid var(--border-soft)" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { marginBottom: 18 } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", font: "var(--type-micro)", letterSpacing: ".12em", color: "var(--text-muted)", marginBottom: 7 } }, /* @__PURE__ */ import_react17.default.createElement("span", null, "REVIEW PROGRESS"), /* @__PURE__ */ import_react17.default.createElement("span", { style: { color: "var(--text-primary)" } }, "62%")), /* @__PURE__ */ import_react17.default.createElement("div", { style: { height: 5, background: "var(--e0-surface)", border: "var(--border-width) solid var(--e0-border)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.85)" } }, /* @__PURE__ */ import_react17.default.createElement("div", { style: { width: "62%", height: "100%", background: "var(--red)" } }))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 } }, /* @__PURE__ */ import_react17.default.createElement(StatBar, { label: "FREQUENCY", value: "18.4", fill: "red", height: 40, valueWidth: 96, skew: "var(--clip-statbar-skew-compact)" }), /* @__PURE__ */ import_react17.default.createElement(StatBar, { label: "ABSENCE", value: "6", height: 40, valueWidth: 96, skew: "var(--clip-statbar-skew-compact)" }), /* @__PURE__ */ import_react17.default.createElement(StatBar, { label: "ALIGNMENT", value: "87", unit: "%", fill: "aligned", height: 40, valueWidth: 96, skew: "var(--clip-statbar-skew-compact)" })), /* @__PURE__ */ import_react17.default.createElement(
      NotchedCard,
      {
        badge: /* @__PURE__ */ import_react17.default.createElement("span", { style: { width: 9, height: 9, background: "var(--compound)", transform: "rotate(45deg)", display: "block" } }),
        badgeSize: 26,
        padding: "44px 16px 16px",
        style: { marginBottom: 18 }
      },
      /* @__PURE__ */ import_react17.default.createElement("div", { style: { font: "var(--type-micro)", fontSize: 10, letterSpacing: ".12em", color: "var(--compound)", marginBottom: 6 } }, "SELECTED MOMENT // COMPOUND"),
      /* @__PURE__ */ import_react17.default.createElement("div", { style: { font: "var(--type-display-m)", fontSize: 28, textTransform: "uppercase", marginBottom: 8 } }, "Mid take call"),
      /* @__PURE__ */ import_react17.default.createElement("div", { style: { font: "var(--type-data)", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.9 } }, /* @__PURE__ */ import_react17.default.createElement("div", null, "t ", /* @__PURE__ */ import_react17.default.createElement("span", { style: { color: "var(--text-primary)" } }, "00:14:22.480")), /* @__PURE__ */ import_react17.default.createElement("div", null, "speaker ", /* @__PURE__ */ import_react17.default.createElement("span", { style: { color: "var(--text-primary)" } }, "PA_WALKER")), /* @__PURE__ */ import_react17.default.createElement("div", null, "alignment ", /* @__PURE__ */ import_react17.default.createElement("span", { style: { color: "var(--declarative)" } }, "DELAYED 3.1s")))
    ), /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, /* @__PURE__ */ import_react17.default.createElement("span", { style: { font: "var(--type-micro)", letterSpacing: ".12em", color: "var(--text-muted)" } }, "ANNOTATIONS \xB7 3"), /* @__PURE__ */ import_react17.default.createElement(IconButton, { label: "Add annotation", size: 26 }, /* @__PURE__ */ import_react17.default.createElement(Icon, { name: "add", size: 12 }))), /* @__PURE__ */ import_react17.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ import_react17.default.createElement(AnnotationCard, { author: "Coach Vela", timestamp: "14:22", body: "Call lands after the rotate is already committed. Needs to come at first contact, not after." }), /* @__PURE__ */ import_react17.default.createElement(AnnotationCard, { author: "Reyes", timestamp: "14:26", body: "I held mid waiting on confirm \u2014 6.4s of nothing on comms there." })), /* @__PURE__ */ import_react17.default.createElement("div", { style: { marginTop: 14 } }, /* @__PURE__ */ import_react17.default.createElement(Input, { label: "Add a note", placeholder: "Type at 14:22\u2026" })))))));
  }

  // ui_kits/review-board/SessionsList.jsx
  var import_react18 = __toESM(require_react());
  var SESSIONS = [
    { id: "SESSION_047", map: "MAP_ASCENT", round: "Round 14", freq: "18.4", gaps: "6", state: "reviewing" },
    { id: "SESSION_046", map: "MAP_LOTUS", round: "Round 21", freq: "14.1", gaps: "9", state: "open" },
    { id: "SESSION_045", map: "MAP_SPLIT", round: "Round 08", freq: "21.7", gaps: "3", state: "signed" }
  ];
  function SessionsList({ onOpen }) {
    return /* @__PURE__ */ import_react18.default.createElement("div", { style: { padding: "28px 32px" } }, /* @__PURE__ */ import_react18.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 26 } }, /* @__PURE__ */ import_react18.default.createElement(SectionHeader, { eyebrow: "Sentinel Academy", title: "Sessions", lede: "Three scrims awaiting coordination review." }), /* @__PURE__ */ import_react18.default.createElement(Button, { icon: /* @__PURE__ */ import_react18.default.createElement(Icon, { name: "add", size: 14, color: "#fff" }) }, "New session")), /* @__PURE__ */ import_react18.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 } }, SESSIONS.map((s) => /* @__PURE__ */ import_react18.default.createElement(Surface, { key: s.id, level: 2, behind: "var(--void)", padding: "0", style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ import_react18.default.createElement(
      "div",
      {
        style: {
          height: 116,
          background: "var(--well)",
          borderBottom: "var(--border-width) solid var(--border)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, var(--clip-thumbnail) 100%, 0 calc(100% - var(--clip-thumbnail)))",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: 14
        }
      },
      /* @__PURE__ */ import_react18.default.createElement("span", { style: { position: "absolute", top: 12, right: 14, font: "var(--type-micro)", color: "var(--text-muted)" } }, s.map),
      /* @__PURE__ */ import_react18.default.createElement("span", { style: { font: "var(--type-display-s)", textTransform: "uppercase" } }, s.round)
    ), /* @__PURE__ */ import_react18.default.createElement("div", { style: { padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ import_react18.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ import_react18.default.createElement(Tag, null, s.id), s.state === "reviewing" && /* @__PURE__ */ import_react18.default.createElement(Tag, { tone: "live", dot: true }, "REVIEWING"), s.state === "signed" && /* @__PURE__ */ import_react18.default.createElement(Tag, { tone: "aligned" }, "SIGNED OFF")), /* @__PURE__ */ import_react18.default.createElement(StatBar, { label: "FREQUENCY", value: s.freq, unit: "/min", fill: s.state === "reviewing" ? "red" : "white", height: 38, valueWidth: 92, skew: "var(--clip-statbar-skew-compact)" }), /* @__PURE__ */ import_react18.default.createElement(StatBar, { label: "ABSENCE", value: s.gaps, unit: "gaps", height: 38, valueWidth: 92, skew: "var(--clip-statbar-skew-compact)" }), /* @__PURE__ */ import_react18.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 } }, /* @__PURE__ */ import_react18.default.createElement("div", { style: { display: "flex", gap: 4 } }, ["PA", "PB", "PC", "PD", "PE"].map((p, i) => /* @__PURE__ */ import_react18.default.createElement(HexSlot, { key: p, initials: p, width: 26, height: 30, state: i === 0 ? "active" : i === 4 ? "offline" : "idle" }))), /* @__PURE__ */ import_react18.default.createElement(Button, { variant: "secondary", style: { padding: "9px 14px" }, onClick: () => onOpen && onOpen(s) }, "Open")))))));
  }
  return __toCommonJS(bundle_entry_exports);
})();
