// Variables globales
let currentData = {}; // Datos cargados

// Plantilla por defecto
const defaultTemplate = [
  {name: "Current Assets", current: 0, last: 0},
  {name: "Average Inventory", current: 0, last: 0},
  {name: "Inventories", current: 0, last: 0},
  {name: "Average Net Fixed Assets", current: 0, last: 0},
  {name: "Average Total Assets", current: 0, last: 0},
  {name: "Investment", current: 0, last: 0},
  {name: "Total Assets", current: 0, last: 0},
  {name: "Current Liabilities", current: 0, last: 0},
  {name: "Average Accounts Payable", current: 0, last: 0},
  {name: "Long Term Debt", current: 0, last: 0},
  {name: "Total Liabilities", current: 0, last: 0},
  {name: "Number of Outstanding Shares", current: 0, last: 0},
  {name: "Shareholders Equity", current: 0, last: 0},
  {name: "Net Sales", current: 0, last: 0},
  {name: "COGS", current: 0, last: 0},
  {name: "Purchases of COGS", current: 0, last: 0},
  {name: "EBITDA", current: 0, last: 0},
  {name: "Net Income", current: 0, last: 0},
  {name: "Net Revenue", current: 0, last: 0},
  {name: "Net Profit", current: 0, last: 0},
  {name: "EBIT", current: 0, last: 0},
  {name: "Interest", current: 0, last: 0},
  {name: "Tax", current: 0, last: 0},
  {name: "Average Working Capital", current: 0, last: 0},
  {name: "Cash Flow From Operating Activities", current: 0, last: 0},
  {name: "Capital Expenditures", current: 0, last: 0},
  {name: "Principal", current: 0, last: 0},
  {name: "Dividends", current: 0, last: 0},
  {name: "Market Value per Share", current: 0, last: 0},
  {name: "Earnings Per Share (EPS)", current: 0, last: 0},
  {name: "Non-Operating Cash", current: 0, last: 0}
];

// Función para inicializar la plantilla
function inicializarPlantilla() {
  currentData = {};
  defaultTemplate.forEach(item => {
    currentData[item.name] = { current: item.current, last: item.last };
  });
  mostrarKPIs();
}

// Función para descargar plantilla Excel
document.getElementById('download-template').addEventListener('click', () => {
  const ws_data = [["Nombre", "CURRENT", "LAST"]];
  defaultTemplate.forEach(item => {
    ws_data.push([item.name, item.current, item.last]);
  });
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
  XLSX.writeFile(wb, "Plantilla_Financiera.xlsx");
});

// Función para cargar archivo Excel
document.getElementById('load-template-btn').addEventListener('click', () => {
  document.getElementById('load-template').click();
});

document.getElementById('load-template').addEventListener('change', (evt) => {
  const file = evt.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      if (json.length < 2) {
        alert("Archivo inválido o vacío");
        return;
      }

      const headers = json[0];
      const currentIdx = headers.findIndex(h => h.toString().toUpperCase().includes('CURRENT'));
      const lastIdx = headers.findIndex(h => h.toString().toUpperCase().includes('LAST'));

      if (currentIdx === -1 || lastIdx === -1) {
        alert("El archivo no tiene columnas 'CURRENT' y 'LAST'");
        return;
      }

      // Procesar filas
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        const name = row[0];
        if (name && currentData.hasOwnProperty(name)) {
          const currentVal = parseFloat(row[currentIdx]);
          const lastVal = parseFloat(row[lastIdx]);
          if (!isNaN(currentVal)) currentData[name].current = currentVal;
          if (!isNaN(lastVal)) currentData[name].last = lastVal;
        }
      }
      mostrarKPIs();
    } catch (err) {
      alert("Error al leer el archivo: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
});

// Función para reiniciar plantilla
document.getElementById('refresh-template').addEventListener('click', () => {
  inicializarPlantilla();
});

// Función para mostrar u ocultar secciones
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.target);
    target.classList.toggle('show');
  });
});

// Función auxiliar para obtener valor
const getVal = (name, period = 'current') => {
  return currentData[name] ? currentData[name][period] || 0 : 0;
};

// Función para crear fila HTML
const createRow = (name, currentVal, lastVal) => {
  return `
    <tr>
      <td>${name}</td>
      <td>${currentVal.toFixed(2)}</td>
      <td>${lastVal.toFixed(2)}</td>
    </tr>
  `;
};

