import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SubjectsPage from "./pages/SubjectsPage";
import FacultyPage from "./pages/FacultyPage";
import RoomsPage from "./pages/RoomsPage";
import LabsPage from "./pages/LabsPage";
import BatchesPage from "./pages/BatchesPage";
import DivisionsPage from "./pages/DivisionsPage";
import ConstraintsPage from "./pages/ConstraintsPage";
import GeneratePage from "./pages/GeneratePage";
import ResultsPage from "./pages/ResultsPage";
import ExportPage from "./pages/ExportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/divisions" element={<DivisionsPage />} />
          <Route path="/constraints" element={<ConstraintsPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
