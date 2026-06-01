// FPM Financial Planner Main Application Core
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Zap,
  BarChart3,
  Settings,
  MessageSquare,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  Lightbulb,
  Layers,
  PieChart as PieIcon,
  LogOut,
  RefreshCw,
  FileText,
  HeartHandshake,
  ArrowRight,
  Info,
  CalendarDays,
  Briefcase,
  X,
  Send,
  HelpCircle,
  TrendingUp as TrendUpIcon,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import * as XLSX from 'xlsx';

import {
  UserOnboarding,
  Transaction,
  Installment,
  RecurringExpense,
  Budget,
  FinancialGoal,
  ChatMessage
} from './types';

import {
  INITIAL_TRANSACTIONS,
  INITIAL_INSTALLMENTS,
  INITIAL_RECURRING_EXPENSES,
  DEFAULT_BUDGETS,
  INITIAL_GOALS
} from './initial-data';

export default function App() {
  // Onboarding & user configurations state
  const [user, setUser] = useState<UserOnboarding | null>(() => {
    const saved = localStorage.getItem('fpm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<number>(0);

  // Core entity states
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fpm_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [installments, setInstallments] = useState<Installment[]>(() => {
    const saved = localStorage.getItem('fpm_installments');
    return saved ? JSON.parse(saved) : INITIAL_INSTALLMENTS;
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem('fpm_recurring');
    return saved ? JSON.parse(saved) : INITIAL_RECURRING_EXPENSES;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('fpm_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('fpm_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // Assistant & Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('fpm_chat');
    return saved ? JSON.parse(saved) : [
      {
        id: "msg-welcome",
        sender: "ai",
        text: "Hola, soy tu asistente financiero cognitive FPM. Conozco el estado de tu cuenta e historial. ¿Te gustaría que analicemos algún patrón en tus gastos, simulemos un escenario como comprar un vehículo, o calculemos tu flujo de caja proyectado para los próximos meses?",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Financial narrative statement
  const [narrativeText, setNarrativeText] = useState<string>(() => {
    return localStorage.getItem('fpm_narrative') || "";
  });
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);

  // Manual mapping states (CSV upload)
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRawData, setCsvRawData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    description: '',
    amount: '',
    montoGasto: '',
    montoIngreso: '',
    comments: '',
    category: '',
    type: ''
  });
  const [transactionsToApprove, setTransactionsToApprove] = useState<any[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);

  // Dynamic customization states (Multiple Cards, Categories, Month pointer, Scenarios editing)
  const [creditCards, setCreditCards] = useState<any[]>(() => {
    const saved = localStorage.getItem('fpm_credit_cards');
    return saved ? JSON.parse(saved) : [
      { id: 'cc-1', name: 'Visa Oro', closingDay: 15, paymentDay: 5, limit: 3000 },
      { id: 'cc-2', name: 'Mastercard Black', closingDay: 20, paymentDay: 10, limit: 5000 }
    ];
  });

  const [bankAccounts, setBankAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('fpm_bank_accounts');
    return saved ? JSON.parse(saved) : [
      { id: 'ba-1', name: 'Cuenta Corriente', balance: 4500 },
      { id: 'ba-2', name: 'Ahorros Coope', balance: 1200 }
    ];
  });

  const [newBankAccount, setNewBankAccount] = useState({
    name: '',
    balance: ''
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('fpm_categories');
    return saved ? JSON.parse(saved) : ['Alimentación', 'Vivienda', 'Transporte', 'Suscripciones', 'Servicios', 'Otros', 'Ingresos', 'Educación', 'Salud', 'Deudas'];
  });

  // Default date default viewport set to May 2026 as per user requirement
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5);

  const [editingBudgetCategory, setEditingBudgetCategory] = useState<string | null>(null);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editingTxData, setEditingTxData] = useState<any>(null);

  const [newCard, setNewCard] = useState({
    name: '',
    closingDay: '15',
    paymentDay: '5',
    limit: '3000'
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [filterByMonthEnv, setFilterByMonthEnv] = useState(true);

  // States for bank accounts editing
  const [editingBankAccountId, setEditingBankAccountId] = useState<string | null>(null);
  const [editingBankAccountData, setEditingBankAccountData] = useState<any>(null);

  // States for credit cards editing
  const [editingCreditCardId, setEditingCreditCardId] = useState<string | null>(null);
  const [editingCreditCardData, setEditingCreditCardData] = useState<any>(null);

  // States for categories editing
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editingCategoryNewValue, setEditingCategoryNewValue] = useState<string>("");

  // Manual creation states
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Alimentación',
    type: 'gasto',
    amount: '',
    account: 'Cuenta Corriente',
    comments: ''
  });

  const [newInstallment, setNewInstallment] = useState({
    name: '',
    category: 'Entretenimiento',
    purchaseDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    monthlyAmount: '',
    totalInstallments: '',
    paidInstallments: '0',
    paymentDay: '5',
    cardAssociated: 'Tarjeta Principal'
  });

  const [newRecurring, setNewRecurring] = useState({
    name: '',
    category: 'Servicios',
    amount: '',
    frequency: 'Mensual',
    startDate: new Date().toISOString().split('T')[0],
    paymentDay: '1'
  });

  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    category: 'Fondo de Emergencia',
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  // Simulator Scenario states
  const [simulatorScenarioId, setSimulatorScenarioId] = useState<'base' | 'optimistic' | 'pessimistic'>('base');
  const [customSimulatorInput, setCustomSimulatorInput] = useState("");
  const [simulatorResponse, setSimulatorResponse] = useState("");
  const [isSimulatorLoading, setIsSimulatorLoading] = useState(false);

  // Persistent storage synchronizer
  useEffect(() => {
    localStorage.setItem('fpm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fpm_installments', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem('fpm_recurring', JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  useEffect(() => {
    localStorage.setItem('fpm_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('fpm_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fpm_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fpm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fpm_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fpm_credit_cards', JSON.stringify(creditCards));
  }, [creditCards]);

  useEffect(() => {
    localStorage.setItem('fpm_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('fpm_categories', JSON.stringify(categories));
  }, [categories]);

  // Onboarding submit handler
  const handleOnboardingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('userName') as string || 'Usuario';
    const country = formData.get('country') as string || 'México';
    const currency = formData.get('currency') as string || '$';
    const salary = parseFloat(formData.get('salary') as string) || 3000;
    const paymentFrequency = formData.get('paymentFrequency') as any || 'Mensual';
    const savingsGoalPct = parseFloat(formData.get('savingsGoalPct') as string) || 20;
    const desiredEmergencyFundMonths = parseFloat(formData.get('desiredEmergencyFundMonths') as string) || 6;

    const partialObjectives: string[] = [];
    if (formData.get('obj_emergency')) partialObjectives.push('Blindar fondo de emergencia');
    if (formData.get('obj_debt')) partialObjectives.push('Eliminar deudas gravosas');
    if (formData.get('obj_invest')) partialObjectives.push('Invertir para jubilación');
    if (formData.get('obj_travel')) partialObjectives.push('Ahorrar para ocio y viajes');

    const newUser: UserOnboarding = {
      name,
      country,
      currency,
      salary,
      paymentFrequency,
      objectives: partialObjectives.length ? partialObjectives : ['Optimizar gastos fijos'],
      savingsGoalPct,
      desiredEmergencyFundMonths
    };

    setUser(newUser);

    // Bootstrap an automatic emergency fund goal based on salary and multiplier
    const emergencyTarget = (salary * desiredEmergencyFundMonths) * 0.75; // 75% of salary represents basic expenses
    const autoEmergencyGoal: FinancialGoal = {
      id: "goal_auto_emergency",
      name: "Fondo Emergencia de Seguridad",
      targetAmount: emergencyTarget,
      currentAmount: (salary * 0.5) || 1500, // starting seed
      category: "Fondo de Emergencia",
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 10)).toISOString().split('T')[0]
    };

    // Update goals state
    setGoals(prev => {
      if (prev.some(g => g.id === "goal_auto_emergency")) return prev;
      return [...prev, autoEmergencyGoal];
    });

    setNarrativeText("");
  };

  // Handles updating existing settings without wiping other states
  const handleUpdateUserSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('userName') as string || user.name;
    const country = formData.get('country') as string || user.country;
    const currency = formData.get('currency') as string || user.currency;
    const salary = parseFloat(formData.get('salary') as string) || user.salary;
    const paymentFrequency = formData.get('paymentFrequency') as any || user.paymentFrequency;
    const savingsGoalPct = parseFloat(formData.get('savingsGoalPct') as string) || user.savingsGoalPct;
    const desiredEmergencyFundMonths = parseFloat(formData.get('desiredEmergencyFundMonths') as string) || user.desiredEmergencyFundMonths;

    setUser({
      name,
      country,
      currency,
      salary,
      paymentFrequency,
      objectives: user.objectives,
      savingsGoalPct,
      desiredEmergencyFundMonths
    });
    alert("¡Configuración del perfil financiero guardada exitosamente!");
  };

  // Restores standard starter profile
  const handleResetProfile = () => {
    if (window.confirm("¿Seguro que deseas reiniciar tu perfil financiero? Se perderán las modificaciones locales.")) {
      localStorage.clear();
      setUser(null);
      setTransactions(INITIAL_TRANSACTIONS);
      setInstallments(INITIAL_INSTALLMENTS);
      setRecurringExpenses(INITIAL_RECURRING_EXPENSES);
      setBudgets(DEFAULT_BUDGETS);
      setGoals(INITIAL_GOALS);
      setChatMessages([
        {
          id: "msg-welcome",
          sender: "ai",
          text: "Hola, soy tu asistente financiero cognitive FPM. Conozco el estado de tu cuenta e historial. ¿Te gustaría que analicemos algún patrón en tus gastos, simulemos un escenario como comprar un vehículo, o calculemos tu flujo de caja proyectado para los próximos meses?",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setNarrativeText("");
      setActiveTab(0);
    }
  };

  // Financial Metrics Computations
  const computedMetrics = useMemo(() => {
    if (!user) return {
      totalIncomeMonth: 0,
      totalExpenseMonth: 0,
      availableBalance: 0,
      savingsRate: 0,
      monthlySavings: 0,
      emergencyFundTotal: 0,
      emergencyDays: 0,
      assets: 0,
      passives: 0,
      netWorth: 0,
      debtLeverage: 0,
      cardBills: {} as Record<string, number>
    };

    const monthString = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const monthTx = transactions.filter(t => t.date.startsWith(monthString));
    const monthIncomes = monthTx.filter(t => t.type === 'ingreso');
    const monthExpenses = monthTx.filter(t => t.type === 'gasto');

    // Sum manual incomes / expenses added for selected month
    let totalIncomeMonth = monthIncomes.reduce((sum, t) => sum + t.amount, 0);
    let totalExpenseMonth = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

    // If no manual income is added, baseline user.salary as base income (projected)
    if (totalIncomeMonth === 0) {
      totalIncomeMonth = user.salary;
    }

    // Include projected recurring expenses that are not recorded yet in actual transactions of this month
    recurringExpenses.forEach(rec => {
      // Check if starting date is on or before selected month
      const recDate = new Date(rec.startDate);
      const recYear = recDate.getFullYear();
      const recMonth = recDate.getMonth() + 1;
      
      const elapsed = (currentYear - recYear) * 12 + (currentMonth - recMonth);
      if (elapsed >= 0) {
        const alreadyRegistered = monthTx.some(t => 
          t.type === 'gasto' && 
          (t.description.toLowerCase().includes(rec.name.toLowerCase()) || t.category === rec.category)
        );
        if (!alreadyRegistered) {
          totalExpenseMonth += rec.amount;
        }
      }
    });

    // Include projected active installments for this month
    installments.forEach(ins => {
      const parts = ins.startDate.split('-');
      const startYear = parseInt(parts[0], 10);
      const startMonth = parseInt(parts[1], 10);
      
      const elapsed = (currentYear - startYear) * 12 + (currentMonth - startMonth);
      if (elapsed >= 0 && elapsed < ins.totalInstallments) {
        // Only count if paidInstallments doesn't exceed total
        if (ins.paidInstallments < ins.totalInstallments) {
          totalExpenseMonth += ins.monthlyAmount;
        }
      }
    });

    // Calculate Credit Card estimated bill due in selected month
    const cardBills: Record<string, number> = {};
    creditCards.forEach(card => {
      // payment in month M
      let closingYear = currentYear;
      let closingMonth = currentMonth;
      
      if (card.paymentDay <= card.closingDay) {
        // statement closed in previous month
        closingMonth = currentMonth - 1;
        if (closingMonth === 0) {
          closingMonth = 12;
          closingYear = currentYear - 1;
        }
      }
      
      const endDStr = `${closingYear}-${String(closingMonth).padStart(2, '0')}-${String(card.closingDay).padStart(2, '0')}`;
      
      let startYear = closingYear;
      let startMonth = closingMonth - 1;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = closingYear - 1;
      }
      const startDStr = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(Math.min(28, card.closingDay + 1)).padStart(2, '0')}`;
      
      const cardExpenses = transactions.filter(t => {
        if (t.type !== 'gasto') return false;
        const accountLower = (t.account || '').toLowerCase();
        const cardNameLower = card.name.toLowerCase();
        
        const isMatch = accountLower === cardNameLower || 
                        accountLower === `tarjeta - ${cardNameLower}` || 
                        accountLower === `tarjeta ${cardNameLower}` || 
                        accountLower.includes(cardNameLower) ||
                        (cardNameLower.includes('visa') && accountLower.includes('visa')) ||
                        (cardNameLower.includes('mastercard') && accountLower.includes('mastercard')) ||
                        (cardNameLower.includes('oro') && accountLower.includes('oro'));
        if (!isMatch) return false;
        return t.date >= startDStr && t.date <= endDStr;
      });
      
      const totalSpent = cardExpenses.reduce((sum, t) => sum + t.amount, 0);
      cardBills[card.id] = totalSpent;
      
      // Add estimated credit card bill to total projected month expenditures
      totalExpenseMonth += totalSpent;
    });

    const monthlySavings = Math.max(0, totalIncomeMonth - totalExpenseMonth);
    const savingsRate = totalIncomeMonth > 0 ? (monthlySavings / totalIncomeMonth) * 100 : 0;

    // Assets = cash in banks + user investments
    const bankCashSum = bankAccounts.reduce((sum, ba) => sum + ba.balance, 0);
    const goalInvestmentsSum = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const assetsVal = bankCashSum + goalInvestmentsSum;

    // Passives = outstanding debt & installments
    let passivesVal = 0;
    installments.forEach(i => {
      const remainingInstallments = i.totalInstallments - i.paidInstallments;
      passivesVal += remainingInstallments * i.monthlyAmount;
    });

    const netWorth = Math.max(0, assetsVal - passivesVal);

    // Emergency fund totals tracked under Goals
    const emergencyFundObj = goals.find(g => g.category === 'Fondo de Emergencia');
    const emergencyFundTotal = emergencyFundObj ? emergencyFundObj.currentAmount : (user.salary * 1.5);
    
    // Average daily expense
    const dailyExpense = Math.max(1, totalExpenseMonth / 30);
    const emergencyDays = Math.round(emergencyFundTotal / dailyExpense);

    // Debt leverage ratio
    const debtLeverage = assetsVal > 0 ? (passivesVal / assetsVal) * 100 : 0;

    return {
      totalIncomeMonth,
      totalExpenseMonth,
      availableBalance: Math.max(0, totalIncomeMonth - totalExpenseMonth),
      savingsRate,
      monthlySavings,
      emergencyFundTotal,
      emergencyDays,
      assets: assetsVal,
      passives: passivesVal,
      netWorth,
      debtLeverage,
      cardBills,
      bankCashSum,
      goalInvestmentsSum
    };
  }, [user, transactions, installments, recurringExpenses, goals, creditCards, currentYear, currentMonth]);

  // Dynamic payment and statement calculation calendar for Credit Cards (TDC)
  const ccPlan = useMemo(() => {
    if (!user) return {} as Record<string, any>;
    const plans: Record<string, {
      cardId: string;
      cardName: string;
      totalActiveBalance: number;
      payments: Array<{
        monthLabel: string;
        dueDate: string;
        cutDate: string;
        amount: number;
        details: string[];
      }>
    }> = {};

    creditCards.forEach(card => {
      // Collect all transactions made with this card
      const cardTxs = transactions.filter(t => {
        if (t.type !== 'gasto') return false;
        const accountLower = (t.account || '').toLowerCase();
        const cardNameLower = card.name.toLowerCase();
        const isMatch = accountLower === cardNameLower || 
                        accountLower.includes(cardNameLower) ||
                        (card.id === 'cc-1' && (accountLower === 'tarjeta de crédito' || accountLower === 'tarjeta crã©dito' || accountLower === 'tarjeta de credito'));
        return isMatch;
      });

      // Sum total outstanding balance on this card
      const totalActiveBalance = cardTxs.reduce((sum, t) => sum + t.amount, 0);

      const cyclePayments: Record<string, {
        dueDate: string;
        cutDate: string;
        amount: number;
        txs: string[];
      }> = {};

      cardTxs.forEach(tx => {
        const parts = tx.date.split('-');
        const txYear = parseInt(parts[0], 10);
        const txMonth = parseInt(parts[1], 10);
        const txDay = parseInt(parts[2], 10);

        let cycleYear = txYear;
        let cycleMonth = txMonth;

        // If purchase day exceeds closingDay, it rolls to next billing cycle month
        if (txDay > card.closingDay) {
          cycleMonth += 1;
          if (cycleMonth > 12) {
            cycleMonth = 1;
            cycleYear += 1;
          }
        }

        const cutDate = `${cycleYear}-${String(cycleMonth).padStart(2, '0')}-${String(Math.min(28, card.closingDay)).padStart(2, '0')}`;

        // Payment is target month
        let paymentMonth = cycleMonth;
        let paymentYear = cycleYear;
        if (card.paymentDay <= card.closingDay) {
          paymentMonth += 1;
          if (paymentMonth > 12) {
            paymentMonth = 1;
            paymentYear += 1;
          }
        }

        const dueDate = `${paymentYear}-${String(paymentMonth).padStart(2, '0')}-${String(Math.min(28, card.paymentDay)).padStart(2, '0')}`;
        const groupKey = `${paymentYear}-${String(paymentMonth).padStart(2, '0')}`;

        if (!cyclePayments[groupKey]) {
          cyclePayments[groupKey] = {
            dueDate,
            cutDate,
            amount: 0,
            txs: []
          };
        }
        cyclePayments[groupKey].amount += tx.amount;
        cyclePayments[groupKey].txs.push(`${tx.date}: ${tx.description} (${user.currency}${tx.amount.toLocaleString()})`);
      });

      const paymentsList = Object.keys(cyclePayments).map(k => {
        const parts = k.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const mNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return {
          monthLabel: `${mNames[m - 1]} ${y}`,
          dueDate: cyclePayments[k].dueDate,
          cutDate: cyclePayments[k].cutDate,
          amount: cyclePayments[k].amount,
          details: cyclePayments[k].txs
        };
      }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

      plans[card.id] = {
        cardId: card.id,
        cardName: card.name,
        totalActiveBalance,
        payments: paymentsList
      };
    });

    return plans;
  }, [creditCards, transactions, user]);

  // Forecast state generator for 3, 6, 12, 24 months
  const forecastData = useMemo(() => {
    if (!user) return [];
    
    const periods = [
      { name: 'Actual', months: 0 },
      { name: '3 Meses', months: 3 },
      { name: '6 Meses', months: 6 },
      { name: '12 Meses', months: 12 },
      { name: '24 Meses', months: 24 }
    ];

    return periods.map(p => {
      // Base scenario projection multipliers
      const monthlyBaseGain = computedMetrics.monthlySavings;
      const basePatrimoine = computedMetrics.netWorth + (monthlyBaseGain * p.months);

      // Optimistic scenario (+10% salary, -15% expenses)
      const optMonthlySavings = (computedMetrics.totalIncomeMonth * 1.10) - (computedMetrics.totalExpenseMonth * 0.85);
      const optimisticPatrimoine = computedMetrics.netWorth + (optMonthlySavings * p.months);

      // Pessimistic scenario (-15% salary, +15% expenses)
      const pesMonthlySavings = Math.max(0, (computedMetrics.totalIncomeMonth * 0.85) - (computedMetrics.totalExpenseMonth * 1.15));
      const pessimisticPatrimoine = computedMetrics.netWorth + (pesMonthlySavings * p.months);

      return {
        name: p.name,
        Base: Math.round(basePatrimoine),
        Optimista: Math.round(optimisticPatrimoine),
        Pesimista: Math.round(pessimisticPatrimoine)
      };
    });
  }, [user, computedMetrics]);

  // Daily projection data for the selected month to show interactive day-by-day cashflow
  const monthlyDailyData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const data = [];
    
    // Gather actual recorded transactions for this month
    const monthString = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const actualTx = transactions.filter(t => t.date.startsWith(monthString));
    
    // Create lists of projected items
    const projectedTx: Array<{ date: string; amount: number; type: 'ingreso' | 'gasto'; description: string }> = [];
    
    // Projected recurring expenses
    recurringExpenses.forEach(rec => {
      const recDate = new Date(rec.startDate);
      const recYear = recDate.getFullYear();
      const recMonth = recDate.getMonth() + 1;
      const elapsed = (currentYear - recYear) * 12 + (currentMonth - recMonth);
      if (elapsed >= 0) {
        const alreadyRegistered = actualTx.some(t => 
          t.type === 'gasto' && 
          (t.description.toLowerCase().includes(rec.name.toLowerCase()) || t.category === rec.category)
        );
        if (!alreadyRegistered) {
          projectedTx.push({
            date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.min(daysInMonth, rec.paymentDay)).padStart(2, '0')}`,
            amount: rec.amount,
            type: 'gasto',
            description: `[Proyectado] ${rec.name}`
          });
        }
      }
    });

    // Projected installments
    installments.forEach(ins => {
      const parts = ins.startDate.split('-');
      const startYear = parseInt(parts[0], 10);
      const startMonth = parseInt(parts[1], 10);
      const elapsed = (currentYear - startYear) * 12 + (currentMonth - startMonth);
      if (elapsed >= 0 && elapsed < ins.totalInstallments && ins.paidInstallments < ins.totalInstallments) {
        projectedTx.push({
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.min(daysInMonth, ins.paymentDay)).padStart(2, '0')}`,
          amount: ins.monthlyAmount,
          type: 'gasto',
          description: `[Cuota Proyectada] ${ins.name}`
        });
      }
    });

    // Projected Credit Card bill payments
    creditCards.forEach(card => {
      const billAmount = computedMetrics.cardBills[card.id] || 0;
      if (billAmount > 0) {
        projectedTx.push({
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.min(daysInMonth, card.paymentDay)).padStart(2, '0')}`,
          amount: billAmount,
          type: 'gasto',
          description: `[Trjta Pago Est.] ${card.name}`
        });
      }
    });

    // Combine actual & projected
    const allItems = [
      ...actualTx.map(t => ({ date: t.date, amount: t.amount, type: t.type as 'ingreso' | 'gasto', description: t.description })),
      ...projectedTx
    ];

    let runningAccumPrice = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayItems = allItems.filter(item => item.date === dayStr);
      
      const dayIncomes = dayItems.filter(item => item.type === 'ingreso').reduce((s, x) => s + x.amount, 0);
      const dayExpenses = dayItems.filter(item => item.type === 'gasto').reduce((s, x) => s + x.amount, 0);
      
      runningAccumPrice += (dayIncomes - dayExpenses);
      
      data.push({
        day: `Día ${d}`,
        Ingresos: dayIncomes,
        Gastos: dayExpenses,
        Flujo_Neto: runningAccumPrice
      });
    }

    return data;
  }, [currentYear, currentMonth, transactions, recurringExpenses, installments, creditCards, computedMetrics.cardBills]);

  // Excel & CSV Processing functions
  const handleCsvFileDropped = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleCsvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processCsvFile(e.target.files[0]);
    }
  };

  const processCsvFile = (file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (parsedData.length > 0) {
        setCsvRawData(parsedData);
        // Extract headers
        const headers = Object.keys(parsedData[0]);
        setCsvHeaders(headers);

        // Preseed mapping guess supporting separate Gasto and Ingreso columns
        const mapped = { date: '', description: '', amount: '', montoGasto: '', montoIngreso: '', comments: '', category: '', type: '' };
        
        headers.forEach(h => {
          const l = h.toLowerCase();
          if (l.includes('fech') || l.includes('date')) mapped.date = h;
          if (l.includes('desc') || l.includes('movim') || l.includes('detalle') || l.includes('concep') || l.includes('movimiento')) mapped.description = h;
          if (l.includes('monto gasto') || l.includes('gasto') || l.includes('gasto monto') || (l.includes('mont') && l.includes('gast'))) mapped.montoGasto = h;
          if (l.includes('monto ingreso') || l.includes('ingreso') || l.includes('ingreso monto') || (l.includes('mont') && l.includes('ingr'))) mapped.montoIngreso = h;
          if (l.includes('comentario') || l.includes('coment') || l.includes('comentarios')) mapped.comments = h;
          if (l === 'valor' || l === 'monto' || l === 'amount' || l === 'valor') mapped.amount = h;
          if (l.includes('categ')) mapped.category = h;
          if (l.includes('tipo') || l.includes('flow') || l.includes('cuenta')) mapped.type = h;
        });

        setColumnMapping(mapped);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Step 2 of CSV import: Map Columns and Fetch AI Auto-categorization
  const handleRunAiClassification = async () => {
    if (csvRawData.length === 0) return;
    setIsClassifying(true);

    // Map rows into raw transactions
    const mappedTransactions = csvRawData.map((row, idx) => {
      let crudeAmount = 0;
      let crudeType = 'gasto';

      // Verify if separate Gasto and Ingreso columns are mapped and present
      if (columnMapping.montoGasto && row[columnMapping.montoGasto] !== undefined && row[columnMapping.montoGasto] !== "") {
        const valGasto = parseFloat(row[columnMapping.montoGasto].toString().replace(/[^\d.-]/g, '')) || 0;
        if (valGasto > 0) {
          crudeAmount = valGasto;
          crudeType = 'gasto';
        }
      }
      
      if (columnMapping.montoIngreso && row[columnMapping.montoIngreso] !== undefined && row[columnMapping.montoIngreso] !== "") {
        const valIngreso = parseFloat(row[columnMapping.montoIngreso].toString().replace(/[^\d.-]/g, '')) || 0;
        if (valIngreso > 0) {
          crudeAmount = valIngreso;
          crudeType = 'ingreso';
        }
      }

      // Single amount fallback
      if (crudeAmount === 0 && columnMapping.amount && row[columnMapping.amount] !== undefined) {
        crudeAmount = parseFloat(row[columnMapping.amount].toString().replace(/[^\d.-]/g, '')) || 0;
        crudeType = crudeAmount > 0 ? 'ingreso' : 'gasto';
        crudeAmount = Math.abs(crudeAmount);
      }

      // Extract account / card type
      let accountVal = 'Efectivo';
      if (columnMapping.type && row[columnMapping.type]) {
        const typeStr = row[columnMapping.type].toString();
        const typeStrLower = typeStr.toLowerCase();
        if (typeStrLower.includes('tarj') || typeStrLower.includes('cred') || typeStrLower.includes('credit')) {
          accountVal = 'Tarjeta de Crédito';
          // Try to match against the dynamic credit cards
          const matchedCard = creditCards.find(c => typeStrLower.includes(c.name.toLowerCase()));
          if (matchedCard) {
            accountVal = matchedCard.name;
          } else if (creditCards.length > 0) {
            accountVal = creditCards[0].name;
          }
        } else if (typeStrLower.includes('tran') || typeStrLower.includes('banc') || typeStrLower.includes('banco') || typeStrLower.includes('transf')) {
          accountVal = 'Transferencia';
        } else {
          accountVal = typeStr;
        }
      }

      // Comments mapping
      const commentsVal = (columnMapping.comments && row[columnMapping.comments]) ? row[columnMapping.comments].toString() : 'Importado de Excel';

      return {
        id: `csv-${idx}-${Date.now().toString().slice(-4)}`,
        date: row[columnMapping.date] || new Date().toISOString().split('T')[0],
        description: row[columnMapping.description] || 'Sin descripción',
        amount: crudeAmount,
        category: row[columnMapping.category] || 'Otros',
        type: crudeType,
        account: accountVal,
        comments: commentsVal
      };
    }).slice(0, 45); // Support up to 45 items in preview limit

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactions: mappedTransactions })
      });

      if (response.ok) {
        const classified = await response.json();
        setTransactionsToApprove(classified);
      } else {
        // Local heuristic fallback
        const mockResponse = mappedTransactions.map(t => {
          const desc = t.description.toLowerCase();
          let cat = 'Otros';
          let isRecVal = false;
          let recValType = '';

          if (desc.includes('netflix') || desc.includes('spotify')) {
            cat = 'Suscripciones';
            isRecVal = true;
            recValType = 'Suscripción';
          }
          if (desc.includes('carrefour') || desc.includes('restauran')) {
            cat = 'Alimentación';
          }
          if (desc.includes('rent') || desc.includes('arriend')) {
            cat = 'Vivienda';
            isRecVal = true;
            recValType = 'Renta';
          }

          return {
            ...t,
            category: cat,
            isRecurring: isRecVal,
            recurrenceType: recValType
          };
        });
        setTransactionsToApprove(mockResponse);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleApproveAllTransactions = () => {
    if (transactionsToApprove.length === 0) return;
    setTransactions(prev => [...transactionsToApprove, ...prev]);

    // Also detect recurrings during approval to recommend adding to scheduled list!
    const newlyDetectedRecurrings = transactionsToApprove.filter(t => t.isRecurring);
    if (newlyDetectedRecurrings.length > 0) {
      newlyDetectedRecurrings.forEach(item => {
        setRecurringExpenses(prev => {
          if (prev.some(r => r.name.toLowerCase() === item.description.toLowerCase())) return prev;
          return [...prev, {
            id: `rec-auto-${Math.random().toString().slice(-4)}`,
            name: item.description,
            category: item.category,
            amount: item.amount,
            frequency: 'Mensual',
            startDate: item.date,
            paymentDay: parseInt(item.date.split('-')[2]) || 15
          }];
        });
      });
      alert(`¡Se importaron ${transactionsToApprove.length} movimientos en la cuenta! Se detectaron y programaron automáticamente ${newlyDetectedRecurrings.length} gastos recurrentes.`);
    } else {
      alert(`¡Se importaron exitosamente ${transactionsToApprove.length} transacciones!`);
    }

    // Reset CSV import states
    setCsvFile(null);
    setCsvRawData([]);
    setTransactionsToApprove([]);
  };

  // Narrative generation call to AI
  const handleGenerateNarrative = async () => {
    setIsNarrativeLoading(true);
    try {
      const analysisPayload = {
        monthlyIncome: computedMetrics.totalIncomeMonth,
        monthlyExpenses: computedMetrics.totalExpenseMonth,
        savingsRate: computedMetrics.savingsRate.toFixed(1),
        netWorth: computedMetrics.netWorth,
        debtLeverage: computedMetrics.debtLeverage.toFixed(1),
        emergencyDays: computedMetrics.emergencyDays,
        historyCount: transactions.length,
        installmentsCount: installments.length,
        recurringCount: recurringExpenses.length,
        goalsCount: goals.length,
        userObjectives: user?.objectives
      };

      const response = await fetch('/api/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: analysisPayload })
      });

      if (response.ok) {
        const json = await response.json();
        setNarrativeText(json.narrative);
        localStorage.setItem('fpm_narrative', json.narrative);
      } else {
        throw new Error();
      }
    } catch {
      // Local premium template markdown
      const failSafe = `### 📊 Historia y Reporte de Salud Financiera (Local Mode)

**Bajo Análisis: Historial de Comportamiento e Inteligencia Financiera**

Hemos analizado tu perfil financiero inicial y tus registros. Actualmente muestras ingresos promedio mensuales de **$${computedMetrics.totalIncomeMonth.toLocaleString()}** contra gastos de **$${computedMetrics.totalExpenseMonth.toLocaleString()}**, lo que representa una **Tasa de Ahorro del ${computedMetrics.savingsRate.toFixed(1)}%**.

*   **Puntos Clave Detectados:**
    *   Tu **Fondo de Emergencia** recomendado de **$${(computedMetrics.totalExpenseMonth * 6).toLocaleString()}** (meta de 6 meses) requerirá disciplina. Con tu ritmo actual de ahorro de **$${computedMetrics.monthlySavings.toLocaleString()}**, te tomará aproximadamente **${Math.ceil((computedMetrics.totalExpenseMonth * 6) / Math.max(1, computedMetrics.monthlySavings))} meses** completarlo.
    *   Posees compromisos financieros activos que imponen un peso importante mensual. La reducción de estas tasas y el plan de amortización acelerada te liberará flujo de caja.
    *   Se observan patrones recurrentes concentrados en Vivienda y Alimentación.

*   **Próximos Pasos Recomendados:**
    *   Considera disminuir un **10%** los gastos discrecionales en categorías no prioritarias para aumentar tu patrimonio en un **12%** anual.
    *   Aprovecha las compras en cuotas únicamente bajo tasas de interés cero.`;
      setNarrativeText(failSafe);
    } finally {
      setIsNarrativeLoading(false);
    }
  };

  // Interactive sandbox simulator questions
  const runSimulationScenario = async (question: string) => {
    setIsSimulatorLoading(true);
    setSimulatorResponse("");

    const statePayload = {
      user,
      metrics: computedMetrics,
      transactionsCount: transactions.length,
      installments,
      recurringExpenses,
      goals
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `SIMULA ESTE ESCENARIO FINANCIERO Y HAZ LOS CALCULOS EXACTOS. DEBE QUEDAR EN ESPAÑOL CLARO Y ACCIONABLE: "${question}"`,
          history: [],
          financialState: statePayload
        })
      });

      if (response.ok) {
        const json = await response.json();
        setSimulatorResponse(json.response);
      } else {
        throw new Error();
      }
    } catch {
      // Heuristic responses for Simulator
      let backupReply = "";
      if (question.includes("Netflix")) {
        const annualSave = 15.99 * 12;
        backupReply = `### Simulación: Cancelar Suscripción Netflix Premium\n\n*   **Ahorro Mensual Directo:** $15.99\n*   **Excedente Anual Acumulado:** $191.88\n*   **Impacto de Interés Compuesto (10% anual de retorno a 5 años):** $301.20\n\n**Análisis:** Al eliminar esta suscripción recurrente, tu Fondo de Emergencias sumará ${Math.round(annualSave / 3.5)} días adicionales de autonomía por año. Aunque parece pequeño, erradicar "gastos hormiga" recurrentes es la piedra angular del desapego financiero.`;
      } else if (question.includes("aumento")) {
        const raiseVal = (user?.salary || 3000) * 0.10;
        const newSaveMo = computedMetrics.monthlySavings + raiseVal;
        backupReply = `### Simulación: Aumento Salarial del 10%\n\n*   **Ingreso Extra Mensual:** $${raiseVal.toFixed(0)}\n*   **Patrimonio Proyectado a 12 meses:** Tendrá un incremento neto adicional de **$${(raiseVal * 12).toLocaleString()}**.\n\n**Análisis:** Tu nueva capacidad de ahorro mensual pasa a **$${newSaveMo.toLocaleString()}**. Si mantienes tu costo de vida actual sin inflarlo (inflación del estilo de vida), tu tasa de ahorro escalará un **${(raiseVal / (user?.salary || 1000) * 100).toFixed(0)}%**, permitiéndote alcanzar todas tus metas activas 4 meses antes de lo esperado.`;
      } else if (question.includes("vehículo") || question.includes("vehiculo")) {
        backupReply = `### Simulación: Comprar un Vehículo ($15k total financiado)\n\n*   **Cuota Estimada (36 meses @ tasa 0%):** $416.00 / mes\n*   **Impacto en Flujo de Caja:** Tus gastos mensuales pasarán de **$${computedMetrics.totalExpenseMonth.toLocaleString()}** a **$${(computedMetrics.totalExpenseMonth + 416).toLocaleString()}**.\n*   **Nueva Tasa de Ahorro:** Caerá significativamente de **${computedMetrics.savingsRate.toFixed(1)}%** a **${Math.max(0, (computedMetrics.totalIncomeMonth - computedMetrics.totalExpenseMonth - 416) / computedMetrics.totalIncomeMonth * 100).toFixed(1)}%**.\n\n**Recomendación del Planificador:** Esta carga representa un nivel de apalancamiento importante. Tu fondo de emergencia de seguridad caería de **${computedMetrics.emergencyDays} días** a menor autonomía de manera drástica. Se sugiere posponer si no es una necesidad laboral urgente.`;
      } else {
        backupReply = `### Simulación General de Escenario\n\n*   **Recálculo de Flujo de Caja:** Realizado.\n*   **Recomendación:** Al alterar tus ingresos fijos o variables, prioriza balancear tus deudas primero. Cada dólar que pagues por adelantado a deudas de más del 8% de interés renta más que cualquier cuenta de ahorro tradicional.`;
      }
      setSimulatorResponse(backupReply);
    } finally {
      setIsSimulatorLoading(false);
    }
  };

  // Conversational financial Chat handler
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);

    const activeHistory = chatMessages.slice(-10); // Last 10 context bounds

    const currentFinancialState = {
      user,
      metrics: computedMetrics,
      transactions: transactions.slice(0, 50),
      installments,
      recurringExpenses,
      goals
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          history: activeHistory,
          financialState: currentFinancialState
        })
      });

      if (response.ok) {
        const json = await response.json();
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: json.response,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error();
      }
    } catch {
      const aiFallbackMsg: ChatMessage = {
        id: `msg-ai-fallback-${Date.now()}`,
        sender: 'ai',
        text: `Entendido. Mi conexión inteligente está limitada temporalmente, pero basándome en tus datos fijos de almacenamiento local: Tu ingreso base es de **$${(user?.salary || 3000).toLocaleString()}** y tienes comprometidos **$${computedMetrics.totalExpenseMonth.toLocaleString()}** mensuales en gastos y suscripciones. ¿Te gustaría simular un egreso o revisar algún calendario?`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiFallbackMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Intelligent Financial Calendar items builder
  const calendarItems = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    let runningBalance = computedMetrics.availableBalance + 1000; // start seed for preview

    return days.map(day => {
      const dayTransactions: any[] = [];
      
      // Check if salary day fits
      const isSalaryDay = user?.paymentFrequency === 'Mensual' && day === 30 ||
                          user?.paymentFrequency === 'Quincenal' && (day === 15 || day === 30) ||
                          user?.paymentFrequency === 'Semanal' && (day % 7 === 0);

      if (isSalaryDay && user) {
        let earned = user.salary;
        if (user.paymentFrequency === 'Quincenal') earned = user.salary / 2;
        if (user.paymentFrequency === 'Semanal') earned = user.salary / 4;
        
        dayTransactions.push({
          name: 'Cobro de Sueldo',
          amount: earned,
          type: 'ingreso',
          category: 'Ingresos'
        });
        runningBalance += earned;
      }

      // Check recurring expenses on specific days
      recurringExpenses.forEach(rec => {
        if (rec.paymentDay === day) {
          dayTransactions.push({
            name: rec.name,
            amount: rec.amount,
            type: 'gasto',
            category: rec.category
          });
          runningBalance -= rec.amount;
        }
      });

      // Check installments dynamic days
      installments.forEach(ins => {
        if (ins.paymentDay === day && (ins.totalInstallments - ins.paidInstallments) > 0) {
          dayTransactions.push({
            name: `${ins.name} (Cuota)`,
            amount: ins.monthlyAmount,
            type: 'gasto',
            category: 'Deudas'
          });
          runningBalance -= ins.monthlyAmount;
        }
      });

      return {
        day,
        items: dayTransactions,
        projectedBalance: Math.round(runningBalance)
      };
    });
  }, [user, recurringExpenses, installments, computedMetrics]);

  // Handle addition functions
  const handleAddManualTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;

    const txAmount = parseFloat(newTx.amount) || 0;
    const txType = newTx.type as any;
    const paymentMethod = newTx.account || 'Efectivo';

    const t: Transaction = {
      id: `tx-${Date.now()}`,
      date: newTx.date,
      description: newTx.description,
      category: newTx.category,
      type: txType,
      amount: txAmount,
      account: paymentMethod,
      comments: newTx.comments || `Movimiento registrado vía ${paymentMethod}`
    };

    setTransactions(prev => [t, ...prev]);

    // Perform balance update on dynamic bank accounts:
    if (txType === 'ingreso') {
      const matchBA = bankAccounts.find(ba => paymentMethod.includes(ba.name));
      if (matchBA) {
        setBankAccounts(prev => prev.map(ba => ba.id === matchBA.id ? { ...ba, balance: ba.balance + txAmount } : ba));
      }
    } else {
      const matchBA = bankAccounts.find(ba => paymentMethod.includes(ba.name));
      if (matchBA) {
        setBankAccounts(prev => prev.map(ba => ba.id === matchBA.id ? { ...ba, balance: Math.max(0, ba.balance - txAmount) } : ba));
      }
    }

    setNewTx({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Alimentación',
      type: 'gasto',
      amount: '',
      account: 'Cuenta Corriente',
      comments: ''
    });
    alert('¡Transacción registrada con éxito!');
  };

  const handleAddManualInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstallment.name || !newInstallment.totalAmount || !newInstallment.monthlyAmount || !newInstallment.totalInstallments) return;

    const ins: Installment = {
      id: `ins-${Date.now()}`,
      name: newInstallment.name,
      category: newInstallment.category,
      purchaseDate: newInstallment.purchaseDate,
      totalAmount: parseFloat(newInstallment.totalAmount) || 0,
      monthlyAmount: parseFloat(newInstallment.monthlyAmount) || 0,
      totalInstallments: parseInt(newInstallment.totalInstallments) || 12,
      paidInstallments: parseInt(newInstallment.paidInstallments) || 0,
      startDate: newInstallment.purchaseDate,
      paymentDay: parseInt(newInstallment.paymentDay) || 5,
      cardAssociated: newInstallment.cardAssociated
    };

    setInstallments(prev => [...prev, ins]);
    setNewInstallment({
      name: '',
      category: 'Entretenimiento',
      purchaseDate: new Date().toISOString().split('T')[0],
      totalAmount: '',
      monthlyAmount: '',
      totalInstallments: '',
      paidInstallments: '0',
      paymentDay: '5',
      cardAssociated: 'Tarjeta Principal'
    });
    alert('¡Compra a cuotas registrada exitosamente!');
  };

  const handleAddManualRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecurring.name || !newRecurring.amount) return;

    const rec: RecurringExpense = {
      id: `rec-${Date.now()}`,
      name: newRecurring.name,
      category: newRecurring.category,
      amount: parseFloat(newRecurring.amount) || 0,
      frequency: newRecurring.frequency as any,
      startDate: newRecurring.startDate,
      paymentDay: parseInt(newRecurring.paymentDay) || 1
    };

    setRecurringExpenses(prev => [...prev, rec]);
    setNewRecurring({
      name: '',
      category: 'Servicios',
      amount: '',
      frequency: 'Mensual',
      startDate: new Date().toISOString().split('T')[0],
      paymentDay: '1'
    });
    alert('Gasto recurrente registrado correctamente.');
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankAccount.name || !newBankAccount.balance) {
      alert("Por favor completa los campos obligatorios");
      return;
    }
    const baItem = {
      id: `ba-${Date.now()}`,
      name: newBankAccount.name,
      balance: parseFloat(newBankAccount.balance) || 0
    };
    setBankAccounts(prev => [...prev, baItem]);
    setNewBankAccount({
      name: '',
      balance: ''
    });
    alert(`Cuenta bancaria "${baItem.name}" agregada exitosamente`);
  };

  const handleClearAllSampleData = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar TODOS los datos de muestra de la aplicación? Esto borrará tus transacciones, tarjetas de crédito, cuentas bancarias, cuotas, gastos recurrentes y metas para que puedas empezar de cero con tus propios datos.")) {
      setTransactions([]);
      setInstallments([]);
      setRecurringExpenses([]);
      setGoals([]);
      setCreditCards([]);
      setBankAccounts([
        { id: 'ba-1', name: 'Cuenta de Banco Principal', balance: 0 }
      ]);
      setBudgets(DEFAULT_BUDGETS.map(b => ({ ...b, limit: 0 })));
      // clear local storage
      localStorage.setItem('fpm_transactions', JSON.stringify([]));
      localStorage.setItem('fpm_installments', JSON.stringify([]));
      localStorage.setItem('fpm_recurring', JSON.stringify([]));
      localStorage.setItem('fpm_budgets', JSON.stringify(DEFAULT_BUDGETS.map(b => ({ ...b, limit: 0 }))));
      localStorage.setItem('fpm_goals', JSON.stringify([]));
      localStorage.setItem('fpm_credit_cards', JSON.stringify([]));
      localStorage.setItem('fpm_bank_accounts', JSON.stringify([
        { id: 'ba-1', name: 'Cuenta de Banco Principal', balance: 0 }
      ]));
      
      setChatMessages([
        {
          id: "msg-welcome-clear",
          sender: "ai",
          text: "¡He limpiado con éxito todos los datos de muestra! He creado una cuenta bancaria con saldo $0 para ti. Ahora puedes configurar tus cuentas, tarjetas y registrar tus primeros movimientos desde cero.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      alert("¡Todos los datos de muestra han sido eliminados con éxito!");
    }
  };

  const handleAddCreditCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name || !newCard.closingDay || !newCard.paymentDay) {
      alert("Por favor completa los campos obligatorios");
      return;
    }
    const cardItem = {
      id: `cc-${Date.now()}`,
      name: newCard.name,
      closingDay: parseInt(newCard.closingDay) || 15,
      paymentDay: parseInt(newCard.paymentDay) || 5,
      limit: parseFloat(newCard.limit) || 3000
    };
    setCreditCards(prev => [...prev, cardItem]);
    setNewCard({
      name: '',
      closingDay: '15',
      paymentDay: '5',
      limit: '3000'
    });
    alert(`Tarjeta de crédito "${cardItem.name}" agregada exitosamente`);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cleanName = newCategoryName.trim();
    if (categories.includes(cleanName)) {
      alert("Esta categoría ya existe");
      return;
    }
    setCategories(prev => [...prev, cleanName]);
    setNewCategoryName("");
    alert(`Categoría "${cleanName}" agregada exitosamente`);
  };

  // Handler to start editing a bank account
  const handleStartEditBankAccount = (ba: any) => {
    setEditingBankAccountId(ba.id);
    setEditingBankAccountData({ name: ba.name, balance: ba.balance.toString() });
  };

  // Handler to save bank account edits
  const handleSaveBankAccountEdit = () => {
    if (!editingBankAccountData || !editingBankAccountData.name.trim()) {
      alert("El nombre de la cuenta no puede estar vacío");
      return;
    }
    const balanceVal = parseFloat(editingBankAccountData.balance) || 0;
    setBankAccounts(prev => prev.map(ba => ba.id === editingBankAccountId ? { ...ba, name: editingBankAccountData.name, balance: balanceVal } : ba));
    setEditingBankAccountId(null);
    setEditingBankAccountData(null);
    alert("Cuenta bancaria modificada con éxito.");
  };

  // Handler to start editing a credit card
  const handleStartEditCreditCard = (cc: any) => {
    setEditingCreditCardId(cc.id);
    setEditingCreditCardData({
      name: cc.name,
      closingDay: cc.closingDay.toString(),
      paymentDay: cc.paymentDay.toString(),
      limit: cc.limit ? cc.limit.toString() : '3000'
    });
  };

  // Handler to save credit card edits
  const handleSaveCreditCardEdit = () => {
    if (!editingCreditCardData || !editingCreditCardData.name.trim()) {
      alert("El nombre de la tarjeta no puede estar vacío");
      return;
    }
    const cDay = parseInt(editingCreditCardData.closingDay) || 15;
    const pDay = parseInt(editingCreditCardData.paymentDay) || 5;
    const lim = parseFloat(editingCreditCardData.limit) || 0;

    setCreditCards(prev => prev.map(cc => cc.id === editingCreditCardId ? {
      ...cc,
      name: editingCreditCardData.name,
      closingDay: cDay,
      paymentDay: pDay,
      limit: lim
    } : cc));

    setEditingCreditCardId(null);
    setEditingCreditCardData(null);
    alert("Tarjeta de crédito modificada con éxito.");
  };

  // Handler to start editing a category
  const handleStartEditCategory = (cat: string) => {
    setEditingCategoryName(cat);
    setEditingCategoryNewValue(cat);
  };

  // Handler to save category edits
  const handleSaveCategoryEdit = (oldCat: string) => {
    const newVal = editingCategoryNewValue.trim();
    if (!newVal) {
      alert("El nombre de la categoría no puede estar vacío");
      return;
    }
    if (categories.includes(newVal) && newVal !== oldCat) {
      alert("Esa categoría ya existe");
      return;
    }
    
    // Update categories
    setCategories(prev => prev.map(c => c === oldCat ? newVal : c));

    // Update transactions that use this category
    setTransactions(prev => prev.map(t => t.category === oldCat ? { ...t, category: newVal } : t));

    // Update budgets of this category
    setBudgets(prev => prev.map(b => b.category === oldCat ? { ...b, category: newVal } : b));

    // Update goals of this category
    setGoals(prev => prev.map(g => g.category === oldCat ? { ...g, category: newVal as any } : g));

    setEditingCategoryName(null);
    setEditingCategoryNewValue("");
    alert("Categoría modificada con éxito.");
  };

  const handleAddManualGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    const gl: FinancialGoal = {
      id: `goal-${Date.now()}`,
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount) || 1000,
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      category: newGoal.category as any,
      targetDate: newGoal.targetDate
    };

    setGoals(prev => [...prev, gl]);
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      category: 'Fondo de Emergencia',
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    alert('Nueva meta de patrimonio creada.');
  };

  // Helper trigger to dump CSV
  const exportLedgerToCsv = () => {
    const rawData = transactions.map(t => ({
      Fecha: t.date,
      Descripción: t.description,
      Monto: t.amount,
      Categoría: t.category,
      Tipo: t.type,
      Cuenta: t.account
    }));
    const worksheet = XLSX.utils.json_to_sheet(rawData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FPM Ledger");
    XLSX.writeFile(workbook, "Historial_Financiero.xlsx");
  };

  // Display Onboarding screen if user state is empty
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#fafafa] flex items-center justify-center p-4 relative overflow-y-auto">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
              <span className="text-black font-black text-2xl">F</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">FPM</h2>
              <p className="text-xs text-amber-500 uppercase tracking-widest font-semibold">Financial Planner</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-light text-zinc-100 mb-2">Diseña tu Arquitectura Financiera</h1>
            <p className="text-sm text-zinc-400">
              Personaliza tu portal cognitivo para comenzar a modelar y proyectar tu patrimonio neto.
            </p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Nombre Completo</label>
                <input
                  required
                  name="userName"
                  type="text"
                  placeholder="Manuel Mazariego"
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">País de Residencia</label>
                <input
                  required
                  name="country"
                  type="text"
                  placeholder="El Salvador"
                  defaultValue="El Salvador"
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Moneda de Trabajo</label>
                <select
                  name="currency"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
                >
                  <option value="$">Dólar Estadounidense ($)</option>
                  <option value="€">Euro (€)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="ARS">Peso Argentino (ARS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Ingreso Neto Mensual</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-zinc-500 text-sm">$</span>
                  <input
                    required
                    name="salary"
                    type="number"
                    defaultValue="3500"
                    placeholder="3500"
                    className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 rounded-xl pl-8 pr-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Frecuencia de Recibo</label>
                <select
                  name="paymentFrequency"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
                >
                  <option value="Mensual">Mensual (1 Pago)</option>
                  <option value="Quincenal">Quincenal (2 Pagos)</option>
                  <option value="Semanal">Semanal (4 Pagos)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Objetivo de Ahorro Neto (%)</label>
                <input
                  required
                  name="savingsGoalPct"
                  type="number"
                  min="5"
                  max="90"
                  defaultValue="25"
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Fondo de Emergencia Deseado (Equivalente en Meses)</label>
                <input
                  required
                  name="desiredEmergencyFundMonths"
                  type="number"
                  min="2"
                  max="24"
                  defaultValue="6"
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-3">Enfoques Prioritarios</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input type="checkbox" name="obj_emergency" defaultChecked className="rounded text-amber-500 focus:ring-amber-500" />
                  <span>Reserva frente a Imprevistos</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input type="checkbox" name="obj_debt" defaultChecked className="rounded text-amber-500 focus:ring-amber-500" />
                  <span>Pagar Deudas Aceleradamente</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input type="checkbox" name="obj_invest" className="rounded text-amber-500 focus:ring-amber-500" />
                  <span>Inversión ETF & Mercado</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input type="checkbox" name="obj_travel" className="rounded text-amber-500 focus:ring-amber-500" />
                  <span>Fondos para Viajes</span>
                </label>
              </div>
            </div>

            <button
              name="submit-onboarding"
              type="submit"
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer"
            >
              Comenzar Auditoría Financiera
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0a0b] text-[#fafafa] font-sans flex flex-col md:flex-row select-none">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col py-6 px-4 shrink-0 justify-between">
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              <DollarSign className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight text-white leading-none">FPM AI</h2>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">Planner</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab(0)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                activeTab === 0 
                  ? 'bg-zinc-800 text-amber-500 shadow-inner' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Dashboard General</span>
            </button>

            <button
              onClick={() => setActiveTab(1)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                activeTab === 1 
                  ? 'bg-zinc-800 text-amber-500 shadow-inner' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Upload className="w-4 h-4 text-amber-500" />
              <span>Importar & Libros</span>
            </button>

            <button
              onClick={() => setActiveTab(2)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                activeTab === 2 
                  ? 'bg-zinc-800 text-amber-500 shadow-inner' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <PieIcon className="w-4 h-4 text-sky-500" />
              <span>Presupuestos & Metas</span>
            </button>

            <button
              onClick={() => setActiveTab(3)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                activeTab === 3 
                  ? 'bg-zinc-800 text-amber-500 shadow-inner' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Cuotas & Recurrentes</span>
            </button>

            <button
              onClick={() => setActiveTab(4)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                activeTab === 4 
                  ? 'bg-zinc-800 text-amber-500 shadow-inner' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Zap className="w-4 h-4 text-pink-500" />
              <span>Forecast / Simulador</span>
            </button>

            <button
              onClick={() => setActiveTab(5)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                activeTab === 5 
                  ? 'bg-zinc-800 text-amber-500 shadow-inner' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Calendario Inteligente</span>
            </button>

            <button
              id="btn-tab-config"
              onClick={() => setActiveTab(6)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                activeTab === 6 
                  ? 'bg-zinc-800 text-amber-500 shadow-inner' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Settings className="w-4 h-4 text-blue-500" />
              <span>Configuración</span>
            </button>
          </nav>
        </div>

        {/* User context action area at footer */}
        <div className="pt-6 border-t border-zinc-850 space-y-4">
          <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-850">
            <div className="w-8 h-8 rounded-full bg-amber-500/25 border border-amber-500 text-amber-500 flex items-center justify-center font-bold text-xs uppercase">
              {user.name.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[9px] text-zinc-500 text-left uppercase truncate">{user.country}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearAllSampleData}
            className="w-full py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/40 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Todos los Datos de Muestra</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex-1 flex justify-center py-2.5 rounded-lg border text-[10px] font-semibold transition-all uppercase cursor-pointer ${
                isChatOpen ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-900 text-zinc-450 border-zinc-800 hover:text-white'
              }`}
            >
              Asistente AI
            </button>

            <button
              onClick={handleResetProfile}
              title="Reiniciar base de datos"
              className="px-3 py-2.5 bg-zinc-900 text-zinc-500 hover:text-red-400 border border-zinc-800 rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* CORE WORKSPACE CONTENT AND WORKBENCH */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-full">
        
        {/* HEADER SECTION METRICS */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-zinc-850 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FPM Financial Planner</h1>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-1">
              Arquitectura Patrimonial e IA • {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* DYNAMIC MONTH BY MONTH INTERACTIVE NAVIGATOR */}
          <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 p-2 rounded-2xl shadow-xl select-none">
            <button
              title="Mes Anterior"
              onClick={() => {
                if (currentMonth === 1) {
                  setCurrentMonth(12);
                  setCurrentYear(prev => prev - 1);
                } else {
                  setCurrentMonth(prev => prev - 1);
                }
              }}
              className="p-1 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-xl cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center min-w-[140px] text-center px-1">
              <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][currentMonth - 1]}
              </span>
              <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
                {currentYear} • {(currentYear === 2026 && currentMonth > 5) || currentYear > 2026 ? "Proyección" : "Histórico Real"}
              </span>
            </div>
            <button
              title="Mes Siguiente"
              onClick={() => {
                if (currentMonth === 12) {
                  setCurrentMonth(1);
                  setCurrentYear(prev => prev + 1);
                } else {
                  setCurrentMonth(prev => prev + 1);
                }
              }}
              className="p-1 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-xl cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={exportLedgerToCsv}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-medium border border-zinc-800 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar XLS
            </button>
            <button
              onClick={() => { setActiveTab(1); }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar CSV
            </button>
          </div>
        </header>

        {/* TAB 0: DASHBOARD GENERAL */}
        {activeTab === 0 && (
          <div className="space-y-6 pt-6">
            
            {/* KPI ROW METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Patrimonio Neto</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-light text-zinc-100">{user.currency} {computedMetrics.netWorth.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 uppercase mt-1">Activos Menos Pasivos</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500"></div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Autonomía Financiera</span>
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-light text-amber-400">{computedMetrics.emergencyDays} días</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 uppercase mt-1">Reserva ante Imprevistos</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tasa de Ahorro Neto</span>
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-light text-zinc-100">{computedMetrics.savingsRate.toFixed(1)}%</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 uppercase mt-1">Meta Personal: {user.savingsGoalPct}%</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rendimiento Mensual</span>
                  <TrendingDown className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2 text-zinc-100">
                    <span className="text-sm font-medium">Gastado: </span>
                    <span className="text-xl font-light"> {user.currency}{computedMetrics.totalExpenseMonth.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 uppercase mt-1">Ingresado: {user.currency}{computedMetrics.totalIncomeMonth.toLocaleString()}</p>
                </div>
              </div>

            </div>

            {/* LIQUIDITY SUMMARY / BANK ACCOUNTS & CREDIT CARDS STATEMENT PROJECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* BANK ACCOUNTS CARD */}
              <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200">Saldos de Cuentas Bancarias</h3>
                      <p className="text-[10px] text-zinc-550 uppercase mt-0.5">Disponibilidad de Líquidos, Salarios y Ahorros</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  
                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                    {bankAccounts.map(ba => (
                      <div key={ba.id} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-zinc-200">{ba.name}</p>
                          <p className="text-[9px] text-zinc-500 uppercase mt-0.5">Saldo Líquido</p>
                        </div>
                        <p className="font-mono text-emerald-400 font-bold text-sm">
                          {user.currency}{ba.balance.toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {bankAccounts.length === 0 && (
                      <div className="text-center text-zinc-550 text-xs py-5 font-mono">
                        No hay cuentas bancarias registradas. Ve a la pestaña Cuotas & Recurrentes para agregar una.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-850 flex justify-between items-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Total Disponible</p>
                  <p className="font-mono font-black text-emerald-400 text-sm">
                    {user.currency}{bankAccounts.reduce((sum, ba) => sum + ba.balance, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* CREDIT CARDS DUE DATES & BALANCES GENERAL CALENDAR */}
              <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200">Cronograma y Saldos de Tarjetas de Crédito</h3>
                      <p className="text-[10px] text-zinc-550 uppercase mt-0.5">Próximas Obligaciones calculadas según Ciclos de Corte y Pago</p>
                    </div>
                    <CalendarDays className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                    {creditCards.map(card => {
                      const plan = ccPlan[card.id];
                      const nextPayment = plan?.payments[0]; // next payment in timeline
                      return (
                        <div key={card.id} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 flex justify-between items-start text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-zinc-200">{card.name}</p>
                            {nextPayment ? (
                              <div className="space-y-0.5 text-[9px] font-mono">
                                <p className="text-amber-500">
                                  Pagar: <span className="font-bold underline">{user.currency}{nextPayment.amount.toLocaleString()}</span> el <span className="font-bold">{new Date(nextPayment.dueDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                </p>
                                <p className="text-zinc-500">
                                  Detalle: Corte el {new Date(nextPayment.cutDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ({nextPayment.details.length} txs)
                                </p>
                              </div>
                            ) : (
                              <p className="text-[9px] text-zinc-550 italic">Sin transacciones registradas este ciclo</p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-[9px] text-zinc-550 uppercase">Cupo Usado</p>
                            <p className="font-mono text-red-400 font-bold">
                              {user.currency}{(plan?.totalActiveBalance || 0).toLocaleString()}
                            </p>
                            <p className="text-[8px] text-zinc-600 font-mono">Límite {user.currency}{card.limit?.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                    {creditCards.length === 0 && (
                      <div className="text-center text-zinc-550 text-xs py-5 font-mono">
                        No hay tarjetas de crédito configuradas. Ve a Pestaña Cuotas & Recurrentes para cargarlas.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-850 flex justify-between items-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Deuda Total Consolidada</p>
                  <p className="font-mono font-black text-red-400 text-sm">
                    {user.currency}{Object.values(ccPlan).reduce((sum: number, c: any) => sum + (c.totalActiveBalance || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* CHARTS CONTAINER (BENTO GRID STYLE) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* PRIMARY INCOME VS EXPENSE EVOLUTION */}
              <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Distribución de Caja y Proyección Diaria</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Gastos e Ingresos Proyectados Día por Día - Mes Seleccionado</p>
                  </div>
                  <div className="flex gap-4 text-[10px] font-medium tracking-wide">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500"></div> Ingresos</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500"></div> Gastos</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-0.5 bg-blue-400"></div> Saldo Proyectado</div>
                  </div>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={monthlyDailyData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#71717a" fontSize={9} />
                      <YAxis stroke="#71717a" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }} />
                      <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} barSize={8} />
                      <Bar dataKey="Gastos" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={8} />
                      <Line type="monotone" dataKey="Flujo_Neto" stroke="#3b82f6" strokeWidth={2} dot={false} name="Balance" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PIE CHART EXPENSE BY CATEGORIES */}
              <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Gastos por Categoría</h3>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Distribución de Gasto ({['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][currentMonth - 1]} {currentYear})</p>
                </div>

                <div className="w-full h-48 flex items-center justify-center py-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const cats: any = {};
                          const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
                          const targetTxs = transactions.filter(t => t.type === 'gasto' && t.date.startsWith(monthStr));
                          
                          if (targetTxs.length > 0) {
                            targetTxs.forEach(tx => {
                              cats[tx.category] = (cats[tx.category] || 0) + tx.amount;
                            });
                          } else {
                            // Fallback to average representation if chosen month has no items yet
                            transactions.filter(t => t.type === 'gasto').forEach(tx => {
                              cats[tx.category] = (cats[tx.category] || 0) + tx.amount;
                            });
                          }
                          return Object.keys(cats).map(name => ({ name, value: Math.round(cats[name]) }));
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#6366f1', '#a855f7', '#14b8a6', '#f43f5e'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {(() => {
                    const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
                    const items = transactions.filter(t => t.type === 'gasto' && t.date.startsWith(monthStr));
                    const sourceList = items.length > 0 ? items : transactions.filter(t => t.type === 'gasto');
                    return Array.from(new Set(sourceList.map(t => t.category))).slice(0, 4).map((c, i) => (
                      <div key={c} className="flex items-center gap-1.5 text-zinc-400">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#6366f1'][i % 5] }}></div>
                        <span className="truncate">{c}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

            {/* AI GENERATIVE STORY SECTION */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Auditoría Narrativa Cognitive FPM</h3>
                    <p className="text-[10px] text-amber-500/80 uppercase tracking-wide font-medium">Análisis en tiempo real impulsado por Inteligencia Artificial</p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateNarrative}
                  disabled={isNarrativeLoading}
                  className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold rounded-xl text-amber-500 flex items-center gap-2 border border-zinc-750 transition-all cursor-pointer"
                >
                  {isNarrativeLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Calculando Análisis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generar Análisis Inteligente
                    </>
                  )}
                </button>
              </div>

              {narrativeText ? (
                <div className="prose prose-invert prose-xs text-xs leading-relaxed text-zinc-300 space-y-3 bg-zinc-950/65 rounded-xl p-4 border border-zinc-850">
                  {narrativeText.split('\n').map((line, key) => {
                    if (line.startsWith('###')) {
                      return <h4 key={key} className="text-xs font-bold text-white mt-3 uppercase tracking-wider">{line.replace('###', '')}</h4>;
                    }
                    if (line.startsWith('*')) {
                      return <p key={key} className="pl-4 border-l border-zinc-700 italic my-1 text-zinc-450">{line.replace('*', '')}</p>;
                    }
                    return <p key={key}>{line}</p>;
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-400">Haz clic en generar análisis para crear una narrativa a medida de tu situación actual.</p>
                </div>
              )}
            </div>

            {/* METRICS OF LEVERAGE & FINANCIAL COVERAGE ALERT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Apalancamiento de Deudas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-zinc-400">Pasivos sobre Activos Totales</span>
                    <span className="text-sm font-semibold">{computedMetrics.debtLeverage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, computedMetrics.debtLeverage)}%` }}></div>
                  </div>
                  <div className="flex gap-2 items-center text-[10px] text-zinc-500 pt-1">
                    <Info className="w-3.5 h-3.5 text-zinc-450" />
                    <span>Ratio óptimo inferior a 35% para finanzas saludables.</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b0f0c] border border-emerald-900/30 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Fondo de Emergencia</h4>
                    <p className="text-[10px] text-emerald-400 font-medium">Meta deseada: {user.desiredEmergencyFundMonths} Meses</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-baseline">
                  <div>
                    <p className="text-sm text-zinc-400">Acumulado Seguro:</p>
                    <p className="text-xl font-light text-emerald-400">{user.currency} {computedMetrics.emergencyFundTotal.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold uppercase rounded-lg text-[9px] tracking-widest">
                      {computedMetrics.emergencyDays > 120 ? "Saludable" : "Alerta de Reserva"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 1: LEDGER & IMPORT COMPONENT */}
        {activeTab === 1 && (
          <div className="space-y-6 pt-6">
            
            {/* FILE SUBMISSION BOARD DRAG-DROP */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">Cargar Transacciones Manual/CSV</h3>
              
              <div 
                onDragOver={e => e.preventDefault()}
                onDrop={handleCsvFileDropped}
                className="border-2 border-dashed border-zinc-800 hover:border-amber-500/30 rounded-2xl p-10 text-center cursor-pointer transition-colors relative"
              >
                <input 
                  type="file" 
                  accept=".csv,.xlsx" 
                  id="csv-file-picker" 
                  onChange={handleCsvFileSelected}
                  className="hidden" 
                />
                <label htmlFor="csv-file-picker" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
                  <p className="text-xs font-semibold text-zinc-300">Arrastra archivos Excel o CSV aquí, o haz clic para subir</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">Formatos admitidos: .csv, .xlsx, .xls</p>
                </label>
              </div>

              {csvFile && (
                <div className="mt-5 p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-500">Archivo detectado: {csvFile.name} (Columnas: {csvHeaders.length})</span>
                    <button onClick={() => setCsvFile(null)} className="text-red-400 font-bold hover:underline">Cancelar</button>
                  </div>

                  {/* Columns Parser settings mappings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-850">
                    {/* Date Mapping */}
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase font-extrabold tracking-wider mb-1">Fecha</label>
                      <select 
                        value={columnMapping.date} 
                        onChange={e => setColumnMapping(prev => ({...prev, date: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Desc Mapping */}
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase font-extrabold tracking-wider mb-1">Descripción / Movimiento</label>
                      <select 
                        value={columnMapping.description} 
                        onChange={e => setColumnMapping(prev => ({...prev, description: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Amount Mapping */}
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase font-extrabold tracking-wider mb-1">Monto (Columna única)</label>
                      <select 
                        value={columnMapping.amount} 
                        onChange={e => setColumnMapping(prev => ({...prev, amount: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Category Mapping */}
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase font-extrabold tracking-wider mb-1">Categoría</label>
                      <select 
                        value={columnMapping.category} 
                        onChange={e => setColumnMapping(prev => ({...prev, category: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Separate Gasto Column */}
                    <div>
                      <label className="block text-[10px] text-amber-500/80 uppercase font-extrabold tracking-wider mb-1">Monto Gasto (Separado)</label>
                      <select 
                        value={columnMapping.montoGasto} 
                        onChange={e => setColumnMapping(prev => ({...prev, montoGasto: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-amber-500/10 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Separate Ingreso Column */}
                    <div>
                      <label className="block text-[10px] text-emerald-500/80 uppercase font-extrabold tracking-wider mb-1">Monto Ingreso (Separado)</label>
                      <select 
                        value={columnMapping.montoIngreso} 
                        onChange={e => setColumnMapping(prev => ({...prev, montoIngreso: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-emerald-500/10 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Comments Column */}
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase font-extrabold tracking-wider mb-1">Comentarios / Notas</label>
                      <select 
                        value={columnMapping.comments} 
                        onChange={e => setColumnMapping(prev => ({...prev, comments: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Type Flow Mapping */}
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase font-extrabold tracking-wider mb-1">Tipo Cuenta / Medio</label>
                      <select 
                        value={columnMapping.type} 
                        onChange={e => setColumnMapping(prev => ({...prev, type: e.target.value}))}
                        className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-lg p-2 text-zinc-200"
                      >
                        <option value="">Selecciona...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleRunAiClassification}
                    disabled={isClassifying}
                    className="w-full py-2 bg-amber-500 font-semibold text-black text-xs rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isClassifying ? "AI Categorizando movimientos..." : "Escanear & Clasificar con Inteligencia Artificial FPM"}
                  </button>
                </div>
              )}
            </div>

            {/* AI APPROVAL REGISTRY ROWS */}
            {transactionsToApprove.length > 0 && (
              <div className="bg-zinc-950 border border-amber-500/25 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Buzón de Aprobación de AI Classifier</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Corrige si deseas reentrenar localmente al modelo</p>
                  </div>
                  <button
                    onClick={handleApproveAllTransactions}
                    className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400"
                  >
                    Aprobar & Registrar Todos
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {transactionsToApprove.map((item, key) => (
                    <div key={key} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-zinc-900 rounded-xl gap-2 text-xs border border-zinc-850">
                      <div>
                        <p className="font-semibold text-zinc-200">{item.description}</p>
                        <p className="text-[10px] text-zinc-500">{item.date} • {item.account}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.type === 'ingreso' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {item.type}
                        </span>

                        <select
                          value={item.category}
                          onChange={e => {
                            const updated = [...transactionsToApprove];
                            updated[key].category = e.target.value;
                            setTransactionsToApprove(updated);
                          }}
                          className="bg-zinc-950 text-[11px] border border-zinc-800 rounded p-1 text-zinc-300"
                        >
                          {['Alimentación', 'Vivienda', 'Transporte', 'Suscripciones', 'Servicios', 'Otros', 'Ingresos', 'Educación', 'Salud', 'Deudas'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>

                        <span className="font-semibold text-zinc-200">{user.currency} {item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MANUAL RECODRING LEDGER AND TABLE LISTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Registro Financiero Rápido</h3>
                
                <form onSubmit={handleAddManualTransaction} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Descripción</label>
                    <input
                      required
                      type="text"
                      placeholder="Supermercado o Salario"
                      value={newTx.description}
                      onChange={e => setNewTx(prev => ({...prev, description: e.target.value}))}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Monto</label>
                      <input
                        required
                        type="number"
                        placeholder="75.00"
                        value={newTx.amount}
                        onChange={e => setNewTx(prev => ({...prev, amount: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Tipo</label>
                      <select
                        value={newTx.type}
                        onChange={e => setNewTx(prev => ({...prev, type: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5"
                      >
                        <option value="gasto">Gasto / Salida</option>
                        <option value="ingreso">Ingreso / Entrada</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Categoría</label>
                      <select
                        value={newTx.category}
                        onChange={e => setNewTx(prev => ({...prev, category: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5 text-zinc-300"
                      >
                        {['Alimentación', 'Vivienda', 'Transporte', 'Suscripciones', 'Servicios', 'Otros', 'Ingresos', 'Educación', 'Salud', 'Deudas'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Fecha</label>
                      <input
                        type="date"
                        value={newTx.date}
                        onChange={e => setNewTx(prev => ({...prev, date: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Medio de Pago / Cuenta</label>
                    <select
                      value={newTx.account}
                      onChange={e => setNewTx(prev => ({...prev, account: e.target.value}))}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5 text-zinc-350"
                    >
                      <option value="Efectivo">Efectivo</option>
                      
                      {/* Dynamic Bank Account outputs as Debit / Transfer */}
                      {bankAccounts.map(ba => (
                        <option key={`opt-ba-deb-${ba.id}`} value={`Tarjeta de Débito - ${ba.name}`}>
                          Débito - {ba.name} (Saldo: {user.currency}{ba.balance.toLocaleString()})
                        </option>
                      ))}
                      {bankAccounts.map(ba => (
                        <option key={`opt-ba-tran-${ba.id}`} value={`Transferencia - ${ba.name}`}>
                          Transferencia - {ba.name} (Saldo: {user.currency}{ba.balance.toLocaleString()})
                        </option>
                      ))}

                      {/* Dynamic Credit Card outputs */}
                      {creditCards.map(c => (
                        <option key={`opt-cc-${c.id}`} value={`Tarjeta de Crédito - ${c.name}`}>
                          Crédito - {c.name} (Corte {c.closingDay} • Pago {c.paymentDay})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-755 border border-zinc-700 text-amber-500 font-semibold rounded-lg text-xs tracking-wider cursor-pointer transition-all"
                  >
                    Agregar Movimiento
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Historial de Transacciones Registradas</h3>
                    <p className="text-[10px] text-zinc-550 mt-1 uppercase">Visualizador y Simulador de Flujos</p>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-zinc-350 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filterByMonthEnv}
                      onChange={e => setFilterByMonthEnv(e.target.checked)}
                      className="rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Filtrar por Mes Seleccionado ({['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][currentMonth - 1]} {currentYear})</span>
                  </label>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-zinc-300">
                    <thead className="bg-[#121214] text-[10px] text-zinc-500 uppercase tracking-widest">
                      <tr>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Detalle</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3 text-right">Valor</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {(() => {
                        const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
                        const txToShow = filterByMonthEnv
                          ? transactions.filter(t => t.date.startsWith(monthStr))
                          : transactions;

                        if (txToShow.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-zinc-500">
                                No se encontraron transacciones registradas para este periodo.
                              </td>
                            </tr>
                          );
                        }

                        return txToShow.map(item => {
                          const isRowEditing = editingTxId === item.id;
                          return (
                            <tr key={item.id} className="hover:bg-zinc-850/40 transition-colors">
                              {isRowEditing ? (
                                <>
                                  {/* Date field */}
                                  <td className="p-2">
                                    <input
                                      type="date"
                                      className="bg-zinc-950 text-amber-500 text-xs border border-zinc-800 p-1.5 rounded w-28 uppercase"
                                      value={editingTxData?.date || ''}
                                      onChange={e => setEditingTxData(prev => prev ? { ...prev, date: e.target.value } : null)}
                                    />
                                  </td>
                                  {/* Description field */}
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      className="bg-zinc-950 text-white text-xs border border-zinc-800 p-1.5 rounded w-full font-semibold"
                                      value={editingTxData?.description || ''}
                                      onChange={e => setEditingTxData(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    />
                                  </td>
                                  {/* Category dropdown field */}
                                  <td className="p-2">
                                    <select
                                      className="bg-zinc-950 text-zinc-300 text-[11px] border border-zinc-800 p-1.5 rounded w-28"
                                      value={editingTxData?.category || ''}
                                      onChange={e => setEditingTxData(prev => prev ? { ...prev, category: e.target.value } : null)}
                                    >
                                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                  </td>
                                  {/* Amount field with type toggle */}
                                  <td className="p-2 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <select
                                        className="bg-zinc-950 text-zinc-400 text-[10px] border border-zinc-800 rounded px-1 p-1"
                                        value={editingTxData?.type || ''}
                                        onChange={e => setEditingTxData(prev => prev ? { ...prev, type: e.target.value } : null)}
                                      >
                                        <option value="gasto">- Gasto</option>
                                        <option value="ingreso">+ Ingreso</option>
                                      </select>
                                      <span className="text-zinc-500 font-mono text-[11px]">{user.currency}</span>
                                      <input
                                        type="number"
                                        className="bg-zinc-950 text-white font-mono text-xs border border-zinc-800 p-1 rounded w-20 text-right"
                                        value={editingTxData?.amount || 0}
                                        onChange={e => setEditingTxData(prev => prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null)}
                                      />
                                    </div>
                                  </td>
                                  {/* Save Cancel actions */}
                                  <td className="p-2 text-center">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => {
                                          if (editingTxData) {
                                            setTransactions(prev => prev.map(t => t.id === item.id ? { ...t, ...editingTxData } : t));
                                          }
                                          setEditingTxId(null);
                                          setEditingTxData(null);
                                        }}
                                        className="text-emerald-500 hover:text-emerald-400 p-1 font-bold"
                                        title="Guardar"
                                      >
                                        <Check className="w-4 h-4 mx-auto" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingTxId(null);
                                          setEditingTxData(null);
                                        }}
                                        className="text-zinc-500 hover:text-zinc-350 p-1"
                                        title="Cancelar"
                                      >
                                        <X className="w-4 h-4 mx-auto" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-3 whitespace-nowrap text-zinc-450">{item.date}</td>
                                  <td className="p-3 font-semibold text-zinc-200 truncate max-w-xs">{item.description}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[10px]">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap">
                                    <span className={item.type === 'ingreso' ? 'text-emerald-450 font-medium' : 'text-zinc-205'}>
                                      {item.type === 'ingreso' ? '+' : '-'} {user.currency} {item.amount.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* Inline Edit button */}
                                      <button
                                        onClick={() => {
                                          setEditingTxId(item.id);
                                          setEditingTxData({
                                            date: item.date,
                                            description: item.description,
                                            category: item.category,
                                            type: item.type,
                                            amount: item.amount,
                                            account: item.account,
                                            comments: item.comments
                                          });
                                        }}
                                        className="text-zinc-500 hover:text-amber-500 p-1 cursor-pointer"
                                        title="Editar Movimiento"
                                      >
                                        <Pencil className="w-3.5 h-3.5 mx-auto" />
                                      </button>
                                      {/* Deletion button */}
                                      <button
                                        onClick={() => {
                                          setTransactions(prev => prev.filter(p => p.id !== item.id));
                                        }}
                                        className="text-red-400 hover:text-red-350 p-1 cursor-pointer"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: BUDGETS & FINANCIAL GOALS METAS */}
        {activeTab === 2 && (
          <div className="space-y-6 pt-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* BUDGETS SETTINGS */}
              <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Presupuestos por Categorías</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Control de Límites Mensuales</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="space-y-5">
                  {budgets.map(b => {
                    const spentForCat = transactions
                      .filter(t => t.type === 'gasto' && t.category === b.category)
                      .reduce((sum, current) => sum + current.amount, 0);
                    
                    const pct = Math.round((spentForCat / b.limit) * 100) || 0;
                    const overspent = spentForCat > b.limit;

                    const isEditing = editingBudgetCategory === b.category;

                    return (
                      <div key={b.category} className="space-y-1.5">
                        {isEditing ? (
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-zinc-300">{b.category}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-400">{user.currency}</span>
                              <input
                                type="number"
                                className="w-24 bg-zinc-950 text-xs text-white border border-zinc-800 rounded px-1.5 py-0.5 font-mono focus:outline-none"
                                defaultValue={b.limit}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    const targetVal = parseFloat((e.target as HTMLInputElement).value) || 0;
                                    setBudgets(prev => prev.map(item => item.category === b.category ? { ...item, limit: targetVal } : item));
                                    setEditingBudgetCategory(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingBudgetCategory(null);
                                  }
                                }}
                                onBlur={e => {
                                  const targetVal = parseFloat((e.target as HTMLInputElement).value) || 0;
                                  setBudgets(prev => prev.map(item => item.category === b.category ? { ...item, limit: targetVal } : item));
                                  setEditingBudgetCategory(null);
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingBudgetCategory(null)}
                                className="text-emerald-500 hover:text-emerald-400 p-0.5 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-xs font-semibold group">
                            <span className="text-zinc-300">{b.category}</span>
                            <div className="flex items-center gap-2">
                              <span className={overspent ? "text-red-450" : "text-zinc-450"}>
                                {user.currency}{spentForCat.toLocaleString()} / {user.currency}{b.limit.toLocaleString()} ({pct}%)
                              </span>
                              <button
                                onClick={() => setEditingBudgetCategory(b.category)}
                                className="text-zinc-500 hover:text-amber-500 opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                title="Editar presupuesto"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                          <div 
                            className={`h-full rounded-full transition-all ${overspent ? "bg-red-500" : pct > 85 ? "bg-amber-500" : "bg-emerald-500"}`} 
                            style={{ width: `${Math.min(100, pct)}%` }}
                          ></div>
                        </div>
                        {overspent && (
                          <div className="flex items-center gap-1 text-[9px] text-red-400">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>¡Sobreconsumo! Has excedido el límite presupuestario por {user.currency}{(spentForCat - b.limit).toLocaleString()}.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NET WORTH & ACTIVE GOALS */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Metas List */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Metas de Ahorro y Patrimonio</h3>
                  
                  <div className="space-y-5">
                    {goals.map(g => {
                      const pct = Math.round((g.currentAmount / g.targetAmount) * 100) || 0;
                      return (
                        <div key={g.id} className="space-y-2 p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-200">{g.name}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-bold uppercase">{pct}%</span>
                          </div>
                          
                          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, pct)}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-zinc-500">
                            <span>{user.currency}{g.currentAmount.toLocaleString()} de {user.currency}{g.targetAmount.toLocaleString()}</span>
                            <span>Completa: {g.targetDate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form to Create New Goal */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Nueva Meta de Retorno</h3>
                  
                  <form onSubmit={handleAddManualGoal} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nombre de la Meta</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Fondos para Vivienda"
                        value={newGoal.name}
                        onChange={e => setNewGoal(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Monto Objetivo</label>
                        <input
                          required
                          type="number"
                          placeholder="15000"
                          value={newGoal.targetAmount}
                          onChange={e => setNewGoal(prev => ({...prev, targetAmount: e.target.value}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Inicial Sembrado</label>
                        <input
                          type="number"
                          value={newGoal.currentAmount}
                          onChange={e => setNewGoal(prev => ({...prev, currentAmount: e.target.value}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Categoría</label>
                        <select
                          value={newGoal.category}
                          onChange={e => setNewGoal(prev => ({...prev, category: e.target.value as any}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2.5 text-zinc-300"
                        >
                          {['Fondo de Emergencia', 'Viajes', 'Vehículo', 'Vivienda', 'Jubilación', 'Otros'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Fecha Límite</label>
                        <input
                          type="date"
                          value={newGoal.targetDate}
                          onChange={e => setNewGoal(prev => ({...prev, targetDate: e.target.value}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-amber-500 font-semibold rounded-lg text-xs tracking-wider cursor-pointer transition-all"
                    >
                      Añadir Compromiso de Ahorro
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: CUOTAS (INSTALLMENTS) & RECURRING */}
        {activeTab === 3 && (
          <div className="space-y-6 pt-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* COMPRAS EN CUOTAS CARDS */}
              <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Calendario y Amortización de Compras en Cuotas</h3>
                
                <div className="space-y-4">
                  {installments.map(i => {
                    const remaining = i.totalInstallments - i.paidInstallments;
                    const balancePending = remaining * i.monthlyAmount;
                    const finishDate = new Date(i.startDate);
                    finishDate.setMonth(finishDate.getMonth() + remaining);

                    return (
                      <div key={i.id} className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="font-semibold text-zinc-200 text-sm">{i.name}</p>
                          <p className="text-[10px] text-zinc-550 mt-1 uppercase">Cuota {i.paidInstallments}/{i.totalInstallments} • Tarjeta: {i.cardAssociated}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Vencimiento: Día {i.paymentDay} de cada mes</p>
                        </div>

                        <div className="flex gap-6 text-xs text-right items-center">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase">Cuota Mensual</p>
                            <p className="font-semibold text-white">{user.currency}{i.monthlyAmount}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase">Saldo Pendiente</p>
                            <p className="font-semibold text-amber-500">{user.currency}{balancePending.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase">Finalización Est.</p>
                            <p className="font-semibold text-zinc-400">{finishDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}</p>
                          </div>

                          <button
                            onClick={() => {
                              const updated = installments.map(item => {
                                if (item.id === i.id) {
                                  return { ...item, paidInstallments: Math.min(item.totalInstallments, item.paidInstallments + 1) };
                                }
                                return item;
                              });
                              setInstallments(updated);
                            }}
                            className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold uppercase rounded text-[9px] hover:bg-amber-500 text-black hover:text-black transition-colors"
                          >
                            Pagar Cuota
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Form to add Installment */}
                <div className="mt-8 pt-6 border-t border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Registrar Compra Financiada</h4>
                  <form onSubmit={handleAddManualInstallment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Nombre del Gasto</label>
                      <input
                        required
                        type="text"
                        placeholder="Smart TV 55 Inch"
                        value={newInstallment.name}
                        onChange={e => setNewInstallment(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Monto Total</label>
                      <input
                        required
                        type="number"
                        placeholder="1200"
                        value={newInstallment.totalAmount}
                        onChange={e => setNewInstallment(prev => ({...prev, totalAmount: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Cuota Mensual</label>
                      <input
                        required
                        type="number"
                        placeholder="100"
                        value={newInstallment.monthlyAmount}
                        onChange={e => setNewInstallment(prev => ({...prev, monthlyAmount: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Total Cuotas</label>
                      <input
                        required
                        type="number"
                        placeholder="12"
                        value={newInstallment.totalInstallments}
                        onChange={e => setNewInstallment(prev => ({...prev, totalInstallments: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Día de Pago Fijo</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="5"
                        value={newInstallment.paymentDay}
                        onChange={e => setNewInstallment(prev => ({...prev, paymentDay: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full h-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 font-semibold rounded-lg text-xs uppercase cursor-pointer"
                      >
                        Crear Amortización
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* GASTOS RECURRENTES CONTROL */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Compromisos y Gastos Recurrentes</h3>
                  
                  <div className="space-y-4">
                    {recurringExpenses.map(rec => (
                      <div key={rec.id} className="flex justify-between items-center text-xs p-3 bg-zinc-950/40 rounded-xl border border-zinc-85">
                        <div>
                          <p className="font-semibold text-zinc-200">{rec.name}</p>
                          <p className="text-[10px] text-zinc-550">{rec.frequency} • Día {rec.paymentDay}</p>
                        </div>
                        <span className="font-semibold text-zinc-300">{user.currency}{rec.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Registrar Compromiso Mensual</h3>
                  
                  <form onSubmit={handleAddManualRecurring} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Nombre</label>
                      <input
                        required
                        type="text"
                        placeholder="Spotify Premium"
                        value={newRecurring.name}
                        onChange={e => setNewRecurring(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Monto Fijo</label>
                        <input
                          required
                          type="number"
                          placeholder="9.99"
                          value={newRecurring.amount}
                          onChange={e => setNewRecurring(prev => ({...prev, amount: e.target.value}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Día del Mes</label>
                        <input
                          required
                          type="number"
                          min="1"
                          max="31"
                          placeholder="15"
                          value={newRecurring.paymentDay}
                          onChange={e => setNewRecurring(prev => ({...prev, paymentDay: e.target.value}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 font-semibold rounded-lg text-xs uppercase cursor-pointer"
                    >
                      Añadir Recurrencia
                    </button>
                  </form>
                </div>

              </div>

            </div>
                   {/* CONFIGURACIÓN AVANZADA DE MEDIOS Y CATEGORÍAS */}
            {false && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 font-sans">
              
              {/* BANK ACCOUNTS MANAGER BOARD */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 font-sans">Cuentas Bancarias</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Gestión de Saldos Líquidos y Nómina</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                  {bankAccounts.map(ba => {
                    const isEditing = editingBankAccountId === ba.id;
                    return (
                      <div key={ba.id} className="p-3 bg-zinc-950/45 rounded-xl border border-zinc-850 flex flex-col gap-2 transition-all text-xs">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Nombre de la Cuenta</label>
                              <input
                                type="text"
                                value={editingBankAccountData?.name || ''}
                                onChange={e => setEditingBankAccountData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider block mb-1">Saldo Disponible ({user.currency})</label>
                              <input
                                type="number"
                                value={editingBankAccountData?.balance || ''}
                                onChange={e => setEditingBankAccountData(prev => ({ ...prev, balance: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBankAccountId(null);
                                  setEditingBankAccountData(null);
                                }}
                                className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 text-[9px] uppercase font-bold text-zinc-400 rounded-md transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveBankAccountEdit}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-[9px] uppercase font-bold text-black rounded-md flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3 h-3 text-black" /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-zinc-100">{ba.name}</p>
                              <p className="text-[10px] text-zinc-450 mt-0.5">
                                Saldo actual: <span className="font-semibold text-emerald-400 font-mono">{user.currency}{ba.balance?.toLocaleString() || '0'}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditBankAccount(ba)}
                                className="text-zinc-400 hover:text-amber-500 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Editar esta cuenta"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de que deseas eliminar la cuenta "${ba.name}"?`)) {
                                    setBankAccounts(prev => prev.filter(item => item.id !== ba.id));
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Eliminar cuenta bancaria"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {bankAccounts.length === 0 && (
                    <p className="text-xs text-zinc-500 italic py-2 text-center">No hay cuentas bancarias registradas.</p>
                  )}
                </div>

                <form onSubmit={handleAddBankAccount} className="mt-4 pt-4 border-t border-zinc-850 space-y-3">
                  <p className="text-[11px] font-bold text-amber-500/80 uppercase">Añadir nueva cuenta</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Nombre de la Cuenta / Banco</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Banco de América (Ahorros)"
                        value={newBankAccount.name}
                        onChange={e => setNewBankAccount(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Saldo Inicial / Disponible</label>
                      <input
                        required
                        type="number"
                        placeholder="4500"
                        value={newBankAccount.balance}
                        onChange={e => setNewBankAccount(prev => ({...prev, balance: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 font-semibold rounded-lg text-xs uppercase cursor-pointer transition-all"
                  >
                    Registrar Cuenta
                  </button>
                </form>
              </div>

              {/* CREDIT CARDS MANAGER BOARD */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Tarjetas de Crédito</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-sans">Control de Fechas de Corte y Pago</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                  {creditCards.map(c => {
                    const isEditing = editingCreditCardId === c.id;
                    return (
                      <div key={c.id} className="p-3 bg-zinc-950/45 rounded-xl border border-zinc-850 flex flex-col gap-2 transition-all text-xs">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Nombre de la Tarjeta</label>
                              <input
                                type="text"
                                value={editingCreditCardData?.name || ''}
                                onChange={e => setEditingCreditCardData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Día Corte</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={editingCreditCardData?.closingDay || ''}
                                  onChange={e => setEditingCreditCardData(prev => ({ ...prev, closingDay: e.target.value }))}
                                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Día Pago</label>
                                  <input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={editingCreditCardData?.paymentDay || ''}
                                  onChange={e => setEditingCreditCardData(prev => ({ ...prev, paymentDay: e.target.value }))}
                                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Cupo Límite ({user.currency})</label>
                              <input
                                type="number"
                                value={editingCreditCardData?.limit || ''}
                                onChange={e => setEditingCreditCardData(prev => ({ ...prev, limit: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCreditCardId(null);
                                  setEditingCreditCardData(null);
                                }}
                                className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 text-[9px] uppercase font-bold text-zinc-400 rounded-md transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveCreditCardEdit}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-[9px] uppercase font-bold text-black rounded-md flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3 h-3 text-black" /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-zinc-200">{c.name}</p>
                              <p className="text-[10px] text-zinc-450 mt-0.5">
                                Corte: Día {c.closingDay} • Pago: Día {c.paymentDay}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                Límite: <span className="font-semibold text-zinc-350 font-mono">{user.currency}{(c.limit || 0).toLocaleString()}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditCreditCard(c)}
                                className="text-zinc-400 hover:text-amber-500 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Editar esta tarjeta"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de que deseas eliminar la tarjeta de crédito "${c.name}"?`)) {
                                    setCreditCards(prev => prev.filter(item => item.id !== c.id));
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Eliminar tarjeta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {creditCards.length === 0 && (
                    <p className="text-xs text-zinc-500 italic py-2 text-center">No hay tarjetas de crédito registradas.</p>
                  )}
                </div>

                <form onSubmit={handleAddCreditCard} className="mt-4 pt-4 border-t border-zinc-850 space-y-3">
                  <p className="text-[11px] font-bold text-amber-500/80 uppercase">Añadir nueva tarjeta</p>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Nombre de la Tarjeta</label>
                      <input
                        required
                        type="text"
                        placeholder="Tarjeta Gold Visa"
                        value={newCard.name}
                        onChange={e => setNewCard(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Día Corte</label>
                        <input
                          required
                          type="number"
                          min="1"
                          max="31"
                          placeholder="15"
                          value={newCard.closingDay}
                          onChange={e => setNewCard(prev => ({...prev, closingDay: e.target.value}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Día Pago</label>
                        <input
                          required
                          type="number"
                          min="1"
                          max="31"
                          placeholder="5"
                          value={newCard.paymentDay}
                          onChange={e => setNewCard(prev => ({...prev, paymentDay: e.target.value}))}
                          className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Cupo Límite</label>
                      <input
                        required
                        type="number"
                        placeholder="3000"
                        value={newCard.limit}
                        onChange={e => setNewCard(prev => ({...prev, limit: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 font-semibold rounded-lg text-xs uppercase cursor-pointer transition-all"
                  >
                    Registrar Tarjeta
                  </button>
                </form>
              </div>

              {/* DYNAMIC CATEGORIES MANAGER BOARD */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Categorías de Gastos</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Gestor de Clasificación del Sistema</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 text-xs">
                  {categories.map(cat => {
                    const isEditing = editingCategoryName === cat;
                    return (
                      <span 
                        key={cat} 
                        className="px-2 py-1 bg-zinc-950 border border-zinc-850 rounded-xl text-[11px] text-zinc-300 flex items-center gap-1.5 transition-all duration-150"
                      >
                        {isEditing ? (
                          <span className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingCategoryNewValue}
                              onChange={e => setEditingCategoryNewValue(e.target.value)}
                              className="bg-zinc-900 border border-zinc-700 text-[10px] px-1.5 py-0.5 rounded text-white w-20 focus:border-amber-500 focus:outline-none font-sans"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCategoryEdit(cat)}
                              className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold px-0.5 text-xs"
                              title="Guardar nombre"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryName(null);
                                setEditingCategoryNewValue("");
                              }}
                              className="text-zinc-500 hover:text-zinc-300 cursor-pointer font-bold text-xs px-0.5"
                              title="Cancelar"
                            >
                              ×
                            </button>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span 
                              className="cursor-pointer hover:text-amber-500 transition-colors font-medium font-sans"
                              onClick={() => handleStartEditCategory(cat)}
                              title="Haz clic para renombrar"
                            >
                              {cat}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(cat)}
                              className="text-zinc-500 hover:text-amber-500 transition-colors cursor-pointer"
                              title="Renombrar clase"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (['Alimentación', 'Otros', 'Suscripciones', 'Vivienda'].includes(cat)) {
                                  alert("Las categorías del núcleo del sistema no se pueden eliminar.");
                                  return;
                                }
                                if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat}"?`)) {
                                  setCategories(prev => prev.filter(c => c !== cat));
                                }
                              }}
                              className="text-zinc-550 hover:text-red-400 font-bold transition-colors cursor-pointer text-xs"
                              title="Eliminar categoría"
                            >
                              ×
                            </button>
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>

                <form onSubmit={handleAddCategory} className="mt-4 pt-4 border-t border-zinc-850 space-y-3">
                  <p className="text-[11px] font-bold text-amber-500/80 uppercase">Añadir nueva categoría</p>
                  <div>
                    <label className="block text-[10px] text-zinc-500 uppercase mb-1">Nombre de Categoría</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Educación, Seguros, Mascotas"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 font-semibold rounded-lg text-xs uppercase cursor-pointer transition-all"
                  >
                    Guardar Categoría
                  </button>
                </form>
              </div>
            </div>
            )}

          </div>
        )}

        {/* TAB 4: FORECAST, ESCENARIOS & SIMULADOR */}
        {activeTab === 4 && (
          <div className="space-y-6 pt-6">
            
            {/* INTERACTIVE FORECAST SCENARIO PLOTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Prórroga de Flujo & Proyecciones Patrimoniales</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Evolución de Ahorro Neto Compuesto del Patrimonio</p>
                  </div>
                  <div className="flex gap-4 text-[10px] font-semibold tracking-wide">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500"></div> Optimista</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500"></div> Base</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-red-500"></div> Pesimista</div>
                  </div>
                </div>

                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={9} />
                      <YAxis stroke="#71717a" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }} />
                      <Line type="monotone" dataKey="Optimista" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Base" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Pesimista" stroke="#f43f5e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SIMULADOR DE ESCENARIOS INTERACTIVO */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Simulador Patrimonial Inteligente</h3>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Respuestas cognitivas sobre decisiones</p>
                  
                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => runSimulationScenario("¿Qué pasa si aumento mi ahorro mensual un 15%?")}
                      className="w-full text-left p-3 bg-zinc-950/60 hover:bg-zinc-950 rounded-xl border border-zinc-850 hover:border-amber-500/20 text-xs text-zinc-300 flex justify-between items-center transition-colors cursor-pointer"
                    >
                      <span>¿Qué pasa si aumento mi ahorro un 15%?</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    </button>

                    <button
                      onClick={() => runSimulationScenario("¿Qué pasa si cancelo Netflix y Spotify?")}
                      className="w-full text-left p-3 bg-zinc-950/60 hover:bg-zinc-950 rounded-xl border border-zinc-850 hover:border-amber-500/20 text-xs text-zinc-300 flex justify-between items-center transition-colors cursor-pointer"
                    >
                      <span>¿Qué pasa si cancelo Netflix y Spotify?</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    </button>

                    <button
                      onClick={() => runSimulationScenario("¿Qué ocurre si compro un vehículo de $15,000 en 36 cuotas?")}
                      className="w-full text-left p-3 bg-zinc-950/60 hover:bg-zinc-950 rounded-xl border border-zinc-850 hover:border-amber-500/20 text-xs text-zinc-300 flex justify-between items-center transition-colors cursor-pointer"
                    >
                      <span>¿Qué ocurre si compro un vehículo ($15k)?</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Simula tu propio escenario..."
                      value={customSimulatorInput}
                      onChange={e => setCustomSimulatorInput(e.target.value)}
                      className="flex-1 bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-zinc-200"
                    />
                    <button
                      onClick={() => {
                        if (customSimulatorInput.trim()) {
                          runSimulationScenario(customSimulatorInput);
                          setCustomSimulatorInput("");
                        }
                      }}
                      className="px-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* SIMULATION STATEMENT DISPLAY */}
            {isSimulatorLoading && (
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-center py-10">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">La IA está recalculando tu patrimonio neto proyectado y plan de amortización...</p>
              </div>
            )}

            {!isSimulatorLoading && simulatorResponse && (
              <div className="bg-gradient-to-r from-[#111115] to-[#16161b] border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">
                  <Sparkles className="w-5 h-5 animate-bounce" />
                  <span>Resultado del Simulador de Dinámica Financiera:</span>
                </div>
                
                <div className="prose prose-invert prose-xs text-xs text-zinc-350 leading-relaxed space-y-2">
                  {simulatorResponse.split('\n').map((para, i) => {
                    if (para.startsWith('###')) {
                      return <h4 key={i} className="text-xs font-bold text-white uppercase mt-4">{para.replace('###', '')}</h4>;
                    }
                    if (para.startsWith('*')) {
                      return <li key={i} className="ml-4 list-disc text-zinc-400">{para.replace('*', '')}</li>;
                    }
                    return <p key={i}>{para}</p>;
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: CALENDARIO FINANCIERO */}
        {activeTab === 5 && (
          <div className="space-y-6 pt-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Calendario de Dinámica Diaria de Caja</h3>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Control de Vencimientos y Saldo Proyectado Día a Día</p>
              </div>
              <CalendarDays className="w-5 h-5 text-zinc-500" />
            </div>

            {/* CALENDAR MONTH GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {calendarItems.map(item => {
                const isWarning = item.projectedBalance < 500;
                return (
                  <div key={item.day} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col justify-between hover:border-amber-500/10 transition-colors h-28 overflow-hidden">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                      <span>Día {item.day}</span>
                      <span className={isWarning ? "text-amber-500" : "text-emerald-450"}>
                        {user.currency}{item.projectedBalance.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto mt-2 space-y-1">
                      {item.items.map((sub: any, idx: number) => (
                        <div key={idx} className={`text-[8px] px-1 py-0.5 rounded truncate ${sub.type === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`} title={sub.name}>
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-[10px] text-zinc-500">
              <Info className="w-4 h-4 text-zinc-450 shrink-0" />
              <span>El calendario calcula la dinámica de balance asumiendo un fondo líquido inicial ordinario. Úsalo para planificar egresos de deudas.</span>
            </div>
          </div>
        )}

        {/* TAB 6: CONFIGURACIÓN GENERAL, PERFIL, MEDIOS DE PAGO, TARJETAS, CATEGORIAS */}
        {activeTab === 6 && (
          <div className="space-y-6 pt-6 font-sans">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500 animate-spin-slow" /> Configuración General del Sistema
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Personaliza los parámetros base de tu planificador financiero, agrega cuentas de liquidación, gestiona tarjetas de crédito, cupos y categorías.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* PERFIL GENERAL / PARAMETROS */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Parámetros del Perfil</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5 animate-pulse">Ajustes Base y Moneda</p>
                  </div>
                  <Settings className="w-4 h-4 text-zinc-500" />
                </div>

                <form onSubmit={handleUpdateUserSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">Nombre Completo</label>
                    <input
                      required
                      type="text"
                      name="userName"
                      defaultValue={user.name}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">País</label>
                      <input
                        required
                        type="text"
                        name="country"
                        defaultValue={user.country}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">Moneda Local</label>
                      <select
                        name="currency"
                        defaultValue={user.currency}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs px-1 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="$">$ (Pesos / USD / Símbolo General)</option>
                        <option value="€">€ (Euro)</option>
                        <option value="¥">¥ (Yen / Yuan)</option>
                        <option value="£">£ (Libra Esterlina)</option>
                        <option value="S/.">S/. (Sol Peruano)</option>
                        <option value="Bs.">Bs. (Boliviano/Bolívar)</option>
                        <option value="UF">UF (Unidad de Fomento)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">Sueldo / Ingreso Neto</label>
                      <input
                        required
                        type="number"
                        name="salary"
                        defaultValue={user.salary}
                        className="w-full bg-zinc-950 border border-zinc-800 font-mono text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">Frecuencia de Pago</label>
                      <select
                        name="paymentFrequency"
                        defaultValue={user.paymentFrequency}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs px-1.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="Mensual">Mensual</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Semanal">Semanal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">% Meta de Ahorro</label>
                      <input
                        required
                        type="number"
                        min="1"
                        max="100"
                        name="savingsGoalPct"
                        defaultValue={user.savingsGoalPct}
                        className="w-full bg-zinc-950 border border-zinc-800 font-mono text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">Meses Fondo Emergencia</label>
                      <input
                        required
                        type="number"
                        min="1"
                        max="24"
                        name="desiredEmergencyFundMonths"
                        defaultValue={user.desiredEmergencyFundMonths}
                        className="w-full bg-zinc-950 border border-zinc-800 font-mono text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs uppercase cursor-pointer transition-all mt-2"
                  >
                    Guardar Ajustes de Perfil
                  </button>
                </form>
              </div>

              {/* BANK ACCOUNTS CONTROL */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Cuentas Bancarias</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Saldos Líquidos y Efectivo</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-zinc-500 animate-pulse" />
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {bankAccounts.map(ba => {
                    const isEditing = editingBankAccountId === ba.id;
                    return (
                      <div key={ba.id} className="p-3 bg-zinc-950/45 rounded-xl border border-zinc-850 flex flex-col gap-2 transition-all text-xs">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Nombre de la Cuenta</label>
                              <input
                                type="text"
                                value={editingBankAccountData?.name || ''}
                                onChange={e => setEditingBankAccountData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider block mb-1">Saldo Disponible ({user.currency})</label>
                              <input
                                type="number"
                                value={editingBankAccountData?.balance || ''}
                                onChange={e => setEditingBankAccountData(prev => ({ ...prev, balance: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBankAccountId(null);
                                  setEditingBankAccountData(null);
                                }}
                                className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 text-[9px] uppercase font-bold text-zinc-400 rounded-md transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveBankAccountEdit}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-[9px] uppercase font-bold text-black rounded-md flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3 h-3 text-black" /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-zinc-100">{ba.name}</p>
                              <p className="text-[10px] text-zinc-450 mt-0.5">
                                Saldo actual: <span className="font-semibold text-emerald-450 font-mono">{user.currency}{ba.balance?.toLocaleString() || '0'}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditBankAccount(ba)}
                                className="text-zinc-400 hover:text-amber-500 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Editar esta cuenta"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de que deseas eliminar la cuenta "${ba.name}"?`)) {
                                    setBankAccounts(prev => prev.filter(item => item.id !== ba.id));
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Eliminar cuenta bancaria"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {bankAccounts.length === 0 && (
                    <p className="text-xs text-zinc-500 italic py-2 text-center font-sans">No hay cuentas bancarias registradas.</p>
                  )}
                </div>

                <form onSubmit={handleAddBankAccount} className="mt-4 pt-4 border-t border-zinc-850 space-y-3 font-sans">
                  <p className="text-[11px] font-bold text-amber-500/80 uppercase">Añadir nueva cuenta</p>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">Nombre de la Cuenta / Efectivo</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Cuenta de Ahorro, Efectivo"
                        value={newBankAccount.name}
                        onChange={e => setNewBankAccount(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-450 uppercase mb-1">Saldo Líquido Disponible</label>
                      <input
                        required
                        type="number"
                        placeholder="3500"
                        value={newBankAccount.balance}
                        onChange={e => setNewBankAccount(prev => ({...prev, balance: e.target.value}))}
                        className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 font-semibold rounded-lg text-xs uppercase cursor-pointer transition-all"
                  >
                    Registrar Cuenta
                  </button>
                </form>
              </div>

              {/* DYNAMIC CATEGORIES MANAGER BOARD */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Categorías de Gastos</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Clasificación del Sistema</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 text-xs">
                  {categories.map(cat => {
                    const isEditing = editingCategoryName === cat;
                    return (
                      <span 
                        key={cat} 
                        className="px-2 py-1 bg-zinc-950 border border-zinc-855 rounded-xl text-[11px] text-zinc-300 flex items-center gap-1.5 transition-all duration-150"
                      >
                        {isEditing ? (
                          <span className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingCategoryNewValue}
                              onChange={e => setEditingCategoryNewValue(e.target.value)}
                              className="bg-zinc-900 border border-zinc-700 text-[10px] px-1.5 py-0.5 rounded text-white w-20 focus:border-amber-500 focus:outline-none font-sans"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCategoryEdit(cat)}
                              className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold px-0.5 text-xs"
                              title="Guardar nombre"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryName(null);
                                setEditingCategoryNewValue("");
                              }}
                              className="text-zinc-500 hover:text-zinc-300 cursor-pointer font-bold text-xs px-0.5"
                              title="Cancelar"
                            >
                              ×
                            </button>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span 
                              className="cursor-pointer hover:text-amber-500 transition-colors font-medium font-sans"
                              onClick={() => handleStartEditCategory(cat)}
                              title="Haz clic para renombrar"
                            >
                              {cat}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(cat)}
                              className="text-zinc-500 hover:text-amber-500 transition-colors cursor-pointer"
                              title="Renombrar clase"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (['Alimentación', 'Otros', 'Suscripciones', 'Vivienda'].includes(cat)) {
                                  alert("Las categorías del núcleo del sistema no se pueden eliminar.");
                                  return;
                                }
                                if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat}"?`)) {
                                  setCategories(prev => prev.filter(c => c !== cat));
                                }
                              }}
                              className="text-zinc-500 hover:text-red-400 font-bold transition-colors cursor-pointer text-xs"
                              title="Eliminar categoría"
                            >
                              ×
                            </button>
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>

                <form onSubmit={handleAddCategory} className="mt-4 pt-4 border-t border-zinc-850 space-y-3 font-sans">
                  <p className="text-[11px] font-bold text-amber-500/80 uppercase">Añadir nueva categoría</p>
                  <div className="text-xs">
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">Nombre de Categoría</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Educación, Seguros, Mascotas"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 font-semibold rounded-lg text-xs uppercase cursor-pointer transition-all"
                  >
                    Guardar Categoría
                  </button>
                </form>
              </div>
            </div>

            {/* SECOND GRID ROW: CREDIT CARDS & PAYMENT METHODS CONFIGURATION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* CREDIT CARDS CONTROL BOARD */}
              <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 animate-pulse">Tarjetas de Crédito</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-sans">Control de Fechas de Corte y Límites de Crédito</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {creditCards.map(c => {
                    const isEditing = editingCreditCardId === c.id;
                    return (
                      <div key={c.id} className="p-3 bg-zinc-950/45 rounded-xl border border-zinc-800/80 flex flex-col gap-2 transition-all text-xs">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Nombre de la Tarjeta</label>
                              <input
                                type="text"
                                value={editingCreditCardData?.name || ''}
                                onChange={e => setEditingCreditCardData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Día Corte</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={editingCreditCardData?.closingDay || ''}
                                  onChange={e => setEditingCreditCardData(prev => ({ ...prev, closingDay: e.target.value }))}
                                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider block mb-1">Día Pago</label>
                                  <input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={editingCreditCardData?.paymentDay || ''}
                                  onChange={e => setEditingCreditCardData(prev => ({ ...prev, paymentDay: e.target.value }))}
                                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider block mb-1">Cupo Límite ({user.currency})</label>
                              <input
                                type="number"
                                value={editingCreditCardData?.limit || ''}
                                onChange={e => setEditingCreditCardData(prev => ({ ...prev, limit: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCreditCardId(null);
                                  setEditingCreditCardData(null);
                                }}
                                className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 text-[9px] uppercase font-bold text-zinc-400 rounded-md transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveCreditCardEdit}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-[9px] uppercase font-bold text-black rounded-md flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3 h-3 text-black" /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-zinc-200">{c.name}</p>
                              <p className="text-[10px] text-zinc-450 mt-0.5">
                                Corte: Día {c.closingDay} • Pago: Día {c.paymentDay}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                Cupo Límite: <span className="font-semibold text-zinc-350 font-mono text-amber-500">{user.currency}{(c.limit || 0).toLocaleString()}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditCreditCard(c)}
                                className="text-zinc-400 hover:text-amber-500 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Editar esta tarjeta"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de que deseas eliminar la tarjeta de crédito "${c.name}"?`)) {
                                    setCreditCards(prev => prev.filter(item => item.id !== c.id));
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer rounded-lg hover:bg-zinc-850/60 transition-colors"
                                title="Eliminar tarjeta"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {creditCards.length === 0 && (
                    <p className="text-xs text-zinc-500 italic py-2 text-center">No hay tarjetas de crédito registradas.</p>
                  )}
                </div>

                <form onSubmit={handleAddCreditCard} className="mt-4 pt-4 border-t border-zinc-850 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-sans">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">Nombre / Banco</label>
                    <input
                      required
                      type="text"
                      placeholder="Tarjeta Visa Platinum"
                      value={newCard.name}
                      onChange={e => setNewCard(prev => ({...prev, name: e.target.value}))}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">Día Corte</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      value={newCard.closingDay || ''}
                      onChange={e => setNewCard(prev => ({...prev, closingDay: e.target.value}))}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">Día Pago</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="31"
                      placeholder="5"
                      value={newCard.paymentDay || ''}
                      onChange={e => setNewCard(prev => ({...prev, paymentDay: e.target.value}))}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">Cupo Límite</label>
                    <input
                      required
                      type="number"
                      placeholder="3000"
                      value={newCard.limit || ''}
                      onChange={e => setNewCard(prev => ({...prev, limit: e.target.value}))}
                      className="w-full bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                  <div className="md:col-span-4 mt-1">
                    <button
                      type="submit"
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 font-semibold rounded-lg text-xs uppercase cursor-pointer transition-all"
                    >
                      Añadir Tarjeta de Crédito
                    </button>
                  </div>
                </form>
              </div>

              {/* MEDIOS DE PAGO EXTRA TIPS */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2">Información y Control de Medios</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Configurar correctamente los <strong>Días de Corte</strong> y <strong>Días de Pago</strong> permite al sistema de proyección asimilar exactamente cuándo vencerán tus obligaciones.
                  </p>
                  <ul className="text-[11px] text-zinc-500 space-y-2 mt-4">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></div>
                      <span><strong>Día de Corte</strong>: Cierre del ciclo de compras de tu TDC de cada mes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></div>
                      <span><strong>Día de Pago</strong>: Fecha límite mensual para amortizar el saldo de la TDC.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></div>
                      <span><strong>Saldos Líquidos</strong>: Tu saldo disponible en efectivo o cuentas de nómina.</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-zinc-800/60 text-center text-zinc-500 text-[10px] mt-4 lg:mt-0 font-mono">
                  SISTEMA PARÁMETROS V1.2 • AI STUDIO BUILD
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FLOATABLE ASSISTANT DRAWER PANEL */}
      {isChatOpen && (
        <aside className="w-full md:w-80 bg-[#09090b] border-t md:border-t-0 md:border-l border-zinc-850 flex flex-col h-auto md:h-screen shrink-0">
          
          <div className="p-4 border-b border-zinc-850 flex justify-between items-center bg-[#101013]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
              <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase">Asistente AI FPM</span>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-zinc-500 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHAT MESSAGES PANEL */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[350px] md:max-h-[calc(100vh-140px)]">
            {chatMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                  msg.sender === 'user' 
                    ? 'bg-zinc-800 text-zinc-100 ml-auto rounded-tr-none' 
                    : 'bg-zinc-900 border border-zinc-850 text-zinc-300 mr-auto rounded-tl-none relative before:absolute before:top-2 before:-left-1.5 before:bg-zinc-900 before:w-3 before:h-3 before:rotate-45 before:border-l before:border-b before:border-zinc-850'
                }`}
              >
                {/* Process lists / titles from narrative responses beautifully */}
                <div className="space-y-1">
                  {msg.text.split('\n').map((line, key) => (
                    <p key={key}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 italic p-3">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                El asistente está analizando tus estados de cuenta...
              </div>
            )}
          </div>

          {/* QUICK PROMPTS FOR HIGH FIDELITY CHATS */}
          <div className="p-3 bg-zinc-950/80 border-t border-zinc-850 space-y-1.5">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Consultas Rápidas:</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  setChatInput("¿Cómo puedo construir mi fondo de emergencia más rápido?");
                }}
                className="text-[9px] px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-820 rounded-full whitespace-nowrap cursor-pointer hover:text-amber-500"
              >
                Fondo emergencia
              </button>
              <button
                onClick={() => {
                  setChatInput("¿Qué gastos recurrentes tengo y cómo los reduzco?");
                }}
                className="text-[9px] px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-820 rounded-full whitespace-nowrap cursor-pointer hover:text-amber-500"
              >
                Gastos recurrentes
              </button>
              <button
                onClick={() => {
                  setChatInput("¿Cuál es mi patrimonio neto proyectado a un año?");
                }}
                className="text-[9px] px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-820 rounded-full whitespace-nowrap cursor-pointer hover:text-amber-500"
              >
                Metas a un año
              </button>
            </div>
          </div>

          {/* CHAT INPUT AREA */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-850">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Preguntar a la IA..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendChatMessage();
                }}
                className="flex-1 bg-zinc-950 text-xs border border-zinc-805 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-550 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSendChatMessage}
                className="p-2 bg-amber-500 text-black hover:bg-amber-400 font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </aside>
      )}

    </div>
  );
}
