let csvData = [];
let filteredData = [];
const rowsPerPage = 15;
let currentPage = 1;

function loadVendorData(vendor) {
    document.getElementById('csvTable').style.display = 'none';
    document.getElementById('pagination').style.display = 'none';
    document.getElementById('tableTitle').style.display = 'none';

    let vendorTitle = '';
    let excludedColumns = [];

    if (vendor === 'mesco') {
        vendorTitle = 'Mesco Product Data';
        excludedColumns = [2,3,4,6,8,9,10,11,12,13,15,18,19,20,21,24,26,27,28,29,30,31,32,33,34,35,36,38,39,42,43];

        fetch('/J3Marine/assets/files/ItmMst.csv')
            .then(response => response.text())
            .then(data => {
                csvData = data.split('\n').map(row => row.split(','));
                filteredData = csvData.slice();
                renderTableHeader(excludedColumns);
                renderTable(excludedColumns);
                renderPagination();

                document.getElementById('csvTable').style.display = 'table';
                document.getElementById('pagination').style.display = 'block';
                document.getElementById('tableTitle').style.display = 'block';
            })
            .catch(error => console.error('Error fetching the CSV file:', error));
    } else if (vendor === 'kellogg') {
        vendorTitle = 'Kellogg Product Data';
        excludedColumns = [5, 8, 9, 10, 12, 13, 14, 15, 16, 17];
        //No excluded columns for Kellogg right now. excludedColumns would be defined here

        fetch('/J3Marine/assets/files/Kellogg_ItmMstr.TXT')
            .then(response => response.text())
            .then(data => {
                const headers = [
                    'Part Number', 'Mfr Itm Number', 'Vendor Itm Number', 'Manufacturer', 'Description',  'Pkg Type', 'Qty On Hand', 'List Price', 'Discount', 'Discounted Price', 'Manual', 'Cost Price', 'Code 1', 'Value 1', 'Code 2', 'Value 2', 'Code 3', 'UPC'
                ];

                csvData = data.split('\n').map(row => row.trim().split(/\s{2,}/));
                filteredData = csvData.slice();

                renderTableHeader(excludedColumns, headers); //no excluded columns for now
                renderTable(excludedColumns); //No excluded columns for now
                renderPagination();

                document.getElementById('csvTable').style.display = 'table';
                document.getElementById('pagination').style.display = 'block';
                document.getElementById('tableTitle').style.display = 'block';
            })
            .catch(error => console.error('Error fetching the .txt file:', error));
    } else if(vendor === 'wintron') {
        vendorTitle = 'Wintron Product Data';
        excludedColumns = [2, 6, 7, 8, 9, 11, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25];

        fetch('/J3Marine/assets/files/wintron.csv')
            .then(response => response.text())
            .then(data => {
                csvData = data.split('\n').map(row => row.split(','));
                filteredData = csvData.slice();

                renderTableHeader(excludedColumns);
                renderTable(excludedColumns);
                renderPagination();

                document.getElementById('csvTable').style.display = 'table';
                document.getElementById('pagination').style.display = 'block';
                document.getElementById('tableTitle').style.display = 'block';
            })
            .catch(error => console.error('Error fetching the csv file:', error));
    } else {
        console.log('Loading data for:', vendor);
    }

    document.getElementById('tableTitle').innerText = vendorTitle;

}

function renderTableHeader(excludedColumns, customHeaders) {

    const tableHead = document.querySelector('#csvTable thead');
    tableHead.innerHTML = '';

    const headers = customHeaders || csvData[0]; //use custom headers if applicable
    const headerRow = document.createElement('tr');
    headers.forEach((header, index) => {
        if (!excludedColumns.includes(index)) {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        }
    });
    tableHead.appendChild(headerRow);
}

function renderTable(excludedColumns) {

    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach((row, index) => {
        if (filteredData.indexOf(row) === 0) return;

        const tr = document.createElement('tr');
        row.forEach((cell, cellIndex) => {
            if (!excludedColumns.includes(cellIndex)) {
                const td = document.createElement('td');
                if (cellIndex === 23) {
                    const link = document.createElement('a');
                    link.href = '#';
                    link.textContent = cell.trim();
                    link.onclick = () => filterByColumnText(cell.trim());
                    td.appendChild(link)
                } else {
                    td.textContent = cell.trim();
                }
                tr.appendChild(td);
            }
        });
        tableBody.appendChild(tr);
    });
}

function filterByColumnText(text) {
    const searchValue = text.toLowerCase().trim();

    filteredData = csvData.filter((row, index) => {
        return index === 0 || row.some(cell => {
            return cell.toLowerCase().trim().includes(searchValue);
        });
    });

    currentPage = 1;
    renderTable();
    renderPagination();
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const maxPagesToShow = 10;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage +1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (currentPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.textContent = 'First';
        firstButton.onclick = () => {
            currentPage = 1;
            renderTable();
            renderPagination();
        };
        paginationDiv.appendChild(firstButton);
    }

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => {
            currentPage--;
            renderTable();
            renderPagination();
        };
        paginationDiv.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            renderTable();
            renderPagination();
        };
        if (i === currentPage) {
            button.style.fontWeight = 'bold';
        }
        paginationDiv.appendChild(button);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => {
            currentPage++;
            renderTable();
            renderPagination();
        };
        paginationDiv.appendChild(nextButton);
    }

    if (currentPage < totalPages) {
        const lastButton = document.createElement('button');
        lastButton.textContent = 'Last';
        lastButton.onclick = () => {
            currentPage = totalPages;
            renderTable();
            renderPagination();
        };
        paginationDiv.appendChild(lastButton);
    }
}

function filterRows() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase().trim();

    filteredData = csvData.filter((row, index) => {
        //Skip the header row (index > 0)
        return index ===  0 || row.some(cell => {
            return cell.toLowerCase().trim().includes(searchValue);
        });
    });

    currentPage = 1;
    renderTable();
    renderPagination();
}

function clearFilter() {
    document.getElementById('searchInput').value = '';
    filteredData = csvData.slice();
    currentPage = 1;
    renderTable();
    renderPagination();
}