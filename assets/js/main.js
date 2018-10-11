(function($, w, d) {

  var templates = {};

  function getDiacritics(str) {
    var diacritics = {a: '\u00E0-\u00E3', e: '\u00E9-\u00EA', o: '\u00F3-\u00F5', u: '\u00FA', c: '\u00E7'};
    str = str.toLowerCase();
    for (var i = 0, l = str.length, r = '', c; i < l; i++) (c = str.charAt(i), r += diacritics[c] ? '[' + c + diacritics[c] + ']' : c);
    return r;
  }

  function search(needle, haystack, options) {
    options = $.extend(options, {highlight: true, start: 50, stop: 200});
    needle = needle.replace(/[.?*+^$[\](){}|\\]/g, '');
    var regex = new RegExp('(' + getDiacritics(needle) + ')', 'gi');
    if (!regex.test(haystack)) return false;
    haystack = haystack.replace(regex, '<mark>$1</mark>');
    var length = haystack.length,
        start = Math.max(0, haystack.indexOf('<mark>') - options.start),
        stop = Math.min(length, options.stop);
    haystack = haystack.substr(start, stop);
    haystack = haystack.slice(start ? haystack.indexOf(' ') + 1 : start, stop < length ? haystack.lastIndexOf(' ') : length);
    haystack = (start ? '... ' : '') + haystack + (stop < length ? ' ...' : '');
    return haystack;
  }

  /* SEARCH */
  (function() {
    var modal = $('#search-modal'),
        input = $('#search-modal-input');

    if (!modal.length) return;

    modal.on('shown.bs.modal', function() {
      $('#search-modal-input').focus();
    }).on('hidden.bs.modal', function() {
      $('#search-modal-input').val('');
      $('#search-modal-results').html('');
    });

    input.on('input', function(evt) {
      var needle = evt.target.value;
      $('#search-modal-results').html(needle.length < 3 ? '' : Mustache.render(templates['search'], {
        results: window.search.map(function(page) {
          return $.extend({}, page, {content: search(needle, page.content)});
        }).filter(function(page) {
          return !!page.content;
        })
      }));
    });
  }())

  /* MUSTACHE */
  $('script[type="x-tmpl-mustache"]').each(function (idx, elm) {
    elm = $(elm);
    template = elm.attr('data-template');
    templates[template] = elm.html();
    Mustache.parse(templates[template]);
    elm.remove();
  });

}(jQuery, window, document))