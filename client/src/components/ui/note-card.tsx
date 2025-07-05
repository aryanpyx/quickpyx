import { useState } from "react";
import { format } from "date-fns";
import { 
  NotebookPen, 
  CheckCircle, 
  Clock, 
  Edit, 
  Trash2,
  Bell
} from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import type { Note } from "@shared/schema";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  className?: string;
}

export function NoteCard({ note, onEdit, onDelete, className }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getNoteIcon = () => {
    switch (note.type) {
      case "checklist":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "reminder":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <NotebookPen className="w-5 h-5 text-primary" />;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  const renderContent = () => {
    if (note.type === "checklist") {
      const items = note.content.split("\n").filter(Boolean);
      return (
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <p className="text-sm text-muted-foreground line-clamp-2">
        {note.content}
      </p>
    );
  };

  return (
    <div
      className={cn(
        "note-card bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getNoteIcon()}
          <Badge variant="secondary" className="category-chip">
            {note.category}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(note.createdAt)}
        </span>
      </div>
      
      <h3 className="font-medium mb-1">{note.title}</h3>
      
      {renderContent()}
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          {note.reminderDate && (
            <div className="reminder-badge px-2 py-1 rounded-full flex items-center space-x-1">
              <Bell className="w-3 h-3 text-white" />
              <span className="text-xs text-white">Reminder</span>
            </div>
          )}
          {note.isVoiceNote && (
            <Badge variant="outline" className="text-xs">
              Voice Note
            </Badge>
          )}
        </div>
        
        {isHovered && (
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(note)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(note.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
