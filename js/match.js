// match.js — ORION Match: filtra productos y renderiza árbol

function evalMatch(client) {
  return DATA.products.map(p => {
    const checks = [
      { label: 'Tipo de crédito compatible',  passed: p.creditTypes.includes(client.creditType), reason: `Producto solo para: ${p.creditTypes.join(', ')}` },
      { label: 'Ingreso mínimo requerido',     passed: client.income >= p.minIncome,  reason: `Ingreso mínimo S/ ${p.minIncome} — cliente tiene S/ ${client.income}` },
      { label: 'Score crediticio suficiente',  passed: client.creditScore >= p.minScore, reason: `Score mínimo ${p.minScore} — cliente tiene ${client.creditScore}` },
      { label: 'Nivel de deuda aceptable',     passed: client.debt <= p.maxDebt,      reason: `Deuda máxima S/ ${p.maxDebt} — cliente tiene S/ ${client.debt}` },
    ];
    const qualifies = checks.every(c => c.passed);
    return { ...p, checks, qualifies };
  });
}

function renderMatch(results, client) {
  const qualified   = results.filter(r => r.qualifies);
  const disqualified = results.filter(r => !r.qualifies);

  document.getElementById('client-info').innerHTML = `
    <strong>${client.name}</strong> &nbsp;·&nbsp; DNI: ${client.dni}
    &nbsp;·&nbsp; Crédito: <strong>${client.creditType}</strong>
    &nbsp;·&nbsp; Score: ${client.creditScore} 
  `;

  document.getElementById('match-summary').innerHTML = `
    <span style="color:var(--color-apto)">✅ ${qualified.length} producto(s) califican</span>
    &nbsp;&nbsp;
    <span style="color:var(--color-no-apto)">❌ ${disqualified.length} descartado(s)</span>
  `;

  document.getElementById('match-tree').innerHTML = results.map(r => `
    <div class="tree-node-product ${r.qualifies ? 'tree-pass' : 'tree-fail'}">
      <div class="product-header" onclick="toggleProduct('prod-${r.id}', this)">
        <span class="product-icon">${r.qualifies ? '✅' : '❌'}</span>
        <span class="product-name">${r.name}</span>
        <span class="product-amount">Hasta S/ ${r.maxAmount.toLocaleString()}</span>
        <span class="product-toggle" id="toggle-${r.id}">▾</span>
        ${r.qualifies
          ? `<button class="btn btn-accent btn-sm" onclick="event.stopPropagation(); selectProduct('${r.id}')">Seleccionar</button>`
          : ''}
      </div>
      <div class="product-checks" id="prod-${r.id}">
        <div class="checks-tree">
          ${r.checks.map(c => `
            <div class="check-node ${c.passed ? 'pass' : 'fail'}">
              <div class="check-node-row">
                <span class="check-icon">${c.passed ? '✅' : '❌'}</span>
                <span class="check-label">${c.label}</span>
              </div>
              ${!c.passed ? `<div class="check-reason">${c.reason}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function toggleProduct(id) {
  const el     = document.getElementById(id);
  const toggle = document.getElementById('toggle-' + id.replace('prod-', ''));
  const isOpen = el.style.display === 'block';
  el.style.display = isOpen ? 'none' : 'block';
  if (toggle) toggle.classList.toggle('open', !isOpen);
}

function selectProduct(productId) {
  const product = DATA.products.find(p => p.id === productId);
  State.set({ selectedProduct: product });
  window.location.href = 'verify.html';
}

// Init
const { client } = State.get();
if (!client) { window.location.href = 'dashboard.html'; }
else { renderMatch(evalMatch(client), client); }
