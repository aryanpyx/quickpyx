import { Plus } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FabProps {
  onClick: () => void;
  className?: string;
}

export function Fab({ onClick, className }: FabProps) {
  return (
    <div className={cn("fixed bottom-24 right-4 z-10", className)}>
      <Button
        onClick={onClick}
        className="material-ripple fab-animate w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </Button>
    </div>
  );
}
