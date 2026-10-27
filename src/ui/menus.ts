import { AGE_NAMES, CIVS, CIV_BLURB, CIV_LIST, PLAYABLE_CIVS, PLAYER_COLORS, PLAYER_COLOR_NAMES, unitDef, type CivId } from '../data/defs';
import type { Settings } from '../sim/types';
import { applyAudioSettings, audioSettings, music, play } from '../audio/sfx';
import { SAVE_KEYS, type App } from './app';

interface SetupPlayer { civ: CivId | 'random'; human: boolean; team: number; diff: number; color: number; name: string }

const AI_NAMES = ['Charlemagne', 'Joan of Arc', 'Saladin', 'Genghis Khan', 'Barbarossa', 'Richard', 'Tamerlane', 'Ragnar', 'Justinian', 'Oda Nobunaga', 'Cyrus', 'Wu Zetian', 'El Cid', 'Harald'];
const MAPS: [Settings['mapType'], string, string][] = [
  ['arabia', 'Arabia', 'Dry, open land: dusty plains, patchy grass, low hills and scattered woods. Fast, aggressive games.'],
  ['black_forest', 'Black Forest', 'Dense forest with narrow paths. Great for walling and booming.'],
  ['lakes', 'Lakes', 'A central lake and ponds full of fish. Docks pay off.'],
  ['coastal', 'Coastal', 'Land ringed by the sea. Fishing and warships matter.'],
  ['highland', 'Highland', 'Steep hills and small lakes. Hold the high ground!'],
  ['oasis', 'Oasis', 'Desert with a palm-ringed oasis in the centre.'],
];
const SIZES: [number, string][] = [[96, 'Tiny (96)'], [120, 'Small (120)'], [144, 'Medium (144)'], [168, 'Large (168)']];
const DIFFS = ['Easy', 'Moderate', 'Hard', 'Hardest', 'Extreme'];
/** Difficulties offered as one-tap chips on the simplified setup screen. */
const QUICK_DIFFS = [0, 1, 2];
const QUICK_MAPS: Settings['mapType'][] = ['arabia', 'black_forest', 'lakes', 'highland'];
const DIFF_DESC = [
  'Slow, relaxed opponents that gather 20% slower and attack late. Good for learning.',
  'A fair fight at normal gather rates.',
  'Faster decisions, a stronger economy (+10% gathering) and earlier attacks.',
  'Booms hard (+25% gathering), multiple production buildings and steady pressure.',
  'Relentless: very fast decisions, +40% gathering, early and growing attacks.',
];
const SETUP_KEY = 'aoak-setup';

export class Menus {
  app: App;
  root: HTMLDivElement;
  setup: { mapType: Settings['mapType']; mapSize: number; players: SetupPlayer[]; startRes: Settings['startRes']; startAge: number; popCap: number; victory: Settings['victory']; reveal: Settings['reveal'] };

  private advOpen = false;

  /** Copy the advanced rule selects back into the setup before the screen re-renders. */
  private keepRules() {
    const v = (id: string) => (this.root.querySelector(id) as HTMLSelectElement | null)?.value;
    const s = this.setup;
    s.startRes = (v('#s-res') ?? s.startRes) as Settings['startRes'];
    s.startAge = +(v('#s-age') ?? s.startAge);
    s.popCap = +(v('#s-pop') ?? s.popCap);
    s.victory = (v('#s-vic') ?? s.victory) as Settings['victory'];
    s.reveal = (v('#s-rev') ?? s.reveal) as Settings['reveal'];
  }

