/* Gera public/assets/purin.riv (arquivo do Rive) diretamente, sem o editor, usando a
   imagem oficial do Purin (public/assets/purin-base.png) como corpo do personagem.

   Uso:  python tools/prep-image.py <png>   (uma vez: remove o fundo e gera purin-base.png)
         npm run riv                         (gera o purin.riv)

   O arquivo gerado tem uma state machine "Purin" com os inputs:
     humor (Number: 0 normal, 1 feliz, 2 triste, 3 fome, 4 sujo, 5 cansado, 6 dormindo)
     comer, banho, carinho, pular (Triggers)                                              */
const fs = require("fs");
const path = require("path");

/* ---------------------------- tabelas do formato ---------------------------- */
// nome -> [propertyKey, tipo]   u=uint(varuint) f=float32 s=string c=cor(uint32 LE) b=bool(1 byte) B=bytes
const PK = {
  name: [4, "s"], parentId: [5, "u"],
  artW: [7, "f"], artH: [8, "f"], clip: [196, "b"],
  x: [13, "f"], y: [14, "f"], rotation: [15, "f"], scaleX: [16, "f"], scaleY: [17, "f"], opacity: [18, "f"],
  w: [20, "f"], h: [21, "f"],
  isClosed: [32, "b"],
  colorValue: [37, "c"], fillRule: [40, "u"],
  thickness: [47, "f"], cap: [48, "u"], join: [49, "u"],
  vx: [24, "f"], vy: [25, "f"],
  inRot: [84, "f"], inDist: [85, "f"], outRot: [86, "f"], outDist: [87, "f"],
  objectId: [51, "u"], propertyKey: [53, "u"],
  animName: [55, "s"], fps: [56, "u"], duration: [57, "u"], loopValue: [59, "u"],
  frame: [67, "u"], interpType: [68, "u"], kfValue: [70, "f"],
  inputName: [138, "s"], inputValue: [140, "f"],
  animationId: [149, "u"], stateToId: [151, "u"], flags: [152, "u"],
  inputId: [155, "u"], opValue: [156, "u"], condValue: [157, "f"],
  trDuration: [158, "u"], exitTime: [160, "u"],
  assetId: [204, "u"], assetName: [203, "s"], assetH: [207, "f"], assetW: [208, "f"], bytes: [212, "B"],
  imgAssetId: [206, "u"]
};
const T = {
  Artboard: 1, Node: 2, Shape: 3, Ellipse: 4, StraightVertex: 5, CubicDetachedVertex: 6,
  PointsPath: 16, SolidColor: 18, Fill: 20, Backboard: 23, Stroke: 24,
  KeyedObject: 25, KeyedProperty: 26, KeyFrameDouble: 30, LinearAnimation: 31,
  Image: 100, ImageAsset: 105, FileAssetContents: 106,
  StateMachine: 53, SMNumber: 56, SMLayer: 57, SMTrigger: 58,
  AnimationState: 61, AnyState: 62, EntryState: 63, ExitState: 64, StateTransition: 65,
  TransTriggerCond: 68, TransNumberCond: 70
};
const KEY = { x: 13, y: 14, rotation: 15, scaleX: 16, scaleY: 17, opacity: 18 };

/* ------------------------------- escritor ---------------------------------- */
class Writer {
  constructor() { this.b = []; }
  u8(v) { this.b.push(v & 255); }
  varu(v) { do { let x = v % 128; v = Math.floor(v / 128); if (v > 0) x |= 128; this.b.push(x); } while (v > 0); }
  f32(v) { const bf = Buffer.alloc(4); bf.writeFloatLE(v); this.b.push(...bf); }
  u32(v) { const bf = Buffer.alloc(4); bf.writeUInt32LE(v >>> 0); this.b.push(...bf); }
  str(s) { const bf = Buffer.from(s, "utf8"); this.varu(bf.length); this.b.push(...bf); }
  bytes(bf) { this.varu(bf.length); for (const x of bf) this.b.push(x); }
}

