// Game data: units, buildings, technologies, civilizations, ages.
// Numbers are modelled on Age of Empires II (DE) and simplified where needed.

export type Res = 'food' | 'wood' | 'gold' | 'stone';
export const RES: Res[] = ['food', 'wood', 'gold', 'stone'];
export type Cost = Partial<Record<Res, number>>;

export type UnitClass =
  | 'infantry' | 'archer' | 'cavalry' | 'cavarcher' | 'spear' | 'skirm' | 'siege' | 'ram'
  | 'ship' | 'villager' | 'monk' | 'camel' | 'gunpowder' | 'animal' | 'building'
  | 'stonedef' | 'wall' | 'unique' | 'trade';

export type ProjKind = 'arrow' | 'bolt' | 'stone' | 'bullet' | 'axe' | 'fire' | 'cannon';

export type UnitKey =
  | 'villager'
  | 'fishing_ship'
  | 'transport_ship'
  | 'trade_cog'
  | 'militia'
  | 'man_at_arms'
  | 'long_swordsman'
  | 'two_handed_swordsman'
  | 'champion'
  | 'spearman'
  | 'pikeman'
  | 'halberdier'
  | 'archer'
  | 'crossbowman'
  | 'arbalester'
  | 'skirmisher'
  | 'elite_skirmisher'
  | 'cavalry_archer'
  | 'heavy_cavalry_archer'
  | 'hand_cannoneer'
  | 'scout_cavalry'
  | 'light_cavalry'
  | 'hussar'
  | 'knight'
  | 'cavalier'
  | 'paladin'
  | 'camel_rider'
  | 'heavy_camel_rider'
  | 'battering_ram'
  | 'capped_ram'
  | 'mangonel'
  | 'onager'
  | 'scorpion'
  | 'heavy_scorpion'
  | 'bombard_cannon'
  | 'trebuchet'
  | 'monk'
  | 'galley'
  | 'war_galley'
  | 'galleon'
  | 'fire_galley'
  | 'cannon_galleon'
  | 'longbowman'
  | 'throwing_axeman'
  | 'teutonic_knight'
  | 'mangudai'
  | 'cataphract'
  | 'samurai'
  | 'berserk'
  | 'mameluke'
  | 'war_elephant'
  | 'chu_ko_nu'
  | 'sheep'
  | 'deer'
  | 'boar'
  | 'wolf';

export type BuildingKey =
  | 'town_center'
  | 'house'
  | 'mill'
  | 'lumber_camp'
  | 'mining_camp'
  | 'farm'
  | 'dock'
  | 'barracks'
  | 'palisade_wall'
  | 'palisade_gate'
  | 'outpost'
  | 'stone_wall'
  | 'gate'
  | 'watch_tower'
  | 'archery_range'
  | 'stable'
  | 'blacksmith'
  | 'market'
  | 'monastery'
  | 'university'
  | 'siege_workshop'
  | 'castle'
  | 'wonder';

export interface UnitDef {
  name: string;
  desc: string;
  cls: UnitClass[];
  hp: number;
  speed: number; // tiles/s
  los: number;
  atk: number;
  atkType?: 'm' | 'p';
  bonus?: Partial<Record<UnitClass, number>>;
  armor: [number, number]; // melee, pierce
  range: number; // 0 = melee
  minRange?: number;
  reload: number;
  proj?: ProjKind;
  splash?: number;
  cost: Cost;
  time: number;
  pop?: number;
  at: BuildingKey | null;
  age: number;
  line?: string;
  naval?: boolean;
  civ?: CivId;
  radius: number;
  cargo?: number;
  heal?: number;
  regen?: number;
  setup?: number;
  food?: number;
  flee?: boolean;
  hostile?: boolean;
  model: string;
}

const U = (d: Partial<UnitDef> & Pick<UnitDef, 'name' | 'cls' | 'hp' | 'speed' | 'atk' | 'armor' | 'cost' | 'time' | 'at' | 'age'>): UnitDef => ({
  desc: '',
  los: 4,
  range: 0,
  reload: 2,
  radius: 0.22,
  model: '',
  ...d,
});

