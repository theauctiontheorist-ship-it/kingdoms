// Beginner helpers: step-by-step tips, idle-villager auto-work, and automatic
// graphics quality so the game stays smooth on phones.
import { unitDef, type GatherKind } from '../data/defs';
import type { Game } from '../sim/game';
import type { Building, Unit } from '../sim/types';
import type { App } from './app';

// ------------------------------------------------------------------ tutorial

interface Step {
  id: string;
  text: string;
  /** Returns true once the player has done this step. */
  done: (g: Game, app: App) => boolean;
}

const mine = (g: Game) => g.human;
const myBuildings = (g: Game, t: Building['t'], doneOnly = false) => {
  let n = 0;
  for (const b of g.buildings.values()) if (b.o === mine(g) && b.t === t && (!doneOnly || b.done)) n++;
  return n;
};
const myUnits = (g: Game, fn: (u: Unit) => boolean) => {
  let n = 0;
  for (const u of g.units.values()) if (u.o === mine(g) && u.dead === undefined && fn(u)) n++;
  return n;
};
const isVillager = (u: Unit) => unitDef(u.t).cls.includes('villager');
const isSoldier = (u: Unit) => {
  const d = unitDef(u.t);
  return !d.cls.includes('villager') && !d.cls.includes('animal') && u.t !== 'fishing_ship' && u.t !== 'trade_cog' && u.t !== 'scout_cavalry';
};

const STEPS: Step[] = [
  { id: 'tc', text: '👋 Welcome! <b>Tap your Town Center</b> (the big building) to see what it can do.',
    done: (g, app) => [...app.view.selection].some((id) => g.buildings.get(id)?.t === 'town_center') || g.time > 40 },
  { id: 'house', text: '🏠 Each House holds 5 people. Tap a villager → <b>Build</b> → <b>House</b>, then tap the ground. (Auto-houses also builds them for you.)',
    done: (g) => myBuildings(g, 'house', true) >= 1 },
  { id: 'vil', text: '👷 <b>Train villagers</b> — they gather everything. <b>Auto</b> is on, so your Town Center keeps making them.',
    done: (g) => myUnits(g, isVillager) >= 8 },
  { id: 'wood', text: '🌲 Tap a villager, then <b>tap a tree</b> to chop wood. A <b>Lumber Camp</b> near trees saves walking.',
    done: (g) => myBuildings(g, 'lumber_camp') >= 1 || g.players[mine(g)].stats.gathered.wood >= 400 },
  { id: 'houses2', text: '🏘️ Keep building Houses before you run out of room (watch the 👥 counter at the top).',
    done: (g) => g.players[mine(g)].popCap >= 15 },
  { id: 'barracks', text: '⚔️ Build a <b>Barracks</b> so you can train soldiers.',
    done: (g) => myBuildings(g, 'barracks') >= 1 },
  { id: 'age', text: '⏫ Advance to the <b>Feudal Age</b> at the Town Center (needs 500 food and 2 buildings).',
    done: (g) => g.players[mine(g)].age >= 2 },
  { id: 'army', text: '🛡️ Train at least 5 soldiers. The <b>crossed-swords</b> button selects your whole army.',
    done: (g) => myUnits(g, isSoldier) >= 5 },
  { id: 'attack', text: '🎯 With your army selected, <b>tap an enemy building</b> to attack. Destroy them all to win!',
    done: (g) => g.players[mine(g)].stats.razed >= 1 || g.players[mine(g)].stats.kills >= 5 },
];

export class Tutorial {
  private app: App;
  private el: HTMLDivElement;
  private idx = 0;
  private t = 0;
  private houseWarnT = -999;
  private lastHtml = '';
  private doneShownT = 0;

