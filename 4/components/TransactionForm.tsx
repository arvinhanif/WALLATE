import React, { useState } from 'react';
import { TransactionType, Transaction, UserRole } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  role: UserRole;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, role }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (role !== UserRole.ADMIN) {
    return (
      <div className="py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Authorization Required to Sync Data</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onAdd({ description, amount: parseFloat(amount), type, date });
    setDescription('');
    setAmount('');
  };

  const inputClass = "w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800 placeholder:text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <input
        required
        type="text"
        placeholder="Memo / Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={inputClass}
      />
      <div className="relative">
        <input
          required
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType)}
        className={`${inputClass} appearance-none cursor-pointer bg-no-repeat bg-right-4`}
      >
        <option value={TransactionType.EXPENSE}>Expense Out</option>
        <option value={TransactionType.INCOME}>Income In</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all text-sm ios-button shadow-lg shadow-blue-500/20 uppercase tracking-widest">
        Sync Entry
      </button>
    </form>
  );
};

export default TransactionForm;