# Bikedoc

BikeDoc nettisivut

## Yhteystietojen päivittäminen

Muokkaa tiedoston **`js/yhteystiedot.js` alussa olevaa `contact`-objektia**.
Se on yrityksen yhteystietojen ainoa ylläpitopaikka. Tiedot näkyvät
automaattisesti kaikkien kuuden pääsivun ylä- ja alatunnisteissa sekä
yhteystieto- ja ajanvaraussivujen sisällössä. Myös vanha `contact.html`
käyttää samaa lähdettä.

- `company`: yrityksen nimi yhteystiedoissa
- `phone`: puhelinnumero kansainvälisessä muodossa; soitettava linkki muodostuu automaattisesti
- `email`: sähköpostiosoite; sähköpostilinkki muodostuu automaattisesti
- `street`, `postalCode`, `city`: osoite
- `cityIn`, `cityFrom`: kaupungin taivutusmuodot sivujen teksteihin
- `hours`: viikonpäivät ja aukioloajat; arkipäivät on ryhmitelty yhteen, viikonlopun päivät erikseen

Tallenna ja vie muutos GitHubiin. Sivujen yhteystietoja ei tarvitse muokata
erikseen. GitHub Pages näyttää muutoksen julkaisun valmistuttua; tarvittaessa
päivitä selaimen sivu ohittaen välimuisti (Ctrl+F5).

HTML-sivujen `data-contact`, `data-contact-link` ja `data-contact-hours`
-merkinnät kertovat, mihin yhteiset tiedot näytetään. Uudelle sivulle lisätään
`<script src="js/yhteystiedot.js" defer></script>` ja vastaavat merkinnät.
Yhteystietojen näyttäminen edellyttää selaimen JavaScript-tukea.

Yhteystietojen keskittäminen ei muuta yhteydenottolomakkeen lähetysratkaisua
tai ulkopuolista ajanvarauskalenteria.

## Käytetyt pyörät Google Sheetsistä

`kaytetyt.html` hakee valikoiman suoraan [myyntitaulukon välilehdeltä](https://docs.google.com/spreadsheets/d/1VuVfVprnpPOujEw6q723R1lpQpqYgc7nIeBDe5tS-b4/edit?gid=187111732#gid=187111732)
jokaisella sivun latauksella. Sivustoa ei tarvitse julkaista uudelleen, kun
pyörän tietoja päivitetään, lisätään uusi rivi tai poistetaan vanha rivi.
Sivulle paluu selaimen takaisin-painikkeella hakee tiedot myös uudelleen.
Selaimen välimuisti ohitetaan haussa, mutta Googlen palvelussa voi olla lyhyt
päivitysviive. Auki oleva sivu päivittyy, kun kävijä lataa sen uudelleen.

Taulukon jakamisen pitää sallia **Kaikki, joilla on linkki → Katselija**.
Sisällytä taulukkoon vain julkiseen myyntiin tarkoitettuja tietoja. Sivusto ei
käytä kirjautumista tai salaisia avaimia eikä kirjoita taulukkoon.

Ensimmäisen rivin sarakeotsikot tunnistetaan nimien perusteella, joten
sarakkeiden järjestystä voi muuttaa. Säilytä seuraavat otsikot:

- `Pyörän merkki`: pyörän koko nimi (merkki ja malli); tyhjän nimen riviä ei näytetä
- `Hinta`: numero tai euromäärä; puuttuva hinta näkyy muodossa "Kysy hinta"
- `Kuva`: suora julkinen HTTPS-linkki kuvatiedostoon
- `Runkokoko`, `Vuosimalli`, `Väri`, `Yleiskunto`
- `Huomautettavat asiat`: varusteet, lisätiedot ja huomautukset
- `Vaihteisto ja vaihteiden määrä`, `Jarrut`, `Viimeisin huolto`, `Huollettu`
- `Pyörätyyppi`, `Sähköpyörä`, `Moottorivalmistaja`, `Akun kapasiteetti`

Nimi-, hinta- ja kuvasarakkeet ovat pakollisia otsikoita. Muiden puuttuvat
arvot jätetään pois korteista. Kuvan URL pitää kirjoittaa soluun tekstinä;
pelkkä solun sisään lisätty kuva ei välity tietosyötteeseen. Myös julkisen
Drive-kuvan jakolinkki tunnistetaan, mutta itse kuvatiedoston pitää sallia
katselu ilman kirjautumista. Jos kuva puuttuu tai ei lataudu, kortissa näkyy
neutraali "Kuva tulossa" -paikkamerkki.

Myydyn pyörän voi poistaa taulukosta. Vaihtoehtoisesti lisää sarake **`Tila`**:
tyhjä tai `Myynnissä` näyttää pyörän, `Varattu` näyttää varausmerkinnän ja
`Myyty`, `Poistettu`, `Piilotettu` tai `Ei myynnissä` piilottaa pyörän.

Suodattimet muodostuvat valikoimasta automaattisesti. Sähköpyörä löytyy sekä
sähköpyöristä että oman pyörätyyppinsä alta. Kortit asettuvat leveydestä riippuen
1–5 sarakkeeseen. "Kysy tästä pyörästä" avaa sähköpostiviestin, jossa pyörän
tiedot ovat valmiina; vastaanottaja luetaan yhteisistä yhteystiedoista.

Toteutus on tiedostoissa `js/kaytetyt.js` ja `css/kaytetyt.css`.
Tietolähteen tunnukset ovat JavaScript-tiedoston alussa. Tietojen käsittelyn
testit voi ajaa komennolla `node --test tests/kaytetyt.test.mjs`.
