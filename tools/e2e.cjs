// Teste de fumaça: abre o site exportado (pasta out/) no Edge headless e tira prints.
// Uso: npm run build && node tools/e2e.cjs
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const OUT = path.join(__dirname, "..", "out");
const SHOTS = path.join(__dirname, "work");
fs.mkdirSync(SHOTS, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".riv": "application/octet-stream", ".wasm": "application/wasm" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(OUT, p);
  if (!f.startsWith(OUT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

const EDGE = ["C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"].find(fs.existsSync);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(8123, r));
  const edge = spawn(EDGE, ["--headless=new", "--remote-debugging-port=9333", "--user-data-dir=" + path.join(require("os").tmpdir(), "purin-e2e-" + Date.now()), "--window-size=480,900", "about:blank"], { stdio: "ignore" });
  let targets;
  for (let i = 0; i < 40; i++) { try { targets = await (await fetch("http://127.0.0.1:9333/json")).json(); break; } catch { await sleep(250); } }
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map(); const logs = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); }
    if (d.method === "Runtime.exceptionThrown") logs.push("EXC " + d.params.exceptionDetails.exception?.description);
    if (d.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(d.params.type)) logs.push(d.params.type + " " + d.params.args.map((a) => a.value ?? a.description).join(" "));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.value;
  const shot = async (name) => { const r = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(SHOTS, name + ".png"), Buffer.from(r.data, "base64")); console.log("shot", name); };
  const click = (sel) => ev(`(() => { const e = [...document.querySelectorAll(${JSON.stringify(sel)})][0]; if (!e) return false; e.click(); return true; })()`);
  const clickText = (sel, text) => ev(`(() => { const e = [...document.querySelectorAll(${JSON.stringify(sel)})].find(b => b.textContent.includes(${JSON.stringify(text)})); if (!e) return false; e.click(); return true; })()`);

  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 420, height: 860, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: "http://127.0.0.1:8123/" });
  await sleep(2500);
  await shot("1-welcome");
  console.log("start", await click(".welcome .btn"));
  await sleep(2500);
  await shot("2-room");
  console.log("canvas", await ev("!!document.querySelector('.purin__rive canvas')"), "fallback", await ev("!!document.querySelector('.purin__fallback')"));
  console.log("pet", await click(".purin")); await sleep(600); await shot("3-pet");
  console.log("food", await clickText(".action", "Comer")); await sleep(500); await shot("4-food");
  console.log("pudim", await clickText(".food", "Pudim")); await sleep(1800); await shot("5-eat");
  console.log("bath", await clickText(".action", "Banho")); await sleep(2800); await shot("6-bath");
  console.log("play", await clickText(".action", "Brincar")); await sleep(400);
  console.log("go", await clickText(".mg .btn", "Começar")); await sleep(3500); await shot("7-minigame");
  await ev("document.querySelector('.modal .icon-btn').click()"); await sleep(300);
  console.log("letter", await click(".hud .icon-btn")); await sleep(500); await shot("8-letter");
  await ev("document.querySelector('.modal .icon-btn').click()"); await sleep(300);
  console.log("sleep", await clickText(".action", "Dormir")); await sleep(1200); await shot("9-sleep");
  // loja + fotos (dá moedas, acorda o Purin e recarrega)
  await ev(`(() => { const s = JSON.parse(localStorage.getItem('purin-emilly-v1')); s.moedas = 300; s.dormindo = false; s.energia = 80; localStorage.setItem('purin-emilly-v1', JSON.stringify(s)); })()`);
  await send("Page.navigate", { url: "http://127.0.0.1:8123/" }); await sleep(2500);
  console.log("shop", await clickText(".action", "Loja")); await sleep(400); await shot("10-shop");
  for (const n of ["Coroinha", "Óculos escuros", "Esmeralda"]) console.log("buy", n, await clickText(".card", n));
  await sleep(300);
  console.log("tab", await clickText(".tab", "Quarto"));
  for (const n of ["Rosinha", "Ursinho"]) console.log("buy", n, await clickText(".card", n));
  await sleep(300); await shot("11-shop-quarto"); await ev("document.querySelector('.modal').scrollTop = 99999"); await sleep(300); await shot("11b-shop-quarto-fim");
  await ev("document.querySelector('.modal .icon-btn').click()"); await sleep(2500); await shot("12-dressed");
  // com a florzinha na cabeça (bug relatado)
  await ev(`(() => { const s = JSON.parse(localStorage.getItem('purin-emilly-v1')); s.itens.push('flor'); s.equipado.cabeca = 'flor'; s.dormindo = false; s.energia = 80; localStorage.setItem('purin-emilly-v1', JSON.stringify(s)); })()`);
  await send("Page.navigate", { url: "http://127.0.0.1:8123/" }); await sleep(2500);
  console.log("flor", await ev("document.querySelector('.gear__item--cabeca')?.textContent"));
  console.log("vape", await clickText(".action", "Vape"));
  await sleep(300); console.log("vape-dom", await ev("!!document.querySelector('.vape')"), await ev("document.querySelector('.bubble')?.textContent")); await sleep(1200);
  console.log("vape-img", await ev("(() => { const i = document.querySelector('.vape__device img'); const r = i.getBoundingClientRect(); return [i.complete, i.naturalWidth, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), getComputedStyle(i.parentElement).opacity].join(' '); })()"));
  await sleep(500); await shot("14-vape-drag");
  await sleep(1500); await shot("15-vape-smoke"); await sleep(3000);
  console.log("vape-gone", await ev("!document.querySelector('.vape')"));
  await sleep(1500); // fim da trava
  console.log("vape-2x", await clickText(".action", "Vape")); await sleep(400);
  console.log("vape-2x-dom", await ev("!!document.querySelector('.vape')")); await sleep(6300);
  console.log("frame", await click(".frame")); await sleep(500); await shot("13-gallery");
  // upload de foto: usa um print anterior como arquivo de teste
  const doc = await send("DOM.getDocument");
  const inp = await send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: ".gallery__actions input[type=file]" });
  await send("DOM.setFileInputFiles", { nodeId: inp.nodeId, files: [path.join(SHOTS, "2-room.png"), path.join(SHOTS, "6-bath.png")] });
  await sleep(2500); await shot("16-uploaded");
  console.log("count", await ev("document.querySelector('.gallery__nav span')?.textContent"));
  console.log("idb", await ev("new Promise(r => { const q = indexedDB.open('purin-emilly'); q.onsuccess = () => { const g = q.result.transaction('photos').objectStore('photos').count(); g.onsuccess = () => r(g.result); }; })"));
  await send("Page.navigate", { url: "http://127.0.0.1:8123/" }); await sleep(2500);
  console.log("persisted frame img", await ev("!!document.querySelector('.frame img')"));
  await click(".frame"); await sleep(600);
  console.log("persisted count", await ev("document.querySelector('.gallery__nav span')?.textContent"));
  await shot("17-reloaded-gallery");
  console.log("svg", await ev("fetch('/photos/exemplo.svg').then(async r => r.status + ' ' + r.headers.get('content-type') + ' ' + (await r.text()).slice(0, 120))"));
  console.log("img", await ev("(() => { const i = document.querySelector('.gallery__img'); return i.src + ' ' + i.complete + ' ' + i.naturalWidth; })()"));
  await ev("document.querySelector('.modal .icon-btn').click()");
  console.log("saved", await ev("localStorage.getItem('purin-emilly-v1')"));
  console.log("LOGS", logs.length ? logs.join("\n") : "(nenhum erro)");

  ws.close(); edge.kill(); server.close(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
