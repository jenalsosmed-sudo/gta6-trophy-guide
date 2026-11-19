// Leonida Platinum — offline GTA VI trophy tracker.
// Progress lives only in this browser (localStorage); export/import move it as JSON.
const KEY = 'leonida-platinum-progress-v1';
const SOURCE_NAMES = {
  official: 'Official trophy list (PSN)',
  pushsquare: 'Push Square — GTA 6 Trophy Guide & Roadmap',
  powerpyx: 'PowerPyx (as reported by GTA Zone)',
  outputlag: 'Output Lag — GTA 6 Trophy List',
  planetgta6: 'PlanetGTA6 — GTA 6 Trophies',
};
const KIND_LABELS = {
  story: 'Story', stranger: 'Stranger missions', collectible: 'Collectibles',
  activity: 'Activities', robbery: 'Robberies', money: 'Money',
  completion: 'Platinum & 100%', other: 'Other moments',
};

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]').filter((id) => byId.has(id)));

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const qEl = $('q');
const gradeEl = $('grade');
const kindEl = $('kind');
const stateEl = $('state');
const spoilersEl = $('spoilers');

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeCount(grade) {
  return trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
}

function renderProgress() {
  const total = trophies.length;
  $('count-earned').textContent = earned.size;
  $('count-total').textContent = total;
  $('count-platinum').textContent = `${gradeCount('platinum')}/1`;
  $('count-gold').textContent = `${gradeCount('gold')}/2`;
  $('count-silver').textContent = `${gradeCount('silver')}/6`;
  $('count-bronze').textContent = `${gradeCount('bronze')}/46`;
  $('bar-fill').style.width = `${Math.round((earned.size / total) * 100)}%`;
  const next = trophies.find((t) => !earned.has(t.id) && t.kind === 'story') ?? trophies.find((t) => !earned.has(t.id));
  $('next-up').textContent = next
    ? `Next up: ${next.name} — ${next.description}`
    : 'Platinum earned — every trophy in Leonida is yours. Congratulations, Leonida Legend!';
}

function matches(t) {
  const q = qEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value === 'missable') { if (!t.missable) return false; }
  else if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (stateEl.value === 'earned' && !earned.has(t.id)) return false;
  if (stateEl.value === 'remaining' && earned.has(t.id)) return false;
  return true;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  const head = document.createElement('div');
  const badge = document.createElement('span');
  badge.className = `badge ${t.grade}`;
  badge.textContent = t.grade;
  head.append(badge);
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = KIND_LABELS[t.kind] ?? t.kind;
  head.append(kind);
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = '⚠ Possibly missable';
    head.append(flag);
  }
  card.append(head);
  const title = document.createElement('h3');
  title.textContent = t.name;
  card.append(title);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `“${t.description}” — official description`;
  card.append(official);
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  card.append(guide);
  const src = document.createElement('p');
  src.className = 'src';
  src.textContent = 'Sources: ' + t.sources.map((s) => SOURCE_NAMES[s] ?? s).join(' · ');
  card.append(src);
  const earn = document.createElement('label');
  earn.className = 'earn';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderProgress();
    renderCards();
  });
  earn.append(box, document.createTextNode(earned.has(t.id) ? 'Earned' : 'Mark as earned'));
  card.append(earn);
  return card;
}

function hiddenCard(t) {
  const card = document.createElement('article');
  card.className = 'card hidden-card';
  const lock = document.createElement('div');
  lock.className = 'lock';
  lock.textContent = '🔒';
  card.append(lock);
  const badge = document.createElement('span');
  badge.className = `badge ${t.grade}`;
  badge.textContent = t.grade;
  card.append(badge);
  const p = document.createElement('p');
  p.textContent = 'Hidden story trophy — its name and description stay hidden until you earn it, or until you switch spoilers off.';
  card.append(p);
  const earn = document.createElement('label');
  earn.className = 'earn';
  earn.style.justifyContent = 'center';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = false;
  box.setAttribute('aria-label', 'Mark hidden story trophy as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    save();
    renderProgress();
    renderCards();
  });
  earn.append(box, document.createTextNode('Mark as earned'));
  card.append(earn);
  return card;
}

function renderCards() {
  cardsEl.replaceChildren();
  const shown = trophies.filter(matches);
  $('result-count').textContent = `Showing ${shown.length} of ${trophies.length} trophies` +
    (spoilersEl.checked ? ' — story spoilers hidden until earned.' : ' — spoilers shown.');
  for (const t of shown) {
    cardsEl.append(t.hidden && spoilersEl.checked && !earned.has(t.id) ? hiddenCard(t) : trophyCard(t));
  }
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'No trophies match those filters — loosen the search or the filters.';
    cardsEl.append(p);
  }
}

for (const el of [qEl, gradeEl, kindEl, stateEl, spoilersEl]) {
  el.addEventListener(el === qEl ? 'input' : 'change', renderCards);
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab').forEach((s) => s.classList.toggle('active', s.id === `tab-${btn.dataset.tab}`));
  });
});

$('export').addEventListener('click', () => {
  const payload = { app: 'leonida-platinum', version: 1, earned: [...earned].sort((a, b) => a - b), exported: new Date().toISOString() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = ids.filter((id) => byId.has(id));
    if (!valid.length && ids.length) throw new Error('no known trophy ids');
    earned = new Set(valid);
    save();
    renderProgress();
    renderCards();
  } catch {
    alert('That file is not a Leonida Platinum progress export.');
  }
  e.target.value = '';
});

$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    renderProgress();
    renderCards();
  }
});

renderProgress();
renderCards();
