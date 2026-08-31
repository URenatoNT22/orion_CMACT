// explain.js — ORION Explain: genera guía operativa dinámica

const { client, selectedProduct: product, verifyParams } = State.get();
if (!client || !product) { window.location.href = 'verify.html'; }

const { amount, term } = verifyParams || {};
const monthlyRate = 0.018;
const monthly = amount
  ? (amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term))).toFixed(2)
  : 0;

// ── Lógica de condiciones según producto ──────────────────────────────────────

function getRatioCuota(product) {
  if (product.id === 'p2') return { val: '30%', sub: 'Máximo para crédito hipotecario' };
  if (product.id === 'p3') return { val: '40%', sub: 'Máximo para MYPE empresarial' };
  return { val: '35%', sub: 'Máximo para crédito de consumo' };
}

function getGarantia(product, amount) {
  if (product.id === 'p2') return { val: 'Hipotecaria', sub: 'Obligatoria para este producto' };
  if (product.id === 'p3' && amount >= 50000) return { val: 'Real o mobiliaria', sub: 'Requerida desde S/ 50,000' };
  if (product.id === 'p3') return { val: 'No requerida', sub: 'Monto dentro del límite sin garantía' };
  return { val: 'No requerida', sub: 'Producto sin garantía' };
}

function getSeguros(product) {
  if (product.id === 'p2') return { val: '2 seguros', sub: 'Desgravamen + bien inmueble' };
  if (product.id === 'p3') return { val: 'Desgravamen', sub: 'Obligatorio antes del desembolso' };
  return { val: 'Desgravamen', sub: 'Obligatorio antes del desembolso' };
}

function getAval(client, product) {
  if (client.status === 'nuevo' && product.id !== 'p2') return { val: 'Requerido', sub: 'Cliente nuevo sin historial interno' };
  if (product.id === 'p2') return { val: 'No aplica', sub: 'Se sustituye con garantía hipotecaria' };
  return { val: 'No requerido', sub: 'Cliente recurrente con historial' };
}

function getDestino(product) {
  if (product.id === 'p1') return { val: 'Consumo libre', sub: 'Sin restricción de destino' };
  if (product.id === 'p2') return { val: 'Adquisición de vivienda', sub: 'Solo para compra o construcción de inmueble' };
  if (product.id === 'p3') return { val: 'Capital de trabajo / activo fijo', sub: 'Uso exclusivo del negocio' };
  if (product.id === 'p4') return { val: 'Consumo personal', sub: 'Libre disponibilidad' };
  return { val: 'Libre', sub: '' };
}

// ── Lógica de nivel de aprobación ─────────────────────────────────────────────

function getAprobador(product, amount) {
  // Cadena completa siempre igual, solo cambia quién está activo
  const chain = [
    { label: 'Administrador de tienda', minAmount: 0 }
    // { label: 'Jefe Zonal',              minAmount: 30000 },
    // { label: 'Gerencia de Negocios',    minAmount: 60000 },
    // { label: 'Gerencia Central',        minAmount: 150000 },
  ];

  // Para hipotecario el umbral sube
  const thresholds = product.id === 'p2'
    ? [0, 100000, 200000, 300000]
    : [0, 30000, 60000, 150000];

  let activeIdx = 0;
  thresholds.forEach((t, i) => { if (amount >= t) activeIdx = i; });

  return { chain: chain.map(c => c.label), activeIdx };
}

// ── Documentación dinámica por producto y perfil de cliente ───────────────────

function getDocGroups(product, client, amount) {
  const groups = [];

  // Ingresos — siempre, pero varía si es nuevo o recurrente
  if (client.status === 'nuevo') {
    const docs = [];
    if (product.id === 'p1' || product.id === 'p4') {
      docs.push({ name: 'Boletas de pago últimos 3 meses', req: true });
      docs.push({ name: 'Recibo de servicios del domicilio', req: true });
    } else if (product.id === 'p3') {
      docs.push({ name: 'Declaración jurada de ingresos del negocio', req: true });
      docs.push({ name: 'Últimos 6 meses de estados de cuenta bancaria', req: true });
      docs.push({ name: 'Boletas de venta o facturas del negocio', req: false, tag: 'dt-cond', tagLabel: 'Si aplica' });
    } else if (product.id === 'p2') {
      docs.push({ name: 'Declaración de renta o boletas de pago últimos 3 meses', req: true });
      docs.push({ name: 'Estados de cuenta bancaria últimos 6 meses', req: true });
    }
    groups.push({ head: 'Acreditación de ingresos — cliente nuevo sin historial', docs });
  }

  // Garantía hipotecaria
  if (product.id === 'p2') {
    groups.push({
      head: 'Garantía hipotecaria',
      docs: [
        { name: 'Partida registral vigente (SUNARP)', req: true },
        { name: 'Tasación vigente (no mayor a 6 meses)', req: true },
        { name: 'HR y PU del ejercicio vigente', req: true },
      ]
    });
  }

  // Garantía real/mobiliaria para MYPE > 50k
  if (product.id === 'p3' && amount >= 50000) {
    groups.push({
      head: 'Garantía — monto supera S/ 50,000',
      docs: [
        { name: 'Documento de bien ofrecido en garantía', req: true },
        { name: 'Tasación o valorización del bien', req: true },
      ]
    });
  }

  // Aval
  if (client.status === 'nuevo' && product.id !== 'p2') {
    groups.push({
      head: 'Aval',
      docs: [
        { name: 'DNI del aval y cónyuge (si corresponde)', req: true },
        { name: 'Sustento de ingresos del aval', req: true },
      ]
    });
  }

  // Documentos específicos del producto
  if (product.id === 'p3') {
    groups.push({
      head: 'Documentación empresarial',
      docs: [
        { name: 'RUC activo y ficha RUC actualizada', req: true },
        { name: 'Declaración anual SUNAT último ejercicio', req: true },
        { name: 'Estados financieros firmados por contador', req: true },
      ]
    });
  }

  // Seguros
  const segDocs = [{ name: 'Contratación de seguro de desgravamen', req: true, tag: 'dt-pre', tagLabel: 'Antes del desembolso' }];
  if (product.id === 'p2') segDocs.push({ name: 'Póliza de seguro del bien inmueble dado en garantía', req: true, tag: 'dt-pre', tagLabel: 'Antes del desembolso' });
  groups.push({ head: 'Seguros — antes del desembolso', docs: segDocs });

  // Destino del crédito
  const destDocs = [];
  if (product.id === 'p3') {
    destDocs.push({ name: 'Sustento de destino: proformas, contratos o cotizaciones', req: true });
  }
  if (amount >= 75000) {
    destDocs.push({ name: 'Declaración de origen y destino de fondos (PLAFT)', req: false, tag: 'dt-cond', tagLabel: `Monto ≥ S/ 75,000` });
  }
  if (destDocs.length) {
    groups.push({ head: 'Destino del crédito', docs: destDocs });
  }

  return groups;
}

