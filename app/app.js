// Leonida Platinum — offline GTA VI trophy tracker and guide.
// Progress lives only in this browser (localStorage). Export and import move it as JSON.
// The page makes no network requests of its own; it reads data/trophies.json from its own folder.

const STORAGE_KEY = 'leonida-platinum-earned-v1';
const KIND_LABELS = {
  story: 'Story', stranger: 'Strangers', collectible: 'Collectibles', activity: 'Activities',
  robbery: 'Robberies', money: 'Money', completion: 'Completion', other: 'Other',
};
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

// The roadmap: six phases, each a list of trophy ids in the order to earn them.
const ROADMAP = [
  { title: 'Phase 1 — Play the story', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    note: 'Twelve story trophies unlock on their own as the chapters and missions pass. Do the Chapter 1 meditation spot before the chapter ends — it is the run\u2019s one possibly missable trophy.' },
  { title: 'Phase 2 — Stranger strands', ids: [22, 23, 24, 25, 26, 27, 29],
    note: 'Meet the strangers across Leonida and finish their strands. Eight finished strands earn the silver; each person\u2019s final mission is its own trophy.' },
  { title: 'Phase 3 — Activities and races', ids: [15, 16, 17, 18, 19, 20, 21, 32, 46, 51],
    note: 'The grindy middle: 250 stunts, gold at all 42 shooting-range challenges, 20 different races, drone races at every location, 50 challenges — plus fishing, the arcade and the bowling alley.' },
  { title: 'Phase 4 — Collectibles and the world', ids: [28, 30, 31, 35, 42, 44, 45, 47, 48, 49, 50],
    note: 'Slow, mappable work: 18 meditation spots, 3 card sets, 100 WAiNK scans, 100 vehicles, every area of Leonida — and the quiet hidden trophies that unlock while you explore.' },
  { title: 'Phase 5 — Crime and money', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 52, 53, 54, 55],
    note: 'Robberies and cash: 5 bank vaults, an armored truck, a jewelry store without being seen, one illegal operation per gang — then launder $250,000, spend $100,000 and buy every garage.' },
  { title: 'Phase 6 — 100% and the Platinum', ids: [14, 1],
    note: 'The in-game 100% checklist opens after the story. Finish it and A Long Road pops; the Platinum follows the moment the last other trophy does.' },
];

const params = new URLSearchParams(location.search);
const listEl = document.getElementById('trophy-list');
const emptyNote = document.getElementById('empty-note');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const kindEl = document.getElementById('kind-filter');
const hideEarnedEl = document.getElementById('hide-earned');
const spoilerEl = document.getElementById('spoiler-toggle');

let data = null;
let earned = new Set();
let openId = null;

