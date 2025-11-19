import { useState, useEffect } from "react";
import { UserRating, RatingBreakdown, RatingMilestone } from "@/types/gamification";
import {
  getUserRating,
  updateRatingAfterQuiz,
  getRatingBreakdown,
  getRatingMilestones,
  getImprovementTips,
  getRatingStats,
} from "@/hooks/lib/ratingUtils";

export const useRating = () => {
  const [rating, setRating] = useState<UserRating>(getUserRating());
  const [breakdown, setBreakdown] = useState<RatingBreakdown>(getRatingBreakdown());
  const [milestones, setMilestones] = useState<RatingMilestone[]>(getRatingMilestones());
  const [tips, setTips] = useState<string[]>(getImprovementTips());
  const [stats, setStats] = useState(getRatingStats());
  const [isLoading, setIsLoading] = useState(true);

  const loadRating = () => {
    setRating(getUserRating());
    setBreakdown(getRatingBreakdown());
    setMilestones(getRatingMilestones());
    setTips(getImprovementTips());
    setStats(getRatingStats());
    setIsLoading(false);
  };

  useEffect(() => {
    loadRating();
  }, []);

  const updateAfterQuiz = (
    score: number,
    totalQuestions: number,
    subject: string,
    difficulty: "easy" | "medium" | "hard" = "medium",
    timeSpent: number = 0
  ): number => {
    const change = updateRatingAfterQuiz(score, totalQuestions, subject, difficulty, timeSpent);
    loadRating();
    return change;
  };

  const refreshRating = () => {
    loadRating();
  };

  return {
    rating,
    breakdown,
    milestones,
    tips,
    stats,
    isLoading,
    updateAfterQuiz,
    refreshRating,
  };
};
