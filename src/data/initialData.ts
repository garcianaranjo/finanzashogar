export type Account = 'Santander de Juan' | 'CaixaBank de Juan' | 'Santander de Sara';
export type Card = 'Tarjeta Crédito Santander' | 'Tarjeta de Crédito Iberia Cards ICON' | 'Tarjeta Carrefour' | 'Tarjeta El Corte Inglés';
export type Timing = 'Inicio del mes' | 'Antes de quincena' | 'Después de quincena' | 'Final del mes';
export type Frequency = 'Mensual' | '14 Pagas' | 'Bimestral' | 'Trimestral' | '10 Meses' | 'Variable';
export type ExpenseType = 'Transferencia' | 'Débito' | '-';

export type IncomeCategory = 'Cuenta Ajena de Juan' | 'Autónomo de Juan' | 'Cuenta Ajena de Sara' | 'Otros';
export type ExpenseCategory = 'Vivienda y Suministros' | 'Hijos y Educación' | 'Cargos Profesionales' | 'Seguros' | 'Deudas y Préstamos' | 'Otros';
export type CardCategory = 'Ordinarios' | 'Créditos' | 'Suscripciones';

export interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  account: Account;
  category: IncomeCategory;
  notes: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  timing: Timing;
  type: ExpenseType;
  account: Account;
  category: ExpenseCategory;
  endDate?: string;
  notes: string;
  isDerived?: boolean;
  dependencyId?: string; // ID of the income it depends on (for Diezmo)
  dependencyPercentage?: number; // e.g., 10 for 10%
}

export interface CardExpense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  timing: Timing;
  card: Card;
  category: CardCategory;
  endDate?: string;
  notes: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  card: Card;
  category: CardCategory;
}

export interface MonthlyActual {
  id: string; // incomeId or expenseId or cardExpenseId
  amount: number;
}

export interface MonthlyRecord {
  month: number; // 0-11
  year: number;
  incomeActuals: Record<string, number>;
  expenseActuals: Record<string, number>;
  cardExpenseActuals: Record<string, number>;
  cardPaymentActuals?: Record<string, number>;
  startingBalances?: Record<string, number>;
}

export const initialIncomes: Income[] = [
  { id: 'i1', name: 'Nómina Hospital Pascual', amount: 3000, frequency: '14 Pagas', account: 'Santander de Juan', category: 'Cuenta Ajena de Juan', notes: 'Contrato indefinido' },
  { id: 'i4', name: 'Facturación Otosur', amount: 1500, frequency: 'Mensual', account: 'CaixaBank de Juan', category: 'Autónomo de Juan', notes: 'Promedio, descontado IRPF' },
  { id: 'i5', name: 'Asesoramiento Audiológico', amount: 1800, frequency: 'Variable', account: 'CaixaBank de Juan', category: 'Autónomo de Juan', notes: '1200€ a 2400€, 4 veces al año' },
  { id: 'i6', name: 'Nómina Distrito de Educación', amount: 2100, frequency: '14 Pagas', account: 'Santander de Sara', category: 'Cuenta Ajena de Sara', notes: 'Contrato 3 años' },
  { id: 'i7', name: 'Ahorro/Otros', amount: 0, frequency: 'Variable', account: 'Santander de Juan', category: 'Otros', notes: 'Aportación extra' },
];