export const UNITS: Record<UnitKey, UnitDef> = {
  // ---- Economy ----
  villager: U({ name: 'Villager', desc: 'Gathers resources, builds and repairs.', cls: ['villager'], hp: 25, speed: 0.8, atk: 3, armor: [0, 0], cost: { food: 50 }, time: 25, at: 'town_center', age: 1, radius: 0.2 }),
  fishing_ship: U({ name: 'Fishing Ship', desc: 'Catches fish and returns it to a Dock.', cls: ['ship'], hp: 60, speed: 1.26, atk: 0, armor: [0, 4], cost: { wood: 75 }, time: 40, at: 'dock', age: 1, naval: true, radius: 0.5, los: 5 }),
  transport_ship: U({ name: 'Transport Ship', desc: 'Carries up to 5 land units across water.', cls: ['ship'], hp: 100, speed: 1.45, atk: 0, armor: [4, 8], cost: { wood: 125 }, time: 46, at: 'dock', age: 1, naval: true, radius: 0.6, cargo: 5, los: 5 }),
  trade_cog: U({ name: 'Trade Cog', desc: 'Not available in single player.', cls: ['ship', 'trade'], hp: 80, speed: 1.3, atk: 0, armor: [0, 6], cost: { wood: 100, gold: 50 }, time: 36, at: null, age: 2, naval: true, radius: 0.5 }),

  // ---- Infantry ----
  militia: U({ name: 'Militia', desc: 'Basic swordsman.', cls: ['infantry'], hp: 40, speed: 0.9, atk: 4, armor: [0, 1], cost: { food: 60, gold: 20 }, time: 21, at: 'barracks', age: 1, line: 'sword' }),
  man_at_arms: U({ name: 'Man-at-Arms', desc: 'Tougher swordsman.', cls: ['infantry'], hp: 45, speed: 0.9, atk: 6, armor: [0, 1], bonus: { building: 2 }, cost: { food: 60, gold: 20 }, time: 21, at: 'barracks', age: 2, line: 'sword' }),
  long_swordsman: U({ name: 'Long Swordsman', desc: 'Strong all-round infantry.', cls: ['infantry'], hp: 60, speed: 0.9, atk: 9, armor: [1, 1], bonus: { building: 2 }, cost: { food: 60, gold: 20 }, time: 21, at: 'barracks', age: 3, line: 'sword' }),
  two_handed_swordsman: U({ name: 'Two-Handed Swordsman', desc: 'Heavy-hitting infantry.', cls: ['infantry'], hp: 60, speed: 0.9, atk: 12, armor: [0, 1], bonus: { building: 3 }, cost: { food: 60, gold: 20 }, time: 21, at: 'barracks', age: 4, line: 'sword' }),
  champion: U({ name: 'Champion', desc: 'Elite infantry.', cls: ['infantry'], hp: 70, speed: 0.9, atk: 13, armor: [1, 1], bonus: { building: 4 }, cost: { food: 60, gold: 20 }, time: 21, at: 'barracks', age: 4, line: 'sword' }),
  spearman: U({ name: 'Spearman', desc: 'Cheap anti-cavalry infantry.', cls: ['infantry', 'spear'], hp: 45, speed: 1.0, atk: 3, armor: [0, 0], bonus: { cavalry: 15, camel: 12 }, cost: { food: 35, wood: 25 }, time: 22, at: 'barracks', age: 2, line: 'spear' }),
  pikeman: U({ name: 'Pikeman', desc: 'Anti-cavalry infantry.', cls: ['infantry', 'spear'], hp: 55, speed: 1.0, atk: 4, armor: [0, 0], bonus: { cavalry: 22, camel: 18 }, cost: { food: 35, wood: 25 }, time: 22, at: 'barracks', age: 3, line: 'spear' }),
  halberdier: U({ name: 'Halberdier', desc: 'Elite anti-cavalry infantry.', cls: ['infantry', 'spear'], hp: 60, speed: 1.0, atk: 6, armor: [1, 0], bonus: { cavalry: 32, camel: 26 }, cost: { food: 35, wood: 25 }, time: 22, at: 'barracks', age: 4, line: 'spear' }),

  // ---- Archers ----
  archer: U({ name: 'Archer', desc: 'Ranged foot soldier.', cls: ['archer'], hp: 30, speed: 0.96, atk: 4, atkType: 'p', bonus: { spear: 3 }, armor: [0, 0], range: 4, proj: 'arrow', cost: { wood: 25, gold: 45 }, time: 35, at: 'archery_range', age: 2, line: 'archer', los: 6 }),
  crossbowman: U({ name: 'Crossbowman', desc: 'Upgraded archer.', cls: ['archer'], hp: 35, speed: 0.96, atk: 5, atkType: 'p', bonus: { spear: 3 }, armor: [0, 0], range: 5, proj: 'arrow', cost: { wood: 25, gold: 45 }, time: 27, at: 'archery_range', age: 3, line: 'archer', los: 7 }),
  arbalester: U({ name: 'Arbalester', desc: 'Elite archer.', cls: ['archer'], hp: 40, speed: 0.96, atk: 6, atkType: 'p', bonus: { spear: 3 }, armor: [0, 0], range: 5, proj: 'arrow', cost: { wood: 25, gold: 45 }, time: 27, at: 'archery_range', age: 4, line: 'archer', los: 7 }),
  skirmisher: U({ name: 'Skirmisher', desc: 'Cheap anti-archer unit.', cls: ['archer', 'skirm'], hp: 30, speed: 0.96, atk: 2, atkType: 'p', bonus: { archer: 3, spear: 3 }, armor: [0, 3], range: 4, minRange: 1, proj: 'arrow', cost: { food: 25, wood: 35 }, time: 22, at: 'archery_range', age: 2, line: 'skirm', los: 6, reload: 3 }),
  elite_skirmisher: U({ name: 'Elite Skirmisher', desc: 'Upgraded anti-archer unit.', cls: ['archer', 'skirm'], hp: 35, speed: 0.96, atk: 3, atkType: 'p', bonus: { archer: 4, spear: 3, cavarcher: 2 }, armor: [0, 4], range: 5, minRange: 1, proj: 'arrow', cost: { food: 25, wood: 35 }, time: 22, at: 'archery_range', age: 3, line: 'skirm', los: 7, reload: 3 }),
  cavalry_archer: U({ name: 'Cavalry Archer', desc: 'Fast mounted archer.', cls: ['archer', 'cavarcher', 'cavalry'], hp: 50, speed: 1.4, atk: 6, atkType: 'p', bonus: { spear: 2 }, armor: [0, 0], range: 4, proj: 'arrow', cost: { wood: 40, gold: 70 }, time: 34, at: 'archery_range', age: 3, line: 'ca', los: 5, radius: 0.32 }),
  heavy_cavalry_archer: U({ name: 'Heavy Cav Archer', desc: 'Upgraded mounted archer.', cls: ['archer', 'cavarcher', 'cavalry'], hp: 60, speed: 1.4, atk: 7, atkType: 'p', bonus: { spear: 2 }, armor: [1, 0], range: 4, proj: 'arrow', cost: { wood: 40, gold: 70 }, time: 27, at: 'archery_range', age: 4, line: 'ca', los: 6, radius: 0.32 }),
  hand_cannoneer: U({ name: 'Hand Cannoneer', desc: 'Gunpowder infantry. Shreds infantry.', cls: ['archer', 'gunpowder'], hp: 35, speed: 0.96, atk: 17, atkType: 'p', bonus: { infantry: 10, spear: 1 }, armor: [1, 0], range: 7, proj: 'bullet', reload: 3.45, cost: { food: 45, gold: 50 }, time: 34, at: 'archery_range', age: 4, los: 9 }),

  // ---- Cavalry ----
  scout_cavalry: U({ name: 'Scout Cavalry', desc: 'Fast, cheap scout.', cls: ['cavalry'], hp: 45, speed: 1.55, atk: 3, armor: [0, 2], bonus: { monk: 6 }, cost: { food: 80 }, time: 30, at: 'stable', age: 2, line: 'scout', los: 6, radius: 0.32 }),
  light_cavalry: U({ name: 'Light Cavalry', desc: 'Upgraded scout. Great vs monks & siege.', cls: ['cavalry'], hp: 60, speed: 1.5, atk: 7, armor: [0, 2], bonus: { monk: 10 }, cost: { food: 80 }, time: 30, at: 'stable', age: 3, line: 'scout', los: 8, radius: 0.32 }),
  hussar: U({ name: 'Hussar', desc: 'Elite light cavalry.', cls: ['cavalry'], hp: 75, speed: 1.5, atk: 7, armor: [0, 2], bonus: { monk: 12 }, cost: { food: 80 }, time: 30, at: 'stable', age: 4, line: 'scout', los: 10, radius: 0.32 }),
  knight: U({ name: 'Knight', desc: 'Heavily armoured cavalry.', cls: ['cavalry'], hp: 100, speed: 1.35, atk: 10, armor: [2, 2], cost: { food: 60, gold: 75 }, time: 30, at: 'stable', age: 3, line: 'knight', los: 4, radius: 0.34 }),
  cavalier: U({ name: 'Cavalier', desc: 'Upgraded knight.', cls: ['cavalry'], hp: 120, speed: 1.35, atk: 12, armor: [2, 2], cost: { food: 60, gold: 75 }, time: 30, at: 'stable', age: 4, line: 'knight', los: 4, radius: 0.34 }),
  paladin: U({ name: 'Paladin', desc: 'Elite heavy cavalry.', cls: ['cavalry'], hp: 160, speed: 1.35, atk: 14, armor: [2, 3], cost: { food: 60, gold: 75 }, time: 30, at: 'stable', age: 4, line: 'knight', los: 5, radius: 0.34 }),
  camel_rider: U({ name: 'Camel Rider', desc: 'Anti-cavalry mounted unit.', cls: ['camel'], hp: 100, speed: 1.45, atk: 6, armor: [0, 0], bonus: { cavalry: 9, ship: 5 }, cost: { food: 55, gold: 60 }, time: 22, at: 'stable', age: 3, line: 'camel', los: 4, radius: 0.34 }),
  heavy_camel_rider: U({ name: 'Heavy Camel Rider', desc: 'Upgraded camel.', cls: ['camel'], hp: 120, speed: 1.45, atk: 7, armor: [0, 0], bonus: { cavalry: 18, ship: 5 }, cost: { food: 55, gold: 60 }, time: 22, at: 'stable', age: 4, line: 'camel', los: 5, radius: 0.34 }),

  // ---- Siege ----
  battering_ram: U({ name: 'Battering Ram', desc: 'Destroys buildings. Immune to arrows.', cls: ['siege', 'ram'], hp: 175, speed: 0.5, atk: 2, bonus: { building: 125, siege: 40 }, armor: [-3, 180], reload: 5, cost: { wood: 160, gold: 75 }, time: 36, at: 'siege_workshop', age: 3, line: 'ram', radius: 0.45, los: 3, pop: 1 }),
  capped_ram: U({ name: 'Capped Ram', desc: 'Upgraded ram.', cls: ['siege', 'ram'], hp: 200, speed: 0.5, atk: 3, bonus: { building: 150, siege: 50 }, armor: [-3, 190], reload: 5, cost: { wood: 160, gold: 75 }, time: 36, at: 'siege_workshop', age: 4, line: 'ram', radius: 0.45, los: 3 }),
  mangonel: U({ name: 'Mangonel', desc: 'Area-damage catapult. Hurts friends too!', cls: ['siege'], hp: 50, speed: 0.6, atk: 40, bonus: { building: 35, ship: 12 }, armor: [0, 6], range: 7, minRange: 3, reload: 6, proj: 'stone', splash: 1, cost: { wood: 160, gold: 135 }, time: 46, at: 'siege_workshop', age: 3, line: 'mangonel', radius: 0.45, los: 9 }),
  onager: U({ name: 'Onager', desc: 'Upgraded mangonel.', cls: ['siege'], hp: 60, speed: 0.6, atk: 50, bonus: { building: 45, ship: 12 }, armor: [0, 7], range: 8, minRange: 3, reload: 6, proj: 'stone', splash: 1.2, cost: { wood: 160, gold: 135 }, time: 46, at: 'siege_workshop', age: 4, line: 'mangonel', radius: 0.45, los: 10 }),
  scorpion: U({ name: 'Scorpion', desc: 'Fires heavy bolts that pierce lines.', cls: ['siege'], hp: 40, speed: 0.65, atk: 12, atkType: 'p', bonus: { building: 0 }, armor: [0, 7], range: 7, minRange: 2, reload: 3.6, proj: 'bolt', splash: 0.4, cost: { wood: 75, gold: 75 }, time: 30, at: 'siege_workshop', age: 3, line: 'scorpion', radius: 0.4, los: 9 }),
  heavy_scorpion: U({ name: 'Heavy Scorpion', desc: 'Upgraded scorpion.', cls: ['siege'], hp: 50, speed: 0.65, atk: 16, atkType: 'p', armor: [0, 7], range: 7, minRange: 2, reload: 3.6, proj: 'bolt', splash: 0.5, cost: { wood: 75, gold: 75 }, time: 30, at: 'siege_workshop', age: 4, line: 'scorpion', radius: 0.4, los: 9 }),
  bombard_cannon: U({ name: 'Bombard Cannon', desc: 'Long-range gunpowder siege.', cls: ['siege', 'gunpowder'], hp: 80, speed: 0.7, atk: 40, bonus: { building: 200, ship: 40, siege: 20 }, armor: [2, 5], range: 12, minRange: 5, reload: 6.5, proj: 'cannon', splash: 0.5, cost: { wood: 225, gold: 225 }, time: 56, at: 'siege_workshop', age: 4, radius: 0.45, los: 14 }),
  trebuchet: U({ name: 'Trebuchet', desc: 'Huge range. Must unpack to fire.', cls: ['siege'], hp: 150, speed: 0.8, atk: 200, bonus: { building: 250, ship: 40 }, armor: [2, 150], range: 16, minRange: 4, reload: 10, proj: 'stone', splash: 0.5, setup: 4, cost: { wood: 200, gold: 200 }, time: 50, at: 'castle', age: 4, radius: 0.55, los: 18 }),

  // ---- Monk ----
  monk: U({ name: 'Monk', desc: 'Heals allies, converts enemies, carries relics.', cls: ['monk'], hp: 30, speed: 0.7, atk: 0, armor: [0, 0], range: 9, heal: 1, cost: { gold: 100 }, time: 51, at: 'monastery', age: 3, los: 11 }),

  // ---- Navy ----
  galley: U({ name: 'Galley', desc: 'Ranged warship.', cls: ['ship'], hp: 120, speed: 1.43, atk: 6, atkType: 'p', bonus: { ship: 8, building: 6 }, armor: [0, 6], range: 5, proj: 'arrow', reload: 3, cost: { wood: 90, gold: 30 }, time: 60, at: 'dock', age: 2, line: 'galley', naval: true, radius: 0.6, los: 7 }),
  war_galley: U({ name: 'War Galley', desc: 'Upgraded galley.', cls: ['ship'], hp: 135, speed: 1.43, atk: 7, atkType: 'p', bonus: { ship: 9, building: 7 }, armor: [0, 6], range: 6, proj: 'arrow', reload: 3, cost: { wood: 90, gold: 30 }, time: 36, at: 'dock', age: 3, line: 'galley', naval: true, radius: 0.6, los: 8 }),
  galleon: U({ name: 'Galleon', desc: 'Elite ranged warship.', cls: ['ship'], hp: 165, speed: 1.43, atk: 8, atkType: 'p', bonus: { ship: 11, building: 8 }, armor: [0, 8], range: 7, proj: 'arrow', reload: 3, cost: { wood: 90, gold: 30 }, time: 36, at: 'dock', age: 4, line: 'galley', naval: true, radius: 0.6, los: 9 }),
  fire_galley: U({ name: 'Fire Galley', desc: 'Short-range ship that burns other ships.', cls: ['ship'], hp: 100, speed: 1.35, atk: 2, bonus: { ship: 3, building: 2 }, armor: [0, 4], range: 2.5, reload: 0.25, proj: 'fire', cost: { wood: 75, gold: 45 }, time: 65, at: 'dock', age: 2, naval: true, radius: 0.6, los: 5 }),
  cannon_galleon: U({ name: 'Cannon Galleon', desc: 'Long-range ship that bombards buildings.', cls: ['ship', 'gunpowder'], hp: 120, speed: 1.1, atk: 35, bonus: { building: 275, ship: 0 }, armor: [0, 6], range: 13, minRange: 3, reload: 10, proj: 'cannon', splash: 0.5, cost: { wood: 200, gold: 150 }, time: 46, at: 'dock', age: 4, naval: true, radius: 0.65, los: 15 }),

  // ---- Unique units (trained at the Castle) ----
  longbowman: U({ name: 'Longbowman', desc: 'Britons unique: very long-range archer.', cls: ['archer', 'unique'], hp: 35, speed: 0.96, atk: 6, atkType: 'p', bonus: { spear: 3 }, armor: [0, 1], range: 6, proj: 'arrow', cost: { wood: 35, gold: 40 }, time: 18, at: 'castle', age: 3, civ: 'britons', los: 8 }),
  throwing_axeman: U({ name: 'Throwing Axeman', desc: 'Franks unique: ranged melee infantry.', cls: ['infantry', 'unique'], hp: 60, speed: 1.0, atk: 7, bonus: { building: 2 }, armor: [0, 0], range: 3, proj: 'axe', cost: { food: 55, gold: 25 }, time: 17, at: 'castle', age: 3, civ: 'franks', los: 5 }),
  teutonic_knight: U({ name: 'Teutonic Knight', desc: 'Teutons unique: slow, unstoppable infantry.', cls: ['infantry', 'unique'], hp: 80, speed: 0.7, atk: 12, bonus: { building: 4 }, armor: [5, 2], cost: { food: 85, gold: 40 }, time: 12, at: 'castle', age: 3, civ: 'teutons', los: 3, radius: 0.24 }),
  mangudai: U({ name: 'Mangudai', desc: 'Mongols unique: horse archer that hunts siege.', cls: ['archer', 'cavarcher', 'cavalry', 'unique'], hp: 60, speed: 1.45, atk: 6, atkType: 'p', bonus: { siege: 3, spear: 1 }, armor: [0, 0], range: 4, proj: 'arrow', reload: 2.1, cost: { wood: 55, gold: 65 }, time: 26, at: 'castle', age: 3, civ: 'mongols', los: 6, radius: 0.32 }),
  cataphract: U({ name: 'Cataphract', desc: 'Byzantine unique: infantry-crushing cavalry.', cls: ['cavalry', 'unique'], hp: 110, speed: 1.35, atk: 9, bonus: { infantry: 9 }, armor: [2, 1], cost: { food: 70, gold: 75 }, time: 20, at: 'castle', age: 3, civ: 'byzantines', los: 4, radius: 0.34 }),
  samurai: U({ name: 'Samurai', desc: 'Japanese unique: fast-attacking swordsman.', cls: ['infantry', 'unique'], hp: 60, speed: 1.0, atk: 8, bonus: { unique: 10, building: 2 }, armor: [1, 1], reload: 1.45, cost: { food: 60, gold: 30 }, time: 9, at: 'castle', age: 3, civ: 'japanese', los: 4 }),
  berserk: U({ name: 'Berserk', desc: 'Vikings unique: infantry that heals itself.', cls: ['infantry', 'unique'], hp: 54, speed: 1.05, atk: 9, bonus: { building: 2 }, armor: [2, 1], regen: 0.66, cost: { food: 65, gold: 25 }, time: 14, at: 'castle', age: 3, civ: 'vikings', los: 3 }),
  mameluke: U({ name: 'Mameluke', desc: 'Saracens unique: camel that hurls blades.', cls: ['camel', 'unique'], hp: 65, speed: 1.4, atk: 8, bonus: { cavalry: 9 }, armor: [1, 0], range: 3, proj: 'axe', cost: { food: 55, gold: 85 }, time: 23, at: 'castle', age: 3, civ: 'saracens', los: 5, radius: 0.34 }),
  war_elephant: U({ name: 'War Elephant', desc: 'Persians unique: slow, colossal beast.', cls: ['cavalry', 'unique'], hp: 450, speed: 0.6, atk: 15, bonus: { building: 7 }, armor: [1, 2], splash: 0.6, cost: { food: 200, gold: 75 }, time: 25, at: 'castle', age: 3, civ: 'persians', los: 4, radius: 0.5, pop: 1 }),
  chu_ko_nu: U({ name: 'Chu Ko Nu', desc: 'Chinese unique: rapid-fire crossbow.', cls: ['archer', 'unique'], hp: 45, speed: 0.96, atk: 8, atkType: 'p', armor: [0, 0], range: 4, reload: 1.5, proj: 'bolt', cost: { wood: 40, gold: 35 }, time: 16, at: 'castle', age: 3, civ: 'chinese', los: 6 }),

  // ---- Wildlife (Gaia) ----
  sheep: U({ name: 'Sheep', desc: 'Herdable. Bring near your Town Center.', cls: ['animal'], hp: 7, speed: 0.7, atk: 0, armor: [0, 0], cost: {}, time: 0, at: null, age: 1, food: 100, radius: 0.22 }),
  deer: U({ name: 'Deer', desc: 'Huntable. Runs from danger.', cls: ['animal'], hp: 5, speed: 1.1, atk: 0, armor: [0, 0], cost: {}, time: 0, at: null, age: 1, food: 140, flee: true, radius: 0.25 }),
  boar: U({ name: 'Wild Boar', desc: 'Dangerous. Fights back when hunted.', cls: ['animal'], hp: 75, speed: 0.9, atk: 8, armor: [0, 0], cost: {}, time: 0, at: null, age: 1, food: 340, radius: 0.3, reload: 2 }),
  wolf: U({ name: 'Wolf', desc: 'Attacks anything nearby.', cls: ['animal'], hp: 25, speed: 1.1, atk: 3, armor: [0, 0], cost: {}, time: 0, at: null, age: 1, hostile: true, radius: 0.25, los: 6 }),
};
for (const k in UNITS) {
  const d = (UNITS as Record<string, UnitDef>)[k];
  if (!d.model) d.model = k;
  if (!d.atkType) d.atkType = 'm';
}
export const unitDef = (t: string): UnitDef => (UNITS as Record<string, UnitDef>)[t];

