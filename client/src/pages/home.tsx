import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Moon, Sun } from "lucide-react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import { NoteCard } from "@/components/ui/note-card";
import { Fab } from "@/components/ui/fab";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNoteSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Note, InsertNote } from "@shared/schema";
import { z } from "zod";

const formSchema = insertNoteSchema.extend({
  reminderDate: z.string().optional(),
});

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: InsertNote) => {
      const response = await apiRequest("POST", "/api/notes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsCreateDialogOpen(false);
      toast({ description: "Note created successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to create note", variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertNote> }) => {
      const response = await apiRequest("PUT", `/api/notes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setEditingNote(null);
      toast({ description: "Note updated successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to update note", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ description: "Note deleted successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to delete note", variant: "destructive" });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      type: "plain",
      isVoiceNote: false,
    },
  });

  useEffect(() => {
    if (editingNote) {
      form.reset({
        title: editingNote.title,
        content: editingNote.content,
        category: editingNote.category,
        type: editingNote.type,
        isVoiceNote: editingNote.isVoiceNote,
        reminderDate: editingNote.reminderDate 
          ? new Date(editingNote.reminderDate).toISOString().slice(0, 16)
          : undefined,
      });
    }
  }, [editingNote, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const noteData: InsertNote = {
      ...data,
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : undefined,
    };

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setIsCreateDialogOpen(true);
    form.setValue("content", text);
    form.setValue("isVoiceNote", true);
    form.setValue("title", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">Q</span>
          </div>
          <h1 className="text-xl font-medium">Quickpyx</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchTerm("")}
            className="rounded-full"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4">
        {/* Developer Attribution Banner */}
        <div className="py-4">
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🚀 DEVELOPED BY ARYAN PANDEY 🚀</h2>
              <p className="text-sm opacity-90">Building the future, one app at a time</p>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">📝</span>
                  </div>
                  <span className="text-sm font-medium">Total Notes</span>
                </div>
                <p className="text-2xl font-bold mt-2">{notes.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600">⏰</span>
                  </div>
                  <span className="text-sm font-medium">Reminders</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {notes.filter(n => n.reminderDate && !n.isCompleted).length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Voice Recording */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
          </CardContent>
        </Card>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Recent Notes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Notes</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              View All
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-32" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No notes found matching your search." : "No notes yet. Create your first note!"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.slice(0, 10).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </div>

        {/* AdMob Banner Placeholder */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/25">
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 bg-muted-foreground/10 rounded flex items-center justify-center">
              📱
            </div>
            <p className="text-sm">Advertisement Space</p>
            <p className="text-xs mt-1">AdMob Integration Ready</p>
          </div>
        </div>

        {/* Developer Attribution Footer */}
        <div className="mt-8 text-center py-4 border-t border-border/50">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">♥</span>
            <span>by</span>
            <span className="font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Aryan Pandey
            </span>
            <span className="opacity-50">|</span>
            <span className="font-mono text-[10px]">v1.0.0</span>
          </div>
        </div>
      </main>

      {/* FAB */}
      <Fab onClick={() => setIsCreateDialogOpen(true)} />

      {/* Create/Edit Note Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingNote(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Edit Note" : "Create New Note"}
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
                      <Input placeholder="Enter note title" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter note content" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="ideas">Ideas</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="plain">Plain Note</SelectItem>
                          <SelectItem value="checklist">Checklist</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("type") === "reminder" && (
                <FormField
                  control={form.control}
                  name="reminderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

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
                  disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                >
                  {editingNote ? "Update" : "Create"}
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
