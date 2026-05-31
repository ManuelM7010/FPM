// FPM Application Type Definitions
export interface UserOnboarding {
  name: string;
  country: string;
  currency: string;             // Currency symbol or name (e.g., "$", "€", "MXN")
  salary: number;
  paymentFrequency: 'Mensual' | 'Quincenal' | 'Semanal';
  objectives: string[];
  savingsGoalPct: number;       // Percent saving goal, e.g. 20 (for 20%)
  desiredEmergencyFundMonths: number; // e.g. 6 months
}

export interface Transaction {
  id: string;
  date: string;                 // YYYY-MM-DD
  description: string;
  category: string;             // Alimentación, Vivienda, Transporte, Entretenimiento, Servicios, Deudas, etc.
  type: 'ingreso' | 'gasto';
  amount: number;
  account: string;
  comments?: string;
  isRecurring?: boolean;
  recurrenceType?: string;
}

export interface Installment {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  totalAmount: number;
  monthlyAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: string;
  paymentDay: number;           // 1 to 31
  cardAssociated: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'Diario' | 'Semanal' | 'Quincenal' | 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';
  startDate: string;
  endDate?: string;
  paymentDay: number;           // Day of month or specific rule
}

export interface CreditCard {
  id: string;
  name: string;
  closingDay: number;           // Día de corte (1 a 31)
  paymentDay: number;           // Día de pago (1 a 31)
  limit?: number;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: 'Fondo de Emergencia' | 'Viajes' | 'Vehículo' | 'Vivienda' | 'Jubilación' | 'Otros';
  targetDate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
