// Predefined account structures
const ASSETS = {
    current: [
        '1) Cash and Cash Equivalents',
        '2) Accounts Receivable',
        '3) Notes Receivable',
        '4) Inventory',
        '5) Prepaid Expenses',
        '6) Marketable Securities',
        '7) Other Current Assets'
    ],
    nonCurrent: [
        '1) Property, Plant, and Equipment (PPE)',
        '2) Land',
        '3) Buildings',
        '4) Machinery and Equipment',
        '5) Furniture and Fixtures',
        '6) Intangible Assets',
        '7) Goodwill',
        '8) Patents, Copyrights, Trademarks',
        '9) Investments (long-term)',
        '10) Deferred Tax Assets',
        '11) Other Long-term Assets'
    ]
};

const LIABILITIES = {
    current: [
        '1. Accounts Payable',
        '2. Short-term Loans / Bank Overdrafts',
        '3. Accrued Expenses',
        '4. Unearned Revenue (Deferred Revenue)',
        '5. Notes Payable (due within one year)',
        '6. Income Taxes Payable',
        '7. Salaries and Wages Payable',
        '8. Interest Payable'
    ],
    nonCurrent: [
        '1. Long-term Loans / Bank Loans',
        '2. Bonds Payable',
        '3. Lease Obligations (Long-term)',
        '4. Pension Obligations',
        '5. Deferred Tax Liabilities',
        '6. Other Long-term Payables'
    ]
};

const EQUITY = [
    '1) Share Capital / Common Stock',
    '2) Retained Earnings',
    '3) Accumulated Other Comprehensive Income (OCI)',
    '4) Reserves'
];

const ALL_ACCOUNTS = {
    ...Object.fromEntries(ASSETS.current.map(a => [a, 'assets-current'])),
    ...Object.fromEntries(ASSETS.nonCurrent.map(a => [a, 'assets-noncurrent'])),
    ...Object.fromEntries(LIABILITIES.current.map(a => [a, 'liabs-current'])),
    ...Object.fromEntries(LIABILITIES.nonCurrent.map(a => [a, 'liabs-noncurrent'])),
    ...Object.fromEntries(EQUITY.map(a => [a, 'equity']))
};

// Element references
const fileInput = document.getElementById('xlsxFile');
const loadBtn = document.getElementById('loadBtn');
const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
const statusEl = document.getElementById('balanceStatus');
const assetsTableBody = document.querySelector('#assetsTable tbody');
const liabsTableBody = document.querySelector('#liabsTable tbody');
const totalAssetsEl = document.getElementById('totalAssets');
const totalLiabsEl = document.getElementById('totalLiabs');

// Load file handler
loadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an XLSX file');
        return;
    }
    
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { raw: false });
        
        const parsed = parseBalanceSheet(json);
        renderBalanceSheet(parsed);
    } catch (err) {
        console.error(err);
        alert('Error parsing XLSX file');
    }
});

// Parse XLSX rows (assume columns: Account, Amount; Amount >0 for Assets left, <0 right OR additional Side column)
function parseBalanceSheet(rows) {
    const assets = { current: { total: 0 }, nonCurrent: { total: 0 }, total: 0 };
    const liabs = { current: { total: 0 }, nonCurrent: { total: 0 }, total: 0 };
    const equity = { total: 0 };
    
    rows.forEach(row => {
        const account = row.Account || row.account || row['Account Name'];
        const amountStr = row.Amount || row.amount || row['Debit'] || row.Debit || row['Credit'] || row.Credit;
        if (!account || !amountStr) return;
        
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) return;
        
        const skipRows = ['Current Assets Subtotal', 'Non-Current Assets Subtotal', 'Total Assets', 'Current Liabilities Subtotal', 'Non-Current Liabilities Subtotal', 'Total Liabilities', 'Total Equity', 'Total Liabilities + Equity'];
        if (skipRows.includes(account)) return;
        
        const category = ALL_ACCOUNTS[account];
        if (!category) return;
        
        const absAmount = Math.abs(amount);
        
        if (category.startsWith('assets-')) {
            let subcat = category.split('-')[1];
            if (subcat === 'noncurrent') subcat = 'nonCurrent';
            if (!assets[subcat]) assets[subcat] = { total: 0 };
            assets[subcat][account] = absAmount;
            assets[subcat].total += absAmount;
            assets.total += absAmount;
        } else if (category.startsWith('liabs-')) {
            let subcat = category.split('-')[1];
            if (subcat === 'noncurrent') subcat = 'nonCurrent';
            if (!liabs[subcat]) liabs[subcat] = { total: 0 };
            liabs[subcat][account] = absAmount;
            liabs[subcat].total += absAmount;
            liabs.total += absAmount;
        } else if (category === 'equity') {
            if (!equity[account]) equity[account] = 0;
            equity[account] = absAmount;
            equity.total += absAmount;
        }
    });
    
    return { assets, liabs, equity, totalLiabsEquity: liabs.total + equity.total };
}

