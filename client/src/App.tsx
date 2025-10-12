import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Predict from "@/pages/Predict";
import Health from "@/pages/Health";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/BottomNav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/predict" component={Predict} />
      <Route path="/health" component={Health} />
      <Route path="/chat" component={Chat} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative">
          <Router />
          <BottomNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
