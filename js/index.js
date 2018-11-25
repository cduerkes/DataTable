function filterColumn ( i ) {
    $('#test').DataTable().column( i ).search(
        $('#col'+i+'_filter').val(),
        $('#col'+i+'_regex').prop('checked')
    ).draw();
}

$(document).ready(function() {
    $('#body').DataTable();
    $("#csv-file").change(parseData);

    $('body').on( 'keyup click', 'input.column_filter', function () {
        filterColumn( $(this).parents('tr').attr('data-column') );
    });

    $('body').on( 'mouseenter', 'tr', function () {
        const table = $('#test').DataTable();

        var rowNumber = table.rows( { order: 'applied' } ).nodes().indexOf( this );


        console.log(`row index: ${rowNumber + 1}`);
    });

    $('body').on( 'mouseenter', 'td', function () {
        const table = $('#test').DataTable();
        const data = table.cell( this ).data();

        if (typeof(data) !== 'undefined') {
            console.log(`row index: ${table.row( this ).index()}`);

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

    $('body').on( 'mouseenter', '#test th', function () {
        const table = $('#test').DataTable();
        let sort = $(this).attr("aria-sort");
        let search = table.column(this).search();

        if (search !== '') {
            console.log(`search by: ${search}`);
        }
        if(typeof sort !== "undefined") {
            console.log(sort.charAt(0).toUpperCase() + sort.slice(1).toLowerCase());
        } else {
            console.log("Unsorted");
        }
    });
});

function isDate(str) {    
    const params = str.split(/[\.\-\/]/);
    const yyyy = parseInt(params[0],10);
    const mm   = parseInt(params[1],10);
    const dd   = parseInt(params[2],10);
    const date = new Date(yyyy,mm-1,dd,0,0,0,0);
    return mm === (date.getMonth()+1) && dd === date.getDate() && yyyy === date.getFullYear();
}

function parseData(e) {
    const file = e.target.files[0];

    Papa.parse(file, {
        dynamicTyping: true,
        complete: function(results) {
            renderSearch(results.data);
            renderTable(results.data);
            getRowIndex();
        }
    });
}

function renderTable(data) {
    const header = getTableHeader(data);
    const body = getTableBody(data);
    
    const table = `
    <table id="test" class="display" style="width:100%">
        <thead>${header}</thead>
        <tbody>${body}<tbody>
    </table>`;

    $('header').hide();
    $('#body').parent().replaceWith(table);
    $('#test').DataTable({
        "columnDefs": [{
            "targets": "_all",
            "createdCell": function (td, cellData, rowData, row, col) {
                $(td).attr('data-title', "your cell title");
            }
        }]
    });
}

function getRowIndex() {
    const table = $('#test').DataTable();
    
    table.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        const data = this.data();
        data[0] = rowIdx + 1;
        this.data(data);
    });
}

function getTableHeader(data) {
    let rows = `<tr>`;
        rows += `<th>Index</th>`;

    for (let i = 0; i < data[0].length; i++) {
        rows += `<th>${data[0][i]}</th>`;
    }

    rows += `</tr>`;
    return rows;
}

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

function renderSearch(data) {
    const sheader = getSearchHeader();
    const sbody = getSearchBody(data);
    
    const searchTable = `
    <table id="stest" cellpadding="3" cellspacing="0" border="0" style="width: 50%; margin: 0 auto 2em auto;">
        <thead>${sheader}</thead>
        <tbody>${sbody}<tbody>
    </table>
    `;

    $('#search').replaceWith(searchTable);
}

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
