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
});

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
    $('#test').DataTable();
}

function getRowIndex() {
    var table = $('#test').DataTable();
    
    table.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        var data = this.data();
        data[0] = rowIdx + 1;
        this.data(data);
    });
}

function getTableHeader(data) {
    let rows = `<tr>`;
        rows += `<th>Index</th>`;

    for (var i = 0; i < data[0].length; i++) {
        rows += `<th>${data[0][i]}</th>`;
    }

    rows += `</tr>`;
    return rows;
}

function getTableBody(data) {
    let rows = '';

    for (var i = 1; i < data.length; i++) {
        rows += `<tr>`;
        rows += `<td>Index</td>`;

        for (var j = 0; j < data[i].length; j++) {
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

    for (var i = 0; i < data[0].length; i++) {
        rows += `<tr id="filter_col${i + 1}" data-column="${i}">`;
        rows += `<td>Column - ${data[0][i]}</td>`;
        rows += `<td align="center"><input type="text" class="column_filter" id="col${i}_filter"></td>`;
        rows += `<td align="center"><input type="checkbox" class="column_filter" id="col${i}_regex"></td>`;
        rows += `</tr>`;
    }

    return rows;
}
