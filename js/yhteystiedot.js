/*
 * Muokkaa yrityksen yhteystietoja vain tässä objektissa.
 * Kaikki sivut näyttävät tiedot automaattisesti tämän tiedoston perusteella.
 */
(function () {
  'use strict';

  var contact = {
    company: 'BikeDoc Joensuu',
    phone: '+358 44 777 0024',
    email: 'info@bikedocjoensuu.fi',
    street: 'Vilniuksenkatu 3',
    postalCode: '80140',
    city: 'Joensuu',
    cityIn: 'Joensuussa',
    cityFrom: 'Joensuusta',
    hours: [
      { days: ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai'], label: 'Maanantai–Perjantai', shortLabel: 'Ma–Pe', time: '12:00–17:00' },
      { days: ['Lauantai'], label: 'Lauantai', shortLabel: 'La', time: 'Sopimuksen mukaan' },
      { days: ['Sunnuntai'], label: 'Sunnuntai', shortLabel: 'Su', time: 'Sopimuksen mukaan' }
    ]
  };

  // Näyttötavat johdetaan yllä olevista tiedoista; älä kopioi arvoja HTML-sivuille.
  var values = {
    company: contact.company,
    phone: contact.phone,
    email: contact.email,
    street: contact.street,
    postalCity: contact.postalCode + ' ' + contact.city,
    address: contact.street + ', ' + contact.postalCode + ' ' + contact.city,
    city: contact.city,
    cityIn: contact.cityIn,
    cityFrom: contact.cityFrom,
    hoursSummary: contact.hours.map(function (group) {
      return group.shortLabel + ' ' + group.time;
    }).join(', ')
  };

  document.querySelectorAll('[data-contact]').forEach(function (element) {
    var key = element.getAttribute('data-contact');
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      element.textContent = values[key];
    }
  });

  document.querySelectorAll('[data-contact-link]').forEach(function (element) {
    var type = element.getAttribute('data-contact-link');
    if (type === 'phone') {
      element.setAttribute('href', 'tel:' + contact.phone.replace(/[^+\d]/g, ''));
    } else if (type === 'email') {
      element.setAttribute('href', 'mailto:' + contact.email);
    }
  });

  document.querySelectorAll('[data-contact-hours]').forEach(function (element) {
    var table = element.getAttribute('data-contact-hours') === 'table';
    element.textContent = '';
    contact.hours.forEach(function (group) {
      var labels = table ? group.days : [group.label];
      labels.forEach(function (label) {
        var row = document.createElement(table ? 'tr' : 'li');
        var day = document.createElement(table ? 'td' : 'span');
        var time = document.createElement(table ? 'td' : 'span');
        day.textContent = label;
        time.textContent = group.time;
        row.appendChild(day);
        row.appendChild(time);
        element.appendChild(row);
      });
    });
  });
})();