  constructor(app: App) {
    this.app = app;
    this.el = document.createElement('div');
    this.el.id = 'hint';
    this.el.className = 'hidden';
    this.el.setAttribute('role', 'status');
    document.body.appendChild(this.el);
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = (e.target as HTMLElement).closest<HTMLElement>('[data-hint]')?.dataset.hint;
      if (act === 'skip') this.next();
      if (act === 'off') { app.prefs.tutorial = false; app.savePrefs(); this.hide(); app.hud.toast('Tips turned off (Settings → Beginner tips).', undefined, 2500); }
    });
  }

  /** Called at the start of every new or loaded game. */
  reset(fresh: boolean) {
    this.idx = fresh ? 0 : STEPS.length;
    this.t = 0;
    this.houseWarnT = -999;
    this.doneShownT = 0;
    this.lastHtml = '';
    this.hide();
  }

  hide() { this.el.className = 'hidden'; this.lastHtml = ''; document.body.classList.remove('has-hint'); }

  private next() {
    this.idx++;
    this.lastHtml = '';
  }

  update(dt: number) {
    const app = this.app, g = app.game;
    if (!g || g.over || app.paused) { if (g?.over) this.hide(); return; }
    this.t += dt;
    if (this.t < 0.5) return;
    this.t = 0;
    const p = g.players[g.human];

    // Context warning (shown even after the tutorial ends): housed.
    const housed = p.pop >= p.popCap && p.popCap < g.settings.popCap;
    const building = [...g.buildings.values()].some((b) => b.o === g.human && b.t === 'house' && !b.done);
    if (housed && !building && g.time - this.houseWarnT > 40 && app.prefs.tutorial) {
      this.houseWarnT = g.time;
      app.hud.toast('🏠 Population full! Build a House so you can train more.', 'bad', 4000, () => app.selectIdleVillager());
    }

    if (!app.prefs.tutorial) { this.hide(); return; }
    // Skip already-completed steps (e.g. later starting age, loaded games).
    while (this.idx < STEPS.length && STEPS[this.idx].done(g, app)) {
      this.idx++;
      if (this.idx > 1) app.hud.toast('✔ Nice!', 'good', 1200);
    }
    if (this.idx >= STEPS.length) {
      if (!this.doneShownT) {
        this.doneShownT = g.time;
        this.show('🏆 You know the basics. Good luck, commander!', true);
      } else if (g.time - this.doneShownT > 12) this.hide();
      return;
    }
    this.show(STEPS[this.idx].text, false);
  }

  private show(text: string, final: boolean) {
    const n = Math.min(this.idx + 1, STEPS.length);
    const html = `<div class="hint-step">${final ? 'Tips' : `Tip ${n}/${STEPS.length}`}</div><div class="hint-text">${text}</div>`
      + `<div class="hint-btns">${final ? '' : '<button data-hint="skip">Next ›</button>'}<button data-hint="off" aria-label="Turn off tips">Hide tips</button></div>`;
    if (html !== this.lastHtml) { this.el.innerHTML = html; this.lastHtml = html; }
    this.el.className = '';
    document.body.classList.add('has-hint');
    document.body.style.setProperty('--hint-h', `${this.el.offsetHeight}px`);
  }
}

// ------------------------------------------------------------------ auto-work

/** Rough target share of workers on each resource, by age. */
function wantedShare(age: number): Record<'food' | 'wood' | 'gold', number> {
  if (age <= 1) return { food: 0.6, wood: 0.4, gold: 0 };
  if (age === 2) return { food: 0.5, wood: 0.35, gold: 0.15 };
  return { food: 0.45, wood: 0.3, gold: 0.25 };
}

const WILD_FOOD: GatherKind[] = ['sheep', 'forage', 'hunt'];
const KIND_RES: Partial<Record<string, 'food' | 'wood' | 'gold'>> = { sheep: 'food', forage: 'food', farm: 'food', hunt: 'food', fish: 'food', wood: 'wood', gold: 'gold' };


/** Find a free spot for building `t` around (cx, cy), optionally keeping a walkway around it. */
function spotNear(g: Game, o: number, t: Building['t'], size: number, cx: number, cy: number, rMin: number, rMax: number, gap: number, facing = 0): [number, number] | null {
  const S = g.grid.size;
  const free = (x: number, y: number) => {
    for (let yy = y - gap; yy < y + size + gap; yy++) for (let xx = x - gap; xx < x + size + gap; xx++) {
      if (xx < 0 || yy < 0 || xx >= S || yy >= S || g.grid.occ[yy * S + xx]) return false;
    }
    return g.canPlace(o, t, x, y);
  };
  for (let r = rMin; r <= rMax; r++) {
    for (let k = 0; k < 24; k++) {
      const a = facing + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 12);
      const x = Math.round(cx + Math.cos(a) * r - size / 2), y = Math.round(cy + Math.sin(a) * r - size / 2);
      if (free(x, y)) return [x, y];
    }
  }
  return null;
}