// Función principal para mostrar KPIs
function mostrarKPIs() {
  // Limpiar tablas
  document.getElementById('general-body').innerHTML = '';
  document.getElementById('operative-body').innerHTML = '';
  document.getElementById('cashflow-body').innerHTML = '';
  document.getElementById('returns-body').innerHTML = '';
  document.getElementById('last-period-body').innerHTML = '';

  // KPIs con cálculos
  const KPIs = {
    // KPIs Generales
    general: [
      {
        name: "Current Ratio",
        value: () => getVal("Current Assets") / getVal("Current Liabilities")
      },
      {
        name: "Quick Ratio",
        value: () => (getVal("Current Assets") - getVal("Inventories")) / getVal("Current Liabilities")
      },
      {
        name: "Debt to Equity Ratio",
        value: () => getVal("Total Liabilities") / getVal("Shareholders Equity")
      },
      {
        name: "Debt Ratio",
        value: () => getVal("Total Liabilities") / getVal("Total Assets")
      },
      {
        name: "Working Capital",
        value: () => getVal("Current Assets") - getVal("Current Liabilities")
      },
      {
        name: "Equity Ratio",
        value: () => getVal("Shareholders Equity") / getVal("Total Assets")
      },
      {
        name: "Book Value per Share",
        value: () => getVal("Shareholders Equity") / getVal("Number of Outstanding Shares")
      }
    ],
    // KPIs Operativos
    operative: [
      {
        name: "Inventory Turnover",
        value: () => getVal("COGS") / getVal("Average Inventory")
      },
      {
        name: "Assets Turnover Ratio",
        value: () => getVal("Net Sales") / getVal("Average Total Assets")
      },
      {
        name: "Fixed Asset Turnover",
        value: () => getVal("Net Sales") / getVal("Average Net Fixed Assets")
      },
      {
        name: "Working Capital Turnover",
        value: () => getVal("Net Sales") / getVal("Average Working Capital")
      }
    ],
    // KPIs Cash Flow
    cashFlow: [
      {
        name: "Operating Cash Flow Ratio",
        value: () => getVal("Cash Flow From Operating Activities") / getVal("Current Liabilities")
      },
      {
        name: "Free Cash Flow",
        value: () => getVal("Cash Flow From Operating Activities") - getVal("Capital Expenditures")
      },
      {
        name: "Cash Flow to Debt Ratio",
        value: () => getVal("Cash Flow From Operating Activities") / getVal("Long Term Debt")
      },
      {
        name: "Cash Flow Margin",
        value: () => getVal("Cash Flow From Operating Activities") / getVal("Net Sales")
      },
      {
        name: "Cash Return on Assets (ROA)",
        value: () => getVal("Cash Flow From Operating Activities") / getVal("Total Assets")
      }
    ],
    // KPIs Retornos
    returns: [
      {
        name: "Return On Assets (ROA)",
        value: () => getVal("Net Income") / getVal("Total Assets")
      },
      {
        name: "Return On Equity (ROE)",
        value: () => getVal("Net Income") / getVal("Shareholders Equity")
      },
      {
        name: "Turnover Ratio",
        value: () => getVal("Net Revenue") / getVal("Total Assets")
      },
      {
        name: "Dividend Payout Ratio",
        value: () => getVal("Dividends") / getVal("Net Income")
      },
      {
        name: "Earnings Per Share (EPS)",
        value: () => getVal("Net Income") / getVal("Number of Outstanding Shares")
      },
      {
        name: "Price Earnings (P/E) Ratio",
        value: () => getVal("Market Value per Share") / getVal("Earnings Per Share (EPS)")
      },
      {
        name: "ROI",
        value: () => getVal("Net Profit") / getVal("Investment")
      }
    ],
    // KPIs para el período pasado (Last period)
    last_period: [
      {
        name: "Current Ratio (Last)",
        value: () => getVal("Current Assets", 'last') / getVal("Current Liabilities", 'last')
      },
      {
        name: "Quick Ratio (Last)",
        value: () => (getVal("Current Assets", 'last') - getVal("Inventories", 'last')) / getVal("Current Liabilities", 'last')
      },
      {
        name: "Debt to Equity Ratio (Last)",
        value: () => getVal("Total Liabilities", 'last') / getVal("Shareholders Equity", 'last')
      },
      {
        name: "Debt Ratio (Last)",
        value: () => getVal("Total Liabilities", 'last') / getVal("Total Assets", 'last')
      },
      {
        name: "Working Capital (Last)",
        value: () => getVal("Current Assets", 'last') - getVal("Current Liabilities", 'last')
      },
      {
        name: "Equity Ratio (Last)",
        value: () => getVal("Shareholders Equity", 'last') / getVal("Total Assets", 'last')
      },
      {
        name: "Book Value per Share (Last)",
        value: () => getVal("Shareholders Equity", 'last') / getVal("Number of Outstanding Shares", 'last')
      },
      // Ejemplo adicional
      {
        name: "Inventory Turnover (Last)",
        value: () => getVal("COGS", 'last') / getVal("Average Inventory", 'last')
      },
      {
        name: "Assets Turnover Ratio (Last)",
        value: () => getVal("Net Sales", 'last') / getVal("Average Total Assets", 'last')
      }
    ]
  };

  // Función auxiliar para agregar KPIs
  const agregarKPIs = (sectionId, kpisArray) => {
    const tbody = document.getElementById(sectionId);
    tbody.innerHTML = ''; // limpiar antes
    kpisArray.forEach(kpi => {
      let val = 0;
      try {
        val = kpi.value();
        if (isNaN(val) || !isFinite(val)) val = 0;
      } catch (e) {
        val = 0;
      }
      const lastVal = currentData[kpi.name] ? currentData[kpi.name].last : 0;
      tbody.innerHTML += createRow(kpi.name, val, lastVal);
    });
  };

  // Agregar KPIs a cada sección
  agregarKPIs('general-body', KPIs.general);
  agregarKPIs('operative-body', KPIs.operative);
  agregarKPIs('cashflow-body', KPIs.cashFlow);
  agregarKPIs('returns-body', KPIs.returns);
  // Para el período pasado
  document.getElementById('last-period-body').innerHTML = '';
  KPIs.last_period.forEach(kpi => {
    let val = 0;
    try {
      val = kpi.value();
      if (isNaN(val) || !isFinite(val)) val = 0;
    } catch (e) {
      val = 0;
    }
    const lastVal = currentData[kpi.name] ? currentData[kpi.name].last : 0;
    document.getElementById('last-period-body').innerHTML += createRow(kpi.name, val, lastVal);
  });
}

// Cargar inicial al abrir
window.onload = inicializarPlantilla;
