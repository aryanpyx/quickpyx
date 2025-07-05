import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "@/pages/home";
import Expenses from "@/pages/expenses";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          
          {/* Developer Attribution Badge */}
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1 shadow-lg">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-blue-600 rounded-full animate-pulse"></div>
                <span className="font-mono text-muted-foreground">by</span>
                <span className="font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  ARYAN PANDEY
                </span>
                <span className="text-primary">⚡</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
