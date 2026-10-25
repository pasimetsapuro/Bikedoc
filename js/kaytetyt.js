// Julkinen myyntitaulukko. Sen jakamisen on sallittava katselu ilman kirjautumista.
const source = {
  spreadsheetId: '1VuVfVprnpPOujEw6q723R1lpQpqYgc7nIeBDe5tS-b4',
  sheetId: '187111732'
};

const columnNames = {
  name: 'Pyörän merkki', size: 'Runkokoko', year: 'Vuosimalli', color: 'Väri',
  condition: 'Yleiskunto', service: 'Viimeisin huolto', description: 'Huomautettavat asiat',
  gears: 'Vaihteisto ja vaihteiden määrä', brakes: 'Jarrut', price: 'Hinta', photo: 'Kuva',
  type: 'Pyörätyyppi', electric: 'Sähköpyörä', motor: 'Moottorivalmistaja',
  battery: 'Akun kapasiteetti', serviced: 'Huollettu', status: 'Tila'
};
const categoryLabels = {
  all: 'Kaikki', sahko: 'Sähköpyörät', kaupunki: 'City & hybridi', maasto: 'Maastopyörät',
  maantie: 'Gravel & maantie', lapset: 'Lasten ja nuorten', muu: 'Muut pyörät'
};
const normalize = value => String(value ?? '').trim().toLocaleLowerCase('fi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
const isYes = value => ['kylla', 'yes', 'true', '1'].includes(normalize(value));

export function buildFeedUrl(now = Date.now()) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/gviz/tq`);
  url.searchParams.set('gid', source.sheetId);
  url.searchParams.set('headers', '1');
  url.searchParams.set('tqx', 'out:json;responseHandler:bikedocFeed');
  url.searchParams.set('_', String(now));
  return url.href;
}

export function parseFeed(text) {
  // Googlen JSONP-kuori puretaan JSON-dataksi: vastausta ei suoriteta koodina.
  const match = text.match(/^\s*(?:\/\*O_o\*\/\s*)?bikedocFeed\(([\s\S]*)\);?\s*$/);
  if (!match) throw new Error('Unexpected inventory response');
  return readInventory(JSON.parse(match[1]));
}

export function imageUrl(value) {
  try {
    const url = new URL(String(value ?? '').trim());
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (url.hostname === 'drive.google.com') {
      const id = url.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] || url.searchParams.get('id');
      if (id && /^[\w-]+$/.test(id)) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`;
    }
    return url.href;
  } catch {
    return '';
  }
}

export function priceNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  const text = String(value ?? '').replace(/[\s\u00a0\u202f€]/g, '');
  if (!text) return null;
  const decimal = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  if (!/^\d+(?:\.\d+)?$/.test(decimal)) return null;
  const number = Number(decimal);
  return Number.isFinite(number) ? number : null;
}

export function readInventory(payload) {
  if (payload.status !== 'ok' || !Array.isArray(payload.table?.cols) || !Array.isArray(payload.table?.rows)) {
    throw new Error('Inventory is unavailable');
  }
  const columns = new Map(payload.table.cols.map((column, index) => [normalize(column.label), index]));
  for (const key of ['name', 'price', 'photo']) {
    if (!columns.has(normalize(columnNames[key]))) throw new Error(`Missing inventory column: ${columnNames[key]}`);
  }
  const bikes = [];
  for (const row of payload.table.rows) {
    const bike = {};
    for (const [key, label] of Object.entries(columnNames)) {
      const cell = row.c?.[columns.get(normalize(label))];
      bike[key] = cell?.v == null ? '' : String(cell.f ?? cell.v).trim();
      if (key === 'price') bike.priceValue = priceNumber(cell?.v);
    }
    if (!bike.name || ['myyty', 'sold', 'poistettu', 'piilotettu', 'ei myynnissa'].includes(normalize(bike.status))) continue;
    bike.photo = imageUrl(bike.photo);
    bike.reserved = normalize(bike.status) === 'varattu';
    bike.electric = isYes(bike.electric);
    const type = normalize(bike.type);
    const category = /lasten|nuorten/.test(type) ? 'lapset' : /maasto|fatbike/.test(type) ? 'maasto'
      : /maantie|gravel/.test(type) ? 'maantie' : /city|hybridi|kaupunki/.test(type) ? 'kaupunki' : 'muu';
    bike.categories = [category];
    if (bike.electric || /sahko/.test(type)) bike.categories.push('sahko');
    if (bike.categories.includes('sahko')) bike.electric = true;
    bike.order = bikes.length;
    bikes.push(bike);
  }
  return bikes;
}