/* ------------------------------- modelo ------------------------------------ */
const pre = [];            // Backboard + assets (antes do artboard)
const comps = [];          // componentes do artboard (índice 0 = artboard)
const rest = [];           // animações, state machine... (depois dos componentes)
let phase = "pre";
let animCount = 0;

function add(type, props = {}, isComp = true) {
  const o = { type, props };
  if (!isComp) { (phase === "pre" ? pre : rest).push(o); return -1; }
  phase = "comps";
  comps.push(o);
  o.idx = comps.length - 1;
  return o.idx;
}
const argb = (hex, a = 255) => ((a << 24) | parseInt(hex.replace("#", ""), 16)) >>> 0;

/* ----------------------------- construtores -------------------------------- */
function node(ctx, name, ax, ay, extra = {}) {
  const i = add(T.Node, { name, parentId: ctx.i, x: ax - ctx.ox, y: ay - ctx.oy, ...extra });
  return { i, ox: ax, oy: ay };
}
function paint(shape, st) {
  if (st.fill) { const f = add(T.Fill, { parentId: shape }); add(T.SolidColor, { parentId: f, colorValue: st.fill }); }
  if (st.stroke) {
    const s = add(T.Stroke, { parentId: shape, thickness: st.sw || 3, cap: 1, join: 1 });
    add(T.SolidColor, { parentId: s, colorValue: st.stroke });
  }
}
function ellipse(ctx, name, cx, cy, w, h, st) {
  const sh = add(T.Shape, { name, parentId: ctx.i });
  add(T.Ellipse, { name: name + "-path", parentId: sh, x: cx - ctx.ox, y: cy - ctx.oy, w, h });
  paint(sh, st);
  return sh;
}
// pontos [[x,y],...]; ctrls = pontos de controle quadráticos (Q) entre eles; null = reta
function pathShape(ctx, name, pts, ctrls, closed, st) {
  const n = pts.length;
  const segs = closed ? n : n - 1;
  const vin = pts.map(() => null), vout = pts.map(() => null);
  for (let k = 0; k < segs; k++) {
    const a = pts[k], b = pts[(k + 1) % n], q = ctrls[k];
    if (!q) continue;
    const c1 = [a[0] + (2 / 3) * (q[0] - a[0]), a[1] + (2 / 3) * (q[1] - a[1])];
    const c2 = [b[0] + (2 / 3) * (q[0] - b[0]), b[1] + (2 / 3) * (q[1] - b[1])];
    vout[k] = [c1[0] - a[0], c1[1] - a[1]];
    vin[(k + 1) % n] = [c2[0] - b[0], c2[1] - b[1]];
  }
  const sh = add(T.Shape, { name, parentId: ctx.i });
  const p = add(T.PointsPath, { name: name + "-path", parentId: sh, isClosed: !!closed });
  pts.forEach((pt, k) => {
    const x = pt[0] - ctx.ox, y = pt[1] - ctx.oy;
    if (!vin[k] && !vout[k]) add(T.StraightVertex, { parentId: p, vx: x, vy: y });
    else {
      const i = vin[k] || [0, 0], o = vout[k] || [0, 0];
      add(T.CubicDetachedVertex, {
        parentId: p, vx: x, vy: y,
        inRot: Math.atan2(i[1], i[0]), inDist: Math.hypot(i[0], i[1]),
        outRot: Math.atan2(o[1], o[0]), outDist: Math.hypot(o[0], o[1])
      });
    }
  });
  paint(sh, st);
  return sh;
}

/* -------------------------------- imagem ----------------------------------- */
const PNG = fs.readFileSync(path.join(__dirname, "..", "public", "assets", "purin-base.png"));
const IMG_W = PNG.readUInt32BE(16), IMG_H = PNG.readUInt32BE(20);

const ART_W = 220, ART_H = 240;
const S = 0.66;                           // escala da imagem dentro do artboard
const PIVOT_X = ART_W / 2, PIVOT_Y = 232; // pés do Purin
// pixel da imagem -> coordenada do artboard
const ip = (ix, iy) => [PIVOT_X + (ix - IMG_W / 2) * S, PIVOT_Y - (IMG_H - iy) * S];

