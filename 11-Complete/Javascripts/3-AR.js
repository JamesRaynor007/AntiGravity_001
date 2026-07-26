document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('current-date').textContent = today;

    // Elements
    const inputs = document.querySelectorAll('.amount-input');
    const grandTotalEl = document.getElementById('grand-total');
    const pctEls = document.querySelectorAll('[id^="pct-"]');
    const canvas = document.getElementById('column-chart');
    const ctx = canvas.getContext('2d');

    const labels = ['1-30', '31-60', '61-90', '91-180', '+180'];
    const barColors = ['#00B4D8', '#0F766E', '#1E3A8A', '#334155', '#475569'];

    // Event listeners on inputs
    inputs.forEach(input => {
        input.addEventListener('input', calculateAndDraw);
        input.addEventListener('change', calculateAndDraw);
    });

    function calculateAndDraw() {
        // Direct totals from 5 inputs
        const colTotals = Array.from(inputs).map(input => parseFloat(input.value) || 0);
        const grandTotal = colTotals.reduce((sum, val) => sum + val, 0);

        // Number formatter
        const formatNum = (num) => num.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });

        // Update % 
        colTotals.forEach((total, idx) => {
            const pct = grandTotal > 0 ? (total / grandTotal * 100) : 0;
            pctEls[idx].textContent = `${pct.toFixed(1)}%`;
        });

        // Update grand
        grandTotalEl.textContent = `Grand Total: $${formatNum(grandTotal)}`;

        // Draw chart
        drawChart(colTotals, grandTotal);
    }

    function drawChart(colTotals, grandTotal) {
        const padding = 40;
        const barWidth = (canvas.width - padding * 2) / 5 - 10;
        const maxHeight = canvas.height - padding * 2 - 20;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Find max for scale
        const maxVal = Math.max(...colTotals, 1); // avoid zero

        // Draw bars
        colTotals.forEach((total, idx) => {
            const barHeight = (total / maxVal) * maxHeight;
            const x = padding + idx * (barWidth + 10) + 5;
            const y = canvas.height - padding - barHeight;

            // Bar
            ctx.fillStyle = barColors[idx];
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);

            // Value label
            ctx.fillStyle = '#1E293B';
            ctx.font = 'bold 12px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(`$${total.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`, x + barWidth / 2, y - 5);

            // Label
            ctx.fillStyle = '#475569';
            ctx.font = '12px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(labels[idx], x + barWidth / 2, canvas.height - 10);
        });

        // Axes
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding - 10, padding);
        ctx.lineTo(padding - 10, canvas.height - padding);
        ctx.lineTo(canvas.width - 10, canvas.height - padding);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#1E3A8A';
        ctx.font = 'bold 20px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AR Aging Column Chart (Amounts)', canvas.width / 2, 25);
    }

    // Initial
    calculateAndDraw();
});