function loadEarned() {
  try { earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
  catch { earned = new Set(); }
}
function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(t) { return t.grade[0].toUpperCase() + t.grade.slice(1); }
function sourceName(key) {
  const s = (data.sources || []).find((x) => x.key === key);
  return s ? s.name : key;
}
function isHiddenFromSpoilers(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function cardFor(t) {
  const card = document.createElement('article');
  card.className = 'trophy-card' + (earned.has(t.id) ? ' earned' : '');
  card.dataset.id = String(t.id);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    renderAll();
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'card-title';
  const name = document.createElement('h3');
  if (isHiddenFromSpoilers(t)) {
    name.textContent = 'Hidden story trophy';
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = 'A story trophy. Earn it to reveal its name and description.';
    title.append(name, desc);
  } else {
    name.textContent = t.name;
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = t.description;
    title.append(name, desc);
  }
  head.append(title);

  const badge = document.createElement('span');
  badge.className = 'grade-badge grade-' + t.grade;
  badge.textContent = gradeLabel(t);
  head.append(badge);
  card.append(head);

  const tags = document.createElement('p');
  tags.className = 'card-tags';
  const tagTexts = [KIND_LABELS[t.kind] || t.kind];
  if (t.hidden) tagTexts.push('Hidden');
  if (t.missable) tagTexts.push('Possibly missable');
  tags.textContent = tagTexts.join(' · ');
  card.append(tags);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = openId === t.id ? 'Hide guide' : 'Show guide';
  toggle.addEventListener('click', () => {
    openId = openId === t.id ? null : t.id;
    renderAll();
  });
  card.append(toggle);

  if (openId === t.id) {
    const guide = document.createElement('div');
    guide.className = 'card-guide';
    const p = document.createElement('p');
    p.textContent = t.guide;
    guide.append(p);
    const src = document.createElement('p');
    src.className = 'card-sources';
    src.textContent = 'Sources: ' + t.sources.map(sourceName).join('; ');
    guide.append(src);
    card.append(guide);
  }
  return card;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return data.trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderProgress() {
  const total = data.trophies.length;
  const done = earned.size;
  document.getElementById('progress-text').textContent = done + ' of ' + total + ' earned';
  document.getElementById('progress-fill').style.width = Math.round((done / total) * 100) + '%';
  const counts = GRADE_ORDER.map((g) => {
    const all = data.trophies.filter((t) => t.grade === g).length;
    const got = data.trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return gradeLabel({ grade: g }) + ' ' + got + '/' + all;
  }).join(' · ');
  document.getElementById('grade-counts').textContent = counts;
  const next = ROADMAP.flatMap((p) => p.ids).map((id) => data.trophies.find((t) => t.id === id)).find((t) => t && !earned.has(t.id));
  document.getElementById('next-up').textContent = next
    ? 'Next up: ' + (isHiddenFromSpoilers(next) ? 'a hidden story trophy' : next.name) + ' — ' + next.description
    : 'All 55 earned — the Platinum is yours.';
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(cardFor));
  emptyNote.hidden = shown.length !== 0;
  document.getElementById('filter-count').textContent = shown.length + ' of ' + data.trophies.length + ' shown';
}

function renderRoadmap() {
  const wrap = document.getElementById('roadmap-phases');
  wrap.replaceChildren();
  for (const phase of ROADMAP) {
    const box = document.createElement('div');
    box.className = 'phase-card';
    const h = document.createElement('h3');
    const done = phase.ids.filter((id) => earned.has(id)).length;
    h.textContent = phase.title + ' — ' + done + '/' + phase.ids.length;
    box.append(h);
    const note = document.createElement('p');
    note.textContent = phase.note;
    box.append(note);
    const ul = document.createElement('ul');
    for (const id of phase.ids) {
      const t = data.trophies.find((x) => x.id === id);
      const li = document.createElement('li');
      li.className = earned.has(id) ? 'done' : '';
      li.textContent = (earned.has(id) ? '✓ ' : '○ ') + (isHiddenFromSpoilers(t) ? 'Hidden story trophy' : t.name) + ' (' + gradeLabel(t) + ')';
      ul.append(li);
    }
    box.append(ul);
    wrap.append(box);
  }
}

function renderMissables() {
  const wrap = document.getElementById('missable-list');
  const miss = data.trophies.filter((t) => t.missable);
  wrap.replaceChildren(...miss.map(cardFor));
}

function renderSources() {
  const ul = document.getElementById('source-list');
  ul.replaceChildren();
  for (const s of data.sources) {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    ul.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
  renderMissables();
  renderSources();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + name));
}
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

for (const el of [searchEl, gradeEl, kindEl, hideEarnedEl, spoilerEl]) {
  el.addEventListener('input', renderAll);
}

document.getElementById('export-btn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    const valid = new Set(data.trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    saveEarned();
  } catch { /* ignore a bad file; progress is unchanged */ }
  e.target.value = '';
  renderAll();
});
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveEarned();
  renderAll();
});

// Deep links: ?tab=roadmap|missables|sources, ?open=<id>, ?check=1,14,15, ?spoilers=off
loadEarned();
if (params.get('tab')) switchTab(params.get('tab'));
if (params.get('spoilers') === 'off') spoilerEl.checked = false;
if (params.get('open')) {
  const id = Number(params.get('open'));
  if (Number.isInteger(id)) openId = id;
}

data = await (await fetch('data/trophies.json')).json();
if (params.get('check')) {
  const valid = new Set(data.trophies.map((t) => t.id));
  for (const raw of params.get('check').split(',')) {
    const id = Number(raw);
    if (Number.isInteger(id) && valid.has(id)) earned.add(id);
  }
  saveEarned();
}
renderAll();
