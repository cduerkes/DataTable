$(document).ready(function() {
    // Don't initially display main table title metadata div
    $('.tableTitle, .metaDiv').hide();

    // Initiate main table template
    $('#main-template').DataTable();

    // Call parse data function when file uploaded
    $("#csv-file").change(parseData);

    // Detect scroll position to style sticky metadata div
    $(document).scroll(function() {
      var y = $(this).scrollTop();

      if (y > 300) {
        $('.metaDiv').fadeIn();
        $('.metaDiv').css({
            "position": "fixed", 
            "top": "39px",
            "width": "50%",
            "height": "50px"
        });
      } else {
        $('.metaDiv').css({
            "position": "static", 
            "margin": "0 0 3rem", 
            "width": "50%",
            "height": "35px"
        });
      }
    });

    // Set up event listener on input fields to filter corresponding columns
    $('body').on( 'keyup click', 'input.column_filter', function () {
        filterColumn( $(this).parents('tr').attr('data-column') );
    });

    // Set up event listener on table rows to get and display visible table row
    $('body').on( 'mouseenter', 'tr', function () {
        const table = $('#main').DataTable();

        var rowNumber = table.rows( { order: 'applied' } ).nodes().indexOf( this );
        if (rowNumber >= 0) {
            $('.metaDiv').text(`Current row: ${rowNumber + 1}`);
        }
    });

    // Set up event listener on table cells to eventually display of column type when hovering over column names
    // Question 6 referred to a 'column type'
    $('body').on( 'mouseenter', 'td', function () {
        const table = $('#main').DataTable();
        const data = table.cell( this ).data();

    // Detect data types
        if (typeof(data) !== 'undefined') {
            if (data[0] ==='$') {
                console.log('currency');
            } else if (data.toString().indexOf("/") > -1) {
                console.log('date');
            } else if (!isNaN(parseInt(data))) {
                console.log('number');
            } else {
                console.log('string');
            }
        }
    });

    // Set up event listener on table heading to get and display column sort method and search term, if applied
    $('body').on( 'mouseenter', '#main th', function () {
        const table = $('#main').DataTable();
        let sort = $(this).attr("aria-sort");
        let search = table.column(this).search();

        if (search !== '') {
            $('.metaDiv').text(`Search by: ${search}`);
        }

        if (typeof sort !== "undefined") {
            if (search !== '') {
                $('.metaDiv').text(`Search by: ${search}, Sort: ${sort.charAt(0).toUpperCase() + sort.slice(1).toLowerCase()}`);
            } else {
                $('.metaDiv').text(`Sort: ${sort.charAt(0).toUpperCase() + sort.slice(1).toLowerCase()}`);
            }

        } else {
            console.log("Unsorted");
        }
    });
});

// Function to parse csv file and then render html strings and update index column
function parseData(e) {
    const file = e.target.files[0];

    Papa.parse(file, {
        dynamicTyping: true,
        complete: function(results) {
            renderSearch(results.data);
            renderTable(results.data);
            getRowIndex();
            $('.tableTitle, .metaDiv').show();
        }
    });
}

// Function to build search table header
function getSearchHeader() {
    const header = `
        <tr>
            <th>Target</th>
            <th>Search text</th>
            <th>Treat as regex</th>
        </tr>
    `;
    return header;
}

// Function to build search table body
function getSearchBody(data) {
    let rows = ``;

    for (let i = 0; i < data[0].length; i++) {
        rows += `<tr id="filter_col${i + 1}" data-column="${i + 1}">`;
        rows += `<td>Column - ${data[0][i]}</td>`;
        rows += `<td align="center"><input type="text" class="column_filter" id="col${i + 1}_filter"></td>`;
        rows += `<td align="center"><input type="checkbox" class="column_filter" id="col${i + 1}_regex"></td>`;
        rows += `</tr>`;
    }

    return rows;
}

// Function to replace template html with search table
function renderSearch(data) {
    const sheader = getSearchHeader();
    const sbody = getSearchBody(data);
    
    const searchTable = `
    <table cellpadding="3" cellspacing="0" border="0" style="width: 50%; margin: 0 auto 2em auto;">
        <thead>${sheader}</thead>
        <tbody>${sbody}<tbody>
    </table>
    `;

    $('#search-template').replaceWith(searchTable);
}

// Function to filter table data using input values/regular expressions
function filterColumn ( i ) {
    $('#main').DataTable().column( i ).search(
        $('#col'+i+'_filter').val(),
        $('#col'+i+'_regex').prop('checked')
    ).draw();
}

// Function to build main table header
function getTableHeader(data) {
    let rows = `<tr>`;
        rows += `<th>Index</th>`;

    for (let i = 0; i < data[0].length; i++) {
        rows += `<th>${data[0][i]}</th>`;
    }

    rows += `</tr>`;
    return rows;
}

// Function to build main table body
function getTableBody(data) {
    let rows = '';

    for (let i = 1; i < data.length; i++) {
        rows += `<tr>`;
        rows += `<td>Index</td>`;

        for (let j = 0; j < data[i].length; j++) {
            rows += `<td>${data[i][j]}</td>`;
        }

        rows += `</tr>`;
    }

    return rows;
}

// Function to replace template html with data table
function renderTable(data) {
    const header = getTableHeader(data);
    const body = getTableBody(data);
    
    const table = `
    <table id="main" class="display" style="width:100%">
        <thead>${header}</thead>
        <tbody>${body}<tbody>
    </table>`;

    $('header').hide();
    $('#main-template').parent().replaceWith(table);
    $('#main').DataTable({
        fixedHeader: true,
        "pageLength": 50
    });
}

// Function to update index column with original row number
function getRowIndex() {
    const table = $('#main').DataTable();
    
    table.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        const data = this.data();
        data[0] = rowIdx + 1;
        this.data(data);
    });
}

// Function to identify whether string is a date
function isDate(str) {
    const params = str.split(/[\.\-\/]/);
    const yyyy = parseInt(params[0],10);
    const mm   = parseInt(params[1],10);
    const dd   = parseInt(params[2],10);
    const date = new Date(yyyy,mm-1,dd,0,0,0,0);
    return mm === (date.getMonth()+1) && dd === date.getDate() && yyyy === date.getFullYear();
}




