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
        <tfoot>
            <tr>
                <th colspan="${columns - 1}" style="text-align:right">Page Total (Salary):</th>
                <th colspan="2" class="total"></th>
            </tr>
        </tfoot>
    </table>`;

    $('#table-wrapper').append(table);
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
    let idx = '';
    table.columns(':visible').every( function () {
        let header = $(this.header()).text();
        headers.push(`<a class="toggle-vis" data-column="${this.index()}">${header}</a>`);
    })
    headers.shift();
    headers = headers.join(' - ');
    console.log(headers)
    headers = `<div class="togglers">Toggle column: ${headers}</div>`;
    $("#main_filter").before(headers);

}

function createTable(data) {
    // render console
    $('#table-wrapper').prepend(`<div class="metaDiv"><span>Console: </span></div>`);

    // render search and main tables
    renderSearch(data);
    renderTable(data);

    // initialize data table
    $('#main').DataTable({
        fixedHeader: true,
        colReorder: true,
        "pageLength": 50,
        "columnDefs": [{
            "searchable": false,
            "targets": 0
        }],
        "footerCallback": function ( row, data, start, end, display ) {
            var api = this.api(), data;
 
            // Remove the formatting to get integer data for summation
            var intVal = function ( i ) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '')*1 :
                    typeof i === 'number' ?
                        i : 0;
            };
 
            // Total over all pages
            var total = api
                .column( 6 )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0 );
 
            // Total over this page
            var pageTotal = api
                .column( 6, { page: 'current'} )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0 );
 
            // Update footer
            $( api.column( 6 ).footer() ).html(
                '$'+pageTotal +' ( $'+ total +' total)'
            );
        }
    });

    // get index column data
    getRowIndex();
    addToggleLinks();
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

function toUpperCase(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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
            $('.metaDiv').text(`Current row: ${rowNumber + 1}`);
        }
    });

    // Event listener on table heading to display column data type, search term and sorting method
    $('body').on( 'mouseenter', '#main thead th', function () {

        const data = table.column(this).data()[0];
        let sort = $(this).attr("aria-sort");
        let search = table.column(this).search();

        let messageList = '';

     // Detect data types
        if (typeof(data) !== 'undefined') {
            if (data[0] ==='$') {
                messageList+='<div class="message">Column type: currency</div>';
            } else if (data.toString().indexOf("/") > -1) {
                messageList+='<div class="message">Column type: date</div>';
//                messageList.push('Column type: date');
            } else if (!isNaN(parseInt(data))) {
                messageList+='<div class="message">Column type: number</div>';
//                messageList.push('Column type: number');
            } else {
                messageList+='<div class="message">Column type: string</div>';
//                messageList.push('Column type: string');
            }
        }

        if (search !== '') {
            messageList+=`<div class="message">Search by: ${search}</div>`;
            //messageList.push(`Search by: ${search}`);
        }

        if (typeof sort !== "undefined") {
            messageList+=`<div class="message">Sort: ${sort}</div>`;
            //messageList.push(`Sort: ${toUpperCase(sort)}`);
        } else {
            console.log("Unsorted");
        }

       // $('.metaDiv').text(messageList.join(' | '));
       $('.metaDiv').html('').append(messageList);
    });

    $('a.toggle-vis').on( 'click', function (e) {
        e.preventDefault();

        // Get the column API object
        var column = table.column( $(this).attr('data-column') );

        // Toggle the visibility
        column.visible( !column.visible() );
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