export function sortBikes(bikes, order) {
  return [...bikes].sort((a, b) => {
    if (order === 'price-asc' || order === 'price-desc') {
      if (a.priceValue == null && b.priceValue == null) return a.order - b.order;
      if (a.priceValue == null) return 1;
      if (b.priceValue == null) return -1;
      return (a.priceValue - b.priceValue) * (order === 'price-desc' ? -1 : 1) || a.order - b.order;
    }
    if (order === 'name') return a.name.localeCompare(b.name, 'fi') || a.order - b.order;
    return a.order - b.order;
  });
}

const euro = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 });

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function photoPlaceholder() {
  const placeholder = element('div', 'used-photo-placeholder');
  // Vakioikoni; taulukon sisältöä ei koskaan lisätä innerHTML:n kautta.
  placeholder.innerHTML = '<svg viewBox="0 0 96 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="21" cy="43" r="16"/><circle cx="75" cy="43" r="16"/><path d="M21 43 38 15 55 43H21M55 43 68 13 75 43M61 13h13M32 15h14"/></svg>';
  placeholder.append(element('span', '', 'Kuva tulossa'));
  return placeholder;
}

function specifications(items, className = 'used-specs') {
  const list = element('dl', className);
  for (const [label, value] of items) {
    if (!value) continue;
    const group = element('div');
    group.append(element('dt', '', label), element('dd', '', value));
    list.append(group);
  }
  return list;
}

