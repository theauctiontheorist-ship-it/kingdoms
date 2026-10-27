import {
  AGE_NAMES, BUILDINGS, CIVS, TECH_BY_ID, buildingDef, unitDef,
  type BuildingKey, type Cost, type UnitKey,
} from '../data/defs';
import { Game, TICK, type Entity, type SaveData } from '../sim/game';
import { buildingStats, canAfford, missing, techCost, unitStats } from '../sim/stats';
import type { Building, GameEvent, Settings, Unit } from '../sim/types';
import { Renderer, type Quality, type ViewState } from '../render/renderer';
import { initAudio, music, play } from '../audio/sfx';
import { ICON, BUILDING_ROLE, techIcon } from './icons';
import { Hud } from './hud';
import { Input } from './input';
import { Menus } from './menus';
import { AutoQuality, Tutorial, autoHouse, autoWork } from './assist';

export interface Cmd {
  key: string;
  icon: string;
  name: string;
  desc?: string;
  cost?: Cost;
  disabled?: string | null;
  poor?: boolean;
  count?: number;
  progress?: number;
  on?: boolean;
  tag?: string;
  age?: boolean;
  act: (shift?: boolean) => void;
  long?: () => void;
}

export type Mode =
  | { k: 'normal' }
  | { k: 'place'; type: BuildingKey; x: number; y: number; set: boolean }
  | { k: 'wall'; type: BuildingKey; sx?: number; sy?: number; ex?: number; ey?: number }
  | { k: 'target'; action: 'attackmove' | 'patrol' | 'garrison' | 'unload' | 'rally' | 'attackground' | 'repair'; label: string };

export interface Prefs {
  quality: Quality;
  realism: boolean;
  haze: boolean;
  perspective: boolean;
  /** On-screen FPS / performance overlay. */
  showFps: boolean;
  /** High quality only: render at the screen's full pixel density (up to 3×) instead of 2×. */
  fullRes: boolean;
  sfx: number;
  music: number;
  /** Include the extra (CC0 medieval) music tracks. */
  extraMusic: boolean;
  muted: boolean;
  speed: number;
  showHotkeys: boolean;
  edgeScroll: boolean;
  /** What a one-finger drag does on touch screens (two fingers always pan/zoom). */
  oneFinger: 'pan' | 'select';
  twistRotate: boolean;
  /** Show the step-by-step beginner tips banner. */
  tutorial: boolean;
  /** Idle villagers automatically go back to work after a few seconds. */
  autoWork: boolean;
  /** A villager builds a House automatically when population is nearly full. */
  autoHouse: boolean;
  /** Town Centers start with auto-train villagers switched on. */
  autoTrain: boolean;
  /** Lower graphics quality automatically when the frame rate drops. */
  autoQuality: boolean;
  /** Prefs schema version (used to migrate older saved preferences). */
  pv?: number;
}

const PREFS_KEY = 'aoak-prefs';
const PREFS_VERSION = 2;
export const SAVE_KEYS = ['aoak-save-auto', 'aoak-save-1', 'aoak-save-2', 'aoak-save-3'];

export class App {
  canvas: HTMLCanvasElement;
  game: Game | null = null;
  renderer: Renderer | null = null;
  hud: Hud;
  input: Input;
  menus: Menus;
  view: ViewState = { selection: new Set(), hover: 0, ghost: null, markers: [], flashIds: new Map() };
  mode: Mode = { k: 'normal' };
  menuPath: 'root' | 'eco' | 'mil' = 'root';
  paused = false;
  prefs: Prefs;
  groups = new Map<number, number[]>();
  lastAlert: { x: number; y: number; t: number } | null = null;
  boxMode = false;
  /** Whether the most recent pointer input was a touch (drives touch-specific UI). */
  touchInput = isTouch();
  private acc = 0;
  private lastT = 0;
  private autosaveT = 0;
  private running = false;
  private overShown = false;
  private battleT = 0;
  private startToken = 0;
  private graphicsStats = import.meta.env.DEV && new URLSearchParams(location.search).has('graphicsStats');
  private measuredFrames = 0;
  private measuredRenderMs = 0;
  private measuredSince = 0;
  idleCycle = 0;
  tutorial!: Tutorial;
  autoQuality = new AutoQuality();
  private autoWorkT = 0;