add(T.Backboard, {}, false);
add(T.ImageAsset, { assetId: 0, assetName: "purin-base", assetW: IMG_W, assetH: IMG_H }, false);
add(T.FileAssetContents, { bytes: PNG }, false);

const art = add(T.Artboard, { name: "Purin", artW: ART_W, artH: ART_H, clip: true });
const root0 = { i: art, ox: 0, oy: 0 };

ellipse(root0, "sombra", PIVOT_X, PIVOT_Y + 2, 130, 12, { fill: argb("#000000", 36) });
const raiz = node(root0, "raiz", PIVOT_X, PIVOT_Y);
const corpo = node(raiz, "corpo", PIVOT_X, PIVOT_Y);

// a imagem oficial (centro da imagem em coordenadas do artboard)
const [cx, cy] = ip(IMG_W / 2, IMG_H / 2);
add(T.Image, { name: "purin-imagem", parentId: corpo.i, imgAssetId: 0, x: cx - corpo.ox, y: cy - corpo.oy, scaleX: S, scaleY: S });

/* --------------------------- rosto (sobre a imagem) ------------------------ */
// coordenadas em pixels da imagem recortada (purin-base.png)
const SKIN = argb("#fff8b0");
const INK = argb("#3b1a0a");
const ink = (sw) => ({ stroke: INK, sw: sw * S });
const EYE_L = [117.8, 96], EYE_R = [217.5, 99];
const px = (p) => ip(p[0], p[1]);
const pxs = (arr) => arr.map(px);

// cobertura (cor da pele) para esconder o rosto original quando o humor muda
const eyePatch = node(corpo, "cobre-olhos", PIVOT_X, PIVOT_Y, { opacity: 0 });
for (const e of [EYE_L, EYE_R]) { const [x, y] = px(e); ellipse(eyePatch, "cobre-olho", x, y, 17 * S * 1.2, 17 * S * 1.2, { fill: SKIN }); }
const mouthPatch = node(corpo, "cobre-boca", PIVOT_X, PIVOT_Y, { opacity: 0 });
{ const [x, y] = px([166.5, 117]); ellipse(mouthPatch, "cobre-boca-forma", x, y, 62 * S, 42 * S, { fill: SKIN }); }

const eyesOpen = node(corpo, "olhos-abertos", PIVOT_X, PIVOT_Y, { opacity: 0 });
for (const e of [EYE_L, EYE_R]) { const [x, y] = px(e); ellipse(eyesOpen, "olho", x, y, 9.5 * S, 9.5 * S, { fill: INK }); }

const eyesClosed = node(corpo, "olhos-fechados", PIVOT_X, PIVOT_Y, { opacity: 0 });
for (const e of [EYE_L, EYE_R]) {
  const a = px([e[0] - 9, e[1]]), b = px([e[0] + 9, e[1]]), q = px([e[0], e[1] + 8]);
  pathShape(eyesClosed, "olho-fechado", [a, b], [q], false, ink(4));
}
const eyesHappy = node(corpo, "olhos-felizes", PIVOT_X, PIVOT_Y, { opacity: 0 });
for (const e of [EYE_L, EYE_R]) {
  const a = px([e[0] - 9, e[1] + 3]), b = px([e[0] + 9, e[1] + 3]), q = px([e[0], e[1] - 9]);
  pathShape(eyesHappy, "olho-feliz", [a, b], [q], false, ink(4));
}
const tear = node(corpo, "lagrima", PIVOT_X, PIVOT_Y, { opacity: 0 });
pathShape(tear, "lagrima-forma", pxs([[112, 103], [112, 117]]), pxs([[104, 113], [120, 113]]), true, { fill: argb("#7cc6ff") });