/** Upgrade lines, in order. The building shows the most advanced type the player has unlocked. */
export const LINES: Record<string, UnitKey[]> = {
  sword: ['militia', 'man_at_arms', 'long_swordsman', 'two_handed_swordsman', 'champion'],
  spear: ['spearman', 'pikeman', 'halberdier'],
  archer: ['archer', 'crossbowman', 'arbalester'],
  skirm: ['skirmisher', 'elite_skirmisher'],
  ca: ['cavalry_archer', 'heavy_cavalry_archer'],
  scout: ['scout_cavalry', 'light_cavalry', 'hussar'],
  knight: ['knight', 'cavalier', 'paladin'],
  camel: ['camel_rider', 'heavy_camel_rider'],
  ram: ['battering_ram', 'capped_ram'],
  mangonel: ['mangonel', 'onager'],
  scorpion: ['scorpion', 'heavy_scorpion'],
  galley: ['galley', 'war_galley', 'galleon'],
};

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

export interface BuildingDef {
  name: string;
  desc: string;
  size: number;
  hp: number;
  armor: [number, number];
  cost: Cost;
  time: number;
  age: number;
  pop?: number;
  req?: BuildingKey;
  trains: UnitKey[];
  drop?: Res[];
  los: number;
  atk?: number;
  range?: number;
  reload?: number;
  garrison?: number;
  water?: boolean;
  wall?: boolean;
  gate?: boolean;
  passable?: boolean;
  ageUp?: boolean; // counts towards the "two buildings" age-up requirement
  stoneDef?: boolean;
  max?: number;
  build?: boolean; // appears in the villager build menu
  menu: 'eco' | 'mil';
}

