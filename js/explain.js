// explain.js — ORION Explain: genera guía operativa

const { client, selectedProduct: product, verifyParams } = State.get();
if (!client || !product) { window.location.href = 'verify.html'; }

const { amount, term } = verifyParams || {};
const monthlyRate = 0.018; // tasa mensual referencial
const monthly = amount ? (amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term))).toFixed(2) : 0;

document.getElementById('explain-content').innerHTML = `

  <!-- Resumen de la operación -->
  <div class="card" style="margin-bottom: var(--space-lg);">
    <div class="card-title">📄 Resumen de la operación</div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: var(--space-md);">
      ${[
        { label: 'Producto',  value: product.name },
        { label: 'Cliente',   value: client.name },
        { label: 'Monto',     value: `S/ ${parseFloat(amount).toLocaleString()}` },
        { label: 'Plazo',     value: `${term} meses` },
        { label: 'Cuota ref.',value: `S/ ${parseFloat(monthly).toLocaleString()}` },
      ].map(i => `
        <div>
          <div style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin-bottom:2px;">${i.label}</div>
          <div style="font-weight:600; font-size:var(--font-size-sm);">${i.value}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Requisitos documentarios -->
  <div class="card" style="margin-bottom: var(--space-lg);">
    <div class="card-title">📎 Requisitos documentarios</div>
    ${product.requirements.map((r, i) => `
      <div class="rule-row rule-pass">
        <span class="rule-icon" style="color:var(--color-accent)">📄</span>
        <span class="rule-label">${i + 1}. ${r}</span>
      </div>
    `).join('')}
  </div>

  <!-- Pasos operativos -->
  <div class="card" style="margin-bottom: var(--space-lg);">
    <div class="card-title">🗂 Pasos para completar la operación</div>
    ${product.steps.map((s, i) => `
      <div class="rule-row">
        <span class="rule-icon" style="background:var(--color-primary);color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${i + 1}</span>
        <span class="rule-label">${s}</span>
      </div>
    `).join('')}
  </div>

  <!-- Sustento normativo -->
  <div class="card">
    <div class="card-title">📘 Sustento normativo</div>
    <div style="font-size:var(--font-size-sm); color:var(--color-text-muted); line-height:1.7;">
      <p>• Resolución SBS N° 3780-2011 — Reglamento de Gestión del Riesgo de Crédito.</p>
      <p>• Circular SBS G-200-2017 — Gestión de la conducta de mercado.</p>
      <p>• Política interna de créditos vigente — versión aprobada por Directorio.</p>
      <p>• Tasas referenciales sujetas a aprobación de Comité de Créditos según monto.</p>
    </div>
  </div>

  <!-- Acciones finales -->
  <div style="display:flex; gap:var(--space-md); margin-top:var(--space-xl);">
    <a href="match.html" class="btn btn-outline">← Volver al Match</a>
    <button class="btn btn-primary" onclick="window.print()">🖨 Imprimir guía</button>
    <button class="btn btn-accent" onclick="State.clear(); window.location.href='dashboard.html'">✅ Finalizar operación</button>
  </div>
`;
