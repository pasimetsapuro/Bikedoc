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