const B = (d: Partial<BuildingDef> & Pick<BuildingDef, 'name' | 'size' | 'hp' | 'cost' | 'time' | 'age' | 'menu'>): BuildingDef => ({
  desc: '',
  armor: [1, 7],
  trains: [],
  los: 5,
  build: true,
  ...d,
});

export const BUILDINGS: Record<BuildingKey, BuildingDef> = {
  town_center: B({ name: 'Town Center', desc: 'Trains villagers, researches ages. Fires arrows.', size: 4, hp: 2400, armor: [3, 5], cost: { wood: 275, stone: 100 }, time: 150, age: 3, pop: 5, trains: ['villager'], drop: ['food', 'wood', 'gold', 'stone'], los: 8, atk: 5, range: 6, reload: 2, garrison: 15, menu: 'eco' }),
  house: B({ name: 'House', desc: 'Supports 5 population.', size: 2, hp: 550, armor: [0, 7], cost: { wood: 25 }, time: 25, age: 1, pop: 5, los: 2, menu: 'eco' }),
  mill: B({ name: 'Mill', desc: 'Drop-off for food. Farming upgrades.', size: 2, hp: 600, cost: { wood: 100 }, time: 35, age: 1, drop: ['food'], ageUp: true, los: 6, menu: 'eco' }),
  lumber_camp: B({ name: 'Lumber Camp', desc: 'Drop-off for wood. Woodcutting upgrades.', size: 2, hp: 600, cost: { wood: 100 }, time: 35, age: 1, drop: ['wood'], ageUp: true, los: 6, menu: 'eco' }),
  mining_camp: B({ name: 'Mining Camp', desc: 'Drop-off for gold and stone. Mining upgrades.', size: 2, hp: 600, cost: { wood: 100 }, time: 35, age: 1, drop: ['gold', 'stone'], ageUp: true, los: 6, menu: 'eco' }),
  farm: B({ name: 'Farm', desc: 'Renewable food. Needs a Mill.', size: 3, hp: 480, armor: [0, 0], cost: { wood: 60 }, time: 15, age: 1, req: 'mill', passable: true, los: 1, menu: 'eco' }),
  dock: B({ name: 'Dock', desc: 'Built on water. Trains ships, receives fish.', size: 3, hp: 1800, cost: { wood: 150 }, time: 35, age: 1, trains: ['fishing_ship', 'transport_ship', 'galley', 'fire_galley', 'cannon_galleon'], drop: ['food'], water: true, ageUp: true, los: 6, menu: 'eco' }),
  barracks: B({ name: 'Barracks', desc: 'Trains infantry.', size: 3, hp: 1200, cost: { wood: 175 }, time: 50, age: 1, trains: ['militia', 'spearman'], ageUp: true, menu: 'mil' }),
  palisade_wall: B({ name: 'Palisade Wall', desc: 'Cheap wooden wall. Drag to build a line.', size: 1, hp: 250, armor: [2, 5], cost: { wood: 3 }, time: 5, age: 1, wall: true, los: 2, menu: 'mil' }),
  palisade_gate: B({ name: 'Palisade Gate', desc: 'Lets your units through.', size: 1, hp: 400, armor: [2, 5], cost: { wood: 30 }, time: 20, age: 1, gate: true, los: 2, menu: 'mil' }),
  outpost: B({ name: 'Outpost', desc: 'Cheap lookout with a long line of sight.', size: 1, hp: 500, armor: [0, 0], cost: { wood: 25, stone: 10 }, time: 15, age: 1, los: 10, menu: 'mil' }),
  stone_wall: B({ name: 'Stone Wall', desc: 'Strong wall. Drag to build a line.', size: 1, hp: 1800, armor: [8, 10], cost: { stone: 5 }, time: 8, age: 2, wall: true, stoneDef: true, los: 2, menu: 'mil' }),
  gate: B({ name: 'Gate', desc: 'Stone gate. Lets your units through.', size: 1, hp: 2750, armor: [6, 6], cost: { stone: 30 }, time: 70, age: 2, gate: true, stoneDef: true, los: 3, menu: 'mil' }),
  watch_tower: B({ name: 'Watch Tower', desc: 'Fires arrows at enemies.', size: 1, hp: 1020, armor: [1, 7], cost: { wood: 25, stone: 125 }, time: 80, age: 2, atk: 5, range: 8, reload: 2, garrison: 5, stoneDef: true, los: 10, menu: 'mil' }),
  archery_range: B({ name: 'Archery Range', desc: 'Trains archers.', size: 3, hp: 1500, cost: { wood: 175 }, time: 50, age: 2, req: 'barracks', trains: ['archer', 'skirmisher', 'cavalry_archer', 'hand_cannoneer'], ageUp: true, menu: 'mil' }),
  stable: B({ name: 'Stable', desc: 'Trains cavalry.', size: 3, hp: 1500, cost: { wood: 175 }, time: 50, age: 2, req: 'barracks', trains: ['scout_cavalry', 'knight', 'camel_rider'], ageUp: true, menu: 'mil' }),
  blacksmith: B({ name: 'Blacksmith', desc: 'Researches attack and armour upgrades.', size: 3, hp: 2100, cost: { wood: 150 }, time: 40, age: 2, ageUp: true, menu: 'eco' }),
  market: B({ name: 'Market', desc: 'Buy and sell resources.', size: 3, hp: 2100, cost: { wood: 175 }, time: 60, age: 2, req: 'mill', ageUp: true, menu: 'eco' }),
  monastery: B({ name: 'Monastery', desc: 'Trains monks. Store relics here for gold.', size: 3, hp: 2100, cost: { wood: 175 }, time: 40, age: 3, trains: ['monk'], ageUp: true, los: 6, menu: 'eco' }),
  university: B({ name: 'University', desc: 'Researches building and siege improvements.', size: 3, hp: 2100, cost: { wood: 200 }, time: 60, age: 3, req: 'blacksmith', ageUp: true, menu: 'eco' }),
  siege_workshop: B({ name: 'Siege Workshop', desc: 'Builds siege weapons.', size: 3, hp: 2100, cost: { wood: 200 }, time: 40, age: 3, req: 'blacksmith', trains: ['battering_ram', 'mangonel', 'scorpion', 'bombard_cannon'], ageUp: true, menu: 'mil' }),
  castle: B({ name: 'Castle', desc: 'Fortress. Trains unique units and trebuchets.', size: 4, hp: 4800, armor: [8, 11], cost: { stone: 650 }, time: 200, age: 3, trains: ['trebuchet'], atk: 11, range: 8, reload: 2, garrison: 20, stoneDef: true, ageUp: true, los: 11, pop: 20, menu: 'mil' }),
  wonder: B({ name: 'Wonder', desc: 'Stand it for 5 minutes to win.', size: 5, hp: 4800, armor: [8, 50], cost: { food: 1000, wood: 1000, gold: 1000, stone: 1000 }, time: 600, age: 4, stoneDef: true, los: 8, max: 1, menu: 'eco' }),
};
export const buildingDef = (t: string): BuildingDef => (BUILDINGS as Record<string, BuildingDef>)[t];

// ---------------------------------------------------------------------------
// Modifiers — shared by civilization bonuses and technologies
// ---------------------------------------------------------------------------

export type UnitStat = 'hp' | 'atk' | 'armorM' | 'armorP' | 'range' | 'speed' | 'reload' | 'los' | 'cost' | 'time' | 'bldgBonus' | 'heal';
export type BuildingStat = 'bhp' | 'barmorM' | 'barmorP' | 'batk' | 'brange' | 'bcost' | 'btime' | 'bgarrison' | 'blos';
export type EcoStat =
  | 'gather_wood' | 'gather_gold' | 'gather_stone' | 'gather_farm' | 'gather_forage' | 'gather_hunt' | 'gather_sheep' | 'gather_fish'
  | 'carry' | 'farmFood' | 'build' | 'tcWork' | 'tradeFee' | 'relicGold' | 'convertTime' | 'monkRest' | 'popCap' | 'techCost';

export interface Mod {
  stat: UnitStat | BuildingStat | EcoStat;
  add?: number;
  mul?: number;
  u?: UnitKey[];
  c?: UnitClass[];
  b?: BuildingKey[] | 'all';
  fromAge?: number;
}

// ---------------------------------------------------------------------------
// Technologies
// ---------------------------------------------------------------------------

export interface TechDef {
  id: string;
  name: string;
  desc: string;
  at: BuildingKey;
  age: number;
  cost: Cost;
  time: number;
  req?: string[];
  mods?: Mod[];
  upgrade?: [UnitKey, UnitKey];
  civ?: CivId;
  icon: string;
  isAge?: number;
  unlocks?: UnitKey; // e.g. elite unique unit
}

