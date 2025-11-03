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
} from "@/lib/streakUtils";

export const useStreak = () => {
  const [streak, setStreak] = useState<UserStreak>(getUserStreak());
  const [stats, setStats] = useState(getStreakStats());
  const [calendarData, setCalendarData] = useState<StreakData[]>([]);
  const [atRisk, setAtRisk] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadStreak = () => {
    const streakData = getUserStreak();
    setStreak(streakData);
    setStats(getStreakStats());
    setCalendarData(getCalendarData(12));
    setAtRisk(isStreakAtRisk());
    setMessage(getStreakMessage());
    setIsLoading(false);
  };

  useEffect(() => {
    loadStreak();
  }, []);

  const logActivity = (
    type: "quiz" | "study" | "blog_read" | "blog_create",
    minutes: number = 0
  ) => {
    recordActivity(type, minutes);
    loadStreak();
  };

  const applyFreeze = (): boolean => {
    const success = useStreakFreeze();
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
