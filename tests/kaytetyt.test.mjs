import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Staattinen sivusto ei tarvitse package.jsonia tai rakennusvaihetta.
const script = await readFile(new URL('../js/kaytetyt.js', import.meta.url), 'utf8');
const { buildFeedUrl, parseFeed, readInventory, imageUrl, priceNumber, sortBikes } = await import(`data:text/javascript;base64,${Buffer.from(script).toString('base64')}`);

function feed(rows = [], labels = ['Pyörän merkki', 'Hinta', 'Kuva', 'Pyörätyyppi', 'Sähköpyörä', 'Tila']) {
  return { status: 'ok', table: { cols: labels.map(label => ({ label })), rows: rows.map(values => ({ c: values.map(v => v == null ? null : { v }) })) } };
}

test('hakee oikean välilehden ja ohittaa selaimen välimuistin URL-parametrilla', () => {
  const url = new URL(buildFeedUrl(123));
  assert.equal(url.searchParams.get('gid'), '187111732');
  assert.equal(url.searchParams.get('headers'), '1');
  assert.equal(url.searchParams.get('_'), '123');
  assert.notEqual(buildFeedUrl(123), buildFeedUrl(124));
});

test('lukee sarakkeet otsikoiden perusteella myös järjestyksen muuttuessa', () => {
  const rows = [['https://example.com/photo.jpg', 1300, 'Testipyörä']];
  const [bike] = readInventory(feed(rows, ['Kuva', 'Hinta', 'Pyörän merkki']));
  assert.equal(bike.name, 'Testipyörä');
  assert.equal(bike.priceValue, 1300);
  assert.equal(bike.photo, 'https://example.com/photo.jpg');
});

test('päivitetyt, lisätyt ja poistetut rivit tulevat jokaisesta uudesta vastauksesta', () => {
  const payload = feed([['Vanha', 100, ''], ['Poistuva', 200, '']]);
  assert.equal(readInventory(payload).length, 2);
  payload.table.rows[0].c[0].v = 'Päivitetty';
  payload.table.rows[0].c[1].v = 125;
  payload.table.rows.splice(1, 1, { c: [{ v: 'Uusi' }, { v: 300 }] });
  const bikes = readInventory(payload);
  assert.deepEqual(bikes.map(b => b.name), ['Päivitetty', 'Uusi']);
  assert.deepEqual(bikes.map(b => b.priceValue), [125, 300]);
});

test('tyhjät ja myydyt rivit ohitetaan, varattu tunnistetaan', () => {
  const bikes = readInventory(feed([
    ['', 100, ''], ['Myyty', 200, '', '', '', 'Myyty'],
    ['Varattu', 300, '', '', '', 'Varattu'], ['Vapaa', 400, '']
  ]));
  assert.deepEqual(bikes.map(b => b.name), ['Varattu', 'Vapaa']);
  assert.equal(bikes[0].reserved, true);
  assert.equal(readInventory(feed()).length, 0);
});

test('sähköpyörä löytyy myös oman pyörätyyppinsä suodatuksesta', () => {
  const bikes = readInventory(feed([
    ['Sähköhybridi', 1000, '', 'City/hybridipyörä', 'Kyllä'],
    ['Lastenpyörä', 150, '', 'Nuorten/lastenpyörä'],
    ['Gravel', 500, '', 'Gravel/maantiepyörä']
  ]));
  assert.deepEqual(bikes[0].categories, ['kaupunki', 'sahko']);
  assert.deepEqual(bikes[1].categories, ['lapset']);
  assert.deepEqual(bikes[2].categories, ['maantie']);
});

test('hinnat lajitellaan numeroina ja puuttuva hinta jää viimeiseksi', () => {
  const bikes = readInventory(feed([['A', 1300, ''], ['B', 35, ''], ['C', null, '']]));
  assert.deepEqual(sortBikes(bikes, 'price-asc').map(b => b.name), ['B', 'A', 'C']);
  assert.deepEqual(sortBikes(bikes, 'price-desc').map(b => b.name), ['A', 'B', 'C']);
  assert.equal(priceNumber('1\u00a0300,50 €'), 1300.5);
  assert.equal(priceNumber('1.300,50 €'), 1300.5);
  assert.equal(priceNumber(''), null);
  assert.equal(priceNumber('Sovitaan'), null);
  assert.equal(priceNumber(-1), null);
  assert.equal(priceNumber(0), 0);
});

test('JSONP luetaan datana ja virheelliset vastaukset hylätään', () => {
  assert.equal(parseFeed(`/*O_o*/\nbikedocFeed(${JSON.stringify(feed([['Pyörä', 123, '']]))});`)[0].priceValue, 123);
  assert.throws(() => parseFeed('<html>Kirjaudu</html>'));
  assert.throws(() => readInventory({ status: 'error' }));
  assert.throws(() => readInventory(feed([], ['Väärä välilehti'])));
});

test('kuvalinkki ei hyväksy suoritettavaa koodia tai tunnuksia', () => {
  assert.equal(imageUrl('javascript:alert(1)'), '');
  assert.equal(imageUrl('data:image/svg+xml,<svg/>'), '');
  assert.equal(imageUrl('https://user:secret@example.com/photo.jpg'), '');
  assert.equal(imageUrl('https://example.com/photo.jpg'), 'https://example.com/photo.jpg');
  assert.equal(imageUrl('https://drive.google.com/file/d/abc-123/view'), 'https://drive.google.com/thumbnail?id=abc-123&sz=w1200');
});