const INF: UnitClass[] = ['infantry'];
const CAV: UnitClass[] = ['cavalry', 'camel'];
const ARCH: UnitClass[] = ['archer'];

export const TECHS: TechDef[] = [
  // Ages (researched at the Town Center)
  { id: 'feudal_age', name: 'Feudal Age', desc: 'Advance to the Feudal Age.', at: 'town_center', age: 1, cost: { food: 500 }, time: 130, isAge: 2, icon: 'age2' },
  { id: 'castle_age', name: 'Castle Age', desc: 'Advance to the Castle Age.', at: 'town_center', age: 2, cost: { food: 800, gold: 200 }, time: 160, isAge: 3, icon: 'age3' },
  { id: 'imperial_age', name: 'Imperial Age', desc: 'Advance to the Imperial Age.', at: 'town_center', age: 3, cost: { food: 1000, gold: 800 }, time: 190, isAge: 4, icon: 'age4' },

  // Town Center
  { id: 'loom', name: 'Loom', desc: 'Villagers +15 HP, +1/+2 armour.', at: 'town_center', age: 1, cost: { gold: 50 }, time: 25, icon: 'loom', mods: [{ stat: 'hp', add: 15, u: ['villager'] }, { stat: 'armorM', add: 1, u: ['villager'] }, { stat: 'armorP', add: 2, u: ['villager'] }] },
  { id: 'wheelbarrow', name: 'Wheelbarrow', desc: 'Villagers move 10% faster and carry 25% more.', at: 'town_center', age: 2, cost: { food: 175, wood: 50 }, time: 75, icon: 'wheelbarrow', mods: [{ stat: 'speed', mul: 1.1, u: ['villager'] }, { stat: 'carry', mul: 1.25 }] },
  { id: 'hand_cart', name: 'Hand Cart', desc: 'Villagers move 10% faster and carry 50% more.', at: 'town_center', age: 3, cost: { food: 300, wood: 200 }, time: 55, req: ['wheelbarrow'], icon: 'handcart', mods: [{ stat: 'speed', mul: 1.1, u: ['villager'] }, { stat: 'carry', mul: 1.2 }] },
  { id: 'town_watch', name: 'Town Watch', desc: 'Buildings +4 line of sight.', at: 'town_center', age: 2, cost: { food: 75 }, time: 25, icon: 'watch', mods: [{ stat: 'blos', add: 4, b: 'all' }] },
  { id: 'town_patrol', name: 'Town Patrol', desc: 'Buildings +4 line of sight.', at: 'town_center', age: 3, cost: { food: 300, gold: 100 }, time: 40, req: ['town_watch'], icon: 'watch', mods: [{ stat: 'blos', add: 4, b: 'all' }] },

  // Mill
  { id: 'horse_collar', name: 'Horse Collar', desc: 'Farms +75 food.', at: 'mill', age: 2, cost: { food: 75, wood: 75 }, time: 20, icon: 'farm', mods: [{ stat: 'farmFood', add: 75 }] },
  { id: 'heavy_plow', name: 'Heavy Plow', desc: 'Farms +125 food, farmers carry +1.', at: 'mill', age: 3, cost: { food: 125, wood: 125 }, time: 40, req: ['horse_collar'], icon: 'farm', mods: [{ stat: 'farmFood', add: 125 }] },
  { id: 'crop_rotation', name: 'Crop Rotation', desc: 'Farms +175 food.', at: 'mill', age: 4, cost: { food: 250, wood: 250 }, time: 70, req: ['heavy_plow'], icon: 'farm', mods: [{ stat: 'farmFood', add: 175 }] },

  // Lumber camp
  { id: 'double_bit_axe', name: 'Double-Bit Axe', desc: 'Lumberjacks +20% work rate.', at: 'lumber_camp', age: 2, cost: { food: 100, wood: 50 }, time: 25, icon: 'axe', mods: [{ stat: 'gather_wood', mul: 1.2 }] },
  { id: 'bow_saw', name: 'Bow Saw', desc: 'Lumberjacks +20% work rate.', at: 'lumber_camp', age: 3, cost: { food: 150, wood: 100 }, time: 50, req: ['double_bit_axe'], icon: 'axe', mods: [{ stat: 'gather_wood', mul: 1.2 }] },
  { id: 'two_man_saw', name: 'Two-Man Saw', desc: 'Lumberjacks +10% work rate.', at: 'lumber_camp', age: 4, cost: { food: 300, wood: 200 }, time: 100, req: ['bow_saw'], icon: 'axe', mods: [{ stat: 'gather_wood', mul: 1.1 }] },

  // Mining camp
  { id: 'gold_mining', name: 'Gold Mining', desc: 'Gold miners +15% work rate.', at: 'mining_camp', age: 2, cost: { food: 100, wood: 75 }, time: 30, icon: 'gold', mods: [{ stat: 'gather_gold', mul: 1.15 }] },
  { id: 'gold_shaft_mining', name: 'Gold Shaft Mining', desc: 'Gold miners +15% work rate.', at: 'mining_camp', age: 3, cost: { food: 200, wood: 150 }, time: 75, req: ['gold_mining'], icon: 'gold', mods: [{ stat: 'gather_gold', mul: 1.15 }] },
  { id: 'stone_mining', name: 'Stone Mining', desc: 'Stone miners +15% work rate.', at: 'mining_camp', age: 2, cost: { food: 100, wood: 75 }, time: 30, icon: 'stone', mods: [{ stat: 'gather_stone', mul: 1.15 }] },
  { id: 'stone_shaft_mining', name: 'Stone Shaft Mining', desc: 'Stone miners +15% work rate.', at: 'mining_camp', age: 3, cost: { food: 200, wood: 150 }, time: 75, req: ['stone_mining'], icon: 'stone', mods: [{ stat: 'gather_stone', mul: 1.15 }] },

  // Dock
  { id: 'gillnets', name: 'Gillnets', desc: 'Fishing ships +25% work rate.', at: 'dock', age: 3, cost: { food: 150, wood: 200 }, time: 45, icon: 'fish', mods: [{ stat: 'gather_fish', mul: 1.25 }] },
  { id: 'careening', name: 'Careening', desc: 'Ships +1 pierce armour.', at: 'dock', age: 3, cost: { food: 250, gold: 150 }, time: 50, icon: 'ship', mods: [{ stat: 'armorP', add: 1, c: ['ship'] }] },
  { id: 'war_galley_up', name: 'War Galley', desc: 'Upgrade Galleys to War Galleys.', at: 'dock', age: 3, cost: { food: 230, gold: 100 }, time: 50, upgrade: ['galley', 'war_galley'], icon: 'up' },
  { id: 'galleon_up', name: 'Galleon', desc: 'Upgrade War Galleys to Galleons.', at: 'dock', age: 4, cost: { food: 400, wood: 315 }, time: 65, req: ['war_galley_up'], upgrade: ['war_galley', 'galleon'], icon: 'up' },

  // Barracks
  { id: 'man_at_arms_up', name: 'Man-at-Arms', desc: 'Upgrade Militia to Man-at-Arms.', at: 'barracks', age: 2, cost: { food: 100, gold: 40 }, time: 40, upgrade: ['militia', 'man_at_arms'], icon: 'up' },
  { id: 'long_swordsman_up', name: 'Long Swordsman', desc: 'Upgrade to Long Swordsman.', at: 'barracks', age: 3, cost: { food: 200, gold: 65 }, time: 45, req: ['man_at_arms_up'], upgrade: ['man_at_arms', 'long_swordsman'], icon: 'up' },
  { id: 'two_handed_up', name: 'Two-Handed Swordsman', desc: 'Upgrade to Two-Handed Swordsman.', at: 'barracks', age: 4, cost: { food: 300, gold: 100 }, time: 75, req: ['long_swordsman_up'], upgrade: ['long_swordsman', 'two_handed_swordsman'], icon: 'up' },
  { id: 'champion_up', name: 'Champion', desc: 'Upgrade to Champion.', at: 'barracks', age: 4, cost: { food: 750, gold: 350 }, time: 100, req: ['two_handed_up'], upgrade: ['two_handed_swordsman', 'champion'], icon: 'up' },
  { id: 'pikeman_up', name: 'Pikeman', desc: 'Upgrade Spearmen to Pikemen.', at: 'barracks', age: 3, cost: { food: 215, gold: 90 }, time: 45, upgrade: ['spearman', 'pikeman'], icon: 'up' },
  { id: 'halberdier_up', name: 'Halberdier', desc: 'Upgrade Pikemen to Halberdiers.', at: 'barracks', age: 4, cost: { food: 300, gold: 600 }, time: 50, req: ['pikeman_up'], upgrade: ['pikeman', 'halberdier'], icon: 'up' },
  { id: 'squires', name: 'Squires', desc: 'Infantry move 10% faster.', at: 'barracks', age: 3, cost: { food: 200 }, time: 40, icon: 'boot', mods: [{ stat: 'speed', mul: 1.1, c: INF }] },

  // Archery range
  { id: 'crossbowman_up', name: 'Crossbowman', desc: 'Upgrade Archers to Crossbowmen.', at: 'archery_range', age: 3, cost: { food: 125, gold: 75 }, time: 35, upgrade: ['archer', 'crossbowman'], icon: 'up' },
  { id: 'arbalester_up', name: 'Arbalester', desc: 'Upgrade Crossbowmen to Arbalesters.', at: 'archery_range', age: 4, cost: { food: 350, gold: 300 }, time: 50, req: ['crossbowman_up'], upgrade: ['crossbowman', 'arbalester'], icon: 'up' },
  { id: 'elite_skirmisher_up', name: 'Elite Skirmisher', desc: 'Upgrade Skirmishers.', at: 'archery_range', age: 3, cost: { wood: 230, gold: 130 }, time: 50, upgrade: ['skirmisher', 'elite_skirmisher'], icon: 'up' },
  { id: 'heavy_ca_up', name: 'Heavy Cavalry Archer', desc: 'Upgrade Cavalry Archers.', at: 'archery_range', age: 4, cost: { food: 900, gold: 500 }, time: 50, upgrade: ['cavalry_archer', 'heavy_cavalry_archer'], icon: 'up' },
  { id: 'thumb_ring', name: 'Thumb Ring', desc: 'Archers fire 18% faster.', at: 'archery_range', age: 3, cost: { food: 300, wood: 250 }, time: 45, icon: 'bow', mods: [{ stat: 'reload', mul: 0.85, c: ARCH }] },

  // Stable
  { id: 'light_cavalry_up', name: 'Light Cavalry', desc: 'Upgrade Scouts to Light Cavalry.', at: 'stable', age: 3, cost: { food: 150, gold: 50 }, time: 45, upgrade: ['scout_cavalry', 'light_cavalry'], icon: 'up' },
  { id: 'hussar_up', name: 'Hussar', desc: 'Upgrade Light Cavalry to Hussars.', at: 'stable', age: 4, cost: { food: 500, gold: 600 }, time: 50, req: ['light_cavalry_up'], upgrade: ['light_cavalry', 'hussar'], icon: 'up' },
  { id: 'cavalier_up', name: 'Cavalier', desc: 'Upgrade Knights to Cavaliers.', at: 'stable', age: 4, cost: { food: 300, gold: 300 }, time: 100, upgrade: ['knight', 'cavalier'], icon: 'up' },
  { id: 'paladin_up', name: 'Paladin', desc: 'Upgrade Cavaliers to Paladins.', at: 'stable', age: 4, cost: { food: 1300, gold: 750 }, time: 170, req: ['cavalier_up'], upgrade: ['cavalier', 'paladin'], icon: 'up' },
  { id: 'heavy_camel_up', name: 'Heavy Camel Rider', desc: 'Upgrade Camel Riders.', at: 'stable', age: 4, cost: { food: 325, gold: 360 }, time: 85, upgrade: ['camel_rider', 'heavy_camel_rider'], icon: 'up' },
  { id: 'bloodlines', name: 'Bloodlines', desc: 'Mounted units +20 HP.', at: 'stable', age: 2, cost: { food: 150, gold: 100 }, time: 50, icon: 'horse', mods: [{ stat: 'hp', add: 20, c: ['cavalry', 'camel'] }] },
  { id: 'husbandry', name: 'Husbandry', desc: 'Mounted units move 10% faster.', at: 'stable', age: 3, cost: { food: 150 }, time: 40, icon: 'horse', mods: [{ stat: 'speed', mul: 1.1, c: ['cavalry', 'camel'] }] },

  // Blacksmith
  { id: 'forging', name: 'Forging', desc: 'Infantry & cavalry +1 attack.', at: 'blacksmith', age: 2, cost: { food: 150 }, time: 50, icon: 'sword', mods: [{ stat: 'atk', add: 1, c: [...INF, ...CAV] }] },
  { id: 'iron_casting', name: 'Iron Casting', desc: 'Infantry & cavalry +1 attack.', at: 'blacksmith', age: 3, cost: { food: 220, gold: 120 }, time: 75, req: ['forging'], icon: 'sword', mods: [{ stat: 'atk', add: 1, c: [...INF, ...CAV] }] },
  { id: 'blast_furnace', name: 'Blast Furnace', desc: 'Infantry & cavalry +2 attack.', at: 'blacksmith', age: 4, cost: { food: 275, gold: 225 }, time: 100, req: ['iron_casting'], icon: 'sword', mods: [{ stat: 'atk', add: 2, c: [...INF, ...CAV] }] },
  { id: 'scale_mail', name: 'Scale Mail Armor', desc: 'Infantry +1/+1 armour.', at: 'blacksmith', age: 2, cost: { food: 100 }, time: 40, icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: INF }, { stat: 'armorP', add: 1, c: INF }] },
  { id: 'chain_mail', name: 'Chain Mail Armor', desc: 'Infantry +1/+1 armour.', at: 'blacksmith', age: 3, cost: { food: 200, gold: 100 }, time: 55, req: ['scale_mail'], icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: INF }, { stat: 'armorP', add: 1, c: INF }] },
  { id: 'plate_mail', name: 'Plate Mail Armor', desc: 'Infantry +1/+2 armour.', at: 'blacksmith', age: 4, cost: { food: 300, gold: 150 }, time: 70, req: ['chain_mail'], icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: INF }, { stat: 'armorP', add: 2, c: INF }] },
  { id: 'scale_barding', name: 'Scale Barding Armor', desc: 'Cavalry +1/+1 armour.', at: 'blacksmith', age: 2, cost: { food: 150 }, time: 45, icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: CAV }, { stat: 'armorP', add: 1, c: CAV }] },
  { id: 'chain_barding', name: 'Chain Barding Armor', desc: 'Cavalry +1/+1 armour.', at: 'blacksmith', age: 3, cost: { food: 250, gold: 150 }, time: 60, req: ['scale_barding'], icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: CAV }, { stat: 'armorP', add: 1, c: CAV }] },
  { id: 'plate_barding', name: 'Plate Barding Armor', desc: 'Cavalry +1/+2 armour.', at: 'blacksmith', age: 4, cost: { food: 350, gold: 200 }, time: 75, req: ['chain_barding'], icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: CAV }, { stat: 'armorP', add: 2, c: CAV }] },
  { id: 'fletching', name: 'Fletching', desc: 'Archers, towers & TC +1 attack, +1 range.', at: 'blacksmith', age: 2, cost: { food: 100, gold: 50 }, time: 30, icon: 'arrow', mods: [{ stat: 'atk', add: 1, c: ARCH }, { stat: 'range', add: 1, c: ARCH }, { stat: 'batk', add: 1, b: ['town_center', 'watch_tower', 'castle'] }, { stat: 'brange', add: 1, b: ['town_center', 'watch_tower', 'castle'] }] },
  { id: 'bodkin_arrow', name: 'Bodkin Arrow', desc: 'Archers, towers & TC +1 attack, +1 range.', at: 'blacksmith', age: 3, cost: { food: 200, gold: 100 }, time: 35, req: ['fletching'], icon: 'arrow', mods: [{ stat: 'atk', add: 1, c: ARCH }, { stat: 'range', add: 1, c: ARCH }, { stat: 'batk', add: 1, b: ['town_center', 'watch_tower', 'castle'] }, { stat: 'brange', add: 1, b: ['town_center', 'watch_tower', 'castle'] }] },
  { id: 'bracer', name: 'Bracer', desc: 'Archers, towers & TC +1 attack, +1 range.', at: 'blacksmith', age: 4, cost: { food: 300, gold: 200 }, time: 40, req: ['bodkin_arrow'], icon: 'arrow', mods: [{ stat: 'atk', add: 1, c: ARCH }, { stat: 'range', add: 1, c: ARCH }, { stat: 'batk', add: 1, b: ['town_center', 'watch_tower', 'castle'] }, { stat: 'brange', add: 1, b: ['town_center', 'watch_tower', 'castle'] }] },
  { id: 'padded_archer_armor', name: 'Padded Archer Armor', desc: 'Archers +1/+1 armour.', at: 'blacksmith', age: 2, cost: { food: 100 }, time: 40, icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: ARCH }, { stat: 'armorP', add: 1, c: ARCH }] },
  { id: 'leather_archer_armor', name: 'Leather Archer Armor', desc: 'Archers +1/+1 armour.', at: 'blacksmith', age: 3, cost: { food: 150, gold: 150 }, time: 55, req: ['padded_archer_armor'], icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: ARCH }, { stat: 'armorP', add: 1, c: ARCH }] },
  { id: 'ring_archer_armor', name: 'Ring Archer Armor', desc: 'Archers +1/+2 armour.', at: 'blacksmith', age: 4, cost: { food: 250, gold: 250 }, time: 70, req: ['leather_archer_armor'], icon: 'armor', mods: [{ stat: 'armorM', add: 1, c: ARCH }, { stat: 'armorP', add: 2, c: ARCH }] },

  // University
  { id: 'masonry', name: 'Masonry', desc: 'Buildings +10% HP, +1/+1 armour.', at: 'university', age: 3, cost: { food: 150, stone: 175 }, time: 50, icon: 'wall', mods: [{ stat: 'bhp', mul: 1.1, b: 'all' }, { stat: 'barmorM', add: 1, b: 'all' }, { stat: 'barmorP', add: 1, b: 'all' }] },
  { id: 'architecture', name: 'Architecture', desc: 'Buildings +10% HP, +1/+1 armour.', at: 'university', age: 4, cost: { food: 300, stone: 200 }, time: 70, req: ['masonry'], icon: 'wall', mods: [{ stat: 'bhp', mul: 1.1, b: 'all' }, { stat: 'barmorM', add: 1, b: 'all' }, { stat: 'barmorP', add: 1, b: 'all' }] },
  { id: 'ballistics', name: 'Ballistics', desc: 'Ranged units and towers fire faster.', at: 'university', age: 3, cost: { wood: 300, gold: 175 }, time: 60, icon: 'target', mods: [{ stat: 'reload', mul: 0.93, c: ['archer', 'ship'] }] },
  { id: 'murder_holes', name: 'Murder Holes', desc: 'Towers and castles +2 attack.', at: 'university', age: 3, cost: { food: 200, stone: 100 }, time: 60, icon: 'tower', mods: [{ stat: 'batk', add: 2, b: ['watch_tower', 'castle', 'town_center'] }] },
  { id: 'guard_tower', name: 'Guard Tower', desc: 'Towers +1 attack, +500 HP.', at: 'university', age: 3, cost: { food: 100, wood: 250 }, time: 30, icon: 'tower', mods: [{ stat: 'batk', add: 1, b: ['watch_tower'] }, { stat: 'bhp', mul: 1.5, b: ['watch_tower'] }] },
  { id: 'keep', name: 'Keep', desc: 'Towers +1 attack, +1 range, +750 HP.', at: 'university', age: 4, cost: { food: 500, wood: 350 }, time: 75, req: ['guard_tower'], icon: 'tower', mods: [{ stat: 'batk', add: 1, b: ['watch_tower'] }, { stat: 'brange', add: 1, b: ['watch_tower'] }, { stat: 'bhp', mul: 1.5, b: ['watch_tower'] }] },
  { id: 'chemistry', name: 'Chemistry', desc: 'Ranged units +1 attack. Unlocks gunpowder.', at: 'university', age: 4, cost: { food: 300, gold: 200 }, time: 100, icon: 'fire', mods: [{ stat: 'atk', add: 1, c: ['archer', 'ship'] }, { stat: 'batk', add: 1, b: ['watch_tower', 'castle', 'town_center'] }] },
  { id: 'siege_engineers', name: 'Siege Engineers', desc: 'Siege +1 range, +20% vs buildings.', at: 'university', age: 4, cost: { food: 500, wood: 600 }, time: 45, icon: 'siege', mods: [{ stat: 'range', add: 1, u: ['mangonel', 'onager', 'scorpion', 'heavy_scorpion', 'bombard_cannon'] }, { stat: 'bldgBonus', mul: 1.2, c: ['siege'] }] },
  { id: 'fortified_wall', name: 'Fortified Wall', desc: 'Walls +60% HP.', at: 'university', age: 4, cost: { food: 200, stone: 100 }, time: 50, icon: 'wall', mods: [{ stat: 'bhp', mul: 1.6, b: ['stone_wall', 'gate'] }] },

  // Monastery
  { id: 'sanctity', name: 'Sanctity', desc: 'Monks +15 HP.', at: 'monastery', age: 3, cost: { gold: 120 }, time: 60, icon: 'monk', mods: [{ stat: 'hp', add: 15, u: ['monk'] }] },
  { id: 'fervor', name: 'Fervor', desc: 'Monks move 15% faster.', at: 'monastery', age: 3, cost: { gold: 140 }, time: 50, icon: 'monk', mods: [{ stat: 'speed', mul: 1.15, u: ['monk'] }] },
  { id: 'atonement', name: 'Atonement', desc: 'Monks recover 50% faster after converting.', at: 'monastery', age: 3, cost: { gold: 325 }, time: 40, icon: 'monk', mods: [{ stat: 'monkRest', mul: 0.5 }] },
  { id: 'block_printing', name: 'Block Printing', desc: 'Monks +3 range.', at: 'monastery', age: 4, cost: { gold: 200 }, time: 55, icon: 'monk', mods: [{ stat: 'range', add: 3, u: ['monk'] }] },

  // Siege workshop
  { id: 'capped_ram_up', name: 'Capped Ram', desc: 'Upgrade Battering Rams.', at: 'siege_workshop', age: 4, cost: { food: 300 }, time: 50, upgrade: ['battering_ram', 'capped_ram'], icon: 'up' },
  { id: 'onager_up', name: 'Onager', desc: 'Upgrade Mangonels to Onagers.', at: 'siege_workshop', age: 4, cost: { food: 800, gold: 500 }, time: 75, upgrade: ['mangonel', 'onager'], icon: 'up' },
  { id: 'heavy_scorpion_up', name: 'Heavy Scorpion', desc: 'Upgrade Scorpions.', at: 'siege_workshop', age: 4, cost: { food: 1000, wood: 1100 }, time: 50, upgrade: ['scorpion', 'heavy_scorpion'], icon: 'up' },

  // Castle
  { id: 'hoardings', name: 'Hoardings', desc: 'Castles +21% HP.', at: 'castle', age: 4, cost: { wood: 400, stone: 400 }, time: 75, icon: 'castle', mods: [{ stat: 'bhp', mul: 1.21, b: ['castle'] }] },
  { id: 'conscription', name: 'Conscription', desc: 'Military buildings train 33% faster.', at: 'castle', age: 4, cost: { food: 150, gold: 150 }, time: 60, icon: 'clock', mods: [{ stat: 'time', mul: 0.75, c: ['infantry', 'archer', 'cavalry', 'camel'] }] },

  // Unique technologies (Castle)
  { id: 'yeomen', name: 'Yeomen', desc: 'Foot archers +1 range, towers +2 attack.', at: 'castle', age: 3, cost: { food: 750, gold: 450 }, time: 60, civ: 'britons', icon: 'unique', mods: [{ stat: 'range', add: 1, u: ['archer', 'crossbowman', 'arbalester', 'longbowman', 'skirmisher', 'elite_skirmisher'] }, { stat: 'batk', add: 2, b: ['watch_tower'] }] },
  { id: 'chivalry', name: 'Chivalry', desc: 'Stables work 40% faster.', at: 'castle', age: 3, cost: { food: 400, wood: 400 }, time: 40, civ: 'franks', icon: 'unique', mods: [{ stat: 'time', mul: 0.6, c: ['cavalry'] }] },
  { id: 'ironclad', name: 'Ironclad', desc: 'Siege weapons +4 melee armour.', at: 'castle', age: 3, cost: { wood: 400, gold: 350 }, time: 60, civ: 'teutons', icon: 'unique', mods: [{ stat: 'armorM', add: 4, c: ['siege'] }] },
  { id: 'nomads', name: 'Nomads', desc: 'Cavalry archers +20 HP.', at: 'castle', age: 3, cost: { wood: 300, gold: 300 }, time: 40, civ: 'mongols', icon: 'unique', mods: [{ stat: 'hp', add: 20, c: ['cavarcher'] }] },
  { id: 'greek_fire', name: 'Greek Fire', desc: 'Fire galleys +1 range, monks heal faster.', at: 'castle', age: 3, cost: { food: 250, gold: 300 }, time: 40, civ: 'byzantines', icon: 'unique', mods: [{ stat: 'range', add: 1, u: ['fire_galley'] }, { stat: 'heal', mul: 2, u: ['monk'] }] },
  { id: 'kataparuto', name: 'Kataparuto', desc: 'Trebuchets fire 33% faster.', at: 'castle', age: 3, cost: { wood: 550, gold: 400 }, time: 60, civ: 'japanese', icon: 'unique', mods: [{ stat: 'reload', mul: 0.75, u: ['trebuchet'] }] },
  { id: 'chieftains', name: 'Chieftains', desc: 'Infantry +5 attack vs cavalry.', at: 'castle', age: 3, cost: { food: 400, gold: 300 }, time: 45, civ: 'vikings', icon: 'unique', mods: [{ stat: 'atk', add: 2, c: ['infantry'] }] },
  { id: 'zealotry', name: 'Zealotry', desc: 'Camels +20 HP.', at: 'castle', age: 3, cost: { food: 750, gold: 800 }, time: 50, civ: 'saracens', icon: 'unique', mods: [{ stat: 'hp', add: 20, c: ['camel'] }] },
  { id: 'kamandaran', name: 'Kamandaran', desc: 'Archers cost wood instead of gold (cheaper).', at: 'castle', age: 3, cost: { food: 400, gold: 300 }, time: 40, civ: 'persians', icon: 'unique', mods: [{ stat: 'cost', mul: 0.85, c: ['archer'] }] },
  { id: 'great_wall', name: 'Great Wall', desc: 'Walls and towers +30% HP.', at: 'castle', age: 3, cost: { wood: 400, stone: 400 }, time: 60, civ: 'chinese', icon: 'unique', mods: [{ stat: 'bhp', mul: 1.3, b: ['stone_wall', 'gate', 'watch_tower', 'palisade_wall'] }] },
  { id: 'elite_unique', name: 'Elite Unique Unit', desc: 'Your unique unit gets +20% HP and +2 attack.', at: 'castle', age: 4, cost: { food: 900, gold: 700 }, time: 60, icon: 'unique', mods: [{ stat: 'hp', mul: 1.2, c: ['unique'] }, { stat: 'atk', add: 2, c: ['unique'] }] },
];
export const TECH_BY_ID: Record<string, TechDef> = Object.fromEntries(TECHS.map((t) => [t.id, t]));

