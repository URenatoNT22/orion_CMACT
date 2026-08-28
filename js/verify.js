// verify.js — ORION Verify: evalúa condiciones específicas del producto

const { client, selectedProduct: product } = State.get();
if (!client || !product) { window.location.href = 'match.html'; }

// Render info del producto seleccionado
document.getElementById('product-title').textContent = product.name;
document.getElementById('product-meta').textContent  = `Hasta S/ ${product.maxAmount.toLocaleString()} · Plazos: ${product.terms.join(', ')} meses`;

// Poblar select de plazos
const termSelect = document.getElementById('input-term');
product.terms.forEach(t => {
  const opt = document.createElement('option');
  opt.value = t; opt.textContent = `${t} meses`;
  termSelect.appendChild(opt);
});

// Evaluar reglas con los parámetros ingresados
document.getElementById('btn-verify').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('input-amount').value);
  const term   = parseInt(document.getElementById('input-term').value);

  if (!amount || !term) {
    alert('Ingresa monto y plazo para continuar.');
    return;
  }

  const rules = [
    { label: 'Monto dentro del límite permitido',    passed: amount <= product.maxAmount,    reason: `Máximo permitido: S/ ${product.maxAmount.toLocaleString()}` },
    { label: 'Plazo válido para el producto',        passed: product.terms.includes(term),   reason: `Plazos válidos: ${product.terms.join(', ')} meses` },
    { label: 'Score crediticio suficiente',          passed: client.creditScore >= product.minScore, reason: `Mínimo requerido: ${product.minScore}` },
    { label: 'Ingreso mínimo cubierto',              passed: client.income >= product.minIncome,     reason: `Ingreso mínimo: S/ ${product.minIncome}` },
    { label: 'Nivel de deuda aceptable',             passed: client.debt <= product.maxDebt,         reason: `Deuda máxima: S/ ${product.maxDebt}` },
    { label: 'Monto no excede 6x el ingreso mensual', passed: amount <= client.income * 6,   reason: `Capacidad estimada: S/ ${(client.income * 6).toLocaleString()}` },
  ];

  const approved = rules.every(r => r.passed);

  // Render desglose
  document.getElementById('verify-result').style.display = 'block';
  document.getElementById('verify-status').innerHTML = approved
    ? `<span style="color:var(--color-apto); font-weight:700; font-size:var(--font-size-md)">✅ Operación viable</span>`
    : `<span style="color:var(--color-no-apto); font-weight:700; font-size:var(--font-size-md)">❌ Operación no viable</span>`;

  document.getElementById('rules-detail').innerHTML = rules.map(r => `
    <div class="rule-row ${r.passed ? 'rule-pass' : 'rule-fail'}">
      <span class="rule-icon">${r.passed ? '✅' : '❌'}</span>
      <span class="rule-label">${r.label}</span>
      ${!r.passed ? `<span class="rule-detail">${r.reason}</span>` : ''}
    </div>
  `).join('');

  if (approved) {
    State.set({ verifyParams: { amount, term }, verifyRules: rules, approved });
    document.getElementById('btn-explain').style.display = 'inline-flex';
  }
});

document.getElementById('btn-explain').addEventListener('click', () => {
  window.location.href = 'explain.html';
});
