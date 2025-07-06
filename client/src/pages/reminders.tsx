import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isAfter, isBefore, addHours } from "date-fns";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { 
  Clock, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import type { Reminder, InsertReminder } from "@shared/schema";
import { z } from "zod";

const formSchema = insertReminderSchema.extend({
  scheduledDate: z.string(),
});

export default function Reminders() {
  const { toast } = useToast();
  const { permission, requestPermission, showNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: InsertReminder) => {
      const response = await apiRequest("POST", "/api/reminders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ description: "Reminder created successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to create reminder", variant: "destructive" });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertReminder> }) => {
      const response = await apiRequest("PUT", `/api/reminders/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setEditingReminder(null);
      setIsCreateDialogOpen(false);
      toast({ description: "Reminder updated successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to update reminder", variant: "destructive" });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ description: "Reminder deleted successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to delete reminder", variant: "destructive" });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      scheduledDate: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  // Request notification permission on component mount
  useEffect(() => {
    if (permission === "default") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Check for due reminders and show notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const dueReminders = reminders.filter(reminder => 
        !reminder.isCompleted && 
        !reminder.notificationSent &&
        isBefore(new Date(reminder.scheduledDate), now)
      );

      dueReminders.forEach(reminder => {
        showNotification(reminder.title, {
          body: reminder.description || "Reminder is due!",
          tag: `reminder-${reminder.id}`,
        });
        
        // Mark notification as sent
        updateReminderMutation.mutate({
          id: reminder.id,
          data: { notificationSent: true }
        });
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders, showNotification, updateReminderMutation]);

  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  const getTimeStatus = (scheduledDate: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diffHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: "Overdue", color: "destructive" };
    } else if (diffHours < 2) {
      return { label: "Due soon", color: "warning" };
    } else if (diffHours < 24) {
      return { label: "Today", color: "primary" };
    } else {
      return { label: "Upcoming", color: "secondary" };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          icon: "🔴",
          label: "High Priority",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-700 dark:text-red-300",
          badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
        };
      case "low":
        return {
          icon: "🟢",
          label: "Low Priority",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-700 dark:text-green-300",
          badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
        };
      default: // medium
        return {
          icon: "🟡",
          label: "Medium Priority",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-700 dark:text-yellow-300",
          badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
        };
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const reminderData: InsertReminder = {
      ...data,
      scheduledDate: new Date(data.scheduledDate),
    };

    if (editingReminder) {
      updateReminderMutation.mutate({ id: editingReminder.id, data: reminderData });
    } else {
      createReminderMutation.mutate(reminderData);
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    form.reset({
      title: reminder.title,
      description: reminder.description || "",
      priority: reminder.priority || "medium",
      scheduledDate: format(new Date(reminder.scheduledDate), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteReminder = (id: number) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      deleteReminderMutation.mutate(id);
    }
  };

  const handleToggleComplete = (reminder: Reminder) => {
    updateReminderMutation.mutate({
      id: reminder.id,
      data: { isCompleted: !reminder.isCompleted }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-medium">Reminders</h1>
        </div>
        {/* Move the New button from here */}
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4">
        {/* Add the button here, for example, after the Stats section */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        {/* Stats */}
        <div className="py-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <p className="text-2xl font-bold mt-2">{activeReminders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold mt-2">{completedReminders.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification Permission */}
        {permission !== "granted" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Enable notifications to get reminded on time
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Click the button to allow notifications for this app
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestPermission}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Reminders */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Active Reminders</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-muted animate-pulse rounded-lg h-24" />
                ))}
              </div>
            ) : activeReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active reminders</p>
                <p className="text-sm mt-1">Create your first reminder to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeReminders.map((reminder) => {
                  const timeStatus = getTimeStatus(reminder.scheduledDate.toString());
                  const priorityConfig = getPriorityConfig(reminder.priority || "medium");
                  return (
                    <Card key={reminder.id} className={`hover:shadow-md transition-shadow ${priorityConfig.bgColor} ${priorityConfig.borderColor} border-l-4`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                variant={timeStatus.color as any}
                                className="text-xs"
                              >
                                {timeStatus.label}
                              </Badge>
                              <Badge 
                                className={`text-xs ${priorityConfig.badgeColor}`}
                              >
                                {priorityConfig.icon} {priorityConfig.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(reminder.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <h3 className="font-medium mb-1">{reminder.title}</h3>
                            {reminder.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleComplete(reminder)}
                                className="text-xs"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Complete
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditReminder(reminder)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Completed</h2>
              <div className="space-y-3">
                {completedReminders.map((reminder) => (
                  <Card key={reminder.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                          <h3 className="font-medium mb-1 line-through">{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleComplete(reminder)}
                              className="text-xs"
                            >
                              Restore
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Reminder Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingReminder(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingReminder ? "Edit Reminder" : "Create New Reminder"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reminder title" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter reminder details" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">🔴 High</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="low">🟢 Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

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
                  disabled={createReminderMutation.isPending || updateReminderMutation.isPending}
                >
                  {editingReminder ? "Update" : "Create"}
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
