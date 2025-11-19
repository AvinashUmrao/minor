import { Brain, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const GateHeader = () => {
  return (
    <div className="text-center mb-12">
      <Badge variant="outline" className="mb-4">GATE 2025</Badge>
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
        GATE Complete Preparation
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Master the Graduate Aptitude Test in Engineering with our comprehensive study materials, 
        practice tests, and expert guidance.
      </p>
    </div>
  );
};
