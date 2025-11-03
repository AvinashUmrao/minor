import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuizProvider } from "@/contexts/QuizContext";
import Navbar from "@/components/ui/navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "./pages/Home";
import ExamPrep from "./pages/ExamPrep";
import Gate from "./pages/Gate";
import GateQuiz from "./pages/GateQuiz";
import Jee from "./pages/Jee";
import JeeQuiz from "./pages/JeeQuiz";
import Cat from "./pages/Cat";
import Neet from "./pages/Neet";
import Upsc from "./pages/Upsc";
import PlagueCheck from "./pages/PlagueCheck";
import PlagiarismPage from "./pages/PlagiarismPage";
import Blogs from "./pages/Blogs";
import CreateBlog from "./pages/CreateBlog";
import Auth from "./pages/Auth";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProgressPage from "./pages/ProgressPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <QuizProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/exam-prep" element={<ExamPrep />} />
                    <Route path="/gate" element={<Gate />} />
                    <Route path="/gate/quiz" element={<GateQuiz />} />
                    <Route path="/jee" element={<Jee />} />
                    <Route path="/jee/quiz" element={<JeeQuiz />} />
                    <Route path="/cat" element={<Cat />} />
                    <Route path="/neet" element={<Neet />} />
                    <Route path="/upsc" element={<Upsc />} />
                    <Route path="/plague-check" element={<PlagueCheck />} />
                    <Route path="/plagiarism" element={<PlagiarismPage />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/create-blog" element={<CreateBlog />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QuizProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