const nose = node(corpo, "nariz", PIVOT_X, PIVOT_Y, { opacity: 0 });
{ const [x, y] = px([167.5, 107.5]); ellipse(nose, "nariz-forma", x, y, 16 * S, 10 * S, { fill: INK }); }
pathShape(nose, "nariz-linha", pxs([[167.5, 111], [167.5, 119]]), [null], false, ink(4));

const smile = node(corpo, "boca-sorriso", PIVOT_X, PIVOT_Y, { opacity: 0 });
pathShape(smile, "sorriso",
  pxs([[143, 119], [152, 129.5], [166.5, 119], [177, 132.5], [187, 120]]),
  pxs([[139, 131], [160, 131], [170, 133], [188, 132]]), false, ink(4.5));
const sad = node(corpo, "boca-triste", PIVOT_X, PIVOT_Y, { opacity: 0 });
pathShape(sad, "triste", pxs([[150, 128], [184, 128]]), pxs([[167, 113]]), false, ink(4.5));
const mouthOpen = node(corpo, "boca-aberta", px([166.5, 122])[0], px([166.5, 122])[1], { opacity: 0 });
{
  const [x, y] = px([166.5, 123]);
  ellipse(mouthOpen, "boca-int", x, y, 24 * S, 22 * S, { fill: argb("#7a2e2e"), stroke: INK, sw: 3 * S });
  const [tx, ty] = px([166.5, 128]);
  ellipse(mouthOpen, "lingua", tx, ty, 13 * S, 8 * S, { fill: argb("#ff8aa0") });
}
const stink = node(corpo, "fedor", PIVOT_X, PIVOT_Y, { opacity: 0 });
const green = { stroke: argb("#8fae4a"), sw: 3 };
pathShape(stink, "fedor-e", [[18, 190], [18, 168], [18, 146]], [[8, 179], [28, 157]], false, green);
pathShape(stink, "fedor-d", [[202, 190], [202, 168], [202, 146]], [[212, 179], [192, 157]], false, green);
pathShape(stink, "fedor-c", [[110, 24], [110, 8]], [[104, 16]], false, green);

/* -------------------------------- animações -------------------------------- */
const FPS = 60;
function anim(name, dur, loop, tracks) {
  add(T.LinearAnimation, { animName: name, fps: FPS, duration: dur, loopValue: loop }, false);
  const byObj = new Map();
  for (const t of tracks) { if (!byObj.has(t.obj)) byObj.set(t.obj, []); byObj.get(t.obj).push(t); }
  for (const [obj, list] of byObj) {
    add(T.KeyedObject, { objectId: obj }, false);
    for (const t of list) {
      add(T.KeyedProperty, { propertyKey: KEY[t.prop] }, false);
      for (const [frame, value] of t.keys) add(T.KeyFrameDouble, { frame, interpType: 1, kfValue: value }, false);
    }
  }
  return animCount++;
}

const FACE = {
  ep: eyePatch, mp: mouthPatch, eo: eyesOpen, ec: eyesClosed, eh: eyesHappy,
  tr: tear, no: nose, sm: smile, sd: sad, mo: mouthOpen, st: stink
};
const faceTracks = (cfg, extra = {}) => Object.entries(FACE).map(([k, obj]) => {
  if (extra[k]) return { obj: obj.i, prop: "opacity", keys: extra[k] };
  if (k === "st" && cfg.st) return { obj: obj.i, prop: "opacity", keys: [[0, 0.4], [30, 1], [60, 0.4], [90, 1], [120, 0.4]] };
  return { obj: obj.i, prop: "opacity", keys: [[0, cfg[k] ? 1 : 0]] };
});
// humor com o rosto trocado
const FULL = (cfg) => ({ ep: 1, mp: 1, no: 1, ...cfg });

