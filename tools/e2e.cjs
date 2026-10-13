// Teste de fumaça: abre o site exportado (pasta out/) no Edge headless e tira prints.
// Uso: npm run build && node tools/e2e.cjs
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const OUT = path.join(__dirname, "..", "out");
const SHOTS = path.join(__dirname, "work");
fs.mkdirSync(SHOTS, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".riv": "application/octet-stream", ".wasm": "application/wasm" };

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
  const edge = spawn(EDGE, ["--headless=new", "--remote-debugging-port=9333", "--user-data-dir=" + path.join(SHOTS, "profile"), "--window-size=480,900", "about:blank"], { stdio: "ignore" });
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
  console.log("saved", await ev("localStorage.getItem('purin-emilly-v1')"));
  console.log("LOGS", logs.length ? logs.join("\n") : "(nenhum erro)");

  ws.close(); edge.kill(); server.close(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