/** No natural food nearby: start a Mill (once) or a Farm next to the Town Center. */
function buildFood(app: App, u: Unit): boolean {
  const g = app.game!;
  const o = g.human, p = g.players[o];
  const tc = [...g.buildings.values()].find((b) => b.o === o && b.t === 'town_center' && b.done);
  if (!tc) return false;
  const [cx, cy] = g.bcenter(tc);
  let mill = false;
  for (const b of g.buildings.values()) {
    if (b.o !== o) continue;
    if (b.t === 'mill') mill = true;
    if (b.t === 'farm' && !b.done) return false; // one new farm at a time
  }
  const facing = Math.atan2(u.y - cy, u.x - cx);
  if (!mill) {
    if (p.res.wood < 100) return false;
    const at = spotNear(g, o, 'mill', 2, cx, cy, 6, 10, 1, facing);
    return !!(at && g.cmdBuild(o, [u.id], 'mill', at[0], at[1]));
  }
  if (p.res.wood < 60) return false;
  const at = spotNear(g, o, 'farm', 3, cx, cy, 4, 9, 0, facing);
  return !!(at && g.cmdBuild(o, [u.id], 'farm', at[0], at[1]));
}

/**
 * Send idle villagers back to work on whatever resource is most under-staffed.
 * `force` = button press: every idle villager, including selected ones.
 * Returns the number of villagers sent.
 */
export function autoWork(app: App, force: boolean): number {
  const g = app.game;
  if (!g) return 0;
  const o = g.human;
  const p = g.players[o];
  const counts = { food: 0, wood: 0, gold: 0 };
  const idle: Unit[] = [];
  for (const u of g.units.values()) {
    if (u.o !== o || u.dead !== undefined || !isVillager(u) || u.inside) continue;
    if (!u.task && !u.q.length) {
      if (force || (u.idleT > 4 && !app.view.selection.has(u.id))) idle.push(u);
      continue;
    }
    const r = u.task?.k === 'gather' && u.gk ? KIND_RES[u.gk] : undefined;
    if (r) counts[r]++;
  }
  if (!idle.length) return 0;
  const share = wantedShare(p.age);
  // Lean towards whatever we're short of: a big stockpile of one resource shifts workers away.
  const stock = { food: p.res.food, wood: p.res.wood, gold: p.res.gold };
  const avg = (stock.food + stock.wood + (share.gold ? stock.gold : 0)) / (share.gold ? 3 : 2);
  for (const r of ['food', 'wood', 'gold'] as const) if (share[r]) share[r] *= 1 + Math.max(0, (avg - stock[r]) / 400);
  const sum = share.food + share.wood + share.gold;
  for (const r of ['food', 'wood', 'gold'] as const) share[r] /= sum;
  const woodRich = p.res.wood > 400;
  let sent = 0;
  for (const u of idle) {
    const total = counts.food + counts.wood + counts.gold + 1;
    const order = (['food', 'wood', 'gold'] as const)
      .filter((r) => share[r] > 0)
      .sort((a, b) => counts[a] / total - share[a] - (counts[b] / total - share[b]));
    let target: { id: number } | null = null, res: 'food' | 'wood' | 'gold' | null = null;
    const wild = (maxD: number) => {
      for (const k of WILD_FOOD) { const t = g.findResource(o, k, u.x, u.y, maxD); if (t) return t; }
      return null;
    };
    for (const r of order) {
      if (r === 'food') {
        // 1) wild food close by  2) with spare wood, farms beat a long walk  3) wild food further out
        target = wild(10) ?? g.findResource(o, 'farm', u.x, u.y, 40);
        if (!target && woodRich && buildFood(app, u)) { res = r; break; }
        target ??= wild(18);
        if (target) { res = r; break; }
        if (buildFood(app, u)) { res = r; break; }
        continue;
      }
      target = g.findResource(o, r, u.x, u.y, 28);
      if (target) { res = r; break; }
    }
    if (res && !target) { counts[res]++; sent++; u.idleT = 0; continue; } // started a mill/farm
    if (!target || !res) continue;
    if (g.cmdTarget(o, [u.id], target.id)) { counts[res]++; sent++; u.idleT = 0; }
  }
  return sent;
}