// ---------------------------------------------------------------------------
// Civilizations
// ---------------------------------------------------------------------------

export type CivId = 'britons' | 'franks' | 'teutons' | 'mongols' | 'byzantines' | 'japanese' | 'vikings' | 'saracens' | 'persians' | 'chinese';

export interface CivDef {
  id: CivId;
  name: string;
  unique: UnitKey;
  bonuses: string[];
  mods: Mod[];
  freeTechs?: string[];
  favour: UnitKey[]; // preferred AI army
  banner: string; // emblem colour
}

export const CIVS: Record<CivId, CivDef> = {
  britons: { id: 'britons', name: 'Britons', unique: 'longbowman', banner: '#c62828',
    bonuses: ['Foot archers +1 range in Castle Age, +1 in Imperial', 'Shepherds work 25% faster', 'Town Centers cost 50% less wood'],
    mods: [{ stat: 'range', add: 1, c: ['archer'], fromAge: 3 }, { stat: 'range', add: 1, c: ['archer'], fromAge: 4 }, { stat: 'gather_sheep', mul: 1.25 }, { stat: 'bcost', mul: 0.75, b: ['town_center'] }],
    favour: ['archer', 'longbowman', 'spearman', 'skirmisher'] },
  franks: { id: 'franks', name: 'Franks', unique: 'throwing_axeman', banner: '#1565c0',
    bonuses: ['Cavalry +20% HP', 'Foragers work 15% faster', 'Castles 15% cheaper'],
    mods: [{ stat: 'hp', mul: 1.2, c: ['cavalry'] }, { stat: 'gather_forage', mul: 1.15 }, { stat: 'bcost', mul: 0.85, b: ['castle'] }],
    favour: ['knight', 'scout_cavalry', 'throwing_axeman'] },
  teutons: { id: 'teutons', name: 'Teutons', unique: 'teutonic_knight', banner: '#37474f',
    bonuses: ['Farms cost 40% less', 'Towers garrison twice as many units', 'Infantry +1 melee armour from Castle Age'],
    mods: [{ stat: 'bcost', mul: 0.6, b: ['farm'] }, { stat: 'bgarrison', mul: 2, b: ['watch_tower'] }, { stat: 'armorM', add: 1, c: ['infantry'], fromAge: 3 }],
    favour: ['militia', 'knight', 'teutonic_knight', 'spearman'] },
  mongols: { id: 'mongols', name: 'Mongols', unique: 'mangudai', banner: '#6d4c41',
    bonuses: ['Hunters work 40% faster', 'Cavalry archers fire 25% faster', 'Light cavalry +30% HP'],
    mods: [{ stat: 'gather_hunt', mul: 1.4 }, { stat: 'reload', mul: 0.8, c: ['cavarcher'] }, { stat: 'hp', mul: 1.3, u: ['light_cavalry', 'hussar'] }],
    favour: ['cavalry_archer', 'mangudai', 'scout_cavalry'] },
  byzantines: { id: 'byzantines', name: 'Byzantines', unique: 'cataphract', banner: '#6a1b9a',
    bonuses: ['Buildings +10% HP per age', 'Spearmen, skirmishers & camels 25% cheaper', 'Monks heal 50% faster'],
    mods: [{ stat: 'bhp', mul: 1.1, b: 'all', fromAge: 2 }, { stat: 'bhp', mul: 1.1, b: 'all', fromAge: 3 }, { stat: 'bhp', mul: 1.1, b: 'all', fromAge: 4 }, { stat: 'cost', mul: 0.75, c: ['spear', 'skirm', 'camel'] }, { stat: 'heal', mul: 1.5, u: ['monk'] }],
    favour: ['spearman', 'skirmisher', 'camel_rider', 'cataphract'] },
  japanese: { id: 'japanese', name: 'Japanese', unique: 'samurai', banner: '#d32f2f',
    bonuses: ['Infantry attack 33% faster', 'Fishing ships +100% HP', 'Mills & camps cost 50% less'],
    mods: [{ stat: 'reload', mul: 0.75, c: ['infantry'] }, { stat: 'hp', mul: 2, u: ['fishing_ship'] }, { stat: 'bcost', mul: 0.5, b: ['mill', 'lumber_camp', 'mining_camp'] }],
    favour: ['militia', 'samurai', 'archer', 'spearman'] },
  vikings: { id: 'vikings', name: 'Vikings', unique: 'berserk', banner: '#00838f',
    bonuses: ['Infantry +15% HP', 'Wheelbarrow & Hand Cart free', 'Warships 15% cheaper'],
    mods: [{ stat: 'hp', mul: 1.15, c: ['infantry'] }, { stat: 'cost', mul: 0.85, c: ['ship'] }],
    freeTechs: ['wheelbarrow', 'hand_cart'],
    favour: ['militia', 'berserk', 'archer', 'spearman'] },
  saracens: { id: 'saracens', name: 'Saracens', unique: 'mameluke', banner: '#f9a825',
    bonuses: ['Market fee only 5%', 'Foot archers +2 attack vs buildings', 'Camels +10% HP'],
    mods: [{ stat: 'tradeFee', mul: 0.33 }, { stat: 'bldgBonus', add: 2, c: ['archer'] }, { stat: 'hp', mul: 1.1, c: ['camel'] }],
    favour: ['camel_rider', 'mameluke', 'archer', 'knight'] },
  persians: { id: 'persians', name: 'Persians', unique: 'war_elephant', banner: '#2e7d32',
    bonuses: ['Start with +50 food and +50 wood', 'Town Centers +100% HP', 'Cavalry +1 attack'],
    mods: [{ stat: 'bhp', mul: 2, b: ['town_center'] }, { stat: 'atk', add: 1, c: ['cavalry'] }],
    favour: ['knight', 'war_elephant', 'scout_cavalry'] },
  chinese: { id: 'chinese', name: 'Chinese', unique: 'chu_ko_nu', banner: '#ef6c00',
    bonuses: ['Technologies cost 10% less', 'Town Centers support 15 population', 'Siege weapons +1/+1 armour'],
    mods: [{ stat: 'techCost', mul: 0.9 }, { stat: 'popCap', add: 10 }, { stat: 'armorM', add: 1, c: ['siege'] }, { stat: 'armorP', add: 1, c: ['siege'] }],
    favour: ['archer', 'chu_ko_nu', 'skirmisher', 'spearman'] },
};
/**
 * Playable civilizations. The game is trimmed to two easy-to-learn, contrasting
 * civilizations: Britons (archers) and Franks (cavalry). The full CIVS table is
 * kept so older save games that used other civilizations still load.
 */
