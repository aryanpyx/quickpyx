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
          <div className="fixed top-2 right-2 z-[100] pointer-events-none">
            <div className="bg-background/95 backdrop-blur-sm border-2 border-primary/20 rounded-full px-4 py-2 shadow-2xl">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-blue-600 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">by</span>
                <span className="font-bold text-primary">
                  ARYAN PANDEY
                </span>
                <span className="text-primary animate-bounce">⚡</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
