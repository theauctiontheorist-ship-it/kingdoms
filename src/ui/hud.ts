import { AGE_NAMES, CIVS, NODE_DEFS, RES, TECH_BY_ID, buildingDef, unitDef, type Cost, type Res } from '../data/defs';
import { T_DIRT, T_FOREST, T_GRASS, T_SAND, T_SHALLOW, T_SNOW, T_WATER } from '../sim/grid';
import { buildingStats, unitStats } from '../sim/stats';
import type { Building, Unit } from '../sim/types';
import type { Entity } from '../sim/game';
import { play } from '../audio/sfx';
import type { App, Cmd } from './app';
import { isTouch } from './app';
import { ICON, uniqIds } from './icons';
import { autoWork } from './assist';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const HOTKEYS = 'QWERTYUIASDFGHJKZXCVBNM';

export class Hud {
  app: App;
  dirty = true;
  private t = 0;
  private miniT = 0;
  private cmdKeys = '';
  private cmdEls: HTMLButtonElement[] = [];
  private cmds: Cmd[] = [];
  private infoKey = '';
  private miniBase: ImageData | null = null;
  private miniCanvas: HTMLCanvasElement | null = null;
  private tipFor: string | null = null;
  private tipTimer = 0;
  private infoExpanded = false;
  private selectionKey = '';

