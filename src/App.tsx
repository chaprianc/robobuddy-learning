import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoboProvider } from "@/lib/robo-context";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Chat from "./pages/Chat";
import ParentAuth from "./pages/ParentAuth";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoboProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/parent/auth" element={<ParentAuth />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoboProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
