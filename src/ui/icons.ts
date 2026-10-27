// Inline SVG glyphs for resources, commands and technologies.

const S = (body: string, vb = '0 0 24 24') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ICON: Record<string, string> = {
  food: S('<path d="M7 3c3 0 6 3 6 7 0 2-1 3-2 4l6 6-2 2-6-6c-1 1-2 2-4 2-3 0-4-3-4-6 0-5 3-9 6-9z" fill="#e0603a"/><circle cx="6" cy="8" r="2" fill="#ffb08a"/><path d="M15 17l3 3" stroke="#f3e5c8" stroke-width="2"/>'),
  wood: S('<rect x="2" y="9" width="20" height="7" rx="3.5" fill="#9a6232"/><ellipse cx="20" cy="12.5" rx="2.5" ry="3.5" fill="#e0b070"/><ellipse cx="20" cy="12.5" rx="1" ry="1.6" fill="#9a6232"/><rect x="2" y="4" width="14" height="5" rx="2.5" fill="#7a4a22"/><ellipse cx="15" cy="6.5" rx="2" ry="2.5" fill="#d8a868"/>'),
  gold: S('<ellipse cx="12" cy="17" rx="8" ry="3" fill="#b8860b"/><rect x="4" y="11" width="16" height="6" fill="#d4a017"/><ellipse cx="12" cy="11" rx="8" ry="3" fill="#ffd54a"/><ellipse cx="12" cy="11" rx="4" ry="1.4" fill="#fff0a0"/>'),
  stone: S('<path d="M3 18l3-8 6-4 7 3 2 9z" fill="#9e9a92"/><path d="M6 10l6-4 7 3-6 3z" fill="#c8c4bc"/><path d="M12 12l7-3 2 9-8 0z" fill="#7e7a72"/>'),
  pop: S('<circle cx="9" cy="7" r="3.2" fill="#f2d6b0"/><path d="M3 20c0-5 3-8 6-8s6 3 6 8z" fill="#5a8fd8"/><circle cx="17" cy="8" r="2.6" fill="#e8c8a0"/><path d="M13 20c0-4 2-7 4-7s5 3 5 7z" fill="#c05a3a"/>'),
  menu: S('<rect x="3" y="5" width="18" height="2.6" rx="1.3" fill="#f0c860"/><rect x="3" y="11" width="18" height="2.6" rx="1.3" fill="#f0c860"/><rect x="3" y="17" width="18" height="2.6" rx="1.3" fill="#f0c860"/>'),
  stop: S('<defs><linearGradient id="gSt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef5a48"/><stop offset="1" stop-color="#a8261a"/></linearGradient></defs><path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" fill="url(#gSt)" stroke="#fff" stroke-width="1.4"/><rect x="6.5" y="10.4" width="11" height="3.2" rx="1" fill="#fff"/>'),
  attackmove: S('<path d="M3 21l10-10" stroke="#e8edf2" stroke-width="3" stroke-linecap="round"/><path d="M2 22l2.5-.5-2-2z" fill="#9a6232"/><path d="M6 14l4 4" stroke="#c9a040" stroke-width="2.4"/><path d="M12 4h8v8" stroke="#ff6a4a" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4l-6 6" stroke="#ff6a4a" stroke-width="2.6" stroke-linecap="round"/>'),
  patrol: S('<path d="M4 8h13l-3.4-3.4" stroke="#8fd0ff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 16H7l3.4 3.4" stroke="#8fd0ff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="16" r="2" fill="#ffd060"/><circle cx="20" cy="8" r="2" fill="#ffd060"/>'),
  garrison: S('<defs><linearGradient id="gGa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0cabe"/><stop offset="1" stop-color="#8a8478"/></linearGradient></defs><path d="M4 21V7l2-1.4V4h2.4v1.6h2.2V4h2.8v1.6h2.2V4H18v1.6L20 7v14z" fill="url(#gGa)" stroke="#3a3a3a" stroke-width=".9"/><path d="M9 21v-5a3 3 0 0 1 6 0v5z" fill="#2a1d12"/><path d="M12 7.5v6.5M9 11l3 3 3-3" stroke="#7be07a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  ungarrison: S('<defs><linearGradient id="gUg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0cabe"/><stop offset="1" stop-color="#8a8478"/></linearGradient></defs><path d="M4 21V7l2-1.4V4h2.4v1.6h2.2V4h2.8v1.6h2.2V4H18v1.6L20 7v14z" fill="url(#gUg)" stroke="#3a3a3a" stroke-width=".9"/><path d="M9 21v-5a3 3 0 0 1 6 0v5z" fill="#2a1d12"/><path d="M12 14V7.5M9 10.5l3-3 3 3" stroke="#ffd060" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  del: S('<defs><linearGradient id="gDe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d04a38"/><stop offset="1" stop-color="#7a1e12"/></linearGradient></defs><path d="M6 7.5h12l-1.2 13a1.5 1.5 0 0 1-1.5 1.4H8.7a1.5 1.5 0 0 1-1.5-1.4z" fill="url(#gDe)" stroke="#2a0a06" stroke-width=".9"/><rect x="3.5" y="4.5" width="17" height="3" rx="1.2" fill="#e05a48" stroke="#2a0a06" stroke-width=".9"/><path d="M10 2.5h4v2h-4z" fill="#e05a48" stroke="#2a0a06" stroke-width=".8"/><path d="M10 11v8M14 11v8" stroke="#ffd6cc" stroke-width="1.6" stroke-linecap="round"/>'),
  buildeco: S('<defs><linearGradient id="gBe1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2d08a"/><stop offset="1" stop-color="#b98a44"/></linearGradient></defs><defs><linearGradient id="gBe2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4553a"/><stop offset="1" stop-color="#7e2a1c"/></linearGradient></defs><path d="M3 12.5l8-6.5 8 6.5V21H3z" fill="url(#gBe1)" stroke="#3a2410" stroke-width="1"/><path d="M1.2 13L11 5l9.8 8" stroke="url(#gBe2)" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="15" width="4" height="6" fill="#4a2e16"/><rect x="5" y="14" width="2.6" height="2.6" fill="#3a5f88"/><g transform="rotate(35 18 7)"><rect x="17" y="3" width="2" height="10" rx="1" fill="#8b5a2b" stroke="#2a1a0a" stroke-width=".6"/><rect x="14" y="2" width="8" height="3.4" rx="1" fill="#c8ccd2" stroke="#2a2a2a" stroke-width=".6"/></g>'),
  buildmil: S('<defs><linearGradient id="gBm1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6d0c4"/><stop offset="1" stop-color="#8a8478"/></linearGradient></defs><defs><linearGradient id="gBm2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e94a3a"/><stop offset="1" stop-color="#8a1e14"/></linearGradient></defs><path d="M2.5 21V10.5l2.4-1.6 2.4 1.6 2.4-1.6 2.4 1.6 2.4-1.6 2.4 1.6 2.4-1.6 2.4 1.6V21z" fill="url(#gBm1)" stroke="#3a3a3a" stroke-width=".9"/><rect x="9.6" y="15.5" width="4.2" height="5.5" rx="2" fill="#3a2a1c"/><path d="M5 3l9 9M14 3l-9 9" stroke="#eef2f6" stroke-width="2.2" stroke-linecap="round"/><path d="M4 5l3-3M15 5l-3-3" stroke="#c9a040" stroke-width="2"/><path d="M17.5 2.5h5v4.2c0 2.5-2.5 4-2.5 4s-2.5-1.5-2.5-4z" fill="url(#gBm2)" stroke="#2a0a06" stroke-width=".8"/>'),
  repair: S('<path d="M13.8 3.2a5 5 0 0 0-5.6 6.4L2.6 15.2a1.9 1.9 0 0 0 2.7 2.7l5.6-5.6a5 5 0 0 0 6.4-5.6l-2.9 2.9-2.4-.6-.6-2.4z" fill="#cfd4da" stroke="#2a2e33" stroke-width="1"/><g transform="rotate(-40 16 16)"><rect x="15" y="10" width="2.4" height="12" rx="1" fill="#9a6232" stroke="#2a1a0a" stroke-width=".6"/><rect x="11.5" y="8" width="9.5" height="4" rx="1" fill="#8d949b" stroke="#2a2a2a" stroke-width=".7"/></g>'),
  back: S('<path d="M15 3.5L6.5 12l8.5 8.5" stroke="#f0c860" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  bell: S('<defs><linearGradient id="gBl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe07a"/><stop offset="1" stop-color="#b8860b"/></linearGradient></defs><path d="M12 2.5a6.2 6.2 0 0 0-6.2 6.2v5L3.5 17.5h17L18.2 13.7v-5A6.2 6.2 0 0 0 12 2.5z" fill="url(#gBl)" stroke="#5a3a08" stroke-width="1"/><circle cx="12" cy="19.6" r="2.2" fill="#a07818" stroke="#5a3a08" stroke-width=".8"/><path d="M1.5 9a10 10 0 0 1 2.5-5M22.5 9a10 10 0 0 0-2.5-5" stroke="#ffd060" stroke-width="1.6" fill="none" stroke-linecap="round"/>'),
  allclear: S('<defs><linearGradient id="gAc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9af08a"/><stop offset="1" stop-color="#3a9a3a"/></linearGradient></defs><path d="M12 2.5a6.2 6.2 0 0 0-6.2 6.2v5L3.5 17.5h17L18.2 13.7v-5A6.2 6.2 0 0 0 12 2.5z" fill="url(#gAc)" stroke="#143a14" stroke-width="1"/><circle cx="12" cy="19.6" r="2.2" fill="#2a7a2a"/><path d="M8.2 10.2l2.8 2.8 5-5.6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  rally: S('<path d="M6 22V2.5" stroke="#6b4a2b" stroke-width="2.6" stroke-linecap="round"/><path d="M7 3.5h12.5l-3.2 4.2 3.2 4.2H7z" fill="#4aa8f0" stroke="#123a5a" stroke-width=".9" stroke-linejoin="round"/><ellipse cx="6" cy="21.6" rx="4" ry="1.2" fill="#00000055"/>'),
  unload: S('<path d="M2.5 13h19l-3.2 6.5H5.7z" fill="#9a6232" stroke="#2a1a0a" stroke-width=".9"/><path d="M2 21.5c3 1 6-1 10 0s7 1 10 0" stroke="#5ab8ff" stroke-width="1.6" fill="none"/><path d="M12 11V2.5M8.5 7.5L12 11l3.5-3.5" stroke="#ffd060" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  target: S('<circle cx="12" cy="12" r="8" fill="none" stroke="#ff5a4a" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="#ff5a4a" stroke-width="2"/><circle cx="12" cy="12" r="1.3" fill="#ff5a4a"/>'),
  aggressive: S('<path d="M4.5 19.5L16 8" stroke="#e8edf2" stroke-width="3.2" stroke-linecap="round"/><path d="M16 8l4.5-4.5-1 4z" fill="#e8edf2"/><path d="M3.5 15.5l5 5" stroke="#c9a040" stroke-width="2.6" stroke-linecap="round"/><path d="M3 21l2-2" stroke="#6b4a2b" stroke-width="3" stroke-linecap="round"/><path d="M13 14.5l7 1.5M11 17.5l7 3.5M16.5 11.5l5.5-.5" stroke="#ff5a3a" stroke-width="2" stroke-linecap="round"/>'),
  defensive: S('<path d="M12 2l8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5z" fill="#5a8fd8"/><path d="M12 5v14" stroke="#fff" stroke-width="1.5"/>'),
  stand: S('<path d="M2 21h20" stroke="#8a6a46" stroke-width="2.6" stroke-linecap="round"/><path d="M4.5 9h4.2v6.5l3.3 1.6V20H4.5z" fill="#8b5a2b" stroke="#2a1a0a" stroke-width=".8"/><path d="M12.8 9H17v6.5l3.3 1.6V20h-7.5z" fill="#8b5a2b" stroke="#2a1a0a" stroke-width=".8"/><path d="M6.6 2.5v4M14.9 2.5v4" stroke="#ffd060" stroke-width="2" stroke-linecap="round"/><path d="M4.8 4.8l1.8 1.8 1.8-1.8M13.1 4.8l1.8 1.8 1.8-1.8" stroke="#ffd060" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  noattack: S('<circle cx="12" cy="12" r="8" fill="none" stroke="#c0392b" stroke-width="2.4"/><path d="M6 18L18 6" stroke="#c0392b" stroke-width="2.4"/><path d="M9 9l6 6" stroke="#e0e6ee" stroke-width="2"/>'),
  idle: S('<circle cx="12" cy="6" r="3.5" fill="#f2d6b0"/><path d="M6 21c0-6 3-9 6-9s6 3 6 9z" fill="#d9ccab"/><text x="17" y="9" font-size="9" fill="#f0c860" font-weight="bold">z</text>'),
  work: S('<path d="M4 20L14 10" stroke="#b07a3a" stroke-width="2.8" stroke-linecap="round"/><path d="M11 5c3-2 7-1 9 2l-3 1-2 3-3-3z" fill="#cfd6de"/><circle cx="18" cy="17" r="4" fill="#7be07a"/><path d="M16.2 17l1.3 1.3 2.4-2.6" stroke="#123" stroke-width="1.4" fill="none"/>'),
  army: S('<path d="M5 19L17 7M14 5l4 0 0 4" stroke="#e0e6ee" stroke-width="2.6" fill="none"/><path d="M19 19L7 7M10 5L6 5 6 9" stroke="#e0e6ee" stroke-width="2.6" fill="none"/><circle cx="12" cy="20" r="2" fill="#c0392b"/>'),
  home: S('<path d="M3 12l9-8 9 8v9H3z" fill="#d8b070"/><path d="M1 12l11-10 11 10" stroke="#a5432e" stroke-width="2.4" fill="none"/><rect x="10" y="14" width="4" height="7" fill="#5a3a1e"/>'),
  box: S('<rect x="4" y="4" width="16" height="16" rx="1" fill="#7be07a22" stroke="#7be07a" stroke-width="2" stroke-dasharray="3 2"/>'),
  close: S('<path d="M6 6l12 12M18 6L6 18" stroke="#f4ecd8" stroke-width="3" stroke-linecap="round"/>'),
  speed: S('<path d="M3 5l8 7-8 7zM12 5l8 7-8 7z" fill="#f0c860"/>'),
  pause: S('<rect x="6" y="4" width="4" height="16" fill="#f0c860"/><rect x="14" y="4" width="4" height="16" fill="#f0c860"/>'),
  collapse: S('<path d="M5 9l7 7 7-7" stroke="#f0c860" stroke-width="3" fill="none"/>'),
  expand: S('<path d="M5 15l7-7 7 7" stroke="#f0c860" stroke-width="3" fill="none"/>'),
  sound: S('<path d="M4 9h4l5-4v14l-5-4H4z" fill="#f0c860"/><path d="M16 8a5 5 0 0 1 0 8M18 5a9 9 0 0 1 0 14" stroke="#f0c860" stroke-width="2" fill="none"/>'),
  mute: S('<path d="M4 9h4l5-4v14l-5-4H4z" fill="#a08a64"/><path d="M16 9l5 6M21 9l-5 6" stroke="#c0392b" stroke-width="2.4"/>'),
  buy: S('<circle cx="12" cy="12" r="9" fill="#2f5a2a"/><path d="M12 6v12M6 12h12" stroke="#fff" stroke-width="2.6"/>'),
  sell: S('<circle cx="12" cy="12" r="9" fill="#6a2a22"/><path d="M6 12h12" stroke="#fff" stroke-width="2.6"/>'),
  reseed: S('<path d="M6.5 9a5.5 4 0 0 1 11 0" stroke="#7be07a" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M19.4 6.6l-1.6 3.2-2.6-2.2z" fill="#7be07a"/><rect x="2.5" y="12" width="19" height="8.5" rx="1.2" fill="#7a5530" stroke="#3a2410" stroke-width=".9"/><path d="M4.5 15h15M4.5 18h15" stroke="#a8803c" stroke-width="1.2"/><path d="M7 13.5v-2.2M12 13.5v-2.6M17 13.5v-2.2" stroke="#9ad04a" stroke-width="1.8" stroke-linecap="round"/>'),
  techtree: S('<rect x="9" y="2" width="6" height="5" rx="1" fill="#f0c860"/><rect x="2" y="16" width="6" height="5" rx="1" fill="#f0c860"/><rect x="16" y="16" width="6" height="5" rx="1" fill="#f0c860"/><path d="M12 7v5M5 16v-4h14v4" stroke="#f0c860" stroke-width="1.8" fill="none"/>'),
  heal: S('<rect x="9" y="3" width="6" height="18" rx="1" fill="#7be07a"/><rect x="3" y="9" width="18" height="6" rx="1" fill="#7be07a"/>'),
  convert: S('<path d="M8 21V8.5a3.6 3.6 0 1 1 7.2 0" stroke="#c9a040" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M17.5 3.5l2-2M19.5 8.5h3M17.5 13l2 2" stroke="#ffe68a" stroke-width="1.7" stroke-linecap="round"/><circle cx="17" cy="18.5" r="3.6" fill="#d04030" stroke="#1a1208" stroke-width=".8"/><path d="M17 14.9a3.6 3.6 0 0 1 0 7.2z" fill="#3a7ae0"/>'),
  pack: S('<path d="M3 16h18" stroke="#8b5a2b" stroke-width="2.6" stroke-linecap="round"/><circle cx="7" cy="19" r="2.4" fill="#5a3a1e" stroke="#2a1a0a" stroke-width=".7"/><circle cx="17" cy="19" r="2.4" fill="#5a3a1e" stroke="#2a1a0a" stroke-width=".7"/><path d="M5 13.5h14" stroke="#a87a4a" stroke-width="2.2" stroke-linecap="round"/><path d="M8 9a5 5 0 0 1 8 0" stroke="#ffd060" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M16.8 6.4l-.6 3.1-2.6-1.4zM7.2 6.4l.6 3.1 2.6-1.4z" fill="#ffd060"/>'),
  scout: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.5" fill="#2a3a4a" stroke="#c9a040" stroke-width="1.6"/><path d="M12 4l2.4 8L12 20l-2.4-8z" fill="#e94a3a"/><path d="M12 12l2.4 0L12 20z" fill="#f4ecd8"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="#c9a040" stroke-width="1.4"/><circle cx="12" cy="12" r="1.3" fill="#c9a040"/></svg>',
  autovil: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="3.2" fill="#f2d6b0" stroke="#3a2410" stroke-width=".7"/><path d="M4 21c0-5.5 2.7-8.5 6-8.5s6 3 6 8.5z" fill="#d9ccab" stroke="#3a2410" stroke-width=".7"/><path d="M6.5 6.2c1-2.6 6-2.6 7 0z" fill="#d8b862"/><path d="M15.5 9.5a5 5 0 1 1 1 8" stroke="#7be07a" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M14 16.6l2.6 1.3-.2-2.9z" fill="#7be07a" stroke="#7be07a" stroke-width="1"/></svg>',
  queue: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="6" r="2" fill="#ffd060"/><circle cx="5" cy="12" r="2" fill="#ffd060"/><circle cx="5" cy="18" r="2" fill="#ffd060"/><path d="M9 6h11M9 12h11M9 18h6" stroke="#f4ecd8" stroke-width="2.2" stroke-linecap="round"/><path d="M19 15v6M16 18h6" stroke="#7be07a" stroke-width="2.2" stroke-linecap="round"/></svg>',
  barding: S('<path d="M6 21v-5.2c0-4.6 2.6-8.2 6.6-9.6L15 2.6l1.6 3.6 3.6 2.6-1.3 3.5-3.4-1.3-1.4 4.1V21z" fill="#a0683a" stroke="#3a2410" stroke-width=".8"/><path d="M12.6 6.2L15 2.6l1.6 3.6 3.6 2.6-1.3 3.5-3.4-1.3z" fill="#b4bcc6" stroke="#3a3e44" stroke-width=".8"/><path d="M8.6 21v-5c0-2.6 1.3-5.2 3.6-6.8" stroke="#b4bcc6" stroke-width="3.2" fill="none"/><circle cx="16.7" cy="7" r=".9" fill="#1a1208"/>'),
  archerarmor: S('<path d="M15.5 1.5l3.2 7" stroke="#8b5a2b" stroke-width="1.6"/><path d="M18.5 1l3 6.5" stroke="#8b5a2b" stroke-width="1.6"/><path d="M14.4 1.4l2.2-.4.2 2.2zM17.4.9l2.2-.4.2 2.2z" fill="#f4ecd8"/><path d="M5 5l5.5 1.8L16 5l2.4 3.8-2 3.2V21H5.6V12L3.4 8.8z" fill="#9a6a3a" stroke="#3a2410" stroke-width=".9"/><path d="M10.5 6.8V21" stroke="#6a4424" stroke-width="1.3"/><path d="M5.6 15h10.8" stroke="#c9a040" stroke-width="1.6"/>'),
  masonry: S('<path d="M3 21v-5.5h8V21zM11 21v-5.5h10V21zM6 15.5V10h10v5.5z" fill="#c8c0b0" stroke="#5a554c" stroke-width=".9"/><path d="M15.2 2.6l5.6 5.6-3.4 1.2-3.4-3.4z" fill="#d0d6dc" stroke="#3a3e44" stroke-width=".7"/><path d="M14.3 6.6l-3.2 3.2" stroke="#8b5a2b" stroke-width="2.2" stroke-linecap="round"/>'),
  murderholes: S('<path d="M3.5 2.5h17v3.5h-2v2.2H5.5V6h-2z" fill="#b0aa9e" stroke="#4a463e" stroke-width=".8"/><rect x="5.5" y="8.2" width="13" height="3.6" fill="#8a857c" stroke="#4a463e" stroke-width=".8"/><path d="M8 12.5v6M12 12.5v6M16 12.5v6" stroke="#ff6a4a" stroke-width="2" stroke-linecap="round"/><path d="M6.2 17.5L8 21l1.8-3.5zM10.2 17.5L12 21l1.8-3.5zM14.2 17.5L16 21l1.8-3.5z" fill="#ff6a4a"/>'),
  husbandry: S('<path d="M7 20v-6c0-4 3-7 7-8l2-3 2 3 3 2-1 3-3-1-1 4v6h-2v-5h-4v5z" fill="#a0683a" stroke="#3a2410" stroke-width=".8"/><path d="M1 9.5h5M.5 13h5.5M1.5 16.5h4.5" stroke="#ffd060" stroke-width="1.9" stroke-linecap="round"/>'),
  halo: S('<ellipse cx="12" cy="3.8" rx="4.6" ry="1.7" fill="none" stroke="#ffd060" stroke-width="1.8"/><path d="M12 6a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4z" fill="#8a6a45"/><path d="M7 21.5l2-10h6l2 10z" fill="#8a6a45" stroke="#3a2410" stroke-width=".7"/><circle cx="12" cy="10.5" r="2" fill="#f2d6b0"/><path d="M18.5 14v6M15.5 17h6" stroke="#7be07a" stroke-width="2.2" stroke-linecap="round"/>'),
  fervor: S('<path d="M14 5a4 4 0 0 1 4 4v2h-8V9a4 4 0 0 1 4-4z" fill="#8a6a45"/><path d="M9 21.5l2-10h6l2 10z" fill="#8a6a45" stroke="#3a2410" stroke-width=".7"/><circle cx="14" cy="9.5" r="2" fill="#f2d6b0"/><path d="M1.5 12h5M1 15.5h6M2 19h5" stroke="#ffd060" stroke-width="1.8" stroke-linecap="round"/>'),
  book: S('<path d="M12 6.5C9 4.5 5.5 4 2.5 4.5v14c3-.5 6.5 0 9.5 2 3-2 6.5-2.5 9.5-2v-14c-3-.5-6.5 0-9.5 2z" fill="#f4ecd8" stroke="#5a3a1e" stroke-width="1"/><path d="M12 6.5v14" stroke="#5a3a1e" stroke-width="1.2"/><path d="M4.5 8.5c2-.2 3.8.1 5.5.9M4.5 11.5c2-.2 3.8.1 5.5.9M14 9.4c1.7-.8 3.5-1.1 5.5-.9M14 12.4c1.7-.8 3.5-1.1 5.5-.9" stroke="#8a6a45" stroke-width="1"/><path d="M16 2v5l1.5-1.2L19 7V2z" fill="#c0392b"/>'),
  anvil: S('<path d="M3 7h13c0 3 2 4 5 4v1.5c-3 0-4.5 1-5 2.5H8c-.5-2-2.5-3.5-5-4z" fill="#6a727c" stroke="#2a2e33" stroke-width=".9"/><path d="M8 15h8l1.5 4.5h-11z" fill="#4a4f55" stroke="#2a2e33" stroke-width=".9"/><path d="M17 3l2-2M20 5.5l2.5-.5M14.5 2.5L14 0" stroke="#ffb040" stroke-width="1.4" stroke-linecap="round"/>'),
  pick: S('<path d="M12 6L5 21" stroke="#8b5a2b" stroke-width="2.8" stroke-linecap="round"/><path d="M2.5 7.5c5-4 13-4.5 19-1.5-5.5-.8-12 0-16.5 3.2z" fill="#b4bcc6" stroke="#3a3e44" stroke-width=".8"/><circle cx="18" cy="18" r="2.6" fill="#ffd040" stroke="#7a5a10" stroke-width=".7"/>'),
  // tech glyphs
  up: S('<path d="M12 3l8 9h-5v9H9v-9H4z" fill="#f0c860" stroke="#5a3a10" stroke-width="1"/>'),
  axe: S('<path d="M5 21L15.5 6.5" stroke="#8b5a2b" stroke-width="3" stroke-linecap="round"/><path d="M12.4 3.4c4.8-.6 8.4 2.6 8.9 7.3L13.9 9z" fill="#d0d6dc" stroke="#2a2e33" stroke-width=".8"/>'),
  farm: S('<path d="M12 21V8" stroke="#c9a040" stroke-width="2"/><path d="M12 8c-3-1-4-4-4-6 3 1 4 3 4 6zM12 8c3-1 4-4 4-6-3 1-4 3-4 6zM12 13c-3-1-4-4-4-6 3 1 4 3 4 6zM12 13c3-1 4-4 4-6-3 1-4 3-4 6z" fill="#e8c860"/>'),
  sword: S('<path d="M4.5 19.5L17.5 6.5" stroke="#e8edf2" stroke-width="3.4" stroke-linecap="round"/><path d="M17.5 6.5l3.2-3.4-4.1 1.9z" fill="#e8edf2"/><path d="M3.4 15.2l5.4 5.4" stroke="#c9a040" stroke-width="2.8" stroke-linecap="round"/><path d="M3 21l2.4-2.4" stroke="#6b4a2b" stroke-width="3.2" stroke-linecap="round"/>'),
  armor: S('<path d="M6 3.5l6 2 6-2 2.6 4.2-2.2 3.3V21H5.6V11L3.4 7.7z" fill="#b4bcc6" stroke="#3a3e44" stroke-width=".9"/><path d="M12 5.5V21" stroke="#6a727c" stroke-width="1.4"/><path d="M5.6 13.5h12.8M5.6 17h12.8" stroke="#8a929c" stroke-width="1"/><circle cx="8.5" cy="8.5" r=".8" fill="#4a4f55"/><circle cx="15.5" cy="8.5" r=".8" fill="#4a4f55"/>'),
  arrow: S('<path d="M4.5 19.5L17 7" stroke="#8b5a2b" stroke-width="3" stroke-linecap="round"/><path d="M20.5 3.5l-8 1.9 6.1 6.1z" fill="#d0d6dc" stroke="#2a2e33" stroke-width=".7"/><path d="M2.8 21.2l1-5 4 4z" fill="#f4ecd8" stroke="#5a4a3a" stroke-width=".6"/>'),
  horse: S('<path d="M5 20v-6c0-4 3-7 7-8l2-3 2 3 3 2-1 3-3-1-1 4v6h-2v-5H8v5z" fill="#a0683a"/>'),
  boot: S('<path d="M8 3h6v10l6 3v4H6z" fill="#8b5a2b"/><path d="M6 18h14" stroke="#5a3a1e" stroke-width="2"/>'),
  bow: S('<path d="M6 3c8 4 8 14 0 18" stroke="#8b5a2b" stroke-width="2.4" fill="none"/><path d="M6 3v18" stroke="#f4ecd8" stroke-width="1"/><path d="M4 12h16" stroke="#c8ccd2" stroke-width="1.8"/>'),
  wall: S('<path d="M2 21V9h4V6h3v3h6V6h3v3h4v12z" fill="#a8a296"/><path d="M2 14h20M8 9v5M16 9v5M12 14v7" stroke="#7a756c" stroke-width="1.2"/>'),
  tower: S('<path d="M7 21V8h10v13z" fill="#a8a296"/><path d="M6 8V4h2v2h2V4h4v2h2V4h2v4z" fill="#8a857c"/><rect x="11" y="11" width="2" height="4" fill="#3a2a1c"/>'),
  fire: S('<path d="M12 2c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 1 4 2 4 0-3 0-5 1-8z" fill="#ff7a1c"/><path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-3 3-5z" fill="#ffd35a"/>'),
  siege: S('<circle cx="7" cy="18" r="3" fill="#6b4a2b"/><circle cx="17" cy="18" r="3" fill="#6b4a2b"/><path d="M4 15h16" stroke="#8b5a2b" stroke-width="2.4"/><path d="M8 15L16 4" stroke="#8b5a2b" stroke-width="2.4"/><circle cx="16" cy="4" r="2.2" fill="#7a756c"/>'),
  monk: S('<path d="M12 3a4 4 0 0 1 4 4v2H8V7a4 4 0 0 1 4-4z" fill="#8a6a45"/><path d="M7 21l2-12h6l2 12z" fill="#8a6a45"/><circle cx="12" cy="8" r="2" fill="#f2d6b0"/>'),
  castle: S('<path d="M3 21V9h3V6h3v3h6V6h3v3h3v12z" fill="#a8a296"/><rect x="10" y="14" width="4" height="7" fill="#3a2a1c"/><path d="M12 6V2l4 1-4 1" fill="#c0392b" stroke="#6b4a2b"/>'),
  clock: S('<circle cx="12" cy="12" r="9" fill="#f4ecd8"/><path d="M12 6v6l4 3" stroke="#3a2a1c" stroke-width="2" fill="none"/>'),
  unique: S('<path d="M12 2l3 7 7 .5-5.5 4.5 2 7.5L12 17l-6.5 4.5 2-7.5L2 9.5 9 9z" fill="#f0c860" stroke="#7a5a10"/>'),
  watch: S('<path d="M2 12c3-5 7-7 10-7s7 2 10 7c-3 5-7 7-10 7s-7-2-10-7z" fill="#f4ecd8"/><circle cx="12" cy="12" r="4" fill="#3b6fb0"/><circle cx="12" cy="12" r="1.8" fill="#111"/>'),
  loom: S('<rect x="4" y="4" width="16" height="16" rx="2" fill="#d9ccab"/><path d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16" stroke="#8a6a45" stroke-width="1.2"/>'),
  wheelbarrow: S('<path d="M3 9h13l-2 6H5z" fill="#8b5a2b"/><circle cx="16" cy="18" r="3" fill="#5a3a1e"/><path d="M16 15l5-4M5 15l-2 4" stroke="#6b4a2b" stroke-width="2"/>'),
  handcart: S('<path d="M4 8h14l-2 7H6z" fill="#8b5a2b"/><circle cx="7" cy="18" r="3" fill="#5a3a1e"/><circle cx="15" cy="18" r="3" fill="#5a3a1e"/><path d="M18 8l4-3" stroke="#6b4a2b" stroke-width="2"/>'),
  fish: S('<path d="M3 12c4-5 10-5 14 0-4 5-10 5-14 0z" fill="#8fb4c4"/><path d="M17 12l5-4v8z" fill="#8fb4c4"/><circle cx="7" cy="11" r="1.2" fill="#111"/>'),
  ship: S('<path d="M3 15h18l-3 5H6z" fill="#8b5a2b"/><path d="M12 14V3" stroke="#5a3a1e" stroke-width="1.8"/><path d="M12 4l7 8h-7z" fill="#f4ecd8"/>'),
  age2: S('<circle cx="12" cy="12" r="10" fill="#6b4a2b" stroke="#f0c860" stroke-width="2"/><text x="12" y="16.5" text-anchor="middle" font-size="12" font-family="serif" font-weight="bold" fill="#f0c860">II</text>'),
  age3: S('<circle cx="12" cy="12" r="10" fill="#4a4a5a" stroke="#f0c860" stroke-width="2"/><text x="12" y="16.5" text-anchor="middle" font-size="11" font-family="serif" font-weight="bold" fill="#f0c860">III</text>'),
  age4: S('<circle cx="12" cy="12" r="10" fill="#2f4a6e" stroke="#f0c860" stroke-width="2"/><text x="12" y="16.5" text-anchor="middle" font-size="12" font-family="serif" font-weight="bold" fill="#f0c860">IV</text>'),
  atk: S('<path d="M5 19L17 7" stroke="#e0e6ee" stroke-width="3"/><path d="M4 15l5 5" stroke="#c9a040" stroke-width="2.6"/>'),
  marmor: S('<path d="M12 2l8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5z" fill="#aab2bc"/>'),
  parmor: S('<path d="M12 2l8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5z" fill="#8a9ab0"/><path d="M7 12h10" stroke="#3a2a1c" stroke-width="1.6"/><path d="M15 9l3 3-3 3" stroke="#3a2a1c" stroke-width="1.6" fill="none"/>'),
  range: S('<circle cx="12" cy="12" r="9" fill="none" stroke="#8fd0ff" stroke-width="2" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="2" fill="#8fd0ff"/>'),
  los: S('<path d="M2 12c3-5 7-7 10-7s7 2 10 7c-3 5-7 7-10 7s-7-2-10-7z" fill="#f4ecd8"/><circle cx="12" cy="12" r="3" fill="#3b6fb0"/>'),
  relic: S('<path d="M12 1.5v2M4.5 4.5L6 6M19.5 4.5L18 6" stroke="#fff3b0" stroke-width="1.5" stroke-linecap="round"/><path d="M5 11c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6z" fill="#f4d26a" stroke="#5a3a08" stroke-width=".9"/><rect x="5" y="11" width="14" height="9.5" rx="1.2" fill="#e8b830" stroke="#5a3a08" stroke-width=".9"/><path d="M5 14h14" stroke="#a87a10" stroke-width="1"/><circle cx="12" cy="16.5" r="2" fill="#b6402f" stroke="#5a1a10" stroke-width=".6"/><circle cx="7.5" cy="17.5" r=".9" fill="#5ab8ff"/><circle cx="16.5" cy="17.5" r=".9" fill="#5ab8ff"/>'),
  trophy: S('<path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="#f0c860"/><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" stroke="#f0c860" stroke-width="1.6" fill="none"/><rect x="10" y="13" width="4" height="4" fill="#c09030"/><rect x="7" y="17" width="10" height="3" fill="#8a6a2a"/>'),
};

export function resIcon(r: string) {
  return ICON[r] ?? '';
}

let uid = 0;
/** Give gradient ids in an icon a unique suffix so several copies (some hidden) never share a definition. */
export function uniqIds(html: string) {
  if (!html.includes('id="')) return html;
  const n = ++uid;
  return html.replace(/id="(g[A-Za-z0-9]+)"/g, `id="$1-${n}"`).replace(/url\(#(g[A-Za-z0-9]+)\)/g, `url(#$1-${n})`);
}

/** Per-technology glyph and tier: tiered lines (I, II, III) get a numeral, armour lines get distinct
 *  glyphs per unit type, and civilisation techs keep a semantic glyph plus a gold star. */
const TECH_GLYPH: Record<string, [string, string?]> = {
  town_watch: ['watch', 'I'], town_patrol: ['watch', 'II'],
  horse_collar: ['farm', 'I'], heavy_plow: ['farm', 'II'], crop_rotation: ['farm', 'III'],
  double_bit_axe: ['axe', 'I'], bow_saw: ['axe', 'II'], two_man_saw: ['axe', 'III'],
  gold_mining: ['gold', 'I'], gold_shaft_mining: ['gold', 'II'], stone_mining: ['stone', 'I'], stone_shaft_mining: ['stone', 'II'],
  bloodlines: ['horse'], husbandry: ['husbandry'],
  forging: ['sword', 'I'], iron_casting: ['sword', 'II'], blast_furnace: ['sword', 'III'],
  scale_mail: ['armor', 'I'], chain_mail: ['armor', 'II'], plate_mail: ['armor', 'III'],
  scale_barding: ['barding', 'I'], chain_barding: ['barding', 'II'], plate_barding: ['barding', 'III'],
  fletching: ['arrow', 'I'], bodkin_arrow: ['arrow', 'II'], bracer: ['arrow', 'III'],
  padded_archer_armor: ['archerarmor', 'I'], leather_archer_armor: ['archerarmor', 'II'], ring_archer_armor: ['archerarmor', 'III'],
  masonry: ['masonry', 'I'], architecture: ['masonry', 'II'], murder_holes: ['murderholes'],
  guard_tower: ['tower', 'I'], keep: ['tower', 'II'],
  sanctity: ['halo'], fervor: ['fervor'], atonement: ['convert'], block_printing: ['book'],
};
const UNIQUE_GLYPH: Record<string, string> = {
  yeomen: 'arrow', chivalry: 'horse', ironclad: 'siege', nomads: 'pop', greek_fire: 'fire', kataparuto: 'siege',
  chieftains: 'axe', zealotry: 'horse', kamandaran: 'bow', great_wall: 'wall',
};

/** Button art for a technology (unit upgrades are handled by the caller with a unit portrait). */
export function techIcon(id: string, fallback: string, civ?: string) {
  const [g, tier] = TECH_GLYPH[id] ?? [UNIQUE_GLYPH[id] ?? fallback];
  return (ICON[g] ?? ICON[fallback] ?? ICON.up) + (tier ? `<span class="tier">${tier}</span>` : '') + (civ || UNIQUE_GLYPH[id] ? '<span class="uq">★</span>' : '');
}

/** Small role badge for buildings that look alike at button size. */
export const BUILDING_ROLE: Record<string, string> = {
  barracks: 'sword', archery_range: 'bow', stable: 'horse', blacksmith: 'anvil', lumber_camp: 'axe', mining_camp: 'pick',
  mill: 'farm', market: 'gold', siege_workshop: 'siege', monastery: 'monk', university: 'book', dock: 'ship', house: 'pop',
};
