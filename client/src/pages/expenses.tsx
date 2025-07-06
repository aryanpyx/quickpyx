import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ExpenseChart } from "@/components/ui/expense-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Plus, Edit, Trash2 } from "lucide-react";
import type { Expense, InsertExpense } from "@shared/schema";
import { z } from "zod";

const formSchema = insertExpenseSchema.extend({
  date: z.string().optional(),
});

const expenseCategories = [
  { value: "food", label: "Food & Dining", icon: "🍽️" },
  { value: "transportation", label: "Transportation", icon: "🚗" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "bills", label: "Bills & Utilities", icon: "💡" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "other", label: "Other", icon: "📦" },
];

const currencies = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
];

export default function Expenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = current month, 1 = last month, etc.

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ description: "Expense added successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to add expense", variant: "destructive" });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertExpense> }) => {
      const response = await apiRequest("PUT", `/api/expenses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setEditingExpense(null);
      setIsCreateDialogOpen(false);
      toast({ description: "Expense updated successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to update expense", variant: "destructive" });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ description: "Expense deleted successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to delete expense", variant: "destructive" });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      currency: "USD",
      category: "other",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const filteredExpenses = useMemo(() => {
    const targetDate = subMonths(new Date(), selectedMonth);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date!);
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses, selectedMonth]);

  const monthlyStats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return { total, categoryTotals };
  }, [filteredExpenses]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const expenseData: InsertExpense = {
      ...data,
      amount: data.amount.toString(),
      date: data.date ? new Date(data.date) : new Date(),
    };

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data: expenseData });
    } else {
      createExpenseMutation.mutate(expenseData);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    form.reset({
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      date: format(new Date(expense.date!), "yyyy-MM-dd"),
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const getCategoryIcon = (category: string) => {
    return expenseCategories.find(cat => cat.value === category)?.icon || "📦";
  };

  const getCurrencySymbol = (currency: string) => {
    return currencies.find(cur => cur.value === currency)?.symbol || "$";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <Wallet className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-medium">Expenses</h1>
        </div>
        {/* Move the Add button from here */}
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4">
        {/* Add the button here, for example, after the Monthly Overview section */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Monthly Overview */}
        <div className="py-6">
          <Card className="expense-card text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Monthly Overview</CardTitle>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      {format(new Date(), "MMMM yyyy")}
                    </SelectItem>
                    <SelectItem value="1">
                      {format(subMonths(new Date(), 1), "MMMM yyyy")}
                    </SelectItem>
                    <SelectItem value="2">
                      {format(subMonths(new Date(), 2), "MMMM yyyy")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ${monthlyStats.total.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Transactions</p>
                  <p className="text-2xl font-bold">{filteredExpenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Add Expense */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="Amount" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map(currency => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Description" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseCategories.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.icon} {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createExpenseMutation.isPending}
                >
                  Add Expense
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Expense Chart */}
        {filteredExpenses.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart expenses={filteredExpenses} />
            </CardContent>
          </Card>
        )}

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Expenses</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-muted animate-pulse rounded-lg h-16" />
                ))}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expenses for this month.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.slice(0, 10).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expenseCategories.find(cat => cat.value === expense.category)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-medium">
                          {getCurrencySymbol(expense.currency)}{parseFloat(expense.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(expense.date!), "MMM d")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Expense Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingExpense(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map(currency => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.symbol} {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                >
                  {editingExpense ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
