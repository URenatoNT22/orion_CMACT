// data.js — data mock del sistema ORION

const DATA = {

  // Clientes de prueba
  clients: [
    { dni: '12345678', name: 'Carlos Mendoza', type: 'DNI', status: 'recurrente', agency: 'trujillo-centro', creditScore: 720, income: 4500, debt: 800, age: 35 },
    { dni: '87654321', name: 'Ana Ríos Torres', type: 'DNI', status: 'nuevo',      agency: 'trujillo-norte', creditScore: 680, income: 3200, debt: 200, age: 28 },
    { dni: '11223344', name: 'Pedro Salas',     type: 'DNI', status: 'desertado',  agency: 'trujillo-sur',  creditScore: 520, income: 2100, debt: 1500, age: 42 },
    { dni: '99887766', name: 'Lucía Vargas',    type: 'CE',  status: 'nuevo',      agency: 'trujillo-centro', creditScore: 750, income: 6000, debt: 0, age: 31 },
  ],

  agencies: [
    { id: 'trujillo-centro', name: 'Trujillo Centro', advisor: 'Asesor Juan Pérez' },
    { id: 'trujillo-norte',  name: 'Trujillo Norte',  advisor: 'Asesor María López' },
    { id: 'trujillo-sur',    name: 'Trujillo Sur',    advisor: 'Asesor Roberto Castro' },
  ],

  // Reglas de ORION Check (precalificación)
  checkRules: [
    { id: 'score',  label: 'Score crediticio mínimo', check: (c) => c.creditScore >= 600, reason: 'Score por debajo del mínimo requerido (600)' },
    { id: 'age',    label: 'Edad entre 18 y 70 años', check: (c) => c.age >= 18 && c.age <= 70, reason: 'Edad fuera del rango permitido' },
    { id: 'debt',   label: 'Sin deuda morosa activa', check: (c) => c.debt < 1200, reason: 'Deuda morosa supera el límite permitido' },
  ],

  // Productos por tipo de crédito
  products: [
    {
      id: 'p1', name: 'Crédito Personal Express',
      creditTypes: ['Consumo'],
      minIncome: 1500, minScore: 600, maxDebt: 1000,
      maxAmount: 30000, terms: [12, 24, 36],
      requirements: ['DNI vigente', 'Boleta de pago últimos 3 meses', 'Recibo de servicios'],
      steps: ['Completar solicitud', 'Verificar identidad en agencia', 'Firma de contrato', 'Desembolso en 24h']
    },
    {
      id: 'p2', name: 'Crédito Hipotecario Mi Hogar',
      creditTypes: ['Hipotecario'],
      minIncome: 3000, minScore: 680, maxDebt: 500,
      maxAmount: 300000, terms: [60, 120, 180, 240],
      requirements: ['DNI vigente', 'Declaración de renta', 'Tasación del inmueble', 'Partida registral'],
      steps: ['Solicitud y documentación', 'Evaluación del inmueble', 'Aprobación crediticia', 'Firma en notaría', 'Desembolso']
    },
    {
      id: 'p3', name: 'Crédito MYPE Empresarial',
      creditTypes: ['Empresarial'],
      minIncome: 2500, minScore: 620, maxDebt: 800,
      maxAmount: 100000, terms: [12, 24, 36, 48],
      requirements: ['DNI del titular', 'RUC activo', 'Estados financieros', 'Declaración anual SUNAT'],
      steps: ['Registro de empresa', 'Evaluación financiera', 'Aprobación', 'Desembolso']
    },
    {
      id: 'p4', name: 'Línea de Consumo Flex',
      creditTypes: ['Consumo'],
      minIncome: 2000, minScore: 650, maxDebt: 600,
      maxAmount: 15000, terms: [6, 12, 18, 24],
      requirements: ['DNI vigente', 'Boleta de pago reciente'],
      steps: ['Solicitud online', 'Verificación', 'Activación de línea']
    },
  ],

  // Notificaciones mock para el asesor
  notifications: [
    { id: 1, clientName: 'Carlos Mendoza', dni: '12345678', creditType: 'Consumo', status: 'recurrente', time: 'hace 5 min', read: false, agency: 'Trujillo Centro' },
    { id: 2, clientName: 'Ana Ríos Torres', dni: '87654321', creditType: 'Hipotecario', status: 'nuevo', time: 'hace 20 min', read: false, agency: 'Trujillo Norte' },
    { id: 3, clientName: 'Lucía Vargas', dni: '99887766', creditType: 'Consumo', status: 'nuevo', time: 'hace 1h', read: true, agency: 'Trujillo Centro' },
  ]
};