export const initialExpenses: Expense[] = [
  { id: 'e1', name: 'Diezmo de nómina de Juan', amount: 300, frequency: 'Mensual', timing: 'Inicio del mes', type: 'Transferencia', account: 'Santander de Juan', category: 'Otros', notes: '10% del ingreso', dependencyId: 'i1', dependencyPercentage: 10 },
  { id: 'e2', name: 'Arriendo', amount: 850, frequency: 'Mensual', timing: 'Inicio del mes', type: 'Transferencia', account: 'Santander de Juan', category: 'Vivienda y Suministros', notes: 'Fijo mensual' },
  { id: 'e3', name: 'Parking', amount: 85, frequency: 'Mensual', timing: 'Inicio del mes', type: 'Transferencia', account: 'Santander de Juan', category: 'Vivienda y Suministros', notes: 'Fijo mensual' },
  { id: 'e4', name: 'Agua', amount: 80, frequency: 'Bimestral', timing: 'Inicio del mes', type: 'Transferencia', account: 'Santander de Juan', category: 'Vivienda y Suministros', notes: 'Enero, marzo, etc.' },
  { id: 'e5', name: 'Luz y Gas', amount: 80, frequency: 'Mensual', timing: 'Inicio del mes', type: 'Transferencia', account: 'Santander de Juan', category: 'Vivienda y Suministros', notes: 'Fijo mensual' },
  { id: 'e6', name: 'Internet', amount: 55, frequency: 'Mensual', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Juan', category: 'Vivienda y Suministros', notes: 'Fijo mensual' },
  { id: 'e7', name: 'AONES', amount: 360, frequency: '10 Meses', timing: 'Después de quincena', type: 'Débito', account: 'Santander de Juan', category: 'Hijos y Educación', notes: 'Libre julio y agosto' },
  { id: 'e8', name: 'Algorithmics', amount: 70, frequency: '10 Meses', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Juan', category: 'Hijos y Educación', notes: 'Libre julio y agosto' },
  { id: 'e9', name: 'Qashqai', amount: 275, frequency: 'Mensual', timing: 'Después de quincena', type: 'Débito', account: 'Santander de Juan', category: 'Deudas y Préstamos', endDate: '2027-09-20', notes: 'Última cuota: 20/09/2027' },
  { id: 'e10', name: 'Juke', amount: 245, frequency: 'Mensual', timing: 'Después de quincena', type: 'Débito', account: 'Santander de Juan', category: 'Deudas y Préstamos', endDate: '2029-01-20', notes: 'Última cuota: 20/01/2029' },
  { id: 'e11', name: 'Diezmo de Facturas de Juan', amount: 150, frequency: 'Mensual', timing: 'Inicio del mes', type: 'Transferencia', account: 'CaixaBank de Juan', category: 'Otros', notes: '10% del ingreso', dependencyId: 'i4', dependencyPercentage: 10 },
  { id: 'e12', name: 'Mutual Médica', amount: 340, frequency: 'Mensual', timing: 'Antes de quincena', type: 'Débito', account: 'CaixaBank de Juan', category: 'Seguros', notes: 'Fijo mensual' },
  { id: 'e13', name: 'Uniteco', amount: 375, frequency: 'Trimestral', timing: 'Antes de quincena', type: 'Débito', account: 'CaixaBank de Juan', category: 'Seguros', notes: 'Enero, abril, etc.' },
  { id: 'e14', name: 'Colegio de Médicos (Juan)', amount: 90, frequency: 'Trimestral', timing: 'Antes de quincena', type: 'Débito', account: 'CaixaBank de Juan', category: 'Cargos Profesionales', notes: 'Enero, abril, etc.' },
  { id: 'e15', name: 'Seguro de Qashqai', amount: 80, frequency: 'Mensual', timing: 'Antes de quincena', type: 'Débito', account: 'CaixaBank de Juan', category: 'Seguros', notes: 'Fijo mensual' },
  { id: 'e16', name: 'Diezmo de nómina de Sara', amount: 210, frequency: 'Mensual', timing: 'Inicio del mes', type: 'Transferencia', account: 'Santander de Sara', category: 'Otros', notes: '10% del ingreso', dependencyId: 'i6', dependencyPercentage: 10 },
  { id: 'e17', name: 'Colegio de Médicos (Sara)', amount: 90, frequency: 'Trimestral', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Sara', category: 'Cargos Profesionales', notes: 'Enero, abril, etc.' },
  { id: 'e18', name: 'Aula', amount: 35, frequency: '10 Meses', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Sara', category: 'Hijos y Educación', notes: 'Libre julio y agosto' },
  { id: 'e19', name: 'Comedor', amount: 210, frequency: '10 Meses', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Sara', category: 'Hijos y Educación', notes: 'Libre julio y agosto' },
  { id: 'e20', name: 'Aspromin', amount: 195, frequency: '10 Meses', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Sara', category: 'Hijos y Educación', notes: 'Libre julio y agosto' },
  { id: 'e21', name: 'Préstamo para audífonos de JK', amount: 115, frequency: 'Mensual', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Sara', category: 'Deudas y Préstamos', endDate: '2026-06-10', notes: 'Última cuota: 10/06/2026' },
  { id: 'e22', name: 'Préstamo para cirugía de Martín', amount: 355, frequency: 'Mensual', timing: 'Antes de quincena', type: 'Débito', account: 'Santander de Sara', category: 'Deudas y Préstamos', endDate: '2036-03-10', notes: 'Última cuota: 10/03/2036' },
  { id: 'e23', name: 'Ofrendas', amount: 0, frequency: 'Variable', timing: 'Inicio del mes', type: 'Transferencia', account: 'Santander de Juan', category: 'Otros', notes: 'Ofrendas voluntarias' },
];

export const initialCardExpenses: CardExpense[] = [
  { id: 'ce1', name: 'Mantenimiento de tarjeta', amount: 10, frequency: 'Mensual', timing: 'Antes de quincena', card: 'Tarjeta de Crédito Iberia Cards ICON', category: 'Ordinarios', notes: 'Fijo mensual' },
  { id: 'ce2', name: 'Gasolina de Qashqai', amount: 240, frequency: 'Mensual', timing: 'Antes de quincena', card: 'Tarjeta de Crédito Iberia Cards ICON', category: 'Ordinarios', notes: 'Fijo mensual' },
  { id: 'ce3', name: 'Gasolina de Juke', amount: 180, frequency: 'Mensual', timing: 'Antes de quincena', card: 'Tarjeta de Crédito Iberia Cards ICON', category: 'Ordinarios', notes: 'Fijo mensual' },
  { id: 'ce4', name: 'Mantenimiento de tarjeta', amount: 5, frequency: 'Mensual', timing: 'Antes de quincena', card: 'Tarjeta Crédito Santander', category: 'Ordinarios', notes: 'Fijo mensual' },
  { id: 'ce5', name: 'Aspiradora', amount: 85, frequency: 'Mensual', timing: 'Antes de quincena', card: 'Tarjeta Crédito Santander', category: 'Créditos', endDate: '2026-06-24', notes: 'Última cuota: 24/06/2026' },
  { id: 'ce6', name: 'Hospital Ruber', amount: 525, frequency: 'Mensual', timing: 'Antes de quincena', card: 'Tarjeta Crédito Santander', category: 'Créditos', endDate: '2026-06-24', notes: 'Última cuota: 24/06/2026' },
];

export const initialSubscriptions: Subscription[] = [
  { id: 's1', name: 'Netflix', amount: 15, card: 'Tarjeta Crédito Santander', category: 'Suscripciones' },
  { id: 's2', name: 'Spotify', amount: 10, card: 'Tarjeta Crédito Santander', category: 'Suscripciones' },
  { id: 's3', name: 'Amazon Prime', amount: 5, card: 'Tarjeta Crédito Santander', category: 'Suscripciones' },
  { id: 's4', name: 'Gimnasio', amount: 20, card: 'Tarjeta Crédito Santander', category: 'Suscripciones' },
];
