import { useAuth } from '@/contexts/AuthContext';
import TeacherPlagiarismPage from './TeacherPlagiarismPage';
import StudentPlagiarismPage from './StudentPlagiarismPage';

const PlagiarismPage = () => {
  const { isTeacher } = useAuth();

  // Automatically route based on user role
  if (isTeacher) {
    return <TeacherPlagiarismPage />;
  }

  return <StudentPlagiarismPage />;
};

export default PlagiarismPage;