function moodAnim(name, cfg, o = {}) {
  const dur = o.dur || 120, sq = o.sq || 0.02;
  const t = [
    { obj: corpo.i, prop: "scaleY", keys: [[0, 1], [dur / 2, 1 + sq], [dur, 1]] },
    { obj: corpo.i, prop: "scaleX", keys: [[0, 1], [dur / 2, 1 - sq / 2], [dur, 1]] }
  ];
  const extra = {};
  if (o.blink) {
    // rosto original; só pisca (cobre os olhos por alguns frames)
    extra.ep = [[0, 0], [dur - 10, 0], [dur - 9, 1], [dur - 3, 1], [dur - 2, 0], [dur, 0]];
    extra.ec = [[0, 0], [dur - 10, 0], [dur - 9, 1], [dur - 3, 1], [dur - 2, 0], [dur, 0]];
  } else if (cfg.eo) {
    extra.eo = [[0, 1], [dur - 16, 1], [dur - 15, 0], [dur - 8, 0], [dur - 7, 1], [dur, 1]];
    extra.ec = [[0, 0], [dur - 16, 0], [dur - 15, 1], [dur - 8, 1], [dur - 7, 0], [dur, 0]];
  }
  return anim(name, dur, 1, [...t, ...faceTracks(cfg, extra)]);
}

const MOODS = [
  ["normal",   {}, { blink: true }],
  ["feliz",    FULL({ eh: 1, sm: 1 })],
  ["triste",   FULL({ eo: 1, sd: 1, tr: 1 })],
  ["fome",     FULL({ eo: 1, sd: 1 })],
  ["sujo",     FULL({ eo: 1, sd: 1, st: 1 })],
  ["cansado",  FULL({ ec: 1, sd: 1 })],
  ["dormindo", FULL({ ec: 1, sm: 1 }), { dur: 240, sq: 0.04 }]
];
const moodAnims = MOODS.map(([n, c, o]) => moodAnim(n, c, o || {}));

function wiggle(amp, step, count) {
  const keys = [[0, 0]];
  for (let i = 1; i <= count; i++) keys.push([i * step, (i % 2 ? -1 : 1) * amp]);
  keys.push([(count + 1) * step, 0]);
  return keys;
}
const actionAnims = [
  anim("comer", 72, 0, [
    { obj: mouthOpen.i, prop: "scaleY", keys: [[0, 0.5], [6, 1.1], [12, 0.5], [18, 1.1], [24, 0.5], [30, 1.1], [36, 0.5], [42, 1.1], [48, 0.5], [54, 1.1], [60, 0.6], [72, 0.6]] },
    { obj: corpo.i, prop: "scaleY", keys: [[0, 1], [12, 1.02], [24, 0.99], [36, 1.02], [48, 0.99], [72, 1]] },
    ...faceTracks(FULL({ eo: 1, mo: 1 }))
  ]),
  anim("banho", 100, 0, [
    { obj: raiz.i, prop: "rotation", keys: wiggle(0.08, 8, 10) },
    ...faceTracks(FULL({ eh: 1, sm: 1 }))
  ]),
  anim("carinho", 80, 0, [
    { obj: raiz.i, prop: "rotation", keys: wiggle(0.06, 10, 6) },
    { obj: corpo.i, prop: "scaleY", keys: [[0, 1], [20, 1.03], [40, 1], [60, 1.03], [80, 1]] },
    ...faceTracks(FULL({ eh: 1, sm: 1 }))
  ]),
  anim("pular", 48, 0, [
    { obj: raiz.i, prop: "y", keys: [[0, PIVOT_Y], [6, PIVOT_Y], [16, PIVOT_Y - 48], [26, PIVOT_Y - 48], [38, PIVOT_Y], [42, PIVOT_Y - 4], [48, PIVOT_Y]] },
    { obj: corpo.i, prop: "scaleY", keys: [[0, 1], [6, 0.94], [16, 1.05], [38, 1.05], [42, 0.93], [48, 1]] },
    ...faceTracks(FULL({ eh: 1, mo: 1 }))
  ])
];
const ACTIONS = ["comer", "banho", "carinho", "pular"];

/* ---------------------------- state machine -------------------------------- */
add(T.StateMachine, { animName: "Purin" }, false);
add(T.SMNumber, { inputName: "humor", inputValue: 0 }, false);          // input 0
ACTIONS.forEach((a) => add(T.SMTrigger, { inputName: a }, false));      // inputs 1..4
add(T.SMLayer, { inputName: "Principal" }, false);