  constructor(app: App) {
    this.app = app;
    this.root = document.createElement('div');
    this.root.className = 'screen hidden';
    document.body.appendChild(this.root);
    this.setup = {
      mapType: 'arabia', mapSize: 120,
      players: [
        { civ: 'britons', human: true, team: 0, diff: 0, color: 1, name: 'You' },
        { civ: 'random', human: false, team: 0, diff: 0, color: 2, name: AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)] },
      ],
      startRes: 'standard', startAge: 1, popCap: 150, victory: 'standard', reveal: 'normal',
    };
    try { Object.assign(this.setup, JSON.parse(localStorage.getItem(SETUP_KEY) ?? '{}')); } catch { /* ignore */ }
    // Only two civilizations are playable now; older setups may name others.
    for (const p of this.setup.players) if (p.civ !== 'random' && !PLAYABLE_CIVS.includes(p.civ)) p.civ = p.human ? 'britons' : 'random';
    if (!this.setup.players.some((p) => p.human)) this.setup.players.unshift({ civ: 'britons', human: true, team: 0, diff: 0, color: 1, name: 'You' });
  }

  /** One tap: 1 vs 1 against an Easy AI on a small open map, with tips on. */
  quickPlay() {
    const human = this.setup.players.find((p) => p.human)!;
    const civ: CivId = human.civ === 'random' ? 'britons' : human.civ;
    const settings: Settings = {
      mapType: 'arabia', mapSize: 96,
      players: [
        { civ, human: true, team: 0, diff: 0, color: human.color || 1, name: human.name || 'You' },
        { civ: 'random', human: false, team: 0, diff: 0, color: human.color === 2 ? 1 : 2, name: AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)] },
      ],
      startRes: 'medium', startAge: 1, popCap: 100, victory: 'conquest', reveal: 'normal',
      speed: this.app.prefs.speed, seed: Math.floor(Math.random() * 1e9),
    };
    this.app.start(settings);
  }

  private open(html: string, dim = false) {
    this.root.className = 'screen' + (dim ? ' dim' : '');
    this.root.innerHTML = `<div class="card">${html}</div>`;
    this.root.scrollTop = 0;
    return this.root;
  }

  hideAll() {
    this.root.className = 'screen hidden';
    this.root.innerHTML = '';
  }

  private on(sel: string, f: (el: HTMLElement) => void) {
    this.root.querySelectorAll<HTMLElement>(sel).forEach((el) => el.addEventListener('click', (e) => { e.stopPropagation(); play('click'); f(el); }));
  }

  // ------------------------------------------------------------------ main menu

  showMain() {
    const auto = this.app.saveMeta(SAVE_KEYS[0]);
    this.open(`
      ${TITLE_SVG}
      <h1>Age of AI: Kingdoms</h1>
      <div class="sub">A real-time strategy game of four ages</div>
      <div class="menu-btns">
        ${auto ? `<button class="btn primary" id="m-continue">Continue <small style="opacity:.7">(${fmtTime(auto.time)}, ${AGE_NAMES[auto.age]})</small></button>` : ''}
        <button class="btn big ${auto ? '' : 'primary'}" id="m-quick">▶ Quick Play</button>
        <div class="menu-sub">1 vs 1 · Easy opponent · small map · tips on</div>
        <button class="btn" id="m-new">Custom Game</button>
        <button class="btn" id="m-load">Load Game</button>
        <button class="btn" id="m-civs">Civilizations</button>
        <button class="btn" id="m-help">How to Play</button>
        <button class="btn" id="m-settings">Settings</button>
      </div>
      <div class="version">Single player vs AI · Built with Three.js · Inspired by Age of Empires II and <a style="color:#c8a060" href="https://github.com/alexvilelabah/age-of-ai" target="_blank" rel="noopener">Age of AI</a></div>`);
    this.on('#m-continue', () => this.app.loadFrom(SAVE_KEYS[0]));
    this.on('#m-quick', () => this.quickPlay());
    this.on('#m-new', () => this.showSetup());
    this.on('#m-load', () => this.showLoad(() => this.showMain()));
    this.on('#m-civs', () => this.showCivs());
    this.on('#m-help', () => this.showHelp(() => this.showMain()));
    this.on('#m-settings', () => this.showSettings(() => this.showMain()));
  }

  // ------------------------------------------------------------------ setup

  showSetup() {
    this.keepRules();
    const s = this.setup;
    const civOpts = (sel: string) => `<option value="random"${sel === 'random' ? ' selected' : ''}>Random</option>` + CIV_LIST.map((c) => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${c.name}</option>`).join('');
    const rows = s.players.map((p, i) => `
      <div class="prow" data-i="${i}">
        <div class="sw" style="background:${PLAYER_COLORS[p.color]}" data-act="color" title="${PLAYER_COLOR_NAMES[p.color]}"></div>
        <input type="text" value="${esc(p.name)}" data-f="name" maxlength="16">
        <select data-f="civ">${civOpts(p.civ)}</select>
        ${p.human ? '<div class="hum" style="font-size:12px;color:var(--gold);text-align:center">Human</div>' : `<select data-f="diff">${DIFFS.map((d, k) => `<option value="${k}"${k === p.diff ? ' selected' : ''}>${d}</option>`).join('')}</select>`}
        <select data-f="team"><option value="0"${p.team === 0 ? ' selected' : ''}>No team</option>${[1, 2, 3, 4].map((t) => `<option value="${t}"${p.team === t ? ' selected' : ''}>Team ${t}</option>`).join('')}</select>
        ${p.human ? '<span class="xs"></span>' : '<button class="x" data-act="del" aria-label="Remove player">✕</button>'}
      </div>`).join('');
    const human = s.players.find((p) => p.human)!;
    const ais = s.players.filter((p) => !p.human);
    const aiDiff = ais.every((p) => p.diff === ais[0]?.diff) ? ais[0]?.diff ?? 0 : -1;
    const civCards = CIV_LIST.map((c) => `<button class="pick-card${human.civ === c.id ? ' on' : ''}" data-civ="${c.id}">
        <span class="pc-name">${c.name}</span><span class="pc-desc">${CIV_BLURB[c.id] ?? ''}</span>
        <span class="pc-desc" style="color:var(--muted)">Special unit: ${unitDef(c.unique).name}</span></button>`).join('');
    const diffChips = QUICK_DIFFS.map((k) => `<button class="chip${aiDiff === k ? ' on' : ''}" data-diff="${k}">${DIFFS[k]}</button>`).join('');
    const mapChips = QUICK_MAPS.map((k) => `<button class="chip${s.mapType === k ? ' on' : ''}" data-map="${k}">${MAPS.find((m) => m[0] === k)![1]}</button>`).join('');
    this.open(`
      <h2>New Game</h2>
      <h3>Your civilization</h3>
      <div class="pick">${civCards}</div>
      <h3>Opponent</h3>
      <div class="chips">${diffChips}</div>
      <div class="civinfo" id="s-diffdesc" style="margin:0">${DIFF_DESC[Math.max(0, aiDiff)]}</div>
      <h3>Map</h3>
      <div class="chips">${mapChips}</div>
      <div class="civinfo" id="s-mapdesc2">${MAPS.find((m) => m[0] === s.mapType)?.[2]}</div>
      <div class="row" style="margin-top:16px;justify-content:space-between">
        <button class="btn" id="s-back">Back</button>
        <button class="btn primary big" id="s-start">Start Game ▶</button>
      </div>
      <details class="adv" id="s-adv"${this.advOpen ? ' open' : ''}><summary>More options (players, teams, rules)</summary>
      <div class="grid2">
        <label class="f">AI difficulty (all opponents)<select id="s-diff">${DIFFS.map((d, k) => `<option value="${k}"${aiDiff === k ? ' selected' : ''}>${d}</option>`).join('')}</select></label>
        <label class="f">Map type<select id="s-map">${MAPS.map(([k, n]) => `<option value="${k}"${k === s.mapType ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      </div>
      <h3>Players</h3>
      ${rows}
      <div class="row"><button class="btn small" id="s-add" ${s.players.length >= 6 ? 'disabled' : ''}>+ Add AI opponent</button></div>
      <h3>Rules</h3>
      <div class="grid2">
        <label class="f">Map size<select id="s-size">${SIZES.map(([k, n]) => `<option value="${k}"${k === s.mapSize ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="f">Starting resources<select id="s-res"><option value="standard">Standard</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label class="f">Starting age<select id="s-age">${[1, 2, 3, 4].map((a) => `<option value="${a}">${AGE_NAMES[a]}</option>`).join('')}</select></label>
        <label class="f">Population limit<select id="s-pop">${[75, 100, 125, 150, 200].map((n) => `<option value="${n}">${n}</option>`).join('')}</select></label>
        <label class="f">Victory<select id="s-vic"><option value="standard">Standard (conquest, wonder, relics)</option><option value="conquest">Conquest only</option></select></label>
        <label class="f">Reveal map<select id="s-rev"><option value="normal">Normal</option><option value="explored">Explored</option><option value="all">All visible</option></select></label>
      </div>
      </details>`);
    const q = <T extends HTMLElement>(sel: string) => this.root.querySelector(sel) as T;
    (q<HTMLSelectElement>('#s-res')).value = s.startRes;
    (q<HTMLSelectElement>('#s-age')).value = String(s.startAge);
    (q<HTMLSelectElement>('#s-pop')).value = String(s.popCap);
    (q<HTMLSelectElement>('#s-vic')).value = s.victory;
    (q<HTMLSelectElement>('#s-rev')).value = s.reveal;
    this.root.querySelectorAll<HTMLElement>('.prow').forEach((row) => {
      const i = +row.dataset.i!;
      const p = s.players[i];
      row.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-f]').forEach((el) => el.addEventListener('change', () => {
        const f = el.dataset.f!;
        if (f === 'name') p.name = el.value || p.name;
        if (f === 'civ') p.civ = el.value as CivId | 'random';
        if (f === 'diff') p.diff = +el.value;
        if (f === 'team') p.team = +el.value;
        if (f === 'civ' && p.human) this.showSetup();
      }));
      row.querySelector('[data-act=color]')?.addEventListener('click', () => {
        const used = new Set(s.players.map((pp) => pp.color));
        let c = p.color;
        for (let k = 0; k < 8; k++) { c = (c % 8) + 1; if (!used.has(c)) break; }
        p.color = c;
        this.showSetup();
      });
      row.querySelector('[data-act=del]')?.addEventListener('click', () => { s.players.splice(i, 1); this.showSetup(); });
    });
    this.on('#s-add', () => {
      const used = new Set(s.players.map((pp) => pp.color));
      let c = 1;
      while (used.has(c)) c++;
      const names = AI_NAMES.filter((n) => !s.players.some((pp) => pp.name === n));
      s.players.push({ civ: 'random', human: false, team: 0, diff: s.players[s.players.length - 1]?.diff ?? 1, color: c, name: names[Math.floor(Math.random() * names.length)] ?? 'AI' });
      if (s.players.length > 2 && s.mapSize < 120) s.mapSize = 120;
      if (s.players.length > 4 && s.mapSize < 144) s.mapSize = 144;
      this.showSetup();
    });
    q('#s-map').addEventListener('change', (e) => { s.mapType = (e.target as HTMLSelectElement).value as Settings['mapType']; this.keepRules(); this.showSetup(); });
    q('#s-adv').addEventListener('toggle', () => { this.advOpen = (q('#s-adv') as HTMLDetailsElement).open; });
    this.on('[data-civ]', (el) => { human.civ = el.dataset.civ as CivId; this.keepRules(); this.showSetup(); });
    this.on('[data-diff]', (el) => { for (const p of s.players) if (!p.human) p.diff = +el.dataset.diff!; this.keepRules(); this.showSetup(); });
    this.on('[data-map]', (el) => { s.mapType = el.dataset.map as Settings['mapType']; this.keepRules(); this.showSetup(); });
    q('#s-size').addEventListener('change', (e) => { s.mapSize = +(e.target as HTMLSelectElement).value; });
    q('#s-diff').addEventListener('change', (e) => {
      const k = +(e.target as HTMLSelectElement).value;
      for (const p of s.players) if (!p.human) p.diff = k;
      this.keepRules();
      this.showSetup();
    });
    this.on('#s-back', () => this.showMain());
    this.on('#s-start', () => {
      s.startRes = (q<HTMLSelectElement>('#s-res')).value as Settings['startRes'];
      s.startAge = +(q<HTMLSelectElement>('#s-age')).value;
      s.popCap = +(q<HTMLSelectElement>('#s-pop')).value;
      s.victory = (q<HTMLSelectElement>('#s-vic')).value as Settings['victory'];
      s.reveal = (q<HTMLSelectElement>('#s-rev')).value as Settings['reveal'];
      if (s.players.length < 2) { alert('Add at least one AI opponent.'); return; }
      const teams = new Set(s.players.map((p, i) => (p.team ? 't' + p.team : 'p' + i)));
      if (teams.size < 2) { alert('Everyone is on the same team — there would be no enemy!'); return; }
      try { localStorage.setItem(SETUP_KEY, JSON.stringify(s)); } catch { /* ignore */ }
      const settings: Settings = {
        mapType: s.mapType, mapSize: s.mapSize, players: s.players.map((p) => ({ ...p })), startRes: s.startRes, startAge: s.startAge,
        popCap: s.popCap, victory: s.victory, reveal: s.reveal, speed: this.app.prefs.speed, seed: Math.floor(Math.random() * 1e9),
      };
      this.app.start(settings);
    });
  }

  // ------------------------------------------------------------------ pause

  showPause() {
    const app = this.app;
    if (!app.game) return;
    app.paused = true;
    app.hud.hideTip();
    this.open(`
      <h2 style="text-align:center">Paused</h2>
      <div class="menu-btns">
        <button class="btn primary" id="p-resume">Resume</button>
        <button class="btn" id="p-save">Save Game</button>
        <button class="btn" id="p-load">Load Game</button>
        <button class="btn" id="p-obj">Objectives &amp; Scores</button>
        <button class="btn" id="p-settings">Settings</button>
        <button class="btn" id="p-help">How to Play</button>
        <div class="row" style="flex-wrap:nowrap"><input type="text" id="p-cheat" placeholder="Chat / cheat code" style="flex:1;min-width:0" autocomplete="off" autocapitalize="off"><button class="btn small" id="p-cheat-go">Send</button></div>
        <button class="btn danger" id="p-resign">Resign</button>
        <button class="btn" id="p-quit">Save &amp; Quit to Menu</button>
      </div>`, true);
    this.on('#p-resume', () => this.resume());
    const sendCheat = () => {
      const inp = this.root.querySelector('#p-cheat') as HTMLInputElement;
      if (!inp.value.trim()) return;
      const res = app.game!.cheat(app.game!.human, inp.value);
      app.hud.toast(res ?? 'Unknown code.', res ? 'gold' : undefined, 2500);
      inp.value = '';
      if (res) this.resume();
    };
    this.on('#p-cheat-go', sendCheat);
    (this.root.querySelector('#p-cheat') as HTMLInputElement).addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') sendCheat(); });
    this.on('#p-save', () => this.showSave());
    this.on('#p-load', () => this.showLoad(() => this.showPause()));
    this.on('#p-obj', () => this.showScores(false));
    this.on('#p-settings', () => this.showSettings(() => this.showPause()));
    this.on('#p-help', () => this.showHelp(() => this.showPause()));
    this.on('#p-resign', () => {
      if (!confirm('Resign this game?')) return;
      const g = app.game!;
      g.players[g.human].resigned = true;
      this.resume();
    });
    this.on('#p-quit', () => app.quitToMenu());
  }

  resume() {
    this.hideAll();
    this.app.paused = false;
  }

  resumeIfPause() {
    if (this.app.game && !this.root.classList.contains('hidden')) this.resume();
  }

  showSave() {
    const slots = SAVE_KEYS.slice(1).map((k, i) => {
      const m = this.app.saveMeta(k);
      return `<button class="btn" data-k="${k}">Slot ${i + 1}: ${m ? `${CIVS[m.civ as CivId]?.name ?? ''} · ${fmtTime(m.time)} · ${new Date(m.t).toLocaleString()}` : '<i>empty</i>'}</button>`;
    }).join('');
    this.open(`<h2>Save Game</h2><div class="menu-btns">${slots}<button class="btn" id="sv-back">Back</button></div>`, true);
    this.on('[data-k]', (el) => {
      if (this.app.saveTo(el.dataset.k!)) { this.app.hud.toast('Game saved.', 'good', 1500); this.showPause(); }
      else alert('Saving failed (storage full?).');
    });
    this.on('#sv-back', () => this.showPause());
  }

  showLoad(back: () => void) {
    const slots = SAVE_KEYS.map((k, i) => {
      const m = this.app.saveMeta(k);
      if (!m) return '';
      return `<button class="btn" data-k="${k}">${i === 0 ? 'Autosave' : 'Slot ' + i}: ${CIVS[m.civ as CivId]?.name ?? ''} · ${fmtTime(m.time)} · ${AGE_NAMES[m.age]} · ${new Date(m.t).toLocaleString()}</button>`;
    }).join('');
    this.open(`<h2>Load Game</h2><div class="menu-btns">${slots || '<div class="sub">No saved games yet.</div>'}<button class="btn" id="ld-back">Back</button></div>`, !!this.app.game);
    this.on('[data-k]', (el) => this.app.loadFrom(el.dataset.k!));
    this.on('#ld-back', back);
  }

  // ------------------------------------------------------------------ settings

  showSettings(back: () => void) {
    const pr = this.app.prefs;
    this.open(`
      <h2>Settings</h2>
      <h3 style="margin-top:0">Easy play</h3>
      <div class="grid2">
        <label class="f"><span><input type="checkbox" id="o-tut"> Beginner tips</span><small class="sub">Step-by-step hints during your game.</small></label>
        <label class="f"><span><input type="checkbox" id="o-work"> Idle villagers find work</span><small class="sub">Villagers left doing nothing go gather food, wood or gold on their own.</small></label>
        <label class="f"><span><input type="checkbox" id="o-house"> Auto-build houses</span><small class="sub">A villager builds a House near your Town Center when you are running out of room.</small></label>
        <label class="f"><span><input type="checkbox" id="o-train"> Auto-train villagers</span><small class="sub">Town Centers keep making villagers at the start of a game.</small></label>
        <label class="f"><span><input type="checkbox" id="o-aq"> Auto graphics</span><small class="sub">Lowers graphics automatically if the game gets slow.</small></label>
      </div>
      <h3>Graphics &amp; sound</h3>
      <div class="grid2">
        <label class="f">Graphics quality<select id="o-q"><option value="low">Low (fast, no shadows)</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label class="f"><span><input type="checkbox" id="o-fullres"> Full screen resolution</span><small class="sub">High quality only. Renders every screen pixel (sharpest, but slower on phones).</small></label>
        <label class="f"><span><input type="checkbox" id="o-realism"> Realistic graphics</span><small class="sub">Detailed models, photographic textures, natural lighting and reflective water.</small></label>
        <label class="f"><span><input type="checkbox" id="o-fps"> Show FPS</span><small class="sub">Frame rate, frame time, draw calls and triangles on screen. Tap the counter to hide it.</small></label>
        <label class="f"><span><input type="checkbox" id="o-persp"> Perspective camera</span><small class="sub">AoE4-style camera with depth. Turn off for a classic flat isometric view.</small></label>
        <label class="f"><span><input type="checkbox" id="o-haze"> Atmospheric haze</span><small class="sub">Soft distance haze in realistic graphics.</small></label>
        <label class="f">Game speed<select id="o-speed"><option value="1">Slow (1.0×)</option><option value="1.5">Normal (1.5×)</option><option value="1.7">AoE2 Normal (1.7×)</option><option value="2">Fast (2.0×)</option><option value="3">Very fast (3.0×)</option></select></label>
        <label class="f">Sound effects<input type="range" id="o-sfx" min="0" max="1" step="0.05"></label>
        <label class="f">Music<input type="range" id="o-music" min="0" max="1" step="0.05"></label>
        <label class="f"><span><input type="checkbox" id="o-xmusic"> Extra music tracks</span><small class="sub">Eight more medieval pieces (lute, feasts, battle drums and a victory fanfare), all CC0 public domain. Turn off for the original soundtrack only.</small></label>
        <label class="f">One-finger drag (touch)<select id="o-finger"><option value="pan">Scroll the map</option><option value="select">Box-select units</option></select></label>
        <label class="f"><span><input type="checkbox" id="o-twist"> Twist two fingers to rotate</span></label>
        <label class="f"><span><input type="checkbox" id="o-mute"> Mute all audio</span></label>
        <label class="f"><span><input type="checkbox" id="o-hk"> Show hotkeys on buttons</span></label>
        <label class="f"><span><input type="checkbox" id="o-edge"> Edge scrolling (mouse)</span></label>
      </div>
      <div class="row" style="margin-top:16px"><button class="btn primary" id="o-back">Done</button><button class="btn small" id="o-fs">Toggle fullscreen</button></div>`, !!this.app.game);
    const q = <T extends HTMLElement>(sel: string) => this.root.querySelector(sel) as T;
    q<HTMLSelectElement>('#o-q').value = pr.quality;
    q<HTMLInputElement>('#o-realism').checked = pr.realism;
    q<HTMLInputElement>('#o-haze').checked = pr.haze;
    q<HTMLInputElement>('#o-persp').checked = pr.perspective;
    q<HTMLInputElement>('#o-fps').checked = pr.showFps;
    q<HTMLInputElement>('#o-fullres').checked = pr.fullRes;
    q<HTMLSelectElement>('#o-speed').value = String(pr.speed);
    q<HTMLInputElement>('#o-sfx').value = String(pr.sfx);
    q<HTMLInputElement>('#o-music').value = String(pr.music);
    q<HTMLInputElement>('#o-mute').checked = pr.muted;
    q<HTMLInputElement>('#o-xmusic').checked = pr.extraMusic;
    q<HTMLSelectElement>('#o-finger').value = pr.oneFinger;
    q<HTMLInputElement>('#o-twist').checked = pr.twistRotate;
    q<HTMLInputElement>('#o-hk').checked = pr.showHotkeys;
    q<HTMLInputElement>('#o-edge').checked = pr.edgeScroll;
    q<HTMLInputElement>('#o-tut').checked = pr.tutorial;
    q<HTMLInputElement>('#o-work').checked = pr.autoWork;
    q<HTMLInputElement>('#o-train').checked = pr.autoTrain;
    q<HTMLInputElement>('#o-house').checked = pr.autoHouse;
    q<HTMLInputElement>('#o-aq').checked = pr.autoQuality;
    const apply = () => {
      pr.quality = q<HTMLSelectElement>('#o-q').value as typeof pr.quality;
      pr.realism = q<HTMLInputElement>('#o-realism').checked;
      pr.haze = q<HTMLInputElement>('#o-haze').checked;
      pr.perspective = q<HTMLInputElement>('#o-persp').checked;
      pr.showFps = q<HTMLInputElement>('#o-fps').checked;
      pr.fullRes = q<HTMLInputElement>('#o-fullres').checked;
      if (!pr.showFps) this.app.hud.hidePerf();
      pr.speed = +q<HTMLSelectElement>('#o-speed').value;
      pr.sfx = +q<HTMLInputElement>('#o-sfx').value;
      pr.music = +q<HTMLInputElement>('#o-music').value;
      pr.muted = q<HTMLInputElement>('#o-mute').checked;
      const xm = q<HTMLInputElement>('#o-xmusic').checked;
      if (xm !== pr.extraMusic) { pr.extraMusic = xm; audioSettings.extraMusic = xm; music.refresh(); }
      pr.oneFinger = q<HTMLSelectElement>('#o-finger').value as typeof pr.oneFinger;
      pr.twistRotate = q<HTMLInputElement>('#o-twist').checked;
      pr.showHotkeys = q<HTMLInputElement>('#o-hk').checked;
      pr.edgeScroll = q<HTMLInputElement>('#o-edge').checked;
      pr.tutorial = q<HTMLInputElement>('#o-tut').checked;
      pr.autoWork = q<HTMLInputElement>('#o-work').checked;
      pr.autoTrain = q<HTMLInputElement>('#o-train').checked;
      pr.autoHouse = q<HTMLInputElement>('#o-house').checked;
      pr.autoQuality = q<HTMLInputElement>('#o-aq').checked;
      Object.assign(audioSettings, { sfx: pr.sfx, music: pr.music, muted: pr.muted });
      applyAudioSettings();
      this.app.renderer?.setQuality(pr.quality);
      this.app.renderer?.setRealism(pr.realism);
      this.app.renderer?.setHaze(pr.haze);
      this.app.renderer?.setPerspective(pr.perspective);
      this.app.renderer?.setFullRes(pr.fullRes);
      this.app.savePrefs();
      this.app.hud.reset();
    };
    this.root.querySelectorAll('select, input').forEach((el) => el.addEventListener('change', apply));
    this.on('#o-back', () => { apply(); back(); });
    this.on('#o-fs', () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.().then(() => (screen.orientation as unknown as { lock?: (o: string) => Promise<void> })?.lock?.('landscape').catch(() => {})).catch(() => {});
    });
  }

  // ------------------------------------------------------------------ info screens

  showCivs() {
    const html = CIV_LIST.map((c) => `<div class="civinfo"><b style="font-size:15px">${c.name}</b> — ${CIV_BLURB[c.id] ?? ''}<br>Unique unit <b>${unitDef(c.unique).name}</b>: ${unitDef(c.unique).desc}<br>${c.bonuses.map((b) => '• ' + b).join('<br>')}</div>`).join('');
    this.open(`<h2>Civilizations</h2>${html}<div class="row" style="margin-top:12px"><button class="btn" id="c-back">Back</button></div>`);
    this.on('#c-back', () => this.showMain());
  }

  showHelp(back: () => void) {
    this.open(`<h2>How to Play</h2><div class="help">
      <h3>Quick start</h3>
      <ol>
        <li>Keep your <b>Town Center</b> making villagers (Auto does this for you).</li>
        <li>Villagers gather <b>food</b> (sheep, berries) and <b>wood</b> (trees). The green ✔ button sends idle villagers back to work.</li>
        <li>Build a <b>House</b> for every 5 people, then a <b>Barracks</b> for soldiers.</li>
        <li>Advance to the <b>Feudal Age</b>, train an army, select it with the ⚔ button, and tap enemy buildings to attack.</li>
      </ol>
      <p><b>Goal:</b> destroy all enemy units and buildings (Conquest), or build a Wonder and defend it for 400 seconds, or hold every Relic in your Monasteries for 400 seconds.</p>
      <h3>Touch controls</h3>
      <ul>
        <li><b>Tap</b> a unit or building to select it. <b>Double-tap</b> to select all of that type on screen.</li>
        <li>With units selected, <b>tap the ground</b> to move, <b>tap an enemy</b> to attack, <b>tap a resource</b> to gather, or <b>tap a foundation</b> to help build.</li>
        <li><b>Two-finger drag</b> scrolls the map and <b>pinch</b> zooms. A deliberate <b>two-finger twist</b> rotates the camera. One-finger drag also scrolls (or box-selects — see Settings).</li>
        <li><b>Long-press then drag</b> (or use the dashed-box button) to box-select units.</li>
        <li>With a building selected, tap the ground to set its <b>gather point</b>. Tap a resource to send new villagers straight to work.</li>
        <li><b>Long-press any command button</b> to see what it does and how much it costs.</li>
        <li>Side buttons: idle villager, select army, go to Town Center, jump to attack, box select, deselect, hide panel.</li>
      </ul>
      <h3>Mouse &amp; keyboard</h3>
      <ul>
        <li>Left-click to select, drag to box-select, right-click to command. Shift adds to selection or queues orders.</li>
        <li>Arrow keys scroll, mouse wheel zooms, PageUp/PageDown rotate. Command hotkeys are shown on the buttons.</li>
        <li><kbd>.</kbd> idle villager · <kbd>,</kbd> army · <kbd>H</kbd> Town Center · <kbd>Space</kbd> last attack · <kbd>Ctrl+1-9</kbd> make group · <kbd>1-9</kbd> select group · <kbd>Del</kbd> delete · <kbd>Esc</kbd> cancel / menu · <kbd>P</kbd> pause</li>
      </ul>
      <h3>Economy</h3>
      <ul>
        <li>Villagers gather <b>food</b> (sheep, berries, deer, boar, fish, farms), <b>wood</b>, <b>gold</b> and <b>stone</b>. Build Mills, Lumber Camps and Mining Camps next to resources so they walk less.</li>
        <li>Bring sheep home: they become yours when your units get close. Wild boar fight back — send several villagers!</li>
        <li>Each House supports 5 population. Keep your Town Center busy making villagers.</li>
        <li>Advance through the <b>Dark, Feudal, Castle and Imperial Ages</b> at the Town Center. Each advance needs resources and two different buildings of your current age.</li>
      </ul>
      <h3>Combat</h3>
      <ul>
        <li>Counters matter: <b>spearmen</b> beat cavalry, <b>skirmishers</b> beat archers, <b>archers</b> beat infantry, <b>cavalry</b> beats archers and siege, <b>rams</b> and <b>trebuchets</b> beat buildings, <b>mangonels</b> crush massed units.</li>
        <li>Research upgrades at the Blacksmith, University and military buildings. Units on higher ground deal more damage.</li>
        <li>Monks heal and <b>convert</b> enemies (wololo!). Garrison villagers in the Town Center or ring the Town Bell when raided.</li>
      </ul></div>
      <div class="row" style="margin-top:12px"><button class="btn primary" id="h-back">Back</button></div>`, !!this.app.game);
    this.on('#h-back', back);
  }

  showScores(final: boolean) {
    const g = this.app.game!;
    const rows = g.players.filter((p) => p.id).map((p) => {
      const s = p.stats;
      const military = s.kills * 10 + s.razed * 30;
      const eco = Math.floor((s.gathered.food + s.gathered.wood + s.gathered.gold + s.gathered.stone) / 10);
      const tech = s.techs * 15 + (p.age - 1) * 100;
      return `<tr style="color:${p.color}"><td>${esc(p.name)}<br><small style="color:var(--muted)">${CIVS[p.civ].name}${p.defeated ? ' · defeated' : ''}</small></td><td>${military + eco + tech}</td><td>${s.kills}/${s.losses}</td><td>${s.razed}</td><td>${Math.floor(s.gathered.food)}/${Math.floor(s.gathered.wood)}/${Math.floor(s.gathered.gold)}/${Math.floor(s.gathered.stone)}</td><td>${AGE_NAMES[p.age].replace(' Age', '')}</td><td>${[2, 3, 4].map((a) => (s.ageT[a] ? fmtTime(s.ageT[a]) : '–')).join(' / ')}</td></tr>`;
    }).join('');
    const w = g.timeLeftWonder();
    const objectives = final ? '' : `<p class="help">Destroy all enemies${g.settings.victory === 'standard' ? ', or build a Wonder and keep it for 400s, or hold all relics for 400s' : ''}.${w ? ` <b style="color:var(--gold)">${esc(g.players[w.o].name)} wins in ${Math.ceil(w.t)}s!</b>` : ''}</p>`;
    this.open(`<h2>${final ? (g.winner > 0 && g.allied(g.winner, g.human) ? '🏆 Victory!' : 'Defeat') : 'Objectives & Scores'}</h2>
      ${objectives}
      <div style="overflow-x:auto"><table class="stats-table"><tr><th>Player</th><th>Score</th><th>Kills/Lost</th><th>Razed</th><th>Food/Wood/Gold/Stone</th><th>Age</th><th>Feudal/Castle/Imp</th></tr>${rows}</table></div>
      <p style="text-align:center;color:var(--muted)">Game time ${fmtTime(g.time)}</p>
      <div class="row" style="justify-content:center;margin-top:10px">${final ? '<button class="btn" id="sc-view">Keep watching</button><button class="btn primary" id="sc-menu">Main Menu</button><button class="btn" id="sc-again">Play Again</button>' : '<button class="btn primary" id="sc-back">Back</button>'}</div>`, true);
    this.on('#sc-back', () => this.showPause());
    this.on('#sc-menu', () => this.app.quitToMenu());
    this.on('#sc-view', () => this.hideAll());
    this.on('#sc-again', () => { this.app.quitToMenu(); this.showSetup(); });
  }

  showGameOver() {
    this.showScores(true);
  }
}

function fmtTime(t: number) {
  t = Math.floor(t);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

const TITLE_SVG = `<svg class="title-art" viewBox="0 0 340 110" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="tg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6d77a"/><stop offset="1" stop-color="#a8781e"/></linearGradient></defs>
  <path d="M20 100 L60 60 L90 80 L130 40 L170 70 L210 35 L250 75 L290 50 L320 100 Z" fill="#2e2418"/>
  <g transform="translate(140 18)">
    <rect x="0" y="30" width="60" height="52" fill="#9d968a"/>
    <rect x="-14" y="18" width="18" height="64" fill="#8a8378"/><rect x="56" y="18" width="18" height="64" fill="#8a8378"/>
    <path d="M-16 18 L-5 0 L6 18Z M54 18 L65 0 L76 18Z" fill="#b0503a"/>
    <path d="M18 30 L30 10 L42 30Z" fill="#3f5f8a"/>
    <rect x="22" y="56" width="16" height="26" rx="8" fill="#3a2a1c"/>
    <path d="M30 10 L30 -6" stroke="#5a3a1e" stroke-width="2"/><path d="M30 -6 L44 -2 L30 2Z" fill="url(#tg)"/>
    ${[0, 12, 24, 36, 48].map((x) => `<rect x="${x + 2}" y="24" width="7" height="7" fill="#9d968a"/>`).join('')}
  </g>
  <rect x="0" y="98" width="340" height="12" fill="url(#tg)" opacity=".5"/>
</svg>`;

export { music };
