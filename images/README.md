# Kuvat (images/)

Lisää tähän kansioon omat kuvasi ja päivitä HTML-tiedostojen `img`-tagit tai `background-image`-tyylit vastaamaan.

## Odotettavat kuvatiedostot

| Tiedostonimi         | Käyttökohde                         | Suositeltu koko  |
|----------------------|-------------------------------------|------------------|
| `hero-bg.jpg`        | Etusivun hero-taustakuva            | 1920 × 1080 px   |
| `guide-1.jpg`        | Vaihteisto-oppaan korttikuva        | 800 × 500 px     |
| `guide-2.jpg`        | Reitti-oppaan korttikuva            | 800 × 500 px     |
| `guide-3.jpg`        | Kypärävertailun korttikuva          | 800 × 500 px     |
| `about.jpg`          | Etusivun "Miksi BikeDoc" -kuva      | 900 × 700 px     |
| `about-story.jpg`    | Tietoa-sivun tarinaosion kuva       | 900 × 700 px     |
| `about-values.jpg`   | Tietoa-sivun arvot-osion kuva       | 900 × 700 px     |

## Kuvan lisääminen HTML:ään

Etsi kommentti `<!-- Korvaa: ... -->` ja vaihda `div.img-placeholder` tai `div.card-image-placeholder`
seuraavanlaisella `<img>`-tagilla:

```html
<img src="images/hero-bg.jpg" alt="Kuvaava alt-teksti" class="card-image" loading="lazy" />
```

Hero-taustan kohdalla päivitä `style`-attribuutti:

```html
<div class="hero-bg" style="background-image: url('images/hero-bg.jpg');" ...></div>
```
