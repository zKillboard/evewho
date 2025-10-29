var lazyLoadInstance;
$(document).ready(function() { 
    $(".number").each(function(index) { $(this).html(new Number($(this).html()).toLocaleString()) });
    $(".numberd").each(function(index) { $(this).html(new Number($(this).html()).toLocaleString(undefined, { minimumFractionDigits: 1 })) });
    lazyLoadInstance = new LazyLoad({elements_selector: ".lazy"}).update();

    setInterval(setTopBannerHeight, 10000); 

    $('#autocomplete').autocomplete({
      autoSelectFirst: true,
      serviceUrl: function(query) {
        return '/autocomplete/' + encodeURIComponent(query.toLowerCase());
      },
      ajaxSettings: {
        type: 'GET',
        dataType: 'json',
        data: {} // Override to send no data/parameters
      },
      params: {}, // No additional parameters
      paramName: '', // Empty param name
      dataType: 'json',
      groupBy: 'groupBy',
      minChars: 2, // Require at least 2 characters to reduce server load
      deferRequestBy: 300, // Wait 300ms after user stops typing before making request
      noCache: false, // Enable caching for better performance
      maxHeight: 400, // Increase max height for more suggestions
      showNoSuggestionNotice: true, // Show "no results" message
      noSuggestionNotice: 'No characters, corporations, or alliances found', // Custom message
      onSelect: function (suggestion) {
          window.location = '/' + suggestion.data.type + '/' + suggestion.data.id;
      },
      onSearchStart: function(params) {
        // Optional: Add loading indicator
        $('#autocomplete').addClass('loading');
      },
      onSearchComplete: function(query, suggestions) {
        // Remove loading indicator
        $('#autocomplete').removeClass('loading');
      },
      onSearchError: function(query, jqXHR, textStatus, errorThrown) {
        console.error('Autocomplete search failed:', {
          query: query,
          status: jqXHR.status,
          statusText: textStatus,
          error: errorThrown
        });
        
        // Remove loading indicator
        $('#autocomplete').removeClass('loading');
        
        // Show user-friendly error (optional)
        if (jqXHR.status === 500) {
          console.warn('Search temporarily unavailable');
        } else if (jqXHR.status === 0) {
          console.warn('Network connection issue');
        }
      },
      transformResult: function(response, originalQuery) {
        // Handle potential response parsing issues
        try {
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
          return response;
        } catch (e) {
          console.error('Failed to parse autocomplete response:', e);
          return { suggestions: [] };
        }
      }
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

var lastHeight = 0;
function setTopBannerHeight() {
    let height = document.getElementById('topbanner').clientHeight;
    if (height > lastHeight) {
        $("#topbanner").css('height', height).css('min-height', height);
        lastHeight = height;
    }
}
