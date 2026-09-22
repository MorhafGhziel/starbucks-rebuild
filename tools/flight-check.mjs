// Samples the planned flight densely at several viewports and reports every
// progress value where the cup's projected bounds touch protected content,
// the header band or the viewport edge. Needs ?flight-debug (exposes the plan).
// node tools/flight-check.mjs [base]
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:3970';
const VIEWS = [[2560, 1440], [1920, 1080], [1536, 864], [1440, 900], [1366, 768], [1280, 720], [1180, 820], [1024, 768], [820, 1180], [768, 1024], [412, 915], [390, 844], [375, 667], [360, 640]];

const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
let total = 0;
for (const [w, h] of VIEWS) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(BASE + '/?flight-debug', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__flight?.plan, null, { timeout: 30000 });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const plan = window.__flight.plan;
    const bad = [];
    const hard = [];
    let minA = 9, maxA = 0;
    for (let i = 0; i <= 500; i++) {
      const s = plan.sample(i / 500);
      minA = Math.min(minA, s.A); maxA = Math.max(maxA, s.A);
      if (s.hits.length) bad.push(`${s.p.toFixed(3)}:${s.hits.join('+')}`);
      if (plan.sample(i / 500, 0).hits.length) hard.push(i / 500);
    }
    return { bad, hard: hard.length, s1: Math.round(plan.L.s1), pT: plan.pT.toFixed(2), pC: plan.pC.toFixed(2), corridor: Math.round(plan.L.corridor.x1 - plan.L.corridor.x0), minA: minA.toFixed(2), maxA: maxA.toFixed(2) };
  });
  total += r.bad.length;
  console.log(`${w}x${h}  s1=${r.s1} pT=${r.pT} pC=${r.pC} corridor=${r.corridor}px size ${r.minA}-${r.maxA}x  inside-clearance=${r.bad.length} actual-overlap=${r.hard}`);
  if (r.bad.length) console.log('   ', summarize(r.bad));
  await p.close();
}
console.log(total ? `\n${total} colliding samples` : '\nno collisions');
await b.close();

function summarize(list) {
  // collapse consecutive samples into ranges
  const out = [];
  let start = null, prev = null, label = '';
  for (const it of list) {
    const [pp, l] = it.split(':');
    const v = +pp;
    if (start !== null && l === label && v - prev < 0.0041) { prev = v; continue; }
    if (start !== null) out.push(`${start.toFixed(3)}-${prev.toFixed(3)} ${label}`);
    start = v; prev = v; label = l;
  }
  if (start !== null) out.push(`${start.toFixed(3)}-${prev.toFixed(3)} ${label}`);
  return out.join(' | ');
}