  constructor() {
    this.canvas = document.getElementById('game') as HTMLCanvasElement;
    // Phones default to the light "classic" art: it starts in a few seconds instead of
    // downloading ~25 MB of photographic textures, and runs far smoother.
    const touch = isTouch();
    this.prefs = {
      quality: defaultQuality(), realism: !touch, haze: !touch, perspective: true, showFps: false, fullRes: false, sfx: 0.7, music: 0.35, extraMusic: true, muted: false,
      speed: 1.7, showHotkeys: !touch, edgeScroll: false, oneFinger: 'pan', twistRotate: true,
      tutorial: true, autoWork: true, autoHouse: true, autoTrain: true, autoQuality: true, pv: PREFS_VERSION,
    };
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as Partial<Prefs>;
      // Older preferences predate the mobile performance defaults: reset graphics once.
      if ((saved.pv ?? 0) < PREFS_VERSION) { delete saved.realism; delete saved.haze; delete saved.quality; saved.pv = PREFS_VERSION; }
      Object.assign(this.prefs, saved);
    } catch { /* ignore */ }
    this.hud = new Hud(this);
    this.input = new Input(this);
    this.menus = new Menus(this);
    this.tutorial = new Tutorial(this);
    window.addEventListener('resize', () => this.renderer?.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.game && !this.game.over) this.saveTo(SAVE_KEYS[0]);
    });
    const unlock = () => { initAudio(); music.resume(); };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs)); } catch { /* ignore */ }
  }

  // ------------------------------------------------------------------ lifecycle

  start(settings: Settings, save?: SaveData) {
    this.stop();
    const token = ++this.startToken;
    const loading = document.getElementById('loading')!;
    loading.classList.remove('hidden');
    // yield a frame so the loading screen shows
    setTimeout(async () => {
      try {
        if (token !== this.startToken) return;
        this.game = new Game(settings, save);
        this.view = { selection: new Set(), hover: 0, ghost: null, markers: [], flashIds: new Map() };
        this.renderer = new Renderer(this.canvas, this.game, this.view, this.prefs.quality, this.prefs.realism, this.prefs.haze, this.prefs.perspective);
        this.renderer.setFullRes(this.prefs.fullRes);
        await this.renderer.ready;
        if (token !== this.startToken) return;
        this.mode = { k: 'normal' };
        this.menuPath = 'root';
        this.groups.clear();
        this.overShown = false;
        this.paused = false;
        this.hud.show(true);
        this.hud.reset();
        this.menus.hideAll();
        this.running = true;
        this.lastT = performance.now();
        this.measuredSince = 0; this.measuredFrames = 0; this.measuredRenderMs = 0;
        music.play('game');
        // pre-warm icons
        this.hud.prewarm();
        this.startLoop();
        this.tutorial.reset(!save);
        this.autoQuality.reset();
        this.autoWorkT = 0;
        if (!save && this.prefs.autoTrain) {
          for (const b of this.game.buildings.values()) if (b.o === this.game.human && b.t === 'town_center') this.game.cmdAutoVillagers(b.o, b.id, true);
        }
        if (!save) this.hud.toast(`You are the ${CIVS[this.game.players[this.game.human].civ].name}. Build your economy and conquer your enemies!`, 'gold', 6000);
      } catch (e) {
        if (token !== this.startToken) return;
        console.error(e);
        this.stop();
        alert('Failed to start the game: ' + (e as Error).message);
        this.menus.showMain();
      } finally {
        if (token === this.startToken) loading.classList.add('hidden');
      }
    }, 30);
  }

  stop() {
    this.startToken++;
    document.getElementById('loading')?.classList.add('hidden');
    this.running = false;
    this.loopToken++;
    this.renderer?.dispose();
    this.renderer = null;
    this.game = null;
    this.hud.show(false);
    this.tutorial?.hide();
  }

  quitToMenu() {
    if (this.game && !this.game.over) this.saveTo(SAVE_KEYS[0]);
    this.stop();
    this.menus.showMain();
    music.play('menu');
  }

  private loopToken = 0;

  /** Exactly one animation loop runs at a time (a new start() retires the old loop). */
  private startLoop() {
    const tok = ++this.loopToken;
    const loop = (now: number) => {
      if (tok !== this.loopToken || !this.running) return;
      requestAnimationFrame(loop);
      this.frame(now);
    };
    requestAnimationFrame(loop);
  }

  private frameStart = 0;
  private perf = { since: 0, frames: 0, cpu: 0, last: 0, worst: [] as number[] };

  /** Rolling stats for the optional on-screen performance overlay (updated twice a second). */
  private perfSample(now: number, cpuMs: number) {
    const p = this.perf;
    // a backgrounded tab / app switch is not a slow frame: restart the window after long gaps
    if (p.last && now - p.last > 1000) { p.since = 0; p.frames = 0; p.cpu = 0; p.worst.length = 0; p.last = 0; }
    if (p.last) p.worst.push(now - p.last);
    p.last = now;
    p.frames++;
    p.cpu += cpuMs;
    if (!p.since) { p.since = now; return; }
    if (now - p.since < 500) return;
    const r = this.renderer!;
    const fps = (p.frames * 1000) / (now - p.since);
    p.worst.sort((a, b) => a - b);
    const p95 = p.worst[Math.floor(p.worst.length * 0.95)] ?? 0;
    const info = r.gl.info.render;
    const pr = r.gl.getPixelRatio();
    this.hud.setPerf(
      `${fps.toFixed(0)} fps · ${(1000 / fps).toFixed(1)} ms (worst ${p95.toFixed(0)}) · CPU ${(p.cpu / p.frames).toFixed(1)} ms`,
      `${info.calls} draws · ${(info.triangles / 1e6).toFixed(2)}M tris · ${r.quality}${r.realism ? ' realistic' : ' classic'} · ${Math.round(r.width * pr)}×${Math.round(r.height * pr)}`,
      fps < 24 ? 'bad' : fps < 45 ? 'mid' : 'good',
    );
    p.since = now; p.frames = 0; p.cpu = 0; p.worst.length = 0;
  }

  private frame = (now: number) => {
    this.frameStart = performance.now();
    if (!this.running || !this.game || !this.renderer) return;
    // iOS standalone resize events can precede the final canvas layout. Sync
    // before input, rendering and the minimap; unchanged sizes are a cheap no-op.
    this.renderer.resize();
    const g = this.game;
    let dt = (now - this.lastT) / 1000;
    this.lastT = now;
    if (dt > 0.25) dt = 0.25;
    this.input.update(dt);
    if (!this.paused && !g.over) {
      this.acc += dt * this.prefs.speed;
      let n = 0;
      while (this.acc >= TICK && n < 10) {
        g.tick();
        this.acc -= TICK;
        n++;
      }
      if (n >= 10) this.acc = 0;
      this.autosaveT += dt;
      if (this.autosaveT > 60) { this.autosaveT = 0; this.saveTo(SAVE_KEYS[0]); }
    }
    this.processEvents();
    this.ambientSounds(dt);
    this.cleanSelection();
    this.updateGhost();
    const renderStart = this.graphicsStats ? performance.now() : 0;
    const cpuStart = this.frameStart;
    this.renderer.render(this.paused ? 1 : Math.min(1, this.acc / TICK), dt);
    if (this.graphicsStats && !document.hidden) {
      if (!this.measuredSince) this.measuredSince = now;
      this.measuredRenderMs += performance.now() - renderStart;
      this.measuredFrames++;
      if (now - this.measuredSince >= 4000) {
        console.info('Graphics stats', JSON.stringify({
          fps: +(this.measuredFrames * 1000 / (now - this.measuredSince)).toFixed(1),
          renderCpuMs: +(this.measuredRenderMs / this.measuredFrames).toFixed(2),
          quality: this.renderer.quality, realism: this.renderer.realism, haze: this.renderer.haze,
          zoom: +this.renderer.zoom.toFixed(1), triangles: this.renderer.gl.info.render.triangles,
        }));
        this.measuredSince = now; this.measuredFrames = 0; this.measuredRenderMs = 0;
      }
    } else if (this.graphicsStats) {
      this.measuredSince = 0; this.measuredFrames = 0; this.measuredRenderMs = 0;
    }
    this.hud.update(dt);
    this.tutorial.update(dt);
    this.autoQuality.sample(this, now);
    if (!this.paused && !g.over) {
      this.autoWorkT += dt;
      if (this.autoWorkT > 2) {
        this.autoWorkT = 0;
        if (this.prefs.autoHouse) autoHouse(this);
        if (this.prefs.autoWork) autoWork(this, false);
      }
    }
    if (this.prefs.showFps) this.perfSample(now, performance.now() - cpuStart);
    if (g.over && !this.overShown) {
      this.overShown = true;
      setTimeout(() => this.menus.showGameOver(), 1500);
      try { localStorage.removeItem(SAVE_KEYS[0]); } catch { /* ignore */ }
    }
  };

  // ------------------------------------------------------------------ events

  private processEvents() {
    const g = this.game!;
    const r = this.renderer!;
    const evs = g.events;
    if (!evs.length) return;
    g.events = [];
    const me = g.human;
    for (const e of evs) {
      r.handleEvent(e);
      this.eventSound(e);
      switch (e.k) {
        case 'attack':
          this.lastAlert = { x: e.x!, y: e.y!, t: g.time };
          this.hud.toast(e.text!, 'bad', 4000, () => r.lookAt(e.x!, e.y!));
          play('alert');
          this.battleT = g.time;
          if (music.mode !== 'battle') music.play('battle');
          break;
        case 'built':
          if (e.o === me) { this.hud.toast(`${buildingDef(e.t!).name} completed.`, 'good', 2500); play('built'); }
          break;
        case 'research':
          if (e.o === me && e.text) { this.hud.toast(e.text, 'good', 3000); play('research'); }
          break;
        case 'age':
          this.hud.toast(e.text!, e.o === me ? 'gold' : undefined, 5000);
          if (e.o === me) play('age');
          break;
        case 'housed': this.hud.toast(e.text!, 'bad', 3000); play('error'); break;
        case 'defeat':
          if (e.o) this.hud.toast(e.text!, e.o === me ? 'bad' : 'gold', 6000);
          else { play('defeat'); music.play('end'); }
          break;
        case 'victory': play('victory'); music.play('victory'); break;
        case 'msg': case 'relic': case 'wonder':
          if (e.text && (e.o === undefined || e.o === me || e.k !== 'msg')) this.hud.toast(e.text, e.k === 'msg' ? undefined : 'gold', 4000);
          break;
        case 'convert':
          if (e.text) this.hud.toast(e.text, e.o === me ? 'good' : 'bad', 3000);
          break;
      }
    }
    if (music.mode === 'battle' && g.time - this.battleT > 60) music.play('game');
  }

  private ambT = 0;
  private ambientSounds(dt: number) {
    this.ambT -= dt;
    if (this.ambT > 0 || this.paused) return;
    this.ambT = 0.35;
    const g = this.game!, r = this.renderer!;
    const workers: Unit[] = [];
    for (const u of g.units.values()) {
      if (u.anim !== 'work' || u.t !== 'villager' || u.dead !== undefined) continue;
      if (!g.isVisible(u.x, u.y) || !r.onScreen(u.x, u.y)) continue;
      workers.push(u);
      if (workers.length > 12) break;
    }
    if (!workers.length) return;
    const u = workers[Math.floor(Math.random() * workers.length)];
    const k = u.task?.k === 'build' || u.task?.k === 'repair' ? 'build' : u.gk;
    const vol = Math.min(1, 0.4 + 6 / r.zoom);
    if (k === 'wood') play('chop', vol);
    else if (k === 'gold' || k === 'stone') play('mine', vol);
    else if (k === 'build') play('build', vol * 0.8);
  }

  private eventSound(e: GameEvent) {
    const g = this.game!, r = this.renderer!;
    if (e.x === undefined || e.y === undefined) return;
    if (!g.isVisible(e.x, e.y) || !r.onScreen(e.x, e.y)) return;
    switch (e.k) {
      case 'hit':
        if (e.t === 'melee') play('sword', 0.7);
        else if (e.t === 'stone') play('thud');
        else if (e.t === 'cannon') play('thud');
        break;
      case 'fire':
        if (e.t === 'arrow' || e.t === 'bolt') play('arrow', 0.6);
        else if (e.t === 'cannon' || e.t === 'bullet') play('cannon', 0.7);
        break;
      case 'death': play('death', 0.6); break;
      case 'collapse': play('collapse'); break;
      case 'convert': play('wololo'); break;
    }
  }

  // ------------------------------------------------------------------ selection

  private cleanSelection() {
    const g = this.game!;
    for (const id of [...this.view.selection]) {
      const e = g.get(id);
      if (!e) { this.view.selection.delete(id); continue; }
      if (e.k === 'u' && (e.dead !== undefined || e.inside)) this.view.selection.delete(id);
    }
  }

  selected(): Entity[] {
    const g = this.game;
    if (!g) return [];
    const out: Entity[] = [];
    for (const id of this.view.selection) { const e = g.get(id); if (e) out.push(e); }
    return out;
  }

  ownUnits(): Unit[] {
    const g = this.game!;
    return this.selected().filter((e): e is Unit => e.k === 'u' && e.o === g.human && e.dead === undefined && !e.inside);
  }

  ownBuilding(): Building | null {
    const s = this.selected();
    const g = this.game!;
    if (s.length === 1 && s[0].k === 'b' && s[0].o === g.human) return s[0];
    return null;
  }

  select(ids: number[], add = false) {
    if (!add) this.view.selection.clear();
    for (const id of ids) this.view.selection.add(id);
    this.menuPath = 'root';
    if (ids.length) play('select');
    this.hud.dirty = true;
  }

  deselect() {
    this.view.selection.clear();
    this.menuPath = 'root';
    this.setMode({ k: 'normal' });
    this.hud.dirty = true;
  }

  selectSameType(e: Entity, onScreen = true) {
    const g = this.game!, r = this.renderer!;
    if (e.k === 'u') {
      const ids = [...g.units.values()].filter((u) => u.o === e.o && u.t === e.t && u.dead === undefined && !u.inside && (!onScreen || r.onScreen(u.x, u.y))).map((u) => u.id);
      this.select(ids);
    } else if (e.k === 'b') {
      const ids = [...g.buildings.values()].filter((b) => b.o === e.o && b.t === e.t && (!onScreen || r.onScreen(...g.bcenter(b)))).map((b) => b.id);
      this.select(ids);
    }
  }

  /** Touch "shift": while on, tap orders are queued (waypoints, build chains). */
  queueMode = false;

  selectIdleVillager(all = false) {
    const g = this.game!;
    const idle = [...g.units.values()].filter((u) => u.o === g.human && u.t === 'villager' && u.dead === undefined && !u.inside && !u.task && u.idleT > 1);
    if (!idle.length) { this.hud.toast('No idle villagers.', undefined, 1500); return; }
    if (all) {
      this.select(idle.map((u) => u.id));
      this.renderer!.lookAt(idle[0].x, idle[0].y);
      this.hud.toast(`${idle.length} idle villager${idle.length > 1 ? 's' : ''} selected`, undefined, 1500);
      return;
    }
    const u = idle[this.idleCycle++ % idle.length];
    this.select([u.id]);
    this.renderer!.lookAt(u.x, u.y);
  }

  /** All military, or (idleOnly, press-and-hold) just soldiers with nothing to do. */
  selectArmy(idleOnly = false) {
    const g = this.game!;
    const ids = [...g.units.values()].filter((u) => {
      if (u.o !== g.human || u.dead !== undefined || u.inside) return false;
      if (idleOnly && (u.task || u.q.length)) return false;
      const d = unitDef(u.t);
      return !d.cls.includes('villager') && u.t !== 'fishing_ship' && u.t !== 'trade_cog' && !d.cls.includes('animal');
    }).map((u) => u.id);
    if (!ids.length) { this.hud.toast(idleOnly ? 'No idle soldiers.' : 'You have no army.', undefined, 1500); return; }
    if (idleOnly) this.hud.toast(`${ids.length} idle soldier${ids.length > 1 ? 's' : ''} selected`, undefined, 1500);
    this.select(ids);
  }

  goHome() {
    const g = this.game!;
    const tcs = [...g.buildings.values()].filter((b) => b.o === g.human && b.t === 'town_center');
    if (!tcs.length) return;
    const tc = tcs[this.idleCycle++ % tcs.length];
    this.select([tc.id]);
    this.renderer!.lookAt(...g.bcenter(tc));
  }

  jumpToAlert() {
    if (this.lastAlert) this.renderer!.lookAt(this.lastAlert.x, this.lastAlert.y);
  }

  setGroup(n: number) {
    this.groups.set(n, [...this.view.selection]);
    this.hud.toast(`Group ${n} set.`, undefined, 1000);
  }

  recallGroup(n: number) {
    const ids = (this.groups.get(n) ?? []).filter((id) => this.game!.get(id));
    if (!ids.length) return;
    const same = ids.length === this.view.selection.size && ids.every((i) => this.view.selection.has(i));
    this.select(ids);
    if (same) {
      const e = this.game!.get(ids[0]);
      if (e) this.renderer!.lookAt(...this.game!.epos(e));
    }
  }

  // ------------------------------------------------------------------ modes

  setMode(m: Mode) {
    this.mode = m;
    this.hud.hideTip();
    if (m.k === 'normal') this.view.ghost = null;
    this.hud.dirty = true;
    this.hud.updateModebar();
  }

  private updateGhost() {
    const g = this.game!;
    const m = this.mode;
    if (m.k === 'place') {
      const ok = g.canPlace(g.human, m.type, m.x, m.y) && !g.buildBlock(g.human, m.type);
      this.view.ghost = m.set || !this.touchInput ? { type: m.type, x: m.x, y: m.y, ok } : null;
    } else if (m.k === 'wall') {
      if (m.sx !== undefined) {
        const tiles = g.wallLine(m.sx, m.sy!, m.ex ?? m.sx, m.ey ?? m.sy!);
        this.view.ghost = { type: m.type, x: m.sx, y: m.sy!, ok: true, tiles };
      } else this.view.ghost = null;
    } else this.view.ghost = null;
  }

  beginPlace(type: BuildingKey) {
    const g = this.game!, r = this.renderer!;
    const d = buildingDef(type);
    if (d.wall) { this.setMode({ k: 'wall', type }); return; }
    const c = r.groundAt(r.width / 2, r.height / 2) ?? { x: r.tx, y: r.tz };
    const x = Math.round(c.x - d.size / 2), y = Math.round(c.y - d.size / 2);
    this.setMode({ k: 'place', type, x, y, set: false });
    void g;
  }

  placeAt(wx: number, wy: number) {
    const m = this.mode;
    if (m.k !== 'place') return;
    const d = buildingDef(m.type);
    m.x = Math.floor(wx - d.size / 2 + 0.5);
    m.y = Math.floor(wy - d.size / 2 + 0.5);
    m.set = true;
    this.hud.updateModebar();
  }

  confirmPlace(keep = false): boolean {
    const g = this.game!;
    const m = this.mode;
    if (m.k === 'place') {
      const vils = this.ownUnits().filter((u) => u.t === 'villager').map((u) => u.id);
      const cost = buildingStats(g.players[g.human], m.type).cost;
      if (!canAfford(g.players[g.human], cost)) { this.notEnough(cost); return false; }
      const b = g.cmdBuild(g.human, vils, m.type, m.x, m.y);
      if (!b) { this.hud.toast("Can't build there.", 'bad', 1500); play('error'); return false; }
      play('place');
      if (!keep) this.setMode({ k: 'normal' });
      else m.set = false;
      return true;
    }
    if (m.k === 'wall' && m.sx !== undefined) {
      const vils = this.ownUnits().filter((u) => u.t === 'villager').map((u) => u.id);
      const n = g.cmdBuildWall(g.human, vils, m.type, m.sx, m.sy!, m.ex ?? m.sx, m.ey ?? m.sy!);
      if (!n) { this.hud.toast("Can't build there (or not enough resources).", 'bad', 1800); play('error'); return false; }
      play('place');
      this.setMode({ k: 'normal' });
      return true;
    }
    return false;
  }

  notEnough(cost: Cost) {
    const g = this.game!;
    const miss = missing(g.players[g.human], cost);
    this.hud.toast(`Not enough ${miss.join(' and ')}.`, 'bad', 1600);
    this.hud.flashRes(miss);
    play('error');
  }

  // ------------------------------------------------------------------ world interaction

  /** Primary tap/click on the world. touch=true uses the mobile "smart tap" scheme. */
  private holdHintShown = false;

  /** Touch long-press on one of your buildings while units are selected: send them to it
   *  (drop off, garrison, repair or build). Returns false when the press should start a box select. */
  holdCommand(sx: number, sy: number): boolean {
    const g = this.game, r = this.renderer;
    if (!g || !r || this.mode.k !== 'normal' || !this.ownUnits().length) return false;
    const hit = r.pickEntity(sx, sy);
    if (!hit || hit.k !== 'b' || hit.o !== g.human) return false;
    this.command(sx, sy, hit, r.groundAt(sx, sy));
    return true;
  }

  tapWorld(sx: number, sy: number, opts: { touch: boolean; shift?: boolean; double?: boolean }) {
    const g = this.game!, r = this.renderer!;
    if (opts.touch && this.queueMode && this.ownUnits().length) opts = { ...opts, shift: true };
    const ground = r.groundAt(sx, sy);
    const m = this.mode;
    if (m.k === 'place') {
      if (!ground) return;
      if (opts.touch) { this.placeAt(ground.x, ground.y); return; }
      this.placeAt(ground.x, ground.y);
      this.confirmPlace(!!opts.shift);
      return;
    }
    if (m.k === 'wall') {
      if (!ground) return;
      const tx = Math.floor(ground.x), ty = Math.floor(ground.y);
      if (m.sx === undefined) { m.sx = tx; m.sy = ty; m.ex = tx; m.ey = ty; }
      else { m.ex = tx; m.ey = ty; }
      this.hud.updateModebar();
      return;
    }
    const hit = r.pickEntity(sx, sy);
    if (m.k === 'target') {
      this.execTarget(m.action, hit, ground);
      if (!opts.shift) this.setMode({ k: 'normal' });
      return;
    }
    const own = (e: Entity | null) => !!e && (e.k === 'u' || e.k === 'b') && e.o === g.human;
    if (!opts.touch) {
      // desktop left click = select
      if (hit && (hit.k === 'u' || hit.k === 'b' || hit.k === 'r' || hit.k === 'relic')) {
        if (opts.double) { this.selectSameType(hit); return; }
        if (opts.shift && own(hit)) {
          if (this.view.selection.has(hit.id)) this.view.selection.delete(hit.id);
          else this.view.selection.add(hit.id);
          this.hud.dirty = true;
          return;
        }
        this.select([hit.id]);
      } else if (!opts.shift) this.deselect();
      return;
    }
    // touch: smart tap
    const units = this.ownUnits();
    const vilSel = units.length > 0 && units.every((u) => u.t === 'villager');
    // Claimed sheep are friendly units, but a villager tap should still harvest them.
    if (vilSel && hit?.k === 'u' && hit.t === 'sheep' && hit.o === g.human) {
      this.command(sx, sy, hit, ground, !!opts.shift);
      return;
    }
    if (hit && own(hit)) {
      if (opts.double) { this.selectSameType(hit); return; }
      // villagers tapping an unfinished foundation or a farm -> work on it; any other own building is
      // simply selected (press and hold it instead to send the selection there: drop off, garrison, repair)
      if (vilSel && hit.k === 'b' && !this.view.selection.has(hit.id) && (!hit.done || hit.t === 'farm')) {
        this.command(sx, sy, hit, ground, !!opts.shift);
        return;
      }
      if (units.length && hit.k === 'b' && !this.holdHintShown) {
        this.holdHintShown = true;
        this.hud.toast('Tip: press and hold a building to send your selected units to it', 'gold', 3200);
      }
      // military tapping a transport / garrisonable building: select it instead (use Garrison button)
      if (opts.shift) { this.view.selection.add(hit.id); this.hud.dirty = true; return; }
      this.select([hit.id]);
      return;
    }
    if (units.length) {
      this.command(sx, sy, hit, ground, !!opts.shift);
      return;
    }
    const b = this.ownBuilding();
    if (b && b.done && buildingDef(b.t).trains.length && ground) {
      this.setRally(b, ground.x, ground.y, hit);
      return;
    }
    if (hit) this.select([hit.id]);
    else this.deselect();
  }

  /** Secondary click (desktop right click) or touch command. */
  command(sx: number, sy: number, hit?: Entity | null, ground?: { x: number; y: number } | null, queue = false) {
    const g = this.game!, r = this.renderer!;
    if (this.mode.k !== 'normal') { this.setMode({ k: 'normal' }); return; }
    hit = hit === undefined ? r.pickEntity(sx, sy) : hit;
    ground = ground === undefined ? r.groundAt(sx, sy) : ground;
    const units = this.ownUnits();
    if (!units.length) {
      const b = this.ownBuilding();
      if (b && ground) this.setRally(b, ground.x, ground.y, hit ?? null);
      return;
    }
    const ids = units.map((u) => u.id);
    if (hit && !(hit.k === 'u' && hit.o === g.human && !unitDef(hit.t).cargo && hit.t !== 'sheep' && !(unitDef(hit.t).cls.includes('animal')))) {
      const did = g.cmdTarget(g.human, ids, hit.id, queue);
      if (did) {
        const [x, y] = g.epos(hit);
        const enemy = (hit.k === 'u' || hit.k === 'b') && g.enemy(g.human, hit.o);
        this.view.markers.push({ x, y, t: r.time, color: enemy ? '#ff4a3d' : '#ffe65a' });
        if (hit.k === 'b' || hit.k === 'u') r.flash(hit.id);
        play(enemy || did === 'attack' ? 'attackCmd' : 'move');
        if (did === 'convert') play('wololo');
        return;
      }
    }
    if (hit && hit.k === 'u' && hit.o === g.human && unitDef(hit.t).cargo && !units.some((u) => unitDef(u.t).naval)) {
      g.cmdGarrison(g.human, ids, hit.id);
      play('move');
      return;
    }
    if (!ground) return;
    g.cmdMove(g.human, ids, ground.x, ground.y, { queue });
    this.view.markers.push({ x: ground.x, y: ground.y, t: r.time, color: '#7be07a' });
    play('move');
  }

  private setRally(b: Building, x: number, y: number, hit: Entity | null) {
    const g = this.game!;
    g.cmdRally(g.human, b.id, x, y, hit && (hit.k === 'r' || hit.k === 'b' || hit.k === 'u') ? hit.id : undefined);
    this.view.markers.push({ x, y, t: this.renderer!.time, color: '#5ab8ff' });
    play('move');
  }

  private execTarget(action: string, hit: Entity | null, ground: { x: number; y: number } | null) {
    const g = this.game!;
    const ids = this.ownUnits().map((u) => u.id);
    switch (action) {
      case 'attackmove':
        if (hit && (hit.k === 'u' || hit.k === 'b') && g.enemy(g.human, hit.o)) g.cmdAttack(g.human, ids, hit.id);
        else if (ground) g.cmdMove(g.human, ids, ground.x, ground.y, { am: true });
        play('attackCmd');
        break;
      case 'patrol':
        if (ground) g.cmdMove(g.human, ids, ground.x, ground.y, { patrol: true });
        play('move');
        break;
      case 'garrison':
        if (hit && (hit.k === 'b' || (hit.k === 'u' && unitDef(hit.t).cargo))) { g.cmdGarrison(g.human, ids, hit.id); play('move'); }
        else play('error');
        break;
      case 'repair':
        if (hit && hit.k === 'b' && hit.o === g.human) { g.cmdTarget(g.human, ids, hit.id); play('move'); }
        else play('error');
        break;
      case 'unload':
        if (ground) g.cmdUnload(g.human, ids, ground.x, ground.y);
        play('move');
        break;
      case 'attackground':
        if (ground) g.cmdAttackGround(g.human, ids, ground.x, ground.y);
        play('attackCmd');
        break;
      case 'rally': {
        const b = this.ownBuilding();
        if (b && ground) this.setRally(b, ground.x, ground.y, hit);
        break;
      }
    }
    if (ground) this.view.markers.push({ x: ground.x, y: ground.y, t: this.renderer!.time, color: '#ff8a3d' });
  }

  boxSelect(x0: number, y0: number, x1: number, y1: number, add: boolean) {
    const g = this.game!;
    const us = this.renderer!.unitsInRect(x0, y0, x1, y1, g.human);
    // prefer military over villagers if both
    const mil = us.filter((u) => !unitDef(u.t).cls.includes('villager') && u.t !== 'sheep');
    const pick = (mil.length ? mil : us.filter((u) => u.t !== 'sheep'));
    const final = pick.length ? pick : us;
    if (!final.length && !add) { this.deselect(); return; }
    this.select(final.map((u) => u.id), add);
  }

  // ------------------------------------------------------------------ commands for the HUD

  commands(): Cmd[] {
    const g = this.game!, r = this.renderer!;
    const me = g.human;
    const p = g.players[me];
    const units = this.ownUnits();
    const b = this.ownBuilding();
    const out: Cmd[] = [];
    const col = p.color;
    const uIcon = (t: UnitKey) => `<img src="${r.unitIcon(t, col)}">`;
    // buildings are shown in the style they will have when built (locked ones at their unlock age)
    const bIcon = (t: BuildingKey) => t === 'farm' ? ICON.farm : `<img src="${r.icon(`b:${t}:${Math.min(4, Math.max(p.age, buildingDef(t).age))}`, col)}">`
      + (BUILDING_ROLE[t] ? `<span class="role">${ICON[BUILDING_ROLE[t]]}</span>` : '');

    if (units.length) {
      const vils = units.filter((u) => u.t === 'villager');
      const others = units.filter((u) => u.t !== 'villager');
      if (vils.length && !others.length) {
        if (this.menuPath === 'eco' || this.menuPath === 'mil') {
          const list = (Object.keys(BUILDINGS) as BuildingKey[]).filter((t) => buildingDef(t).menu === this.menuPath && buildingDef(t).build).sort((a, b) => buildingDef(a).age - buildingDef(b).age);
          for (const t of list) {
            const d = buildingDef(t);
            const cost = buildingStats(p, t).cost;
            const block = g.buildBlock(me, t);
            out.push({
              key: 'b-' + t, icon: bIcon(t), name: d.name, desc: d.desc, cost, disabled: block, poor: !canAfford(p, cost),
              act: () => {
                if (block) { this.hud.toast(block, 'bad', 1800); play('error'); return; }
                if (!canAfford(p, cost)) { this.notEnough(cost); return; }
                this.beginPlace(t);
              },
            });
          }
          out.push({ key: 'back', icon: ICON.back, name: 'Back', act: () => { this.menuPath = 'root'; this.hud.dirty = true; } });
          return out;
        }
        out.push({ key: 'eco', icon: ICON.buildeco, name: 'Build Economic', desc: 'Houses, drop-off camps, farms and civic buildings.', act: () => { this.menuPath = 'eco'; this.hud.dirty = true; } });
        out.push({ key: 'mil', icon: ICON.buildmil, name: 'Build Military', desc: 'Barracks, walls, towers, castles…', act: () => { this.menuPath = 'mil'; this.hud.dirty = true; } });
        out.push({ key: 'repair', icon: ICON.repair, name: 'Repair', desc: 'Tap a damaged building to repair it (costs resources).', act: () => this.setMode({ k: 'target', action: 'repair', label: 'Tap a building to repair' }) });
      }
      const mil = others.filter((u) => !unitDef(u.t).cls.includes('animal'));
      const canFight = units.some((u) => unitStats(p, u.t).atk > 0 && u.t !== 'villager');
      if (canFight) {
        out.push({ key: 'am', icon: ICON.attackmove, name: 'Attack Move', desc: 'Move and fight anything along the way.', act: () => this.setMode({ k: 'target', action: 'attackmove', label: 'Tap where to attack-move' }) });
        out.push({ key: 'patrol', icon: ICON.patrol, name: 'Patrol', desc: 'Patrol between here and a point.', act: () => this.setMode({ k: 'target', action: 'patrol', label: 'Tap the patrol point' }) });
        const scouts = units.filter((u) => g.canScout(u));
        if (scouts.length) {
          const on = scouts.every((u) => u.task?.k === 'scout');
          out.push({
            key: 'scout', icon: ICON.scout, name: on ? 'Auto Scout (scouting…)' : 'Auto Scout', on,
            desc: 'Explore the map by itself: circles your base first, then heads out, steering clear of enemy towers and town centres and veering away when attacked. Give any other order to stop.',
            act: () => { g.cmdScout(me, scouts.map((u) => u.id)); this.hud.toast('Scouting automatically', 'gold', 1500); this.hud.dirty = true; play('click'); },
          });
        }
      }
      if (units.some((u) => ['mangonel', 'onager', 'trebuchet', 'bombard_cannon', 'cannon_galleon'].includes(u.t))) {
        out.push({ key: 'ag', icon: ICON.target, name: 'Attack Ground', desc: 'Bombard an area.', act: () => this.setMode({ k: 'target', action: 'attackground', label: 'Tap the ground to bombard' }) });
      }
      if (units.some((u) => u.cargo && u.cargo.length)) {
        out.push({ key: 'unload', icon: ICON.unload, name: 'Unload', desc: 'Tap the shore to unload.', act: () => this.setMode({ k: 'target', action: 'unload', label: 'Tap the shore to unload' }) });
      }
      if (units.some((u) => !unitDef(u.t).naval)) {
        out.push({ key: 'gar', icon: ICON.garrison, name: 'Garrison', desc: 'Enter a Town Center, tower, castle or transport.', act: () => this.setMode({ k: 'target', action: 'garrison', label: 'Tap a building or ship to garrison' }) });
      }
      out.push({ key: 'stop', icon: ICON.stop, name: 'Stop', act: () => { g.cmdStop(me, units.map((u) => u.id)); play('click'); } });
      if (canFight && mil.length) {
        const st = mil[0].stance;
        const stances: [0 | 1 | 2 | 3, string, string, string][] = [[0, 'aggressive', 'Aggressive', 'Chase and attack any enemy in sight.'], [1, 'defensive', 'Defensive', 'Attack nearby enemies, then return.'], [2, 'stand', 'Stand Ground', 'Hold position, attack only in range.'], [3, 'noattack', 'No Attack', 'Never attack.']];
        for (const [s, ic, n, d] of stances) out.push({ key: 'st' + s, icon: ICON[ic], name: n, desc: d, on: st === s, act: () => { g.cmdStance(me, mil.map((u) => u.id), s); this.hud.dirty = true; play('click'); } });
      }
      out.push({ key: 'del', icon: ICON.del, name: 'Delete', desc: 'Delete the selected units.', act: () => { g.cmdDelete(me, units.map((u) => u.id)); this.deselect(); } });
      return out;
    }

    if (b) {
      if (!b.done) {
        out.push({ key: 'del', icon: ICON.del, name: 'Delete', desc: 'Cancel this construction (refund if not started).', act: () => { g.cmdDelete(me, [b.id]); this.deselect(); } });
        return out;
      }
      const ageBusy = b.q.some((q) => q.tech && TECH_BY_ID[q.tech].isAge);
      for (const t of g.trainable(b)) {
        const st = unitStats(p, t);
        const block = g.trainBlock(b, t) ?? (ageBusy ? 'Researching the next age' : null);
        const n = b.q.filter((q) => q.u === t).length;
        const ud = unitDef(t);
        out.push({
          key: 'u-' + t, icon: uIcon(t), name: ud.name, desc: ud.desc + unitStatLine(st, ud.range > 0), cost: st.cost, disabled: block, poor: !canAfford(p, st.cost), count: n || undefined,
          tag: ud.cls.includes('unique') ? '★' : undefined,
          act: (shift) => this.train(b, t, shift ? 5 : 1),
          long: () => this.train(b, t, 5),
        });
      }
      for (const id of g.techsAt(b)) {
        const t = TECH_BY_ID[id];
        const cost = techCost(p, id);
        const block = g.techBlock(me, id);
        let icon = techIcon(id, t.icon, t.civ);
        if (t.upgrade) icon = `<img src="${r.unitIcon(t.upgrade[1], col)}"><span class="tag" style="font-size:14px">⬆</span>`;
        out.push({
          key: 't-' + id, icon, name: t.name, desc: t.desc + (t.civ ? ` (${CIVS[t.civ].name} unique)` : ''), cost, disabled: block, poor: !canAfford(p, cost), age: !!t.isAge,
          act: () => {
            if (block) { this.hud.toast(block, 'bad', 2000); play('error'); return; }
            if (!canAfford(p, cost)) { this.notEnough(cost); return; }
            if (g.cmdResearch(me, b.id, id)) {
              play('click');
              if (t.isAge) this.hud.toast(`Advancing to the ${AGE_NAMES[p.age + 1]}: your Town Center is being rebuilt`, 'gold', 3000);
            }
          },
        });
      }
      // queue in progress for this building's research (show as on)
      if (b.t === 'market') {
        for (const res of ['food', 'wood', 'stone'] as const) {
          out.push({ key: 'buy-' + res, icon: `${ICON[res]}<span class="tag" style="color:#7be07a">BUY</span>`, name: `Buy 100 ${res}`, cost: { gold: g.marketPrice(me, 'buy', res) }, act: () => { if (!g.cmdMarket(me, 'buy', res)) this.notEnough({ gold: g.marketPrice(me, 'buy', res) }); else play('click'); } });
          out.push({ key: 'sell-' + res, icon: `${ICON[res]}<span class="tag" style="color:#ff8a7a">SELL</span>`, name: `Sell 100 ${res} for ${g.marketPrice(me, 'sell', res)} gold`, act: () => { if (!g.cmdMarket(me, 'sell', res)) this.notEnough({ [res]: 100 }); else play('click'); } });
        }
      }
      if (buildingDef(b.t).trains.length || b.t === 'town_center') {
        out.push({ key: 'rally', icon: ICON.rally, name: 'Set Gather Point', desc: 'Tap a spot (or a resource) where new units go.', act: () => this.setMode({ k: 'target', action: 'rally', label: 'Tap the gather point' }) });
      }
      if (b.gar.length) out.push({ key: 'ungar', icon: ICON.ungarrison, name: 'Ungarrison All', act: () => { g.cmdUngarrison(me, b.id); play('click'); } });
      if (b.t === 'town_center') {
        const auto = !!b.autoVil;
        out.push({
          key: 'autovil', icon: ICON.autovil, name: auto ? 'Auto villagers: ON' : 'Auto villagers: OFF', on: auto,
          desc: 'Keep training villagers whenever this Town Center is idle and you can afford them.',
          act: () => { g.cmdAutoVillagers(me, b.id, !auto); this.hud.dirty = true; play('click'); },
        });
        out.push({ key: 'bell', icon: ICON.bell, name: 'Ring Town Bell', desc: 'All villagers take shelter in nearby buildings.', act: () => { g.cmdTownBell(me, true); play('bell'); } });
        out.push({ key: 'clear', icon: ICON.allclear, name: 'All Clear', desc: 'Villagers return to work.', act: () => { g.cmdTownBell(me, false); play('click'); } });
      }
      if (b.t === 'farm' || b.t === 'mill') {
        const farms = b.t === 'farm' ? [b] : [...g.buildings.values()].filter((f) => f.o === me && f.t === 'farm');
        const on = farms.every((f) => f.reseed);
        out.push({ key: 'reseed', icon: ICON.reseed, name: on ? 'Auto-reseed: ON' : 'Auto-reseed: OFF', desc: 'Automatically rebuild exhausted farms (60 wood).', on, act: () => { for (const f of farms) f.reseed = !on; this.hud.dirty = true; play('click'); } });
      }
      out.push({ key: 'del', icon: ICON.del, name: 'Delete', act: () => { if (confirm(`Delete this ${buildingDef(b.t).name}?`)) { g.cmdDelete(me, [b.id]); this.deselect(); } } });
      return out;
    }
    return out;
  }

  train(b: Building, t: UnitKey, n: number) {
    const g = this.game!;
    const p = g.players[g.human];
    const block = g.trainBlock(b, t);
    if (block) { this.hud.toast(block, 'bad', 1800); play('error'); return; }
    const done = g.cmdTrain(g.human, b.id, t, n);
    if (!done) {
      const st = unitStats(p, t);
      if (!canAfford(p, st.cost)) this.notEnough(st.cost);
      else { this.hud.toast('Queue is full.', 'bad', 1200); play('error'); }
    } else play('click');
  }

  // ------------------------------------------------------------------ save / load

  saveTo(key: string): boolean {
    if (!this.game) return false;
    try {
      const data = this.game.save();
      const meta = { t: Date.now(), civ: this.game.players[this.game.human].civ, time: this.game.time, map: this.game.settings.mapType, age: this.game.players[this.game.human].age };
      localStorage.setItem(key, JSON.stringify({ meta, data }));
      return true;
    } catch (e) {
      console.warn('save failed', e);
      return false;
    }
  }

  loadFrom(key: string): boolean {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const { data } = JSON.parse(raw) as { data: SaveData };
      this.start(data.settings, data);
      return true;
    } catch (e) {
      console.warn('load failed', e);
      alert('This save could not be loaded.');
      return false;
    }
  }

  saveMeta(key: string): { t: number; civ: string; time: number; map: string; age: number } | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const i = raw.indexOf('"data"');
      const metaStr = raw.slice(0, i).replace(/^\{"meta":/, '').replace(/,$/, '');
      return JSON.parse(metaStr);
    } catch { return null; }
  }

  ageName() {
    const g = this.game!;
    return AGE_NAMES[g.players[g.human].age];
  }
}

export function unitStatLine(st: ReturnType<typeof unitStats>, ranged: boolean) {
  return `\nHP ${st.hp} · Attack ${Math.round(st.atk)} · Armour ${st.armorM}/${st.armorP}${ranged ? ` · Range ${st.range}` : ''}`;
}

export function isTouch() {
  return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
}

function defaultQuality(): Quality {
  const mobile = isTouch();
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  // Phones start on Low unless clearly high-end; auto-quality can't go *up*, so err fast.
  if (mobile && (mem <= 4 || cores <= 6)) return 'low';
  if (mobile) return 'medium';
  return 'high';
}