const S_MOOD = 3, S_ACT = 3 + MOODS.length;
add(T.AnyState, {}, false);
add(T.EntryState, {}, false);
add(T.StateTransition, { stateToId: S_MOOD, trDuration: 0 }, false);
add(T.ExitState, {}, false);
const numCond = (value) => add(T.TransNumberCond, { inputId: 0, opValue: 0, condValue: value }, false);

MOODS.forEach((_, j) => {
  add(T.AnimationState, { animationId: moodAnims[j] }, false);
  MOODS.forEach((__, k) => {
    if (k === j) return;
    add(T.StateTransition, { stateToId: S_MOOD + k, trDuration: 250 }, false);
    numCond(k);
  });
  ACTIONS.forEach((_a, a) => {
    add(T.StateTransition, { stateToId: S_ACT + a, trDuration: 120 }, false);
    add(T.TransTriggerCond, { inputId: 1 + a }, false);
  });
});
ACTIONS.forEach((_, a) => {
  add(T.AnimationState, { animationId: actionAnims[a] }, false);
  MOODS.forEach((__, k) => {
    // volta ao humor atual quando a animação termina
    add(T.StateTransition, { stateToId: S_MOOD + k, trDuration: 150, flags: 4 | 8, exitTime: 100 }, false);
    numCond(k);
  });
});

/* ------------- reordena: no Rive o 1º filho é desenhado POR CIMA ----------- */
const children = comps.map(() => []);
comps.forEach((o, i) => { if (i > 0) children[o.props.parentId].push(i); });
const order = [];
(function walk(i) {
  order.push(i);
  const kids = children[i].slice();
  const t = comps[i].type;
  if (t === T.Artboard || t === T.Node) kids.reverse(); // só reordena quem desenha (nós/artboard)
  kids.forEach(walk);
})(0);
const remap = new Map(order.map((old, nu) => [old, nu]));
const orderedComps = order.map((old) => {
  const o = comps[old];
  if (o.props.parentId !== undefined) o.props.parentId = remap.get(o.props.parentId);
  return o;
});
for (const o of rest) if (o.type === T.KeyedObject) o.props.objectId = remap.get(o.props.objectId);

const stream = [...pre, ...orderedComps, ...rest];

/* ------------------------------ serialização ------------------------------- */
const FIELD = { u: 0, b: 0, s: 1, B: 1, f: 2, c: 3 };
const used = new Map();
for (const o of stream) for (const k of Object.keys(o.props)) {
  if (!PK[k]) throw new Error("propriedade desconhecida: " + k);
  used.set(PK[k][0], PK[k][1]);
}

const w = new Writer();
"RIVE".split("").forEach((c) => w.u8(c.charCodeAt(0)));
w.varu(7); w.varu(0); w.varu(0);
const keys = [...used.keys()].sort((a, b) => a - b);
keys.forEach((k) => w.varu(k));
w.varu(0);
for (let i = 0; i < keys.length; i += 4) {      // 4 tipos de campo (2 bits cada) por palavra de 32 bits
  let word = 0;
  for (let j = 0; j < 4 && i + j < keys.length; j++) word |= FIELD[used.get(keys[i + j])] << (2 * j);
  w.u32(word);
}
for (const o of stream) {
  w.varu(o.type);
  for (const [name, val] of Object.entries(o.props)) {
    const [key, kind] = PK[name];
    w.varu(key);
    if (kind === "u") w.varu(val);
    else if (kind === "f") w.f32(val);
    else if (kind === "s") w.str(val);
    else if (kind === "c") w.u32(val);
    else if (kind === "b") w.u8(val ? 1 : 0);
    else if (kind === "B") w.bytes(val);
  }
  w.varu(0);
}

const out = path.join(__dirname, "..", "public", "assets", "purin.riv");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(w.b));
console.log("gerado:", out, w.b.length, "bytes |", comps.length, "componentes |", animCount, "animações");
