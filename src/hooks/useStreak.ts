import { useState, useEffect } from "react";
import { UserStreak, StreakData } from "@/types/gamification";
import {
  getUserStreak,
  getStreakStats,
  recordActivity,
  getCalendarData,
  isStreakAtRisk,
  getStreakMessage,
  useStreakFreeze,
} from "@/hooks/lib/streakUtils";
import { useAuth } from "@/contexts/AuthContext";

export const useStreak = () => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [streak, setStreak] = useState<UserStreak>(getUserStreak(userId));
  const [stats, setStats] = useState(getStreakStats(userId));
  const [calendarData, setCalendarData] = useState<StreakData[]>([]);
  const [atRisk, setAtRisk] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadStreak = () => {
    const streakData = getUserStreak(userId);
    setStreak(streakData);
    setStats(getStreakStats(userId));
    setCalendarData(getCalendarData(12, userId));
    setAtRisk(isStreakAtRisk(userId));
    setMessage(getStreakMessage(userId));
    setIsLoading(false);
  };

  useEffect(() => {
    loadStreak();
  }, [userId]);

  const logActivity = (
    type: "quiz" | "study" | "blog_read" | "blog_create",
    minutes: number = 0
  ) => {
    recordActivity(type, minutes, userId);
    loadStreak();
  };

  const applyFreeze = (): boolean => {
    const success = useStreakFreeze(userId);
    if (success) {
      loadStreak();
    }
    return success;
  };

  const refreshStreak = () => {
    loadStreak();
  };

  return {
    streak,
    stats,
    calendarData,
    atRisk,
    message,
    isLoading,
    logActivity,
    applyFreeze,
    refreshStreak,
  };
};
