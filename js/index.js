$(document).ready(function() {
    // Call parse data function when file uploaded
    $("#csv-file").change(parseData);
});

// Function to parse csv file, remove home page header and render table
function parseData(e) {
    const file = e.target.files[0];

    Papa.parse(file, {
        dynamicTyping: true,
        complete: function(results) {
            $('header').hide();
            $('main').prepend(`<h1 class="tableTitle">Genesis Interview Homework (UI/UX)</h1>`);
            createTable(results.data);
            addEventListeners();
        }
    });
}

function createTable(data) {
    // render console
    $('#table-wrapper').prepend(`<div class="metaDiv"><span>Console: </span></div>`);

    // render search and main tables
    renderSearch(data);
    renderTable(data);

    // initialize data table
    $('#main').DataTable({
        "fixedHeader": true,
        "colReorder": true,
        "pageLength": 50,
        "columnDefs": [
            { "targets": 0, "searchable": false},
            { "targets": "_all", "className": "dt-body-left" }
        ]
    });

    // get index column data
    getRowIndex();

    addToggleLinks();
}

// Function to build search table body
function buildSearchBody(data) {
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

// Function to render search table
function renderSearch(data) {
    const body = buildSearchBody(data);
    
    const searchTable = `
    <table cellpadding="3" cellspacing="0" border="0" style="width: 50%; margin: 0 auto 2em auto;">
        <thead>        
            <tr>
                <th>Target</th>
                <th>Search text</th>
                <th>Treat as regex</th>
            </tr>
        </thead>
        <tbody>${body}<tbody>
    </table>
    `;

    $('#search-wrapper').append(searchTable);
}

// Function to filter table data using input values/regular expressions
function filterColumn ( i ) {
    $('#main').DataTable().column( i ).search(
        $('#col'+i+'_filter').val(),
        $('#col'+i+'_regex').prop('checked')
    ).draw();
}

// Function to build main table header
function buildTableHeader(data) {
    let rows = `<tr>`;
        rows += `<th>Index</th>`;

    for (let i = 0; i < data[0].length; i++) {
        rows += `<th>${data[0][i]}</th>`;
    }

    rows += `</tr>`;
    return rows;
}

// Function to build main table body
function buildTableBody(data) {
    let rows = '';

    for (let i = 1; i < data.length - 1; i++) {
        rows += `<tr>`;
        rows += `<td></td>`;

        for (let j = 0; j < data[i].length; j++) {
            rows += `<td>${data[i][j]}</td>`;
        }

        rows += `</tr>`;
    }

    return rows;
}

// Function to render main table
function renderTable(data) {
    const header = buildTableHeader(data);
    const body = buildTableBody(data);
    const columns = data[0].length;

    const table = `
    <table id="main" class="display" style="width:100%">
        <thead>${header}</thead>
        <tbody>${body}<tbody>
    </table>`;

    $('#table-wrapper').append(table);
}

function addEventListeners() {
    const table = $('#main').DataTable();

    // Detect scroll position to style sticky metadata div
    $(document).scroll(function() {
        positionMetaDiv();
    });

    // Event listener on input fields to filter corresponding columns
    $('input.column_filter').on( 'keyup click', function () {
        filterColumn( $(this).parents('tr').attr('data-column') );
    });

    // Event listener on table rows to get and display visible table row
    $('body').on('mouseenter', '#main tr', function() {
        const rowNumber = table.rows( { order: 'applied' } ).nodes().indexOf( this );
        if (rowNumber >= 0) {
            $('.metaDiv').html('').append(`Current row: ${rowNumber + 1}`);
        }
    });

    // Event listener on table heading to display column data type, search term and sorting method
    $('body').on( 'mouseenter', '#main thead th', function () {
        const data = table.column(this).data()[0];
        let sort = $(this).attr("aria-sort");
        let search = table.column(this).search();

        let messageList = [];

    //  Detect data types
        if (typeof(data) !== 'undefined') {
            if (data[0] ==='$') {
                messageList.push('Type: currency');
            } else if (data.toString().indexOf("/") > -1) {
                messageList.push('Type: date');
            } else if (!isNaN(parseInt(data))) {
                messageList.push('Type: number');
            } else {
                messageList.push('Type: string');
            }
        }

        if (search !== '') {
            messageList.push(`Search by: ${search}`);
        }

        if (typeof sort !== "undefined") {
            messageList.push(`Sort: ${sort}`);
        } else {
            console.log("Unsorted");
        }

        $('.metaDiv').text(messageList.join(', '));
    });

    $('a.toggle-vis').on( 'click', function (e) {
        e.preventDefault();

        // Get the column API object
        var column = table.column( $(this).attr('data-column') );

        // Toggle the visibility
        column.visible( !column.visible() );
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

function addToggleLinks() {
    const table = $('#main').DataTable();
    let headers = [];
    table.columns(':visible').every( function () {
        let header = $(this.header()).text();
        headers.push(`<a class="toggle-vis" data-column="${this.index()}">${header}</a>`);
    })
    headers.shift();
    headers = headers.join(' - ');
    headers = `<div class="togglers">Toggle column: ${headers}</div>`;
    $("#main_filter").before(headers);
}

function positionMetaDiv() {
    var y = $(this).scrollTop();

    if (y > 375) {
        $('.metaDiv').fadeIn();
        $('.metaDiv').css({
            "position": "fixed", 
            "border-bottom": "1px solid #ddd"
        });
    } else {
        $('.metaDiv').css({
            "position": "static",
            "border-bottom": ""
        });
    }
}