// Render tables
function renderBalanceSheet(data) {
    // Assets
    assetsTableBody.innerHTML = '';
    
// Current Assets
    const currentAssets = Object.fromEntries(Object.entries(data.assets.current).filter(([acc, amt]) => amt > 0 && acc !== 'total'));
    const currentSum = Object.values(currentAssets).reduce((sum, amt) => sum + amt, 0);
    if (currentSum > 0) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';
        headerRow.innerHTML = `<td colspan="2"><strong>A) Current Assets</strong></td>`;
        assetsTableBody.appendChild(headerRow);
        
        Object.entries(currentAssets).forEach(([acc, amt]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${acc}</td><td>$${amt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
            assetsTableBody.appendChild(row);
        });
        
        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'subtotal';
        subtotalRow.innerHTML = `<td><strong>Current Assets Subtotal</strong></td><td>$${currentSum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
        assetsTableBody.appendChild(subtotalRow);
    }
    
    // Non-Current Assets
    const nonCurrentAssets = Object.fromEntries(Object.entries(data.assets.nonCurrent).filter(([acc, amt]) => amt > 0 && acc !== 'total'));
    const nonCurrentSum = Object.values(nonCurrentAssets).reduce((sum, amt) => sum + amt, 0);
    if (nonCurrentSum > 0) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';
        headerRow.innerHTML = `<td colspan="2"><strong>B) Non-Current Assets</strong></td>`;
        assetsTableBody.appendChild(headerRow);
        
        Object.entries(nonCurrentAssets).forEach(([acc, amt]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${acc}</td><td>$${amt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
            assetsTableBody.appendChild(row);
        });
        
        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'subtotal';
        subtotalRow.innerHTML = `<td><strong>Non-Current Assets Subtotal</strong></td><td>$${nonCurrentSum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
        assetsTableBody.appendChild(subtotalRow);
    }
    
    totalAssetsEl.textContent = `$${data.assets.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Liabilities & Equity
    liabsTableBody.innerHTML = '';
    
    // Current Liabilities
    const currentLiabs = Object.fromEntries(Object.entries(data.liabs.current).filter(([acc, amt]) => amt > 0 && acc !== 'total'));
    const currentLiabsSum = Object.values(currentLiabs).reduce((sum, amt) => sum + amt, 0);
    if (currentLiabsSum > 0) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';
        headerRow.innerHTML = `<td colspan="2"><strong>A. Current Liabilities</strong></td>`;
        liabsTableBody.appendChild(headerRow);
        
        Object.entries(currentLiabs).forEach(([acc, amt]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${acc}</td><td>$${amt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
            liabsTableBody.appendChild(row);
        });
        

        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'subtotal green-subtotal';
        subtotalRow.innerHTML = `<td><strong>Current Liabilities Subtotal</strong></td><td>$${currentLiabsSum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
        liabsTableBody.appendChild(subtotalRow);

    }
    
    // Non-Current Liabilities
    const nonCurrentLiabs = Object.fromEntries(Object.entries(data.liabs.nonCurrent).filter(([acc, amt]) => amt > 0 && acc !== 'total'));
    const nonCurrentLiabsSum = Object.values(nonCurrentLiabs).reduce((sum, amt) => sum + amt, 0);
    if (nonCurrentLiabsSum > 0) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';
        headerRow.innerHTML = `<td colspan="2"><strong>B. Non-Current Liabilities</strong></td>`;
        liabsTableBody.appendChild(headerRow);
        
        Object.entries(nonCurrentLiabs).forEach(([acc, amt]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${acc}</td><td>$${amt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
            liabsTableBody.appendChild(row);
        });
        


        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'subtotal green-subtotal';
        subtotalRow.innerHTML = `<td><strong>Non-Current Liabilities Subtotal</strong></td><td>$${nonCurrentLiabsSum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
        liabsTableBody.appendChild(subtotalRow);


    }
    
    // Equity
    if (data.equity.total > 0) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';
        headerRow.innerHTML = `<td colspan="2"><strong>Equity</strong></td>`;
        liabsTableBody.appendChild(headerRow);
        
        Object.entries(data.equity).filter(([acc, amt]) => acc !== 'total' && amt > 0).forEach(([acc, amt]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${acc}</td><td>$${amt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
            liabsTableBody.appendChild(row);
        });
        

        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'subtotal equity-total';
        subtotalRow.innerHTML = `<td><strong>Total Equity</strong></td><td>$${(data.equity.total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`;
        liabsTableBody.appendChild(subtotalRow);

    }
    
    totalLiabsEl.textContent = `$${data.totalLiabsEquity.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Balance check
    const isBalanced = Math.abs(data.assets.total - data.totalLiabsEquity) < 0.01;

    if (isBalanced) {
        statusEl.textContent = '✅ Balanced!';
        statusEl.className = 'status balanced';
    } else {
        const difference = data.assets.total - data.totalLiabsEquity;
        statusEl.textContent = `⚠️ Unbalanced! Difference: $${Math.abs(difference).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${difference > 0 ? '(Assets > L&E)' : '(Assets < L&E)'}`;
        statusEl.className = 'status unbalanced';
    }

}

// Download template
downloadTemplateBtn.addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    
    // Template data
    const templateData = [
        ['Account', 'Amount'],
        ['1) Cash and Cash Equivalents', ''],
        ['2) Accounts Receivable', ''],
        ['3) Notes Receivable', ''],
        ['4) Inventory', ''],
        ['5) Prepaid Expenses', ''],
        ['6) Marketable Securities', ''],
        ['7) Other Current Assets', ''],
        ['Current Assets Subtotal', '=SUM(B2:B8)'],
        ['1) Property, Plant, and Equipment (PPE)', ''],
        ['2) Land', ''],
        ['3) Buildings', ''],
        ['4) Machinery and Equipment', ''],
        ['5) Furniture and Fixtures', ''],
        ['6) Intangible Assets', ''],
        ['7) Goodwill', ''],
        ['8) Patents, Copyrights, Trademarks', ''],
        ['9) Investments (long-term)', ''],
        ['10) Deferred Tax Assets', ''],
        ['11) Other Long-term Assets', ''],
        ['Non-Current Assets Subtotal', '=SUM(B10:B20)'],
        ['Total Assets', '=SUM(B9;B21)'],
        [],
        ['A. Current Liabilities'],
        ['1. Accounts Payable', ''],
        ['2. Short-term Loans / Bank Overdrafts', ''],
        ['3. Accrued Expenses', ''],
        ['4. Unearned Revenue (Deferred Revenue)', ''],
        ['5. Notes Payable (due within one year)', ''],
        ['6. Income Taxes Payable', ''],
        ['7. Salaries and Wages Payable', ''],
        ['8. Interest Payable', ''],
        ['Current Liabilities Subtotal', '=SUM(B26:B33)'],
        ['B. Non-Current Liabilities'],
        ['1. Long-term Loans / Bank Loans', ''],
        ['2. Bonds Payable', ''],
        ['3. Lease Obligations (Long-term)', ''],
        ['4. Pension Obligations', ''],
        ['5. Deferred Tax Liabilities', ''],
        ['6. Other Long-term Payables', ''],
        ['Non-Current Liabilities Subtotal', '=SUM(B36:B41)'],
        ['Total Liabilities', '=SUM(B34;B42)'],
        [],
        ['Equity'],
        ['1) Share Capital / Common Stock', ''],
        ['2) Retained Earnings', ''],
        ['3) Accumulated Other Comprehensive Income (OCI)', ''],
        ['4) Reserves', ''],
        ['Total Equity', '=SUM(B45:B48)'],
        ['Total Liabilities + Equity', '=SUM(B43;B49)']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
    
    XLSX.writeFile(wb, 'balance-sheet-template.xlsx');
});