export const PLAYABLE_CIVS: CivId[] = ['britons', 'franks'];
export const CIV_LIST = PLAYABLE_CIVS.map((id) => CIVS[id]);
/** Short beginner-friendly summary for each playable civilization. */
export const CIV_BLURB: Partial<Record<CivId, string>> = {
  britons: 'Archer specialists. Shoot enemies from a distance — great for defending.',
  franks: 'Cavalry specialists. Strong, fast knights — great for attacking.',
};

// ---------------------------------------------------------------------------
// Economy constants
// ---------------------------------------------------------------------------

export type GatherKind = 'wood' | 'gold' | 'stone' | 'farm' | 'forage' | 'hunt' | 'sheep' | 'fish';
export const GATHER_RATE: Record<GatherKind, number> = {
  wood: 0.39, gold: 0.38, stone: 0.36, farm: 0.32, forage: 0.31, hunt: 0.41, sheep: 0.33, fish: 0.43,
};
export const GATHER_RES: Record<GatherKind, Res> = {
  wood: 'wood', gold: 'gold', stone: 'stone', farm: 'food', forage: 'food', hunt: 'food', sheep: 'food', fish: 'food',
};
export const CARRY_BASE = 10;
export const FISH_SHIP_CARRY = 15;
export const FARM_FOOD = 175;
export const BUILD_REPAIR_RATE = 0.5;
export const RELIC_GOLD_PER_S = 0.5;
export const TRAIN_QUEUE_MAX = 10;

export type NodeKind = 'tree' | 'berry' | 'gold' | 'stone' | 'fish';
export const NODE_DEFS: Record<NodeKind, { res: Res; amount: number; gather: GatherKind; name: string }> = {
  tree: { res: 'wood', amount: 100, gather: 'wood', name: 'Tree' },
  berry: { res: 'food', amount: 125, gather: 'forage', name: 'Forage Bush' },
  gold: { res: 'gold', amount: 800, gather: 'gold', name: 'Gold Mine' },
  stone: { res: 'stone', amount: 350, gather: 'stone', name: 'Stone Mine' },
  fish: { res: 'food', amount: 225, gather: 'fish', name: 'Fish' },
};

export const AGE_NAMES = ['', 'Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'];
export const AGE_NUM = ['', 'I', 'II', 'III', 'IV'];

export const PLAYER_COLORS = ['#888888', '#2f6fe4', '#e23b3b', '#2fb350', '#f2c230', '#2ec6d0', '#a453e0', '#9e9e9e', '#f08a24'];
export const PLAYER_COLOR_NAMES = ['', 'Blue', 'Red', 'Green', 'Yellow', 'Cyan', 'Purple', 'Grey', 'Orange'];
