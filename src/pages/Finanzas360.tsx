import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller, Control, useWatch } from 'react-hook-form';
import * as z from 'zod';
import clsx from 'clsx';
import { LayoutDashboard, User, Landmark, Briefcase, BarChart3, ShieldCheck, TrendingUp, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Estilos y Componentes de UI ---
const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
const cardClass = "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md";
const inputClassSm = "w-full px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

// --- Definiciones de Datos y Esquemas (Como en el Excel) ---

// Ingresos
const incomeCategories = ["Sueldo", "Honorarios", "Comisiones", "Intereses", "Dividendos", "Rentas", "Regalías", "Otros"] as const;
type IncomeEntry = { name: typeof incomeCategories[number]; monthly: number; taxRate: number; annualIncrease: number; };

// Gastos
const expenseSuperCategories = ["Vivienda", "Transporte", "Alimentación", "Educación", "Gastos Personales", "Seguros"] as const;
type ExpenseEntry = {
  id: string;
  category: typeof expenseSuperCategories[number];
  name: string;
  monthly: number;
};

// Activos y Pasivos
const assetSuperCategories = ["Efectivo", "Cuentas para Retiro", "Joyeria/Commodities", "Acciones/Bonos", "Arte Fino", "Otros"] as const;
const liabilitySuperCategories = ["Hipotecas", "Tarjetas de Crédito", "Créditos Automotrices", "Impuestos no pagados", "Otros"] as const;

type AssetEntry = { id: string; category: typeof assetSuperCategories[number]; name: string; value: number; };
type LiabilityEntry = { id: string; category: typeof liabilitySuperCategories[number]; name: string; amount: number; };

// Inversiones
const investmentSuperCategories = ["Acciones Públicas y Privadas", "Commodities", "Deuda Pública y Privada", "Bienes Raíces de Inversión", "Otro"] as const;
type InvestmentEntry = {
  id: string;
  category: typeof investmentSuperCategories[number];
  description: string;
  purchasePrice: number;
  purchaseYear: number;
  marketValue: number;
};

// Seguros
type InsuranceEntry = {
  id: string;
  name: string;
  deathBenefit: number;
  disabilityBenefit: number;
  cashValue: number;
  endDate: string;
};

// Definición del tipo de todo el formulario
type FinanceFormData = {
  assumptions: { inflation: number; exchangeRate: number; goldPrice: number; };
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  investments: InvestmentEntry[];
  insurance: InsuranceEntry[];
  // ... otros tipos de datos se añadirán aquí
};

// --- Módulos de Pestaña Rediseñados ---

// Módulo de Primas Vendidas (antes Ingresos)
const SalesModule = ({ control }: { control: Control<FinanceFormData> }) => {
  const { fields } = useFieldArray({ control, name: "incomes" });
  const watchedIncomes = useWatch({ control, name: "incomes" });
  const chartData = useMemo(() => watchedIncomes.filter(i => i.monthly > 0).map(i => ({ name: i.name, value: i.monthly })), [watchedIncomes]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Fuentes de Primas Vendidas</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th>Nombre</th>
              <th>Mensual</th>
              <th>Tasa Imp. (%)</th>
              <th>Incre. Anual (%)</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id}>
                <td className="py-1 pr-2 font-medium">{field.name}</td>
                <td className="p-1"><Controller name={`incomes.${index}.monthly`} control={control} render={({ field }) => <input type="number" {...field} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />} /></td>
                <td className="p-1"><Controller name={`incomes.${index}.taxRate`} control={control} render={({ field }) => <input type="number" {...field} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />} /></td>
                <td className="p-1"><Controller name={`incomes.${index}.annualIncrease`} control={control} render={({ field }) => <input type="number" {...field} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Distribución de Primas Vendidas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Módulo de Gastos
const ExpensesModule = ({ control, watchedExpenses }: { control: Control<FinanceFormData>, watchedExpenses: ExpenseEntry[] }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "expenses" });

  const expensesByCategory = useMemo(() => {
    const grouped: { [key: string]: number[] } = {};
    fields.forEach((field, index) => {
      if (!grouped[field.category]) {
        grouped[field.category] = [];
      }
      grouped[field.category].push(index);
    });
    return grouped;
  }, [fields]);
  
  const chartData = useMemo(() => 
      expenseSuperCategories.map(cat => ({
          name: cat,
          value: watchedExpenses
              .filter((exp: ExpenseEntry) => exp.category === cat)
              .reduce((sum: number, exp: ExpenseEntry) => sum + exp.monthly, 0)
      })).filter(item => item.value > 0)
  , [watchedExpenses]);

  const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8', '#82ca9d'];
  
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseCat, setNewExpenseCat] = useState<typeof expenseSuperCategories[number]>("Vivienda");

  const addExpense = (category: typeof expenseSuperCategories[number]) => {
      append({ id: new Date().toISOString(), category, name: 'Nuevo Gasto', monthly: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {expenseSuperCategories.map(category => (
          <div key={category} className={cardClass}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{category}</h3>
              <button onClick={() => addExpense(category)} className="text-sm button-primary-small">+</button>
            </div>
            <table className="w-full">
              <tbody>
                {(expensesByCategory[category] || []).map(index => (
                  <tr key={fields[index].id}>
                    <td className="p-1 w-2/3"><Controller name={`expenses.${index}.name`} control={control} render={({ field }) => <input {...field} className={inputClass} />} /></td>
                    <td className="p-1 w-1/3"><Controller name={`expenses.${index}.monthly`} control={control} render={({ field }) => <input type="number" {...field} className={inputClass} />} /></td>
                    <td className="p-1"><button onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className={cardClass}>
        <h3 className="text-xl font-bold mb-4">Concentración de Gastos</h3>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Secciones específicas para Balance ---
const AssetsSection = ({ control }: { control: Control<FinanceFormData> }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "assets" });
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-green-500">Activos</h3>
      {assetSuperCategories.map(category => (
        <div key={category} className={cardClass}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">{category}</h4>
            <button onClick={() => append({ id: new Date().toISOString(), category, name: 'Nuevo Activo', value: 0 })} className="button-primary-small">+</button>
          </div>
          {fields.map((field, index) => field.category === category && (
            <div key={field.id} className="flex gap-2 mb-2 items-center">
              <Controller name={`assets.${index}.name`} control={control} render={({ field }) => <input {...field} className={inputClass} />} />
              <Controller name={`assets.${index}.value`} control={control} render={({ field }) => <input type="number" {...field} className={inputClass} />} />
              <button onClick={() => remove(index)}><Trash2 className="w-4 h-4 text-red-500"/></button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const LiabilitiesSection = ({ control }: { control: Control<FinanceFormData> }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "liabilities" });
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-red-500">Pasivos</h3>
      {liabilitySuperCategories.map(category => (
        <div key={category} className={cardClass}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">{category}</h4>
            <button onClick={() => append({ id: new Date().toISOString(), category, name: 'Nuevo Pasivo', amount: 0 })} className="button-primary-small">+</button>
          </div>
          {fields.map((field, index) => field.category === category && (
            <div key={field.id} className="flex gap-2 mb-2 items-center">
              <Controller name={`liabilities.${index}.name`} control={control} render={({ field }) => <input {...field} className={inputClass} />} />
              <Controller name={`liabilities.${index}.amount`} control={control} render={({ field }) => <input type="number" {...field} className={inputClass} />} />
              <button onClick={() => remove(index)}><Trash2 className="w-4 h-4 text-red-500"/></button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Módulo de Balance
const BalanceSheetModule = ({ control, watchedAssets, watchedLiabilities }: { control: Control<FinanceFormData>, watchedAssets: AssetEntry[], watchedLiabilities: LiabilityEntry[] }) => {
  const totalAssets = watchedAssets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = watchedLiabilities.reduce((sum, liab) => sum + liab.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const chartData = watchedAssets.filter(a => a.value > 0).map(a => ({ name: a.name, value: a.value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <AssetsSection control={control} />
        <LiabilitiesSection control={control} />
      </div>
      <div>
        <div className={clsx(cardClass, "mb-6 text-center")}>
            <h3 className="text-xl font-bold mb-4">Patrimonio Neto</h3>
            <p className="text-3xl font-bold text-primary dark:text-primary-dark">{netWorth.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
        </div>
        <div className={cardClass}>
            <h3 className="text-xl font-bold mb-4 text-center">Distribución de Activos</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} fill="#8884d8" paddingAngle={5} label>
                   {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Módulo de Inversiones
const InvestmentModule = ({ control }: { control: Control<FinanceFormData> }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "investments" });

  return (
    <div className={cardClass}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Portafolio de Inversiones</h3>
        <button onClick={() => append({ id: new Date().toISOString(), category: "Otro", description: "Nueva Inversión", purchasePrice: 0, purchaseYear: new Date().getFullYear(), marketValue: 0 })} className="button-primary">Añadir Inversión</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500 dark:text-gray-400">
            <tr>
              <th className="p-2">Categoría</th>
              <th className="p-2">Descripción</th>
              <th className="p-2">Precio de Adquisición</th>
              <th className="p-2">Año de Compra</th>
              <th className="p-2">Valor de Mercado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-1"><Controller name={`investments.${index}.category`} control={control} render={({ field }) => (
                  <select {...field} className={inputClass}>
                    {investmentSuperCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )} /></td>
                <td className="p-1"><Controller name={`investments.${index}.description`} control={control} render={({ field }) => <input {...field} className={inputClass} />} /></td>
                <td className="p-1"><Controller name={`investments.${index}.purchasePrice`} control={control} render={({ field }) => <input type="number" {...field} className={inputClass} />} /></td>
                <td className="p-1"><Controller name={`investments.${index}.purchaseYear`} control={control} render={({ field }) => <input type="number" {...field} className={inputClass} />} /></td>
                <td className="p-1"><Controller name={`investments.${index}.marketValue`} control={control} render={({ field }) => <input type="number" {...field} className={inputClass} />} /></td>
                <td className="p-1"><button onClick={() => remove(index)}><Trash2 className="w-4 h-4 text-red-500"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Módulo de Seguros
const InsuranceModule = ({ control, watchedExpenses, watchedInvestments, watchedInsurance }: { control: Control<FinanceFormData>, watchedExpenses: ExpenseEntry[], watchedInvestments: InvestmentEntry[], watchedInsurance: InsuranceEntry[] }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "insurance" });

  const totalMonthlyExpenses = watchedExpenses.reduce((sum, exp) => sum + exp.monthly, 0);
  const totalInvestments = watchedInvestments.reduce((sum, inv) => sum + inv.marketValue, 0);
  const totalDeathBenefit = watchedInsurance.reduce((sum: number, p: InsuranceEntry) => sum + p.deathBenefit, 0);

  const yearsToCoverExpenses = totalMonthlyExpenses > 0 ? (totalInvestments / (totalMonthlyExpenses * 12)).toFixed(1) : 'N/A';

  return (
    <div className={cardClass}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Pólizas de Seguro</h3>
        <button onClick={() => append({ id: new Date().toISOString(), name: "Seguro Vida", deathBenefit: 0, disabilityBenefit: 0, cashValue: 0, endDate: "" })} className="button-primary">Añadir Póliza</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500 dark:text-gray-400">
             <tr>
               <th className="p-2">Nombre</th>
               <th className="p-2">Beneficio de Fallecimiento</th>
               <th className="p-2">Beneficio de Invalidez</th>
               <th className="p-2">Valor en Efectivo</th>
               <th className="p-2">Fecha de Vencimiento</th>
               <th className="p-2">Acciones</th>
             </tr>
           </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className="border-t">
                <td className="p-1"><Controller name={`insurance.${index}.name`} render={({ field }) => <input {...field} className={inputClass} />} control={control}/></td>
                <td className="p-1"><Controller name={`insurance.${index}.deathBenefit`} render={({ field }) => <input type="number" {...field} className={inputClass} />} control={control}/></td>
                <td className="p-1"><Controller name={`insurance.${index}.disabilityBenefit`} render={({ field }) => <input type="number" {...field} className={inputClass} />} control={control}/></td>
                <td className="p-1"><Controller name={`insurance.${index}.cashValue`} render={({ field }) => <input type="number" {...field} className={inputClass} />} control={control}/></td>
                <td className="p-1"><Controller name={`insurance.${index}.endDate`} render={({ field }) => <input type="date" {...field} className={inputClass} />} control={control}/></td>
                <td className="p-1"><button onClick={() => remove(index)}><Trash2 className="w-4 h-4 text-red-500"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-bold">Resumen de Cobertura</h4>
        <p>Años para mantener Gasto Mensual con Inversiones: <span className="font-bold">{yearsToCoverExpenses}</span></p>
        <p>Protección Total por Fallecimiento: <span className="font-bold">{totalDeathBenefit.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</span></p>
      </div>
    </div>
  );
};

// Módulo Dashboard 360
const Dashboard360 = ({ data }: { data: FinanceFormData }) => {
  const totalIncome = data.incomes.reduce((sum, i) => sum + i.monthly, 0) * 12;
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.monthly, 0) * 12;
  const totalAssets = data.assets.reduce((sum, a) => sum + a.value, 0) + data.investments.reduce((sum, i) => sum + i.marketValue, 0);
  const totalLiabilities = data.liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const cashFlow = totalIncome - totalExpenses;

  const SummaryCard = ({ title, amount, items, colorClass }: { title: string, amount: number, items: {name: string, value: number}[], colorClass: string }) => (
    <div className={clsx(cardClass, colorClass, "border-l-4 p-4")}>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-2xl font-bold mb-3">{amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
      <ul className="text-sm space-y-1">
        {items.filter(i => i.value > 0).map(item => <li key={item.name} className="flex justify-between"><span>{item.name}</span> <span>{item.value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></li>)}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className={cardClass}><p className="text-lg">Flujo de Caja Anual</p><p className="text-3xl font-bold text-blue-500">{cashFlow.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p></div>
        <div className={cardClass}><p className="text-lg">Patrimonio Neto</p><p className="text-3xl font-bold text-green-500">{netWorth.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p></div>
        <div className={cardClass}><p className="text-lg">Valor Inmediato</p><p className="text-3xl font-bold text-yellow-500">{(data.assets.find(a => a.category === 'Efectivo')?.value || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p></div>
      </div>
      
      <div className="flex justify-center items-center p-8">
        <div className="flex items-center space-x-8">
          <SummaryCard title="Donde Gano" amount={totalIncome} items={data.incomes.map(i => ({name: i.name, value: i.monthly * 12}))} colorClass="border-blue-500" />
          <div className="text-5xl font-thin text-gray-400 dark:text-gray-600">→</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Patrimonio</h2>
            <p className="text-4xl font-bold text-green-500">{netWorth.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          </div>
          <div className="text-5xl font-thin text-gray-400 dark:text-gray-600">←</div>
          <SummaryCard title="Como Gasto" amount={totalExpenses} items={data.expenses.map(e => ({name: e.name, value: e.monthly * 12}))} colorClass="border-red-500" />
        </div>
      </div>

    </div>
  );
};

// --- Componente Principal Finanzas 360 ---
const Finanzas360 = () => {
  const { control, watch } = useForm<FinanceFormData>({
    defaultValues: {
      assumptions: { inflation: 4, exchangeRate: 18, goldPrice: 45000 },
      incomes: incomeCategories.map(name => ({ name, monthly: 0, taxRate: 0, annualIncrease: 0 })),
      expenses: [],
      assets: [],
      liabilities: [],
      investments: [],
      insurance: [],
    }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const watchedData = watch();

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingresos', label: 'Primas Vendidas', icon: Landmark },
    { id: 'gastos', label: 'Gastos', icon: Briefcase },
    { id: 'balance', label: 'Balance', icon: BarChart3 },
    { id: 'investments', label: 'Inversiones', icon: TrendingUp },
    { id: 'insurance', label: 'Seguros', icon: ShieldCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard360 data={watchedData} />;
      case 'ingresos': return <SalesModule control={control} />;
      case 'gastos': return <ExpensesModule control={control} watchedExpenses={watchedData.expenses} />;
      case 'balance': return <BalanceSheetModule control={control} watchedAssets={watchedData.assets} watchedLiabilities={watchedData.liabilities} />;
      case 'investments': return <InvestmentModule control={control} />;
      case 'insurance': return <InsuranceModule control={control} watchedExpenses={watchedData.expenses} watchedInvestments={watchedData.investments} watchedInsurance={watchedData.insurance} />;
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Finanzas 360</h1>
        <p className="text-md text-gray-500 dark:text-gray-400">Tu centro de control financiero personal.</p>
      </header>
      
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none",
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary dark:text-primary-dark dark:border-primary-dark'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Finanzas360; 