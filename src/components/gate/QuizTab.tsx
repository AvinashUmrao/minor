import { Brain } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const QuizTab = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleQuizClick = () => {
    if (!user) {
      toast.error("Please log in to start the quiz!");
      navigate("/auth"); // Redirect to login/signup page
      return;
    }
    navigate("/gate/quiz");
  };

  return (
    <div className="text-center py-12">
      <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
      <h2 className="text-2xl font-bold mb-4">GATE Practice Quizzes</h2>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        Test your knowledge with our comprehensive GATE quiz system. Choose from topic-wise, subject-wise, or full syllabus tests.
      </p>
      <Button size="lg" onClick={handleQuizClick}>Start Quiz</Button>
    </div>
  );
};