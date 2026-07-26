'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const formSection = document.querySelector('#formulario');
    if (!formSection) return console.error('No #formulario found');

    let table = formSection.querySelector('table');
    if (!table) {
      table = document.createElement('table');
      formSection.appendChild(table);
    }

    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }
    const tbodyRef = tbody;

    for(let i=0; i<10; i++){
      const tr = document.createElement('tr');

      // Valor
      const tdValor = document.createElement('td');
      const inputValor = document.createElement('input');
      inputValor.type = 'number';
      inputValor.id = 'valor'+i;
      inputValor.className = 'valor-input';
      inputValor.classList.add('valor-input', 'form-input');
      tdValor.appendChild(inputValor);
      tr.appendChild(tdValor);

      // Tipo
      const tdTipo = document.createElement('td');
      const selectTipo = document.createElement('select');
      selectTipo.id = 'tipo'+i;
      selectTipo.className = 'texto-peque';

      const optionIngreso = document.createElement('option');
      optionIngreso.value = 'Ingreso';
      optionIngreso.textContent = 'Ingreso';

      const optionGasto = document.createElement('option');
      optionGasto.value = 'Gasto';
      optionGasto.textContent = 'Gasto';

      selectTipo.appendChild(optionIngreso);
      selectTipo.appendChild(optionGasto);
      tdTipo.appendChild(selectTipo);
      tr.appendChild(tdTipo);

      // Comentario
      const tdComentario = document.createElement('td');
      const inputComentario = document.createElement('input');
      inputComentario.type = 'text';
      inputComentario.id = 'comentario'+i;
      inputComentario.placeholder = 'Opcional';
      inputComentario.classList.add('comentario-input', 'form-input');
      tdComentario.appendChild(inputComentario);
      tr.appendChild(tdComentario);

      tbodyRef.appendChild(tr);
    }

    // Add totals row
    const totalsTr = document.createElement('tr');
    totalsTr.classList.add('totals-row');
    ['Ingresos', 'Gastos', 'Balance'].forEach((label, idx) => {
      const td = document.createElement('td');
      td.textContent = label + ': 0.00';
      td.id = 'total-' + label.toLowerCase();
      td.classList.add('total-cell');
      totalsTr.appendChild(td);
    });
    tbodyRef.appendChild(totalsTr);

    // Add buttons row
    const buttonsTr = document.createElement('tr');
    buttonsTr.classList.add('buttons-row');
    const btnTd = document.createElement('td');
    btnTd.colSpan = 3;
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.classList.add('btn', 'btn-reset');
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.classList.add('btn', 'btn-save');
    btnTd.appendChild(resetBtn);
    btnTd.appendChild(saveBtn);
    buttonsTr.appendChild(btnTd);
    tbodyRef.appendChild(buttonsTr);

    // Event delegation for calculations
    table.addEventListener('input', calculateTotals);
    table.addEventListener('change', calculateTotals);

    function calculateTotals() {
      let ingresos = 0, gastos = 0;
      for (let i = 0; i < 10; i++) {
        const val = parseFloat(document.getElementById('valor' + i)?.value) || 0;
        const tipo = document.getElementById('tipo' + i)?.value;
        if (tipo === 'Ingreso' && val > 0) ingresos += val;
        else if (tipo === 'Gasto' && val > 0) gastos += val;
      }
      const balance = ingresos - gastos;
      document.getElementById('total-ingresos').textContent = 'Ingresos: ' + ingresos.toFixed(2);
      document.getElementById('total-gastos').textContent = 'Gastos: ' + gastos.toFixed(2);
      document.getElementById('total-balance').textContent = 'Balance: ' + balance.toFixed(2);
      // Color balance
      const balanceEl = document.getElementById('total-balance');
      balanceEl.style.color = balance >= 0 ? 'green' : 'red';
    }

    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.form-input').forEach(input => input.value = '');
      document.querySelectorAll('select').forEach(select => select.value = 'Ingreso');
      calculateTotals();
    });

    saveBtn.addEventListener('click', () => {
      const data = [];
      for (let i = 0; i < 10; i++) {
        data.push({
          valor: document.getElementById('valor' + i).value,
          tipo: document.getElementById('tipo' + i).value,
          comentario: document.getElementById('comentario' + i).value
        });
      }
      localStorage.setItem('contabilidadData', JSON.stringify(data));
      alert('Data saved to localStorage!');
    });

    // Load saved data
    const saved = localStorage.getItem('contabilidadData');
    if (saved) {
      const data = JSON.parse(saved);
      data.forEach((item, i) => {
        if (item.valor !== undefined) document.getElementById('valor' + i).value = item.valor;
        if (item.tipo !== undefined) document.getElementById('tipo' + i).value = item.tipo;
        if (item.comentario !== undefined) document.getElementById('comentario' + i).value = item.comentario;
      });
      calculateTotals();
    }
  });

