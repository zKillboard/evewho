$(document).ready(function() { 
    $(".number").each(function(index) { $(this).html(new Number($(this).html()).toLocaleString()) });
    $(".numberd").each(function(index) { $(this).html(new Number($(this).html()).toLocaleString(undefined, { minimumFractionDigits: 1 })) });
var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy"
    // ... more custom settings?
}).update();
    if (lazyLoadInstance) lazyLoadInstance.update();

    $('#autocomplete').autocomplete({
      autoSelectFirst: true,
      serviceUrl: '/autocomplete/',
      dataType: 'json',
      groupBy: 'groupBy',
      onSelect: function (suggestion) {
          window.location = '/' + suggestion.data.type + '/' + suggestion.data.id;
      },
      error: function(xhr) { console.log(xhr); }
    });

     $('[data-toggle="tooltip"]').tooltip({trigger: 'click', title: 'data', placement: 'top'});
});
