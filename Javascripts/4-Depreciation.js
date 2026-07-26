document.addEventListener('DOMContentLoaded', function() {
    // Date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Elements
    const tbody = document.getElementById('dep-body');
    const addBtn = document.getElementById('add-row-btn');
    const deleteBtn = document.getElementById('delete-row-btn');
    const kinds = ['Land', 'Building', 'Vehicle', 'PPE', 'Tools', 'Furniture', 'Intangibles'];

    // Number formatter
    const formatNum = (num) => '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "");
    
    // Add initial row
    addRow();

    // Events
    addBtn.addEventListener('click', addRow);
    deleteBtn.addEventListener('click', deleteRow);
    tbody.addEventListener('input', calculateAll);

    function addRow() {
        const row = document.createElement('tr');
        row.className = 'asset-row';
        row.innerHTML = `
            <td>
                <select class="kind-select">
                    ${kinds.map(k => `<option value="${k}">${k}</option>`).join('')}
                </select>
            </td>
            <td><input type="text" class="name-input" placeholder="Asset name"></td>
            <td><input type="number" class="years-input" min="0" step="0.1" placeholder="Years"></td>
            <td class="months-cell">-</td>
            <td><input type="number" class="buy-input" min="0" step="0.01" placeholder="Buy Value"></td>
            <td class="monthly-cell">-</td>
            <td class="yearly-cell">-</td>
        `;
        tbody.appendChild(row);
        row.querySelector('.years-input').addEventListener('input', calculateRow);
        row.querySelector('.buy-input').addEventListener('input', calculateRow);
        row.querySelector('.kind-select').addEventListener('change', calculateAll);
    }

    function deleteRow() {
        if (tbody.rows.length > 1) {
            tbody.deleteRow(-1);
            calculateAll();
        }
    }

    function calculateRow(e) {
        const row = e.target.closest('tr');
        const years = parseFloat(row.querySelector('.years-input').value) || 0;
        const buy = parseFloat(row.querySelector('.buy-input').value) || 0;
        const monthsCell = row.querySelector('.months-cell');
        const monthlyCell = row.querySelector('.monthly-cell');
        const yearlyCell = row.querySelector('.yearly-cell');
        
        const months = years * 12;
        const monthlyDep = months > 0 ? buy / months : 0;
        const yearlyDep = buy / years || 0;  // Direct Buy / Years as clarified
        
monthsCell.textContent = Math.round(months).toLocaleString();
        monthlyCell.textContent = formatNum(monthlyDep);
        yearlyCell.textContent = formatNum(yearlyDep);
        
        calculateAll();
    }

    function calculateAll() {
        let totalMonths = 0, totalBuy = 0, totalMonthly = 0, totalYearly = 0;
        const kindTotals = {};
        
        // Sum all
        Array.from(tbody.rows).forEach(row => {
            const buy = parseFloat(row.querySelector('.buy-input').value) || 0;
            const monthlyStr = row.querySelector('.monthly-cell').textContent;
            const monthly = parseFloat(monthlyStr.replace(/[$ ,]/g, '')) || 0;
            const yearlyStr = row.querySelector('.yearly-cell').textContent;
            const yearly = parseFloat(yearlyStr.replace(/[$ ,]/g, '')) || 0;
            const kind = row.querySelector('.kind-select').value;
            
            totalBuy += buy;
            totalMonthly += monthly;
            totalYearly += yearly;
            
            kindTotals[kind] = kindTotals[kind] || {buy: 0, monthly: 0, yearly: 0};
            kindTotals[kind].buy += buy;
            kindTotals[kind].monthly += monthly;
            kindTotals[kind].yearly += yearly;
        });
        
        // Update totals row (no months sum)
        document.getElementById('total-buy').textContent = formatNum(totalBuy);
        document.getElementById('total-monthly').textContent = formatNum(totalMonthly);
        document.getElementById('total-yearly').textContent = formatNum(totalYearly);
        
        // Update kind summary
        const kindBody = document.getElementById('kind-body');
        kindBody.innerHTML = '';
        Object.entries(kindTotals).forEach(([kind, totals]) => {
                const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${kind}</td>
                <td>${formatNum(totals.buy)}</td>
                <td>${formatNum(totals.monthly)}</td>
                <td>${formatNum(totals.yearly)}</td>
            `;
            kindBody.appendChild(tr);
        });
    }
});
