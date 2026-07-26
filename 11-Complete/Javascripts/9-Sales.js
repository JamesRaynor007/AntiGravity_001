// Variables globales
let datos = [];
let datosFiltrados = [];

// Elementos DOM
const tableBody = document.querySelector('#dataTable tbody');
const downloadBtn = document.getElementById('downloadBtn');
const loadFileInput = document.getElementById('loadFile');
const filterMonthBtn = document.getElementById('filterMonthBtn');
const monthInput = document.getElementById('monthInput');
const filterProductBtn = document.getElementById('filterProductBtn');
const productSelect = document.getElementById('productSelect');
const totalsContainer = document.getElementById('totalsContainer');

// Función para generar y descargar plantilla XLSX
function descargarPlantilla() {
    const wb = XLSX.utils.book_new();
    const ws_data = [
        ['DATE', 'PRODUCT TYPE', 'UNITS', 'AMOUNT'],
        ['01/01/2024', 'PRODUCT A', 10, 100],
        ['15/02/2024', 'PRODUCT B', 5, 50],
        ['10/03/2024', 'PRODUCT C', 20, 200],
        ['25/01/2024', 'PRODUCT A', 7, 70],
        ['05/02/2024', 'PRODUCT C', 12, 120],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla.xlsx');
}

// Evento para descargar plantilla
document.getElementById('downloadBtn').addEventListener('click', descargarPlantilla);

// Función para cargar y leer archivo XLSX
loadFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {header:1});
        // Limpiar datos existentes
        datos = [];
        // Identificar cabeceras
        const headers = jsonData[0];
        // Procesar filas
        for (let i=1; i<jsonData.length; i++) {
            const row = jsonData[i];
            // Asegurar que la fila tenga datos
            if (row.length >= 4) {
                const obj = {
                    DATE: row[0],
                    PRODUCT_TYPE: row[1],
                    UNITS: parseInt(row[2]),
                    AMOUNT: parseFloat(row[3])
                };
                datos.push(obj);
            }
        }
        // Mostrar datos en tabla
        mostrarDatos(datos);
        // Actualizar lista de productos
        actualizarProductos();
        // Limpiar filtros
        document.getElementById('monthInput').value = '';
        productSelect.value = '';
        totalsContainer.innerHTML = '';
    };
    reader.readAsArrayBuffer(file);
});

// Función para mostrar datos en la tabla
function mostrarDatos(data) {
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.textContent = item.DATE;
        const typeCell = document.createElement('td');
        typeCell.textContent = item.PRODUCT_TYPE;
        const unitsCell = document.createElement('td');
        unitsCell.textContent = item.UNITS;
        const amountCell = document.createElement('td');
        amountCell.textContent = item.AMOUNT.toFixed(2);
        row.appendChild(dateCell);
        row.appendChild(typeCell);
        row.appendChild(unitsCell);
        row.appendChild(amountCell);
        tableBody.appendChild(row);
    });
}

// Función para actualizar la lista de productos en el select
function actualizarProductos() {
    const productos = Array.from(new Set(datos.map(d => d.PRODUCT_TYPE))).sort();
    productSelect.innerHTML = '<option value="">Selecciona un producto</option>';
    productos.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        productSelect.appendChild(option);
    });
}

// Función para filtrar por mes
document.getElementById('filterMonthBtn').addEventListener('click', () => {
    const mesSeleccionado = document.getElementById('monthInput').value; // formato yyyy-mm
    if (!mesSeleccionado) {
        alert('Por favor, selecciona un mes.');
        return;
    }
    const [año, mes] = mesSeleccionado.split('-');
    // Filtrar datos por mes
    const filtrados = datos.filter(d => {
        const fechaParts = d.DATE.split('/');
        if (fechaParts.length !== 3) return false;
        const [dd, mm, yyyy] = fechaParts;
        return yyyy === año && mm === mes;
    });
    mostrarDatos(filtrados);
    totalsContainer.innerHTML = '';
});

// Función para filtrar por producto
filterProductBtn.addEventListener('click', () => {
    const productoSeleccionado = productSelect.value;
    if (!productoSeleccionado) {
        alert('Por favor, selecciona un producto.');
        return;
    }
    const filtrados = datos.filter(d => d.PRODUCT_TYPE === productoSeleccionado);
    mostrarDatos(filtrados);
    mostrarTotales(filtrados, productoSeleccionado);
});

// Función para mostrar totales
function mostrarTotales(data, producto) {
    const totalUnits = data.reduce((sum, d) => sum + d.UNITS, 0);
    const totalAmount = data.reduce((sum, d) => sum + d.AMOUNT, 0);
    totalsContainer.innerHTML = `
        <h2>Totales para ${producto}</h2>
        <p>Unidades Totales: ${totalUnits}</p>
        <p>Monto Total: $${totalAmount.toFixed(2)}</p>
    `;
}