function bikeCard(bike) {
  const card = element('article', 'used-card');
  card.setAttribute('aria-labelledby', `used-bike-${bike.order}`);
  const photo = element('div', 'used-photo');
  if (bike.photo) {
    const link = element('a', 'used-photo-link');
    link.href = bike.photo;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Avaa suurempi kuva: ${bike.name}`);
    const image = element('img');
    image.alt = bike.name;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => link.replaceWith(photoPlaceholder()), { once: true });
    image.src = bike.photo;
    link.append(image);
    photo.append(link);
  } else {
    photo.append(photoPlaceholder());
  }
  photo.append(element('span', `used-status${bike.reserved ? ' used-status--reserved' : ''}`, bike.reserved ? 'Varattu' : 'Myynnissä'));

  const body = element('div', 'used-card-body');
  const heading = element('div');
  heading.append(element('p', 'used-card-brand', [bike.electric ? 'Sähköpyörä' : '', bike.type].filter(Boolean).join(' · ') || 'Käytetty pyörä'));
  const title = element('h3', '', bike.name);
  title.id = `used-bike-${bike.order}`;
  heading.append(title);
  body.append(heading, element('p', 'used-price', bike.priceValue == null ? 'Kysy hinta' : euro.format(bike.priceValue)));
  body.append(specifications([['Runkokoko', bike.size], ['Vuosimalli', bike.year], ['Kunto', bike.condition], ['Väri', bike.color]]));
  if (bike.description) body.append(element('p', 'used-description', bike.description));

  const technical = specifications([
    ['Vaihteisto', bike.gears], ['Jarrut', bike.brakes], ['Viimeisin huolto', bike.service],
    ['Huollettu', bike.serviced], ['Moottori', bike.motor], ['Akku', bike.battery]
  ], 'used-specs used-technical');
  if (technical.children.length) {
    const details = element('details', 'used-details');
    details.append(element('summary', '', 'Tekniset tiedot ja huolto'), technical);
    body.append(details);
  }

  const actions = element('div', 'used-card-actions');
  const enquiry = element('a', 'btn btn-primary', 'Kysy tästä pyörästä');
  const email = document.querySelector('[data-contact-link="email"]')?.getAttribute('href');
  if (email?.startsWith('mailto:')) {
    const message = `Hei! Olen kiinnostunut pyörästä ${bike.name}.\nRunkokoko: ${bike.size || 'ei ilmoitettu'}\nHinta: ${bike.priceValue == null ? 'kysyttävä' : euro.format(bike.priceValue)}\n\nOnko pyörä vielä saatavilla?\n\n${window.location.href.split('#')[0]}`;
    enquiry.href = `${email}?subject=${encodeURIComponent(`Kysely käytetystä pyörästä: ${bike.name}`)}&body=${encodeURIComponent(message)}`;
  } else {
    enquiry.href = 'yhteystiedot.html';
  }
  enquiry.setAttribute('aria-label', `Kysy pyörästä ${bike.name}`);
  actions.append(enquiry);
  body.append(actions);
  card.append(photo, body);
  return card;
}

function initializeInventory() {
  const root = document.getElementById('used-inventory');
  if (!root) return;
  const grid = document.getElementById('used-grid');
  const toolbar = document.getElementById('used-toolbar');
  const filters = document.getElementById('used-filters');
  const count = document.getElementById('used-count');
  const sort = document.getElementById('used-sort');
  const message = document.getElementById('used-message');
  let bikes = [];
  let activeFilter = 'all';
  let loading = false;

  function showMessage(title, text, retry = false) {
    message.replaceChildren(element('h3', '', title), element('p', '', text));
    const actions = element('div', 'used-message-actions');
    if (retry) {
      const button = element('button', 'btn btn-primary', 'Yritä uudelleen');
      button.type = 'button';
      button.addEventListener('click', load);
      actions.append(button);
    }
    const contact = element('a', '', 'Ota yhteyttä →');
    contact.href = 'yhteystiedot.html';
    actions.append(contact);
    message.append(actions);
    message.hidden = false;
  }

  function render() {
    const selected = sortBikes(bikes.filter(bike => activeFilter === 'all' || bike.categories.includes(activeFilter)), sort.value);
    grid.replaceChildren(...selected.map(bikeCard));
    grid.hidden = !selected.length;
    message.hidden = true;
    count.textContent = activeFilter === 'all' ? `${bikes.length} ${bikes.length === 1 ? 'pyörä' : 'pyörää'}` : `${selected.length} / ${bikes.length} pyörää`;
    if (!selected.length) {
      showMessage(bikes.length ? 'Tässä ryhmässä ei ole pyöriä' : 'Uusia löytöjä tulossa', bikes.length ? 'Valitse toinen pyörätyyppi tai katso koko valikoima.' : 'Valikoimassa ei juuri nyt ole myynti-ilmoituksia. Kysy meiltä tulevista pyöristä.');
    }
  }

  function renderFilters() {
    filters.replaceChildren();
    const available = new Set(bikes.flatMap(bike => bike.categories));
    for (const [category, label] of Object.entries(categoryLabels)) {
      if (category !== 'all' && !available.has(category)) continue;
      const button = element('button', 'used-filter', label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(category === activeFilter));
      button.addEventListener('click', () => {
        activeFilter = category;
        for (const item of filters.children) item.setAttribute('aria-pressed', String(item === button));
        render();
      });
      filters.append(button);
    }
  }

  async function load() {
    if (loading) return;
    loading = true;
    root.setAttribute('aria-busy', 'true');
    toolbar.hidden = true;
    grid.hidden = true;
    grid.replaceChildren();
    count.textContent = 'Haetaan pyöriä…';
    const spinner = element('span', 'used-loading');
    spinner.setAttribute('aria-hidden', 'true');
    message.replaceChildren(spinner, element('p', '', 'Haetaan tämänhetkistä valikoimaa…'));
    message.hidden = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(buildFeedUrl(), { signal: controller.signal, cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error(`Inventory HTTP ${response.status}`);
      bikes = parseFeed(await response.text());
      activeFilter = 'all';
      renderFilters();
      toolbar.hidden = !bikes.length;
      render();
    } catch (error) {
      count.textContent = 'Valikoima ei saatavilla';
      showMessage('Valikoimaa ei saatu ladattua', 'Yritä hetken kuluttua uudelleen tai kysy meiltä saatavilla olevista pyöristä.', true);
      console.warn('BikeDoc: käytettyjen pyörien lataus epäonnistui.', error);
    } finally {
      clearTimeout(timer);
      root.setAttribute('aria-busy', 'false');
      loading = false;
    }
  }

  sort.addEventListener('change', render);
  window.addEventListener('pageshow', event => { if (event.persisted) load(); });
  load();
}

if (typeof document !== 'undefined') initializeInventory();
