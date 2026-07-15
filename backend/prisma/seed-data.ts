import { TransactionType } from '@prisma/client'

export const CATEGORIES: {
  name: string
  type: TransactionType
  color: string
  icon: string
}[] = [
  // Expense
  { name: 'Groceries', type: 'DEBIT', color: '#00C896', icon: 'ShoppingCart' },
  { name: 'Food & Dining', type: 'DEBIT', color: '#f97316', icon: 'Utensils' },
  { name: 'Transport', type: 'DEBIT', color: '#a78bfa', icon: 'Car' },
  { name: 'Housing', type: 'DEBIT', color: '#22d3ee', icon: 'Home' },
  { name: 'Shopping', type: 'DEBIT', color: '#ec4899', icon: 'ShoppingBag' },
  { name: 'Entertainment', type: 'DEBIT', color: '#8b5cf6', icon: 'Tv' },
  { name: 'Health', type: 'DEBIT', color: '#84cc16', icon: 'Heart' },
  { name: 'Utilities', type: 'DEBIT', color: '#f59e0b', icon: 'Zap' },
  { name: 'Petrol', type: 'DEBIT', color: '#fb923c', icon: 'Fuel' },
  { name: 'Education', type: 'DEBIT', color: '#60a5fa', icon: 'GraduationCap' },
  { name: 'Travel', type: 'DEBIT', color: '#0ea5e9', icon: 'Plane' },
  { name: 'Subscriptions', type: 'DEBIT', color: '#6366f1', icon: 'RefreshCw' },
  { name: 'Personal Care', type: 'DEBIT', color: '#f472b6', icon: 'Sparkles' },
  { name: 'Insurance', type: 'DEBIT', color: '#34d399', icon: 'Shield' },
  { name: 'Other', type: 'DEBIT', color: '#8b949e', icon: 'MoreHorizontal' },
  // Income
  { name: 'Salary', type: 'CREDIT', color: '#00C896', icon: 'Briefcase' },
  { name: 'Freelance', type: 'CREDIT', color: '#60a5fa', icon: 'Laptop' },
  { name: 'Interest', type: 'CREDIT', color: '#a78bfa', icon: 'TrendingUp' },
  { name: 'Investment', type: 'CREDIT', color: '#f59e0b', icon: 'BarChart2' },
  { name: 'Refund', type: 'CREDIT', color: '#22d3ee', icon: 'RotateCcw' },
  { name: 'Gift', type: 'CREDIT', color: '#ec4899', icon: 'Gift' },
  { name: 'Other', type: 'CREDIT', color: '#8b949e', icon: 'MoreHorizontal' },
]

export const CATEGORY_MAPPINGS: {
  basiqLabel: string
  categoryName: string
  type: TransactionType
}[] = [
  {
    basiqLabel: 'Air and Space Transport',
    categoryName: 'Travel',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Auxiliary Finance and Investment Services',
    categoryName: 'Other',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Cafes, Restaurants and Takeaway Food Services',
    categoryName: 'Food & Dining',
    type: 'DEBIT',
  },
  { basiqLabel: 'Department Stores', categoryName: 'Shopping', type: 'DEBIT' },
  {
    basiqLabel: 'Electricity Distribution',
    categoryName: 'Utilities',
    type: 'DEBIT',
  },
  { basiqLabel: 'Fuel Retailing', categoryName: 'Petrol', type: 'DEBIT' },
  { basiqLabel: 'Groceries', categoryName: 'Groceries', type: 'DEBIT' },
  {
    basiqLabel: 'Health and General Insurance',
    categoryName: 'Insurance',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Internet Publishing and Broadcasting',
    categoryName: 'Subscriptions',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Non-Depository Financing',
    categoryName: 'Other',
    type: 'DEBIT',
  },
  { basiqLabel: 'Other', categoryName: 'Other', type: 'DEBIT' },
  {
    basiqLabel: 'Other Administrative Services',
    categoryName: 'Other',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Other Health Care Services',
    categoryName: 'Health',
    type: 'DEBIT',
  },
  { basiqLabel: 'Property Operators', categoryName: 'Housing', type: 'DEBIT' },
  {
    basiqLabel: 'Pubs, Taverns and Bars',
    categoryName: 'Food & Dining',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Recreational Goods Retailing',
    categoryName: 'Shopping',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Specialised Food Retailing',
    categoryName: 'Groceries',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Sports and Physical Recreation Activities',
    categoryName: 'Entertainment',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Supermarket and Grocery Stores',
    categoryName: 'Groceries',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Telecommunications Services',
    categoryName: 'Utilities',
    type: 'DEBIT',
  },
  {
    basiqLabel: 'Television Broadcasting',
    categoryName: 'Subscriptions',
    type: 'DEBIT',
  },
  { basiqLabel: 'Unknown', categoryName: 'Other', type: 'CREDIT' },
  {
    basiqLabel: 'Water Supply, Sewerage and Drainage Services',
    categoryName: 'Utilities',
    type: 'DEBIT',
  },
]