  constructor(app: App) {
    this.app = app;
    document.body.insertAdjacentHTML('beforeend', `
<div id="topbar" class="hidden">
  ${RES.map((r) => `<div class="res" id="res-${r}">${ICON[r]}<span>0</span></div>`).join('')}
  <div class="res" id="res-pop">${ICON.pop}<span>0/0</span></div>
  <div id="age-badge">Dark Age</div>
  <div id="wonder-timer"></div>
  <div class="spacer"></div>
  <div id="clock">00:00</div>
  <button class="tb-btn" id="btn-pause" title="Pause (P)">${ICON.pause}</button>
  <button class="tb-btn" id="btn-menu" title="Menu (F10)">${ICON.menu}</button>
</div>
<div id="sidebtns" class="hidden">
  <button class="side" id="sb-idle" title="Idle villager (.)">${ICON.idle}<span class="badge hidden">0</span></button>
  <button class="side hidden pulse" id="sb-work" title="Put idle villagers to work">${ICON.work}</button>
  <button class="side" id="sb-army" title="Select army (,)">${ICON.army}</button>
  <button class="side" id="sb-home" title="Town Center (H)">${ICON.home}</button>
  <button class="side hidden" id="sb-alert" title="Go to attack (Space)">${ICON.target}</button>
  <button class="side" id="sb-box" title="Box select">${ICON.box}</button>
  <button class="side hidden" id="sb-queue" title="Queue orders (Shift)">${ICON.queue}</button>
  <button class="side" id="sb-desel" title="Deselect (Esc)">${ICON.close}</button>
  <button class="side" id="sb-collapse" title="Hide panel">${ICON.collapse}</button>
</div>
<div id="bottom" class="hidden">
  <div id="minimap-wrap">
    <canvas id="minimap" aria-label="World map"></canvas>
    <button id="minimap-toggle" aria-label="Expand map" aria-expanded="false" aria-controls="minimap">${ICON.expand}</button>
    <button id="minimap-close" aria-label="Close map">${ICON.close}</button>
  </div>
  <div id="info" class="empty"></div>
  <div id="cmds" class="empty"></div>
</div>
<div id="tooltip" class="hidden"></div>
<div id="toasts"></div>
<div id="modebar" class="hidden"></div>
<div id="selbox" class="hidden"></div>`);
    const on = (id: string, f: () => void) => $(id).addEventListener('click', (e) => {
      e.stopPropagation();
      const el = $(id);
      if (el.dataset.long === '1') { el.dataset.long = ''; return; } // a long press already acted
      play('click'); f();
    });
    /** Press-and-hold action on a side button (touch and mouse). */
    const onHold = (id: string, f: () => void) => {
      const el = $(id);
      let timer = 0;
      el.addEventListener('pointerdown', () => { el.dataset.long = ''; timer = window.setTimeout(() => { el.dataset.long = '1'; play('click'); f(); }, 480); });
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(timer));
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    };
    on('btn-menu', () => this.app.menus.showPause());
    on('btn-pause', () => { this.app.paused = !this.app.paused; this.toast(this.app.paused ? 'Paused' : 'Resumed', undefined, 1000); });
    on('sb-idle', () => this.app.selectIdleVillager());
    on('age-badge', () => {
      // jump to the town centre that is advancing the age (or the main one)
      const g = this.app.game;
      if (!g) return;
      const own = [...g.buildings.values()].filter((b) => b.o === g.human && b.t === 'town_center' && b.done);
      const tc = own.find((b) => b.q[0]?.tech && TECH_BY_ID[b.q[0].tech].isAge) ?? own[0];
      if (!tc) return;
      this.app.select([tc.id]);
      this.app.renderer?.lookAt(...g.epos(tc));
    });
    on('sb-army', () => this.app.selectArmy());
    on('sb-work', () => {
      const n = autoWork(this.app, true);
      this.toast(n ? `${n} villager${n > 1 ? 's' : ''} sent to work` : 'Nothing to gather nearby.', n ? 'good' : undefined, 1500);
    });
    onHold('sb-idle', () => this.app.selectIdleVillager(true));
    onHold('sb-army', () => this.app.selectArmy(true));
    on('sb-queue', () => {
      this.app.queueMode = !this.app.queueMode;
      this.toast(this.app.queueMode ? 'Queue on: taps add waypoints and orders in sequence' : 'Queue off', undefined, 1800);
      this.dirty = true;
    });
    on('sb-home', () => this.app.goHome());
    on('sb-alert', () => this.app.jumpToAlert());
    on('sb-box', () => { this.app.boxMode = !this.app.boxMode; $('sb-box').classList.toggle('on', this.app.boxMode); if (this.app.boxMode) this.toast('Drag to select units', undefined, 1500); });
    on('sb-desel', () => this.app.deselect());
    on('sb-collapse', () => {
      this.closePopouts();
      document.body.classList.toggle('panel-collapsed');
      $('sb-collapse').innerHTML = document.body.classList.contains('panel-collapsed') ? ICON.expand : ICON.collapse;
    });
    on('minimap-toggle', () => this.setMapExpanded(true));
    on('minimap-close', () => this.setMapExpanded(false));
    $('info').addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('[data-info-toggle]')) return;
      e.stopPropagation();
      this.setInfoExpanded(!this.infoExpanded);
    });
    document.addEventListener('pointerdown', (e) => {
      const target = e.target as Node;
      if (!$('info').contains(target)) this.setInfoExpanded(false);
      if (!$('minimap-wrap').contains(target)) this.setMapExpanded(false);
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || (!this.infoExpanded && !$('minimap-wrap').classList.contains('expanded'))) return;
      e.preventDefault(); e.stopPropagation();
      const focus = this.infoExpanded ? $('info').querySelector<HTMLButtonElement>('.info-summary') : $('minimap-toggle');
      this.closePopouts();
      focus?.focus();
    }, true);
    if (!isTouch()) $('sb-box').classList.add('hidden');
    this.initMinimap();
  }

  /** Performance overlay (Settings → Show FPS). */
  setPerf(line1: string, line2: string, level: 'good' | 'mid' | 'bad') {
    let el = document.getElementById('perf');
    if (!el) {
      el = document.createElement('div');
      el.id = 'perf';
      el.title = 'Tap to hide (Settings → Show FPS)';
      el.addEventListener('click', () => { this.app.prefs.showFps = false; this.app.savePrefs(); this.hidePerf(); });
      document.body.appendChild(el);
    }
    el.className = level;
    el.innerHTML = `<b>${line1}</b><br>${line2}`;
    el.classList.remove('hidden');
  }

  hidePerf() {
    document.getElementById('perf')?.classList.add('hidden');
  }

  show(on: boolean) {
    if (!on) this.hidePerf();
    for (const id of ['topbar', 'sidebtns', 'bottom']) $(id).classList.toggle('hidden', !on);
    if (!on) { this.closePopouts(); $('modebar').classList.add('hidden'); $('tooltip').classList.add('hidden'); }
  }

  reset() {
    this.cmdKeys = '';
    this.infoKey = '';
    this.selectionKey = '';
    this.closePopouts();
    this.miniBase = null;
    this.dirty = true;
    $('toasts').innerHTML = '';
  }

  prewarm() {
    const r = this.app.renderer!;
    const g = this.app.game!;
    const col = g.players[g.human].color;
    r.unitIcon('villager', col);
    for (const t of ['house', 'mill', 'lumber_camp', 'mining_camp', 'farm', 'barracks'] as const) r.icon(`b:${t}:2`, col);
  }

  // ------------------------------------------------------------------ toasts

  toast(text: string, kind?: 'bad' | 'good' | 'gold', ms = 3000, onClick?: () => void) {
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = text;
    if (onClick) { el.style.cursor = 'pointer'; el.addEventListener('click', onClick); }
    box.appendChild(el);
    while (box.children.length > 4) box.removeChild(box.firstChild!);
    setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, ms);
  }

  flashRes(rs: Res[]) {
    for (const r of rs) {
      const el = $('res-' + r);
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    }
  }

  // ------------------------------------------------------------------ modebar

  updateModebar() {
    const m = this.app.mode;
    const bar = $('modebar');
    if (m.k === 'normal') { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    let label = '';
    let ok = false;
    const touch = this.app.touchInput;
    if (m.k === 'place') { label = touch ? (m.set ? `Place ${buildingDef(m.type).name} here?` : `Tap where to build the ${buildingDef(m.type).name}`) : `Click to place the ${buildingDef(m.type).name} (Shift: several)`; ok = m.set && touch; }
    else if (m.k === 'wall') { label = m.sx === undefined ? 'Tap the start of the wall' : 'Tap the end of the wall, then ✓'; ok = m.sx !== undefined; }
    else label = m.label;
    bar.innerHTML = `<span>${label}</span>${ok ? '<button class="mb-btn ok" id="mb-ok">✓</button>' : ''}<button class="mb-btn no" id="mb-no">✕</button>`;
    $('mb-no').addEventListener('click', (e) => { e.stopPropagation(); this.app.setMode({ k: 'normal' }); });
    if (ok) $('mb-ok').addEventListener('click', (e) => { e.stopPropagation(); this.app.confirmPlace(); });
  }

  // ------------------------------------------------------------------ per-frame

  update(dt: number) {
    const app = this.app;
    const g = app.game!;
    this.t += dt;
    this.miniT += dt;
    if (this.miniT > 0.25) { this.miniT = 0; this.drawMinimap(); }
    if (this.t < 0.12 && !this.dirty) return;
    this.t = 0;
    const p = g.players[g.human];
    for (const r of RES) ($('res-' + r).lastElementChild as HTMLElement).textContent = String(Math.floor(p.res[r]));
    const popEl = $('res-pop').lastElementChild as HTMLElement;
    popEl.textContent = `${p.pop}/${p.popCap}`;
    popEl.style.color = p.pop >= p.popCap ? 'var(--bad)' : '';
    // age badge
    let ageProg = -1, ageLeft = 0;
    for (const b of g.buildings.values()) {
      if (b.o !== g.human) continue;
      const q = b.q[0];
      if (q?.tech && TECH_BY_ID[q.tech].isAge) { ageProg = q.t / q.total; ageLeft = Math.max(0, q.total - q.t); }
    }
    const roman = ['', 'I', 'II', 'III', 'IV'];
    const ageEl = $('age-badge');
    ageEl.classList.toggle('busy', ageProg >= 0);
    ageEl.innerHTML = ageProg >= 0
      // advancing: show the target age, percentage, a wide bar and the time left; tap jumps to the town centre
      ? `<span class="up">▲</span><span class="full">${AGE_NAMES[p.age + 1]}</span><span class="short" style="display:none">Age ${roman[p.age + 1]}</span>`
        + `<span class="prog"><i style="width:${ageProg * 100}%"></i></span><b class="pct">${Math.floor(ageProg * 100)}%</b><span class="eta">${Math.ceil(ageLeft / Math.max(0.1, g.settings.speed ?? 1))}s</span>`
      : `<span class="full">${AGE_NAMES[p.age]}</span><span class="short" style="display:none">Age ${roman[p.age]}</span>`;
    const tm = Math.floor(g.time);
    $('clock').textContent = `${String(Math.floor(tm / 60)).padStart(2, '0')}:${String(tm % 60).padStart(2, '0')}`;
    const w = g.timeLeftWonder();
    $('wonder-timer').textContent = w ? `${g.players[w.o].name}: ${Math.ceil(w.t)}s` : '';
    // side buttons
    let idle = 0;
    for (const u of g.units.values()) if (u.o === g.human && u.t === 'villager' && u.dead === undefined && !u.inside && !u.task && u.idleT > 1) idle++;
    const badge = $('sb-idle').querySelector('.badge') as HTMLElement;
    badge.textContent = String(idle);
    badge.classList.toggle('hidden', idle === 0);
    $('sb-work').classList.toggle('hidden', idle === 0);
    $('sb-alert').classList.toggle('hidden', !app.lastAlert || g.time - app.lastAlert.t > 30);
    const hasUnits = app.ownUnits().length > 0;
    if (!hasUnits) app.queueMode = false;
    $('sb-queue').classList.toggle('hidden', !(isTouch() || app.touchInput) || !hasUnits);
    $('sb-queue').classList.toggle('on', app.queueMode);
    $('btn-pause').innerHTML = app.paused ? ICON.speed : ICON.pause;
    this.updateInfo();
    this.updateCmds();
    if (this.infoExpanded) this.positionInfoDetails();
    if ($('minimap-wrap').classList.contains('expanded')) this.positionMap();
    this.dirty = false;
  }

  // ------------------------------------------------------------------ commands

  private updateCmds() {
    const app = this.app;
    const cmds = app.mode.k === 'normal' || app.mode.k === 'target' ? app.commands() : [];
    this.cmds = cmds;
    const box = $('cmds');
    box.classList.toggle('empty', cmds.length === 0);
    $('bottom').classList.toggle('many-commands', cmds.length > 3);
    // Portrait leaves one narrow column for the map; phone buttons occupy 48px including their gap.
    const maxColumns = window.matchMedia('(orientation: portrait)').matches ? Math.max(1, Math.min(6, Math.floor((app.canvas.clientWidth - 78) / 48))) : 8;
    const columns = Math.max(1, Math.ceil(cmds.length / Math.max(1, Math.ceil(cmds.length / maxColumns))));
    box.style.setProperty('--cmd-columns', String(columns));
    const keys = cmds.map((c) => c.key).join(',') + '|' + (app.renderer?.iconsVersion ?? 0);
    if (keys !== this.cmdKeys) {
      this.cmdKeys = keys;
      this.hideTip();
      box.innerHTML = '';
      this.cmdEls = cmds.map((c, i) => {
        const el = document.createElement('button');
        el.className = 'cmd' + (c.key.startsWith('t-') ? ' tech' : c.key.startsWith('u-') ? ' unit' : c.key.startsWith('b-') ? ' bld' : '');
        el.setAttribute('aria-label', c.name);
        el.innerHTML = uniqIds(c.icon) + (app.prefs.showHotkeys && i < HOTKEYS.length ? `<span class="hk">${HOTKEYS[i]}</span>` : '')
          + '<span class="cnt"></span><span class="lock"></span><span class="price"></span><span class="bar"></span>';
        this.bindCmd(el, i);
        const slot = document.createElement('div');
        slot.className = 'cmd-slot';
        const caption = document.createElement('span');
        caption.className = 'cmd-caption';
        caption.setAttribute('aria-hidden', 'true');
        caption.textContent = ({ eco: 'Build', mil: 'Military', rally: 'Rally', bell: 'Town bell', clear: 'All clear', ungar: 'Exit', am: 'Attack', ag: 'Bombard', reseed: 'Reseed', scout: 'Auto scout', autovil: 'Auto vills' } as Record<string, string>)[c.key] ?? shortName(c.name);
        slot.append(el, caption);
        box.appendChild(slot);
        return el;
      });
    }
    cmds.forEach((c, i) => {
      const el = this.cmdEls[i];
      if (!el) return;
      el.classList.toggle('dis', !!c.disabled);
      el.classList.toggle('poor', !c.disabled && !!c.poor);
      el.classList.toggle('on', !!c.on);
      el.classList.toggle('age', !!c.age);
      (el.querySelector('.cnt') as HTMLElement).textContent = c.count ? String(c.count) : '';
      // age-locked: grey art with the required age's numeral; other blocks just grey out
      const need = /Requires (?:the )?(Feudal|Castle|Imperial)/.exec(c.disabled ?? '')?.[1];
      const lock = need ? ({ Feudal: 'II', Castle: 'III', Imperial: 'IV' } as Record<string, string>)[need] : '';
      const lockEl = el.querySelector('.lock') as HTMLElement;
      if (lockEl.textContent !== lock) lockEl.textContent = lock;
      el.classList.toggle('locked', !!lock);
      // price chips on the button itself (red where you are short) so costs read without a tooltip
      const priceEl = el.querySelector('.price') as HTMLElement;
      const price = c.cost && !lock ? priceHtml(c.cost, this.app) : '';
      if (priceEl.dataset.v !== price) { priceEl.dataset.v = price; priceEl.innerHTML = price; }
    });
    if (this.tipFor) {
      const c = cmds.find((x) => x.key === this.tipFor);
      if (c) this.showTip(c, null, 0);
    }
  }

  private bindCmd(el: HTMLButtonElement, i: number) {
    let timer = 0;
    let longFired = false;
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      longFired = false;
      if (e.pointerType !== 'mouse') {
        timer = window.setTimeout(() => {
          longFired = true;
          const c = this.cmds[i];
          if (c) this.showTip(c, el, 2200);
          if (navigator.vibrate) navigator.vibrate(15);
        }, 500);
      }
    });
    el.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      clearTimeout(timer);
      if (longFired) return; // the long-press tip hides itself
    });
    el.addEventListener('pointercancel', () => clearTimeout(timer));
    el.addEventListener('pointerleave', () => { clearTimeout(timer); if (!longFired) this.hideTip(); });
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { const c = this.cmds[i]; if (c) this.showTip(c, el); } });
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (longFired) { longFired = false; return; }
      const c = this.cmds[i];
      if (!c) return;
      this.runCmd(c, e.shiftKey);
    });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  runCmd(c: Cmd, shift = false) {
    if (c.disabled && !c.key.startsWith('b-') && !c.key.startsWith('t-') && !c.key.startsWith('u-')) { this.toast(c.disabled, 'bad', 1500); return; }
    c.act(shift);
    this.dirty = true;
  }

  hotkey(k: string, shift: boolean): boolean {
    const i = HOTKEYS.indexOf(k.toUpperCase());
    if (i < 0 || i >= this.cmds.length) return false;
    this.runCmd(this.cmds[i], shift);
    play('click');
    return true;
  }

  /** autoHide: ms until the tip closes by itself (touch), 0 = keep the current timer, -1 = stay (mouse hover). */
  private showTip(c: Cmd, anchor: HTMLElement | null, autoHide = -1) {
    const tip = $('tooltip');
    this.tipFor = c.key;
    if (autoHide !== 0) clearTimeout(this.tipTimer);
    if (autoHide > 0) this.tipTimer = window.setTimeout(() => this.hideTip(), autoHide);
    const cost = c.cost ? `<div class="cost">${costHtml(c.cost, this.app)}</div>` : '';
    tip.innerHTML = `<b>${c.name}</b>${cost}${c.desc ? `<div class="desc">${c.desc.replace(/\n/g, '<br>')}</div>` : ''}${c.disabled ? `<div class="why">${c.disabled}</div>` : ''}`;
    tip.classList.remove('hidden');
    if (anchor) {
      // Sit above the whole command panel so the tip never covers another button.
      const r = anchor.getBoundingClientRect();
      const panel = (anchor.closest('.cmd-slot')?.parentElement ?? anchor).getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = r.left + r.width / 2 - tw / 2;
      x = Math.max(6, Math.min(window.innerWidth - tw - 6, x));
      let y = panel.top - th - 8;
      if (y < 4) {
        // no room above (short landscape screens): beside the panel instead
        y = Math.max(4, panel.bottom - th);
        x = panel.left - tw - 8 >= 6 ? panel.left - tw - 8 : Math.min(window.innerWidth - tw - 6, panel.right + 8);
      }
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    }
  }

  hideTip() {
    this.tipFor = null;
    clearTimeout(this.tipTimer);
    $('tooltip').classList.add('hidden');
  }

  // ------------------------------------------------------------------ info panel

  closePopouts() {
    this.setInfoExpanded(false);
    this.setMapExpanded(false);
  }

  private setInfoExpanded(on: boolean) {
    if (on) this.setMapExpanded(false);
    this.infoExpanded = on;
    const info = $('info');
    info.classList.toggle('expanded', on);
    info.querySelector('.info-summary')?.setAttribute('aria-expanded', String(on));
    const details = info.querySelector<HTMLElement>('.info-details');
    if (details) details.hidden = !on;
    if (on) this.positionInfoDetails();
  }

  private positionInfoDetails() {
    const details = $('info').querySelector<HTMLElement>('.info-details');
    const renderer = this.app.renderer;
    if (!details || !renderer) return;
    const dock = $('bottom').getBoundingClientRect(), style = getComputedStyle($('bottom'));
    const left = dock.left + parseFloat(style.paddingLeft), right = dock.right - parseFloat(style.paddingRight);
    const width = Math.min(360, right - left);
    details.style.width = width + 'px';
    details.style.left = Math.max(left, Math.min($('info').getBoundingClientRect().left, right - width)) + 'px';
    details.style.bottom = Math.max(4, renderer.height - dock.top + 6) + 'px';
    details.style.maxHeight = Math.max(80, dock.top - $('topbar').getBoundingClientRect().bottom - 12) + 'px';
  }

  private setMapExpanded(on: boolean) {
    const wrap = $('minimap-wrap');
    if (wrap.classList.contains('expanded') === on) return;
    if (on) this.setInfoExpanded(false);
    wrap.classList.toggle('expanded', on);
    $('minimap-toggle').setAttribute('aria-expanded', String(on));
    if (on) this.positionMap();
    else { wrap.style.removeProperty('--mini-size'); wrap.style.removeProperty('bottom'); }
    this.drawMinimap();
  }

  private positionMap() {
    const renderer = this.app.renderer;
    if (!renderer) return;
    const wrap = $('minimap-wrap'), dock = $('bottom').getBoundingClientRect(), style = getComputedStyle($('bottom'));
    const availableWidth = dock.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    // Leave the right side of a phone available for the world while the map is open.
    const size = Math.max(80, Math.min(260, availableWidth * 0.68, dock.top - $('topbar').getBoundingClientRect().bottom - 12));
    wrap.style.setProperty('--mini-size', size + 'px');
    wrap.style.bottom = Math.max(4, renderer.height - dock.top + 6) + 'px';
  }

  private renderInfo(details: string, icon: string, name: string, meta: string, health?: number, stats = '') {
    $('info').innerHTML = `<button class="info-summary" data-info-toggle aria-expanded="${this.infoExpanded}" aria-controls="info-details" aria-label="${name}: show or hide details">
      <span class="info-thumb">${icon}</span><span class="info-summary-text"><span class="info-name">${name}</span><span class="info-summary-meta">${meta}</span>${health !== undefined ? `<span class="hpbar ${health < 0.3 ? 'low' : health < 0.6 ? 'mid' : ''}"><i style="width:${Math.max(0, Math.min(100, health * 100))}%"></i></span>` : ''}${stats ? `<span class="info-summary-stats">${stats}</span>` : ''}</span><span class="info-chevron" aria-hidden="true">${ICON.expand}</span>
    </button><div id="info-details" class="info-details" role="region" aria-label="Selection details" ${this.infoExpanded ? '' : 'hidden'}><button class="info-close" data-info-toggle aria-label="Close selection details">${ICON.close}</button>${details}</div>`;
  }

  private updateInfo() {
    const app = this.app;
    const g = app.game!;
    const r = app.renderer!;
    const sel = app.selected();
    const info = $('info');
    const selectionKey = sel.map((e) => e.id).join(',');
    if (selectionKey !== this.selectionKey) { this.setInfoExpanded(false); this.selectionKey = selectionKey; }
    if (!sel.length) { info.classList.add('empty'); info.innerHTML = ''; this.infoKey = ''; return; }
    info.classList.remove('empty');
    const me = g.human;
    if (sel.length > 1) {
      const key = 'm' + sel.map((e) => e.id).join(',') + sel.map((e) => (e.k === 'u' ? Math.round(e.hp) : 0)).join('');
      if (key === this.infoKey) return;
      this.infoKey = key;
      const max = 23;
      const items = sel.slice(0, max).map((e) => {
        if (e.k === 'u') {
          const st = e.o > 0 ? unitStats(g.players[e.o], e.t) : unitDef(e.t);
          return `<div class="mu" data-id="${e.id}"><img src="${this.unitIconSrc(e, 64)}"><div class="h"><i style="width:${Math.max(0, (e.hp / st.hp) * 100)}%"></i></div></div>`;
        }
        if (e.k === 'b') return `<div class="mu" data-id="${e.id}"><img src="${r.icon(`b:${e.t}:2`, g.players[e.o].color, 64)}"></div>`;
        return '';
      }).join('');
      const first = sel[0];
      const icon = first.k === 'u' ? `<img alt="" src="${this.unitIconSrc(first, 64)}">` : first.k === 'b' ? `<img alt="" src="${r.icon(r.buildingKey(first), g.players[first.o].color, 64)}">` : ICON.pop;
      this.renderInfo(`<div class="multi">${items}${sel.length > max ? `<div class="mu" style="display:grid;place-items:center;font-weight:700">+${sel.length - max}</div>` : ''}</div>`, icon, `${sel.length} selected`, 'Tap for unit list');
      info.querySelectorAll<HTMLElement>('.mu[data-id]').forEach((el) => el.addEventListener('click', (ev) => { ev.stopPropagation(); app.select([+el.dataset.id!]); }));
      return;
    }
    const e = sel[0];
    let key = e.id + ':';
    let html = '';
    let summaryIcon = '', summaryName = '', summaryMeta = '', summaryStats = '';
    let summaryHealth: number | undefined;
    if (e.k === 'u') {
      const d = unitDef(e.t);
      const owner = g.players[e.o];
      const st = e.o > 0 ? unitStats(owner, e.t) : { hp: d.hp, atk: d.atk, armorM: d.armor[0], armorP: d.armor[1], range: d.range, los: d.los };
      const frac = e.hp / st.hp;
      const status = this.unitStatus(e);
      key += Math.round(e.hp) + status + (e.ca | 0) + (e.cargo?.length ?? 0) + Math.round(e.rest ?? 0) + ':' + Math.floor(e.food ?? 0) + `:${st.hp},${st.atk},${st.armorM},${st.armorP},${st.range}`;
      if (key === this.infoKey) return;
      this.infoKey = key;
      const ownerTxt = e.o === 0 ? 'Gaia' : `${owner.name} · ${CIVS[owner.civ].name}`;
      const food = e.food !== undefined && (e.dead !== undefined || d.cls.includes('animal')) ? ` · Food ${Math.floor(e.food)}` : '';
      summaryIcon = `<img alt="" src="${this.unitIconSrc(e, 64)}">`;
      summaryName = d.name;
      summaryMeta = food ? `Food ${Math.floor(e.food!)} · ${status}` : status;
      summaryHealth = frac;
      summaryStats = `<span>${Math.ceil(e.hp)}/${st.hp} HP</span>${st.atk ? `<span aria-label="Attack ${Math.round(st.atk)}">${ICON.atk}${Math.round(st.atk)}</span>` : ''}<span aria-label="Melee armour ${st.armorM}">${ICON.marmor}${st.armorM}</span><span aria-label="Pierce armour ${st.armorP}">${ICON.parmor}${st.armorP}</span>${st.range ? `<span aria-label="Range ${st.range}">${ICON.range}${st.range}</span>` : ''}`;
      html = `<div class="portrait"><img src="${this.unitIconSrc(e, 96)}"></div>
<div class="info-main">
  <div class="info-name">${d.name}</div>
  <div class="info-owner" style="color:${owner?.color ?? '#aaa'}">${ownerTxt}${food}</div>
  <div class="hpbar ${frac < 0.3 ? 'low' : frac < 0.6 ? 'mid' : ''}"><i style="width:${Math.max(0, frac * 100)}%"></i></div>
  <div class="hptext">${Math.ceil(e.hp)} / ${st.hp}</div>
  <div class="stats">${st.atk ? `<span>${ICON.atk}${Math.round(st.atk)}</span>` : ''}<span>${ICON.marmor}${st.armorM}</span><span>${ICON.parmor}${st.armorP}</span>${st.range ? `<span>${ICON.range}${st.range}</span>` : ''}</div>
  <div class="status">${status}</div>
</div>`;
    } else if (e.k === 'b') {
      const d = buildingDef(e.t);
      const owner = g.players[e.o];
      const bs = buildingStats(owner, e.t);
      const frac = e.hp / bs.hp;
      key += Math.round(e.hp) + '|' + e.q.map((q) => String(q.u ?? q.tech) + Math.round((q.t / q.total) * 20)).join(',') + '|' + Math.round(e.prog * 50) + '|' + e.gar.length + '|' + Math.round(e.food ?? 0) + (e.relics?.length ?? 0) + `:${bs.hp},${bs.atk},${bs.range},${bs.garrison}`;
      if (key === this.infoKey) return;
      this.infoKey = key;
      let status = '';
      if (!e.done) status = `Under construction: ${Math.floor(e.prog * 100)}%`;
      else if (e.t === 'farm') status = `Food: ${Math.floor(e.food ?? 0)}`;
      else if (e.gar.length) status = `Garrisoned: ${e.gar.length}/${bs.garrison}`;
      else if (e.t === 'monastery') status = `Relics: ${e.relics?.length ?? 0} (+${((e.relics?.length ?? 0) * 0.5).toFixed(1)} gold/s)`;
      else if (bs.atk) status = `Arrows: ${Math.round(bs.atk)} dmg · range ${bs.range}`;
      const queue = e.o === me && e.q.length ? `<div class="queue">${this.queueHtml(e)}</div>` : '';
      summaryIcon = `<img alt="" src="${r.icon(r.buildingKey(e), owner.color, 64)}">`;
      summaryName = d.name;
      const first = e.q[0];
      summaryMeta = first ? `${first.u ? unitDef(first.u).name : TECH_BY_ID[first.tech!].name} ${Math.floor(first.t / first.total * 100)}% · ${e.q.length} queued` : status || `${Math.ceil(e.hp)}/${bs.hp} HP`;
      summaryHealth = frac;
      summaryStats = `<span>${Math.ceil(e.hp)}/${bs.hp} HP</span>${bs.atk ? `<span aria-label="Attack ${Math.round(bs.atk)}">${ICON.atk}${Math.round(bs.atk)}</span><span aria-label="Range ${bs.range}">${ICON.range}${bs.range}</span>` : ''}${bs.garrison ? `<span aria-label="Garrison ${e.gar.length} of ${bs.garrison}">${ICON.garrison}${e.gar.length}/${bs.garrison}</span>` : ''}`;
      html = `<div class="portrait"><img src="${r.icon(r.buildingKey(e), owner.color)}"></div>
<div class="info-main">
  <div class="info-name">${d.name}</div>
  <div class="info-owner" style="color:${owner.color}">${owner.name} · ${CIVS[owner.civ].name}</div>
  <div class="hpbar ${frac < 0.3 ? 'low' : frac < 0.6 ? 'mid' : ''}"><i style="width:${Math.max(0, frac * 100)}%"></i></div>
  <div class="hptext">${Math.ceil(e.hp)} / ${bs.hp}</div>
  ${queue || `<div class="status">${status}</div>`}
</div>`;
    } else if (e.k === 'r') {
      key += Math.floor(e.amt);
      if (key === this.infoKey) return;
      this.infoKey = key;
      const nd = NODE_DEFS[e.t];
      summaryIcon = ICON[nd.res]; summaryName = nd.name; summaryMeta = `${Math.floor(e.amt)} ${nd.res}`;
      html = `<div class="portrait">${ICON[nd.res]}</div><div class="info-main"><div class="info-name">${nd.name}</div><div class="status">${Math.floor(e.amt)} ${nd.res} remaining</div></div>`;
    } else if (e.k === 'relic') {
      if (this.infoKey === key) return;
      this.infoKey = key;
      summaryIcon = ICON.relic; summaryName = 'Relic'; summaryMeta = 'Collect with a Monk';
      html = `<div class="portrait">${ICON.relic}</div><div class="info-main"><div class="info-name">Relic</div><div class="status" style="white-space:normal">Pick up with a Monk and bring to a Monastery for a steady gold income.</div></div>`;
    }
    this.renderInfo(html, summaryIcon, summaryName, summaryMeta, summaryHealth, summaryStats);
    info.querySelectorAll<HTMLElement>('.qitem').forEach((el) => el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const b = sel[0] as Building;
      g.cmdCancel(me, b.id, +el.dataset.i!);
      play('click');
      this.infoKey = '';
    }));
  }

  private queueHtml(b: Building) {
    const r = this.app.renderer!;
    const g = this.app.game!;
    const col = g.players[b.o].color;
    // group consecutive identical units
    const out: string[] = [];
    b.q.forEach((q, i) => {
      const prog = i === 0 ? `<span class="bar" style="width:${(q.t / q.total) * 100}%"></span>` : '';
      const img = q.u ? `<img src="${r.unitIcon(q.u, col, 64)}">` : ICON[TECH_BY_ID[q.tech!].icon] ?? ICON.up;
      out.push(`<div class="qitem" data-i="${i}" title="Tap to cancel">${img}${prog}</div>`);
    });
    return out.join('');
  }

  unitIconSrc(u: Unit, size: number) {
    const g = this.app.game!;
    const col = g.players[u.o]?.color ?? '#888';
    return this.app.renderer!.unitIcon(u.t, col, size, u.t === 'villager' ? (u.fem ? 'f' : 'm') : '');
  }

  unitIconKey(u: Unit) {
    if (u.t === 'villager') return `u:villager:idle:${u.gk ?? 'none'}|none|${u.fem ? 'f' : 'm'}`;
    if (u.t === 'trebuchet') return 'u:trebuchet:idle:packed';
    return `u:${u.t}:idle:`;
  }

  private unitStatus(u: Unit): string {
    const g = this.app.game!;
    if (u.dead !== undefined) return 'Dead';
    if (u.cargo?.length) return `Carrying ${u.cargo.length} units`;
    if (u.relic) return 'Carrying a relic';
    if (u.rest && u.rest > 0) return `Recovering faith (${Math.ceil(u.rest)}s)`;
    if (u.t === 'trebuchet' && u.packT) return u.packed ? 'Unpacking…' : 'Packing…';
    const carry = u.ca >= 1 && u.ct ? ` (${Math.floor(u.ca)} ${u.ct})` : '';
    const t = u.task;
    if (!t) return 'Idle' + carry;
    const tgt: Entity | undefined = g.get(t.id);
    const name = (e?: Entity) => !e ? '' : e.k === 'u' ? unitDef(e.t).name : e.k === 'b' ? buildingDef(e.t).name : e.k === 'r' ? NODE_DEFS[e.t].name : 'Relic';
    switch (t.k) {
      case 'move': return (t.am ? 'Attack-moving' : 'Moving') + carry;
      case 'patrol': return 'Patrolling';
      case 'attack': return `Attacking ${name(tgt)}`;
      case 'gather': return u.sub === 1 ? `Returning resources${carry}` : `Gathering${u.ct ? ' ' + u.ct : ''}${carry}`;
      case 'build': return `Building ${name(tgt)}`;
      case 'repair': return `Repairing ${name(tgt)}`;
      case 'garrison': return `Garrisoning in ${name(tgt)}`;
      case 'heal': return `Healing ${name(tgt)}`;
      case 'convert': return `Converting ${name(tgt)}`;
      case 'relic': return 'Fetching a relic';
      case 'unload': return 'Unloading';
      case 'follow': return `Following ${name(tgt)}`;
      case 'attackGround': return 'Bombarding';
    }
    return '';
  }

  // ------------------------------------------------------------------ minimap

  private initMinimap() {
    const cv = $<HTMLCanvasElement>('minimap');
    const handle = (e: PointerEvent) => {
      const app = this.app;
      if (!$('minimap-wrap').classList.contains('expanded')) return;
      if (!app.game || !app.renderer) return;
      const w = this.miniToWorld(e);
      if (!w) return;
      if (e.button === 2 || (e.type === 'pointerdown' && e.pointerType !== 'mouse' && app.mode.k === 'target' && app.mode.action === 'attackmove')) {
        app.command(0, 0, null, w);
        return;
      }
      app.renderer.lookAt(w.x, w.y);
    };
    let down = false;
    cv.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); down = true; try { cv.setPointerCapture(e.pointerId); } catch { /* ignore */ } handle(e); });
    cv.addEventListener('pointermove', (e) => { if (down && e.buttons !== 2) handle(e); });
    cv.addEventListener('pointerup', (e) => { down = false; try { cv.releasePointerCapture(e.pointerId); } catch { /* ignore */ } });
    cv.addEventListener('pointercancel', () => { down = false; });
    cv.addEventListener('lostpointercapture', () => { down = false; });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private miniToWorld(e: PointerEvent): { x: number; y: number } | null {
    const g = this.app.game!, r = this.app.renderer!;
    const cv = $<HTMLCanvasElement>('minimap');
    const rect = cv.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    const S = g.grid.size;
    const scale = rect.width / (S * Math.SQRT2);
    // inverse rotate
    const a = -r.yaw;
    const x = (px * Math.cos(a) - py * Math.sin(a)) / scale + S / 2;
    const y = (px * Math.sin(a) + py * Math.cos(a)) / scale + S / 2;
    if (x < 0 || y < 0 || x > S || y > S) return null;
    return { x, y };
  }

  private drawMinimap() {
    const app = this.app;
    const g = app.game, r = app.renderer;
    if (!g || !r) return;
    const cv = $<HTMLCanvasElement>('minimap');
    const S = g.grid.size;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    if (!this.miniBase || this.miniBase.width !== S) {
      this.miniBase = new ImageData(S, S);
      const cols: Record<number, [number, number, number]> = {
        [T_GRASS]: [86, 140, 58], [T_WATER]: [44, 104, 150], [T_SHALLOW]: [120, 160, 170], [T_SAND]: [206, 186, 128],
        [T_DIRT]: [150, 124, 80], [T_FOREST]: [40, 90, 36], [T_SNOW]: [225, 232, 236],
      };
      const desert = g.settings.mapType === 'oasis';
      for (let i = 0; i < S * S; i++) {
        let t = g.grid.terrain[i];
        if (desert && t === T_GRASS) t = T_SAND;
        const c = cols[t] ?? cols[T_GRASS];
        const hgt = g.grid.height[(Math.floor(i / S)) * (S + 1) + (i % S)];
        const k = 1 + Math.max(0, hgt - 0.3) * 0.08;
        this.miniBase.data[i * 4] = c[0] * k; this.miniBase.data[i * 4 + 1] = c[1] * k; this.miniBase.data[i * 4 + 2] = c[2] * k; this.miniBase.data[i * 4 + 3] = 255;
      }
      this.miniCanvas = document.createElement('canvas');
      this.miniCanvas.width = this.miniCanvas.height = S;
    }
    const img = new ImageData(new Uint8ClampedArray(this.miniBase.data), S, S);
    const d = img.data;
    const put = (x: number, y: number, c: [number, number, number]) => {
      if (x < 0 || y < 0 || x >= S || y >= S) return;
      const i = (y * S + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
    };
    for (const n of g.nodes.values()) {
      if (n.t === 'tree' || !g.canSee(n)) continue;
      put(n.x, n.y, n.t === 'gold' ? [255, 214, 60] : n.t === 'stone' ? [200, 200, 200] : n.t === 'berry' ? [200, 60, 90] : [160, 210, 230]);
    }
    for (const rl of g.relics.values()) if (!rl.carrier && !rl.mon && g.canSee(rl)) { put(Math.floor(rl.x), Math.floor(rl.y), [255, 255, 255]); }
    const pc = g.players.map((p) => hexRgb(p.color));
    for (const b of g.buildings.values()) {
      if (!g.canSee(b)) continue;
      const s = buildingDef(b.t).size;
      const c = pc[b.o];
      for (let y = b.y; y < b.y + s; y++) for (let x = b.x; x < b.x + s; x++) put(x, y, c);
    }
    for (const u of g.units.values()) {
      if (u.dead !== undefined || u.inside || !g.canSee(u)) continue;
      const c = u.o === 0 ? (u.t === 'wolf' ? [140, 140, 140] as [number, number, number] : [240, 240, 220] as [number, number, number]) : pc[u.o];
      const x = Math.floor(u.x), y = Math.floor(u.y);
      put(x, y, c); put(x + 1, y, c); put(x, y + 1, c); put(x + 1, y + 1, c);
    }
    // fog
    for (let i = 0; i < S * S; i++) {
      if (g.visible[i]) continue;
      const k = g.explored[i] ? 0.55 : 0;
      d[i * 4] *= k; d[i * 4 + 1] *= k; d[i * 4 + 2] *= k;
    }
    this.miniCanvas!.getContext('2d')!.putImageData(img, 0, 0);
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const scale = W / (S * Math.SQRT2);
    ctx.translate(W / 2, H / 2);
    ctx.rotate(r.yaw);
    ctx.scale(scale, scale);
    ctx.translate(-S / 2, -S / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.miniCanvas!, 0, 0);
    // viewport
    const corners = [[0, 0], [r.width, 0], [r.width, r.height], [0, r.height]].map(([x, y]) => r.groundAt(x, y, 0.3));
    if (corners.every((c) => c)) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.2 / scale;
      ctx.beginPath();
      corners.forEach((c, i) => (i ? ctx.lineTo(c!.x, c!.y) : ctx.moveTo(c!.x, c!.y)));
      ctx.closePath();
      ctx.stroke();
    }
    // alert ping
    if (app.lastAlert && g.time - app.lastAlert.t < 6) {
      ctx.strokeStyle = '#ff4a3d';
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      ctx.arc(app.lastAlert.x, app.lastAlert.y, 3 + ((g.time * 4) % 4), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function hexRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16);
  if (h.length <= 4) {
    const r = parseInt(h[1] + h[1], 16), g = parseInt(h[2] + h[2], 16), b = parseInt(h[3] + h[3], 16);
    return [r, g, b];
  }
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const SHORT: Record<string, string> = {
  'Town Center': 'Town Ctr', 'Watch Tower': 'Tower', 'Guard Tower': 'Tower', 'Siege Workshop': 'Siege', 'Archery Range': 'Archery',
  'Lumber Camp': 'Lumber', 'Mining Camp': 'Mining', 'Palisade Wall': 'Palisade', 'Palisade Gate': 'P. Gate', 'Stone Wall': 'Wall',
  'Stone Gate': 'Gate', 'University': 'Univ.', 'Blacksmith': 'Smithy', 'Wheelbarrow': 'Barrow',
  'Hand Cart': 'Handcart', 'Town Watch': 'Watch', 'Town Patrol': 'Patrol', 'Fishing Ship': 'Fisher', 'Transport Ship': 'Transport',
  'Battering Ram': 'Ram', 'Scout Cavalry': 'Scout', 'Skirmisher': 'Skirm.', 'Man-at-Arms': 'M-at-Arms', 'Long Swordsman': 'Long Sw.',
  'Cavalry Archer': 'Cav. Archer', 'Stand Ground': 'Stand', 'Aggressive': 'Aggress.', 'Defensive': 'Defend',
};
/** Button caption: drop verbs and age suffixes, then use a short form for long names. */
function shortName(name: string) {
  const n = name.replace(/^(Train|Research|Build|Advance to( the)?) /, '').replace(/ Age$/, '');
  return SHORT[n] ?? n;
}

const RES_COL: Record<string, string> = { food: '#e8705a', wood: '#c08a50', gold: '#f2c84a', stone: '#b8b4ac' };
/** Compact cost chips for a command button: coloured dot + amount, red when unaffordable. */
function priceHtml(c: Cost, app: App) {
  const g = app.game;
  const p = g ? g.players[g.human] : null;
  return (Object.keys(c) as Res[]).filter((k) => (c[k] ?? 0) > 0).map((k) => {
    const v = c[k] ?? 0;
    const short = p && p.res[k] < v;
    return `<span class="${short ? 'no' : ''}"><i style="background:${RES_COL[k]}"></i>${v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + 'k' : v}</span>`;
  }).join('');
}

export function costHtml(c: Cost, app: App) {
  const g = app.game;
  const p = g ? g.players[g.human] : null;
  return (Object.keys(c) as Res[]).filter((k) => (c[k] ?? 0) > 0).map((k) => `<span style="color:${p && p.res[k] < (c[k] ?? 0) ? 'var(--bad)' : ''}">${ICON[k]}${c[k]}</span>`).join('');
}
