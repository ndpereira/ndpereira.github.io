(function($, w, d) {

  var templates = {};

  /* SEARCH */
  (function() {
    var modal = $('#search-modal'),
        input = $('#search-modal-input');

    if (!modal.length) return;

    function diacritics(str) {
      var chars = {a: '\u00E0-\u00E3', e: '\u00E9-\u00EA', o: '\u00F3-\u00F5', u: '\u00FA', c: '\u00E7'};
      str = str.toLowerCase();
      for (var i = 0, l = str.length, r = '', c; i < l; i++) (c = str.charAt(i), r += chars[c] ? '[' + c + chars[c] + ']' : c);
      return r;
    }

    function search(needle, haystack, options) {
      options = $.extend(options, {start: 50, stop: 200});
      needle = needle.replace(/[.?*+^$[\](){}|\\]/g, '');
      var regex = new RegExp('(' + diacritics(needle) + ')', 'gi');
      if (!regex.test(haystack)) return false;
      haystack = haystack.replace(regex, '<mark>$1</mark>');
      var length = haystack.length,
          start = Math.max(0, haystack.indexOf('<mark>') - options.start),
          stop = Math.min(length, options.stop);
      haystack = haystack.substr(start, stop);
      haystack = haystack.slice(start ? haystack.indexOf(' ') + 1 : start, stop < length ? haystack.lastIndexOf(' ') : length);
      haystack = (start ? '...' : '') + haystack + (stop < length ? '...' : '');
      return haystack;
    }

    modal.on('shown.bs.modal', function() {
      $('#search-modal-input').focus();
    }).on('hidden.bs.modal', function() {
      $('#search-modal-input').val('');
      $('#search-modal-results').html('').addClass('d-none');
    });

    input.on('input', function(evt) {
      var needle = evt.target.value,
          results = needle.length > 3 && window.search.map(function(page) {
            return $.extend({}, page, { content: search(needle, page.content) });
          }).filter(function(page) {
            return !!page.content;
          });

      $('#search-modal-results').toggleClass('d-none', !results).html(Mustache.render(templates['search'], {results: results}));
    });
  }());

  /* MUSTACHE */
  $('script[type="x-tmpl-mustache"]').each(function(idx, elm) {
    elm = $(elm);
    template = elm.attr('data-template');
    templates[template] = elm.html();
    Mustache.parse(templates[template]);
    elm.remove();
  });

}(jQuery, window, document))