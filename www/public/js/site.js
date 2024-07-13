var lazyLoadInstance;
$(document).ready(function() { 
    $(".number").each(function(index) { $(this).html(new Number($(this).html()).toLocaleString()) });
    $(".numberd").each(function(index) { $(this).html(new Number($(this).html()).toLocaleString(undefined, { minimumFractionDigits: 1 })) });
    lazyLoadInstance = new LazyLoad({elements_selector: ".lazy"}).update();

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

    $("#loadMore").on('click', loadNextPage);
    $("#charsbar a").on('click', changeWhich);

    let tbody = $('#char-tbody');
    if (tbody.length && tbody.attr('corp_id') == undefined) $('#loadMore').remove();

    loadNextPage();

    // Listen for / key, if pressed, put focus on search box (#autocomplete)
    $(document).keyup(function(e) {
        if ($("input:focus, textarea:focus").length === 0 && e.key === '/' && e.ctrlKey !== true && e.shiftKey !== true) {
            $("#autocomplete").focus();
        }
    });
});

function changeWhich(event) {
    event.stopPropagation();
    $("#char-tbody").html("");

    $("#charsbar .active").removeClass('active');
    $(event.target).parent().addClass('active');

    page = 1;

    setTimeout(loadNextPage, 1);
    return false;
}

var page = 1;
function loadNextPage(event) {
    $("#loadMore").prop('disabled', true).show();
    let which = $("#charsbar .active").attr('which');
    let tbody = $('#char-tbody');

    if (tbody.length && tbody.attr('corp_id') != undefined) {
        tbody = $(tbody[0]);
        let url = '/pug/list/' + tbody.attr('corp_id') + '/' + which + '/' + page;
        console.log(url);
        $.get(url, function(data) { addHistoryData(tbody, data); });
    }
}

function addHistoryData(tbody, data) {
    tbody.append(data);
    new LazyLoad({elements_selector: ".lazy"}).update();
    if (data.length > 0) { 
        page++;
        $("#loadMore").prop('disabled', false).blur();
    } else {
        $("#loadMore").hide();
    }
}
