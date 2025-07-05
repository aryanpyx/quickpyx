import { notes, expenses, reminders, settings, type Note, type InsertNote, type Expense, type InsertExpense, type Reminder, type InsertReminder, type Settings, type InsertSettings } from "@shared/schema";

export interface IStorage {
  // Notes
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: number): Promise<void>;
  
  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  
  // Reminders
  getReminders(): Promise<Reminder[]>;
  getReminder(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
  getPendingReminders(): Promise<Reminder[]>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private notes: Map<number, Note> = new Map();
  private expenses: Map<number, Expense> = new Map();
  private reminders: Map<number, Reminder> = new Map();
  private settings: Settings;
  private currentId: number = 1;

  constructor() {
    this.settings = {
      id: 1,
      darkMode: false,
      defaultCurrency: "USD",
      voiceRecognitionEnabled: true,
      notificationsEnabled: true,
      updatedAt: new Date(),
    };
  }

  // Notes
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const now = new Date();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, updateNote: Partial<InsertNote>): Promise<Note> {
    const existing = this.notes.get(id);
    if (!existing) {
      throw new Error(`Note with id ${id} not found`);
    }
    
    const updated: Note = {
      ...existing,
      ...updateNote,
      updatedAt: new Date(),
    };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: number): Promise<void> {
    if (!this.notes.has(id)) {
      throw new Error(`Note with id ${id} not found`);
    }
    this.notes.delete(id);
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => 
      new Date(b.date!).getTime() - new Date(a.date!).getTime()
    );
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentId++;
    const now = new Date();
    const expense: Expense = {
      ...insertExpense,
      id,
      date: insertExpense.date || now,
      createdAt: now,
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, updateExpense: Partial<InsertExpense>): Promise<Expense> {
    const existing = this.expenses.get(id);
    if (!existing) {
      throw new Error(`Expense with id ${id} not found`);
    }
    
    const updated: Expense = {
      ...existing,
      ...updateExpense,
    };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: number): Promise<void> {
    if (!this.expenses.has(id)) {
      throw new Error(`Expense with id ${id} not found`);
    }
    this.expenses.delete(id);
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => {
      const expenseDate = new Date(expense.date!);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }

  async getReminder(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentId++;
    const now = new Date();
    const reminder: Reminder = {
      ...insertReminder,
      id,
      priority: insertReminder.priority || "medium",
      createdAt: now,
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, updateReminder: Partial<InsertReminder>): Promise<Reminder> {
    const existing = this.reminders.get(id);
    if (!existing) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    
    const updated: Reminder = {
      ...existing,
      ...updateReminder,
    };
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: number): Promise<void> {
    if (!this.reminders.has(id)) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    this.reminders.delete(id);
  }

  async getPendingReminders(): Promise<Reminder[]> {
    const now = new Date();
    return Array.from(this.reminders.values()).filter(reminder => 
      !reminder.isCompleted && 
      new Date(reminder.scheduledDate) <= now &&
      !reminder.notificationSent
    );
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updateSettings: Partial<InsertSettings>): Promise<Settings> {
    this.settings = {
      ...this.settings,
      ...updateSettings,
      updatedAt: new Date(),
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