// ── Render ────────────────────────────────────────────────────────────────────

const ratio    = getRatioCuota(product);
const garantia = getGarantia(product, amount);
const seguros  = getSeguros(product);
const aval     = getAval(client, product);
const destino  = getDestino(product);
const aprov    = getAprobador(product, amount);
const docGroups = getDocGroups(product, client, amount);

const badgeStatus = {
  nuevo:      'badge-new',
  recurrente: 'badge-recurrent',
  desertado:  'badge-deserter',
};

const condCards = [
  { label: 'Ratio cuota / ingreso', val: ratio.val,      sub: ratio.sub },
  { label: 'Garantía',              val: garantia.val,   sub: garantia.sub },
  { label: 'Seguros',               val: seguros.val,    sub: seguros.sub },
  { label: 'Aval',                  val: aval.val,       sub: aval.sub },
  { label: 'Destino del crédito',   val: destino.val,    sub: destino.sub },
];

document.getElementById('explain-content').innerHTML = `

  <!-- Contexto del caso -->
  <div class="ctx-bar">
    <div class="ctx-item">
      <span class="ctx-label">Cliente</span>
      <span class="ctx-val">${client.name}</span>
    </div>
    <div class="ctx-item">
      <span class="ctx-label">Producto</span>
      <span class="ctx-val">${product.name}</span>
    </div>
    <div class="ctx-item">
      <span class="ctx-label">Monto</span>
      <span class="ctx-val">S/ ${parseFloat(amount).toLocaleString()}</span>
    </div>
    <div class="ctx-item">
      <span class="ctx-label">Plazo</span>
      <span class="ctx-val">${term} meses</span>
    </div>
    <div class="ctx-item">
      <span class="ctx-label">Cuota ref.</span>
      <span class="ctx-val">S/ ${parseFloat(monthly).toLocaleString()}</span>
    </div>
    <div class="ctx-item">
      <span class="ctx-label">Tipo cliente</span>
      <span class="badge ${badgeStatus[client.status] || 'badge-new'}">${client.status}</span>
    </div>
  </div>

  <!-- Nivel de aprobación -->
  <div class="aprov-block">
    <div class="aprov-icon">🛡️</div>
    <div class="aprov-body">
      <div class="aprov-title">Nivel de aprobación requerido — S/ ${parseFloat(amount).toLocaleString()} · ${product.name}</div>
      <div class="aprov-chain">
        ${aprov.chain.map((step, i) => `
          ${i > 0 ? '<span class="aprov-sep">›</span>' : ''}
          <span class="aprov-step ${i === aprov.activeIdx ? 'active' : ''}">${step}</span>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- Condiciones aplicables -->
  <div class="section-title">Condiciones aplicables</div>
  <div class="cond-grid">
    ${condCards.map(c => `
      <div class="cond-card">
        <div class="cond-card-label">${c.label}</div>
        <div class="cond-card-val" style="${c.val.length > 8 ? 'font-size:var(--font-size-md)' : ''}">${c.val}</div>
        <div class="cond-card-sub">${c.sub}</div>
      </div>
    `).join('')}
  </div>

  <!-- Documentación pendiente -->
  <div class="section-title">Documentación pendiente</div>
  ${docGroups.map(g => `
    <div class="doc-block">
      <div class="doc-group-head">${g.head}</div>
      ${g.docs.map(d => `
        <div class="doc-row">
          <span class="doc-dot ${d.req ? 'dot-req' : 'dot-cond'}"></span>
          <span class="doc-name">${d.name}</span>
          <span class="doc-tag ${d.tag || (d.req ? 'dt-req' : 'dt-cond')}">${d.tagLabel || (d.req ? 'Obligatorio' : 'Si aplica')}</span>
        </div>
      `).join('')}
    </div>
  `).join('')}

  <!-- Acciones finales -->
  <div style="display:flex; gap:var(--space-md); margin-top:var(--space-xl); flex-wrap:wrap;">
    <a href="verify.html" class="btn btn-outline">← Volver a Verify</a>
    <button class="btn btn-primary" onclick="window.print()">🖨 Imprimir guía</button>
    <button class="btn btn-accent" onclick="State.clear(); window.location.href='dashboard.html'">✅ Finalizar operación</button>
  </div>
`;