// ------------------------------------------------------------------ auto houses

let houseToasts = 0;

/**
 * When population is (nearly) full, have one nearby villager build a House next to the
 * Town Center. Returns true if a house was started.
 */
export function autoHouse(app: App): boolean {
  const g = app.game;
  if (!g) return false;
  const o = g.human, p = g.players[o];
  if (p.popCap >= g.settings.popCap) return false;
  if (p.popCap - p.pop > 2) return false;
  for (const b of g.buildings.values()) if (b.o === o && b.t === 'house' && !b.done) return false; // one at a time
  if (g.buildBlock(o, 'house')) return false;
  const tcs = [...g.buildings.values()].filter((b) => b.o === o && b.t === 'town_center' && b.done);
  if (!tcs.length) return false;
  const tc = tcs[0];
  const [cx, cy] = g.bcenter(tc);
  // the villager nearest the TC that isn't fighting or building
  let best: Unit | null = null, bd = 30;
  for (const u of g.units.values()) {
    if (u.o !== o || u.dead !== undefined || u.inside || !isVillager(u)) continue;
    if (u.task && u.task.k !== 'gather') continue;
    if (app.view.selection.has(u.id)) continue;
    const d = Math.hypot(u.x - cx, u.y - cy);
    if (d < bd) { bd = d; best = u; }
  }
  if (!best) return false;
  const facing = Math.atan2(best.y - cy, best.x - cx) + Math.PI; // build on the side away from the worker's job
  const at = spotNear(g, o, 'house', 2, cx, cy, 6, 13, 1, facing);
  if (at && g.cmdBuild(o, [best.id], 'house', at[0], at[1])) {
    if (houseToasts++ < 3) app.hud.toast('🏠 A villager is building a House for more room.', undefined, 2500);
    return true;
  }
  return false;
}

// ------------------------------------------------------------------ auto quality

/** Watches the frame rate and steps graphics down (once per level) when it stays low. */
export class AutoQuality {
  private since = 0;
  private frames = 0;
  private last = 0;
  private slow = 0;
  private grace = 0;

  reset() { this.since = 0; this.frames = 0; this.last = 0; this.slow = 0; this.grace = 6000; }

  sample(app: App, now: number) {
    const r = app.renderer;
    if (!r || !app.prefs.autoQuality || app.paused || document.hidden) { this.since = 0; this.last = 0; return; }
    if (this.last && now - this.last > 500) { this.since = 0; } // tab switch / hitch: restart window
    this.last = now;
    if (!this.since) { this.since = now; this.frames = 0; return; }
    this.frames++;
    const span = now - this.since;
    if (span < 3000) return;
    const fps = (this.frames * 1000) / span;
    this.since = now; this.frames = 0;
    if (this.grace > 0) { this.grace -= span; return; } // ignore warm-up (shader compiles)
    this.slow = fps < 28 ? this.slow + 1 : 0;
    if (this.slow < 2) return;
    this.slow = 0;
    const pr = app.prefs;
    let msg = '';
    if (pr.realism) { pr.realism = false; pr.haze = false; r.setRealism(false); r.setHaze(false); msg = 'Switched to light graphics for smoother play.'; }
    else if (pr.fullRes) { pr.fullRes = false; r.setFullRes(false); msg = 'Lowered resolution for smoother play.'; }
    else if (pr.quality === 'high') { pr.quality = 'medium'; r.setQuality('medium'); msg = 'Graphics set to Medium for smoother play.'; }
    else if (pr.quality === 'medium') { pr.quality = 'low'; r.setQuality('low'); msg = 'Graphics set to Low for smoother play.'; }
    else return;
    this.grace = 4000;
    app.savePrefs();
    app.hud.toast(`⚡ ${msg}`, undefined, 3000);
  }
}
