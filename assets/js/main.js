(function() {
  $('[data-target="#search-modal"]').click(function() {
    console.log(1);
    $('#search-modal-input').focus();
  });
  $('#search-modal-input').on('input', function(evt) {
    var results = window.search.filter(function(page) {
      return page.content.toLowerCase().indexOf(evt.target.value.toLowerCase()) > -1;
    });
    $('#search-modal-results').html(results.map(function(result) {
      return '<div>' +
        '<strong>' +
          '<a href="' + result.url + '">' + result.title + '</a>' +
        '</strong>' +
      '</div>';
    }).join(''));
  });
}())