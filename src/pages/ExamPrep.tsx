import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ExamCard } from "@/components/exam/ExamCard";
import { WhyChooseSection } from "@/components/exam/WhyChooseSection";
import { examOptions } from "@/data/sampleData";

const ExamPrep = () => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Exam Preparation</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your Path to Success
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive preparation materials and practice tests for all major competitive exams. 
            Start your journey with expert-curated content and AI-powered learning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {examOptions.map((exam) => (
            <ExamCard
              key={exam.id}
              {...exam}
              isSelected={selectedExam === exam.id}
              onSelect={() => setSelectedExam(exam.id)}
            />
          ))}
        </div>

        <WhyChooseSection />
      </div>
    </div>
  );
};

export default ExamPrep;
