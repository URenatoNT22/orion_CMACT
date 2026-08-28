// check.js — lógica del formulario ORION Check

document.getElementById('btn-check').addEventListener('click', () => {
  const docType   = document.getElementById('doc-type').value;
  const docNum    = document.getElementById('doc-num').value.trim();
  const creditType = document.getElementById('credit-type').value;
  const agency    = document.getElementById('agency').value;

  // Validación básica
  let valid = true;
  [['doc-num', docNum], ['credit-type', creditType], ['agency', agency]].forEach(([id, val]) => {
    const el = document.getElementById(id);
    const err = document.getElementById(id + '-error');
    if (!val) { el.classList.add('invalid'); if (err) err.classList.add('show'); valid = false; }
    else       { el.classList.remove('invalid'); if (err) err.classList.remove('show'); }
  });
  if (!valid) return;

  // Buscar cliente en mock
  const client = DATA.clients.find(c => c.dni === docNum) || {
    dni: docNum, name: 'Cliente Nuevo', type: docType,
    status: 'nuevo', creditScore: 650, income: 3000, debt: 0, age: 30,
    agency
  };
  client.creditType = creditType;
  client.agency = agency;

  // Evaluar reglas de check
  const results = DATA.checkRules.map(r => ({ ...r, passed: r.check(client) }));
  const apto = results.every(r => r.passed);

  // Guardar en state y redirigir
  State.set({ client, checkResults: results, apto });
  window.location.href = 'result.html';
});
