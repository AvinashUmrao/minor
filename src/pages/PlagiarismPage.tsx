import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, setCurrentUser, initializeSampleData } from '@/lib/plagiarismStorage';
import { UserRole } from '@/types/plagiarism';
import { GraduationCap, BookOpen, Shield } from 'lucide-react';
import TeacherPlagiarismPage from './TeacherPlagiarismPage';
import StudentPlagiarismPage from './StudentPlagiarismPage';

const PlagiarismPage = () => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  useEffect(() => {
    initializeSampleData();
    const user = getCurrentUser();
    if (user) {
      setCurrentRole(user.role);
    }
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'teacher') {
      setCurrentUser('teacher1', 'Dr. Sarah Johnson', 'teacher');
    } else {
      setCurrentUser('student1', 'Alex Thompson', 'student');
    }
    setCurrentRole(role);
  };

  const handleSwitchRole = () => {
    setCurrentRole(null);
  };

  if (currentRole === 'teacher') {
    return <TeacherPlagiarismPage />;
  }

  if (currentRole === 'student') {
    return <StudentPlagiarismPage />;
  }

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Plagiarism Detection System</Badge>
          <h1 className="text-4xl font-bold mb-4">Select Your Role</h1>
          <p className="text-muted-foreground text-lg">
            Choose whether you want to access the system as a teacher or student
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Teacher</h2>
              <p className="text-muted-foreground mb-6">
                Create assignments, view submissions, and analyze plagiarism with advanced detection algorithms
              </p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Create and manage assignments
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Run multi-algorithm plagiarism detection
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  View detailed similarity reports
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Download PDF analysis reports
                </li>
              </ul>
              <Button onClick={() => handleRoleSelect('teacher')} className="w-full" size="lg">
                Continue as Teacher
              </Button>
            </div>
          </Card>

          {/* Student Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Student</h2>
              <p className="text-muted-foreground mb-6">
                View assignments, submit your work, and track your submissions with confidence
              </p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  View all available assignments
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Submit text or code assignments
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Update submissions before deadline
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Track submission status
                </li>
              </ul>
              <Button onClick={() => handleRoleSelect('student')} className="w-full" size="lg">
                Continue as Student
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Advanced Plagiarism Detection Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Text Analysis Algorithms:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Jaccard Similarity</li>
                <li>• Cosine Similarity</li>
                <li>• TF-IDF Analysis</li>
                <li>• Levenshtein Distance</li>
                <li>• Longest Common Subsequence (LCS)</li>
                <li>• Semantic Similarity</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Code Analysis Algorithms:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Abstract Syntax Tree (AST) Analysis</li>
                <li>• Control Flow Graph (CFG) Similarity</li>
                <li>• Winnowing Fingerprinting</li>
                <li>• Variable Renaming Detection</li>
                <li>• Structural Pattern Matching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismPage;
