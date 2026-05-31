// FPM Application Initial Data
import { Transaction, Installment, RecurringExpense, Budget, FinancialGoal } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "2026-05-15",
    description: "Salario Principal S.A.",
    category: "Ingresos",
    type: "ingreso",
    amount: 3200,
    account: "Cuenta Corriente"
  },
  {
    id: "t2",
    date: "2026-05-16",
    description: "Alquiler Apartamento Verde",
    category: "Vivienda",
    type: "gasto",
    amount: 950,
    account: "Cuenta Corriente",
    isRecurring: true,
    recurrenceType: "Renta/Hipoteca"
  },
  {
    id: "t3",
    date: "2026-05-18",
    description: "Supermercado Carrefour",
    category: "Alimentación",
    type: "gasto",
    amount: 182.50,
    account: "Tarjeta Débito"
  },
  {
    id: "t4",
    date: "2026-05-19",
    description: "Suscripción Netflix Premium",
    category: "Suscripciones",
    type: "gasto",
    amount: 15.99,
    account: "Tarjeta de Crédito",
    isRecurring: true,
    recurrenceType: "Suscripción"
  },
  {
    id: "t5",
    date: "2026-05-20",
    description: "Suscripción Spotify Duo",
    category: "Suscripciones",
    type: "gasto",
    amount: 9.99,
    account: "Tarjeta de Crédito",
    isRecurring: true,
    recurrenceType: "Suscripción"
  },
  {
    id: "t6",
    date: "2026-05-22",
    description: "Membresía Gimnasio Smart",
    category: "Salud",
    type: "gasto",
    amount: 45.00,
    account: "Tarjeta de Crédito",
    isRecurring: true,
    recurrenceType: "Membresía"
  },
  {
    id: "t7",
    date: "2026-05-24",
    description: "Cuota Hp Laptop Workstation",
    category: "Deudas",
    type: "gasto",
    amount: 120.00,
    account: "Tarjeta de Crédito"
  },
  {
    id: "t8",
    date: "2026-05-25",
    description: "Restaurante Sushi Roll",
    category: "Alimentación",
    type: "gasto",
    amount: 65.40,
    account: "Tarjeta de Crédito"
  },
  {
    id: "t9",
    date: "2026-05-28",
    description: "Internet Hogar Fibra Movistar",
    category: "Servicios",
    type: "gasto",
    amount: 50.00,
    account: "Cuenta Corriente",
    isRecurring: true,
    recurrenceType: "Servicios Públicos"
  }
];

export const INITIAL_INSTALLMENTS: Installment[] = [
  {
    id: "ins1",
    name: "Laptop Workstation HP Z",
    category: "Tech / Equipamiento",
    purchaseDate: "2025-10-10",
    totalAmount: 1440,
    monthlyAmount: 120,
    totalInstallments: 12,
    paidInstallments: 8,
    startDate: "2025-11-05",
    paymentDay: 5,
    cardAssociated: "Tarjeta Oro Visa"
  },
  {
    id: "ins2",
    name: "Crédito Automóvil Volkswagen",
    category: "Transporte / Auto",
    purchaseDate: "2024-05-20",
    totalAmount: 21600,
    monthlyAmount: 450,
    totalInstallments: 48,
    paidInstallments: 24,
    startDate: "2024-06-05",
    paymentDay: 5,
    cardAssociated: "Cargo Directo Banco"
  }
];

export const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: "rec1",
    name: "Arriendo Apartamento",
    category: "Vivienda",
    amount: 950,
    frequency: "Mensual",
    startDate: "2025-01-01",
    paymentDay: 1
  },
  {
    id: "rec2",
    name: "Netflix Premium",
    category: "Suscripciones",
    amount: 15.99,
    frequency: "Mensual",
    startDate: "2025-01-12",
    paymentDay: 12
  },
  {
    id: "rec3",
    name: "Movistar Fibra Intenet",
    category: "Servicios",
    amount: 50,
    frequency: "Mensual",
    startDate: "2025-01-15",
    paymentDay: 15
  },
  {
    id: "rec4",
    name: "Seguro Médico Sura",
    category: "Salud",
    amount: 110,
    frequency: "Mensual",
    startDate: "2025-01-28",
    paymentDay: 28
  }
];

export const DEFAULT_BUDGETS: Budget[] = [
  { category: "Alimentación", limit: 400 },
  { category: "Vivienda", limit: 1000 },
  { category: "Transporte", limit: 200 },
  { category: "Suscripciones", limit: 60 },
  { category: "Servicios", limit: 250 },
  { category: "Salud", limit: 150 },
  { category: "Deudas", limit: 600 },
  { category: "Otros", limit: 300 }
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: "g1",
    name: "Viaje a Japón 2027",
    targetAmount: 5000,
    currentAmount: 3600,
    category: "Viajes",
    targetDate: "2027-04-10"
  },
  {
    id: "g2",
    name: "Inversión S&P 500 ETF",
    targetAmount: 10000,
    currentAmount: 4500,
    category: "Jubilación",
    targetDate: "2028-12-31"
  }
];
