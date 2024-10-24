let csvData = [];
let filteredData = [];
const rowsPerPage = 15;
let currentPage = 1;
let selectedColumns = [];

function loadVendorData(vendor) {
    document.getElementById('csvTable').style.display = 'none';
    document.getElementById('pagination').style.display = 'none';
    document.getElementById('tableTitle').style.display = 'none';

    let vendorTitle = '';

    let filePath = '';

    //let excludedColumns = [];

    if(vendor === 'mesco') {
        filePath = '/assets/files/mesco.xlsx';
        vendorTitle = 'Mesco Product Data';
    } else if ( vendor === 'kellogg') {
        filePath = '/assets/files/kellogg.xlsx';
        vendorTitle = 'Kellogg Product Data';
    } else if ( vendor === 'wintron') {
        filePath = '/assets/files/wintron.xlsx';
        vendorTitle = 'Wintron Product Data';
    }

    fetch(filePath)
        .then(response => response.arrayBuffer())
        .then(data => {
            //parse out using excel.js
            const workbook = XLSX.read(data, {type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName]; //First sheet

            csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // set the parsed data 
            filteredData = csvData.slice(); //make a copy of the data for filtering

            //dynamically create checkboxes
            createColumnCheckboxes(csvData[0]);

            renderTableHeader(selectedColumns); //adjust if needed (no excluded columns for now)
            renderTable(selectedColumns); // render table with no exclusions
            renderPagination();

            //show the table pagination
            document.getElementById('tableTitle').textContent = vendorTitle;
            document.getElementById('tableTitle').style.display = 'block';
            document.getElementById('csvTable').style.display = 'table';
            document.getElementById('pagination').style.display = 'block';
        })
        .catch(error => console.error('Error fetching the Excel file:', error));
}

//Insert column header checkboxes
function createColumnCheckboxes(headers) {
    const columnCheckboxes = document.getElementById('columnCheckboxes');
    columnCheckboxes.innerHTML = '';

    headers.forEach((header, index) => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `col-${index}`;
        checkbox.value = index;
        checkbox.checked = true;
        checkbox.onchange = updateSelectedColumns;

        const label = document.createElement('label');
        label.setAttribute('for', `col-${index}`);
        label.textContent = header;

        li.appendChild(checkbox);
        li.appendChild(label);
        columnCheckboxes.appendChild(li);
    });

    selectedColumns = headers.map((_, index) => index);
}

function updateSelectedColumns() {
    const checkboxes = document.querySelectorAll('#columnCheckboxes input[type="checkbox"]');
    selectedColumns = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => parseInt(checkbox.value));

    renderTableHeader(selectedColumns);
    renderTable(selectedColumns);
}

function saveView() {
    const viewName = prompt('Enter a name for this view:');
    if (viewName) {
        // Save selected columns under the provided view name in local storage
        localStorage.setItem(viewName, JSON.stringify(selectedColumns));

        //update dropdown
        updatSavedViewsDropdown();
    }
}

function loadView(viewName) {
    if (viewName) {
        //Load the selected columns from local Storage
        const savedColumns = JSON.parse(localStorage.getItem(viewName));
        if (savedColumns) {
            //Apply the saved column selections
            selectedColumns = savedColumns;
            applySelectedColumns();
        }
    }
}

function applySelectedColumns() {
    //update the checkboxes to reflect the selected columns
    const checkboxes = document.querySelectorAll('#columnCheckboxes input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectedColumns.includes(parseInt(checkbox.value));
    });

    //re-enter the table with the selected columns
    renderTableHeader(selectedColumns);
    renderTable(selectedColumns);
}

function deleteView() {
    const dropdown = document.getElementById('savedViewsDropdown');
    const viewName = dropdown.value;
    if (viewName) {
        //confirm and delete selected view
        if (confirm('Are you sure you want to delete the view "${viewName}"?')) {
            localStorage.removeItem(viewName);

            //update the dropdown after deletion
            updateSavedViewsDropdown();
        }
    }
}

function updateSavedViewsDropdown() {
    const dropdown = document.getElementById('savedViewsDropdown');
    dropdown.innerHTML = '<option value="">Select a view</option>';

    //Loop through localStorage and add saved views to the dropdown
    for (let i = 0; i < localStorage.length; i++) {
        const viewName = localStorage.key(i);
        const option = document.createElement('option');
        option.value = viewName;
        option.textContent = viewName;
        dropdown.appendChild(option);
    }
}

//call this function when the page loads to populate the saved views dropdown
document.addEventListener('DOMContentLoaded', updateSavedViewsDropdown);

function renderTableHeader(selectedColumns) {
    const tableHead = document.querySelector('#csvTable thead');
    tableHead.innerHTML = '';

    const headers = csvData[0];  // The first row is the header
    const headerRow = document.createElement('tr');
    headers.forEach((header, index) => {
        if (selectedColumns.includes(index)) {  // Skip excluded columns if needed
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        }
    });
    tableHead.appendChild(headerRow);
}

function renderTable(selectedColumns) {
    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';  // Clear previous rows

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);  // Get the data for the current page

    pageData.forEach((row, rowIndex) => {
        if (rowIndex === 0) return;  // Skip the first row, which is the header

        const tr = document.createElement('tr');
        row.forEach((cell, cellIndex) => {
            if (selectedColumns.includes(cellIndex)) {  // Skip excluded columns if needed
                const td = document.createElement('td');
                td.textContent = cell ? cell.toString().trim() : '';  // Handle empty cells
                tr.appendChild(td);
            }
        });
        tableBody.appendChild(tr);
    });
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';  // Clear previous pagination buttons

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);  // Calculate total pages
    const maxPagesToShow = 10;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (currentPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.textContent = 'First';
        firstButton.onclick = () => {
            currentPage = 1;
            renderTable([]);
            renderPagination();
        };
        paginationDiv.appendChild(firstButton);
    }

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => {
            currentPage--;
            renderTable(selectedColumns);
            renderPagination();
        };
        paginationDiv.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            renderTable(selectedColumns);
            renderPagination();
        };
        if (i === currentPage) {
            button.style.fontWeight = 'bold';  // Highlight the current page
        }
        paginationDiv.appendChild(button);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => {
            currentPage++;
            renderTable(selectedColumns);
            renderPagination();
        };
        paginationDiv.appendChild(nextButton);
    }

    if (currentPage < totalPages) {
        const lastButton = document.createElement('button');
        lastButton.textContent = 'Last';
        lastButton.onclick = () => {
            currentPage = totalPages;
            renderTable(selectedColumns);
            renderPagination();
        };
        paginationDiv.appendChild(lastButton);
    }
}

function filterRows() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase().trim();

    filteredData = csvData.filter((row, index) => {
        return index === 0 || row.some(cell => {
            return cell && cell.toString().toLowerCase().trim().includes(searchValue);
        });
    });

    currentPage = 1;
    renderTable(selectedColumns);
    renderPagination();
}

function clearFilter() {
    document.getElementById('searchInput').value = '';
    filteredData = csvData.slice();  // Reset to the full data
    currentPage = 1;
    renderTable(selectedColumns);
    renderPagination();
}