import { StreakData } from "@/types/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Flame, TrendingUp, Calendar } from "lucide-react";
import { getActivityIntensity } from "@/lib/streakUtils";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  calendarData: StreakData[];
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export const StreakCalendar = ({
  calendarData,
  currentStreak,
  longestStreak,
  totalActiveDays,
}: StreakCalendarProps) => {
  // Organize data into weeks (columns) with days (rows) - GitHub style
  const organizeIntoWeeks = () => {
    const weeks: StreakData[][] = [];
    let currentWeek: StreakData[] = [];
    
    // Get the first date and its day of week
    const firstDate = calendarData[0]?.date ? new Date(calendarData[0].date) : new Date();
    const firstDayOfWeek = firstDate.getDay();
    
    // Add empty cells for days before the first date
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: "",
        activityCount: 0,
        quizzesTaken: 0,
        minutesStudied: 0,
        blogsRead: 0,
        blogsCreated: 0,
      });
    }
    
    // Add all calendar data
    calendarData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: "",
          activityCount: 0,
          quizzesTaken: 0,
          minutesStudied: 0,
          blogsRead: 0,
          blogsCreated: 0,
        });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  // Get month labels for the timeline
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    const weeks = organizeIntoWeeks();
    let lastMonth = '';
    
    weeks.forEach((week, weekIndex) => {
      const firstDayWithDate = week.find(day => day.date);
      if (firstDayWithDate?.date) {
        const date = new Date(firstDayWithDate.date);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (monthYear !== lastMonth) {
          labels.push({ month: monthYear, weekIndex });
          lastMonth = monthYear;
        }
      }
    });
    
    return labels;
  };

  const weeks = organizeIntoWeeks();
  const monthLabels = getMonthLabels();

  const getIntensityColor = (intensity: number): string => {
    const colors = [
      "bg-gray-100 dark:bg-gray-800", // 0 - no activity
      "bg-green-200 dark:bg-green-900", // 1 - low
      "bg-green-400 dark:bg-green-700", // 2 - medium
      "bg-green-600 dark:bg-green-500", // 3 - high
      "bg-green-800 dark:bg-green-300", // 4 - very high
    ];
    return colors[intensity] || colors[0];
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTooltipContent = (day: StreakData): string => {
    if (!day.date) return "";

    if (day.activityCount === 0) {
      return `${formatDate(day.date)}: No activity`;
    }

    const parts = [
      `${formatDate(day.date)}`,
      `${day.activityCount} ${day.activityCount === 1 ? "activity" : "activities"}`,
    ];

    if (day.quizzesTaken > 0) {
      parts.push(`${day.quizzesTaken} ${day.quizzesTaken === 1 ? "quiz" : "quizzes"}`);
    }
    if (day.minutesStudied > 0) {
      parts.push(`${day.minutesStudied} min studied`);
    }
    if (day.blogsRead > 0) {
      parts.push(`${day.blogsRead} ${day.blogsRead === 1 ? "blog" : "blogs"} read`);
    }

    return parts.join("\n");
  };

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{longestStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              Total Active Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalActiveDays}</div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Calendar</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((intensity) => (
                  <div
                    key={intensity}
                    className={cn(
                      "w-3 h-3 rounded-sm",
                      getIntensityColor(intensity)
                    )}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <TooltipProvider>
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex gap-1 mb-2 ml-10">
                  {monthLabels.map((label, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-medium text-muted-foreground"
                      style={{ 
                        marginLeft: idx === 0 ? `${label.weekIndex * 17}px` : `${(label.weekIndex - monthLabels[idx - 1].weekIndex) * 17 - 30}px`,
                        minWidth: '30px'
                      }}
                    >
                      {label.month}
                    </div>
                  ))}
                </div>

                {/* Calendar grid - horizontal layout */}
                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 mr-2">
                    <div className="h-[14px]" /> {/* Spacer */}
                    {["Mon", "Wed", "Fri"].map((day, i) => (
                      <div key={i} className="h-[14px] flex items-center">
                        <span className="text-[10px] text-muted-foreground w-8 text-right">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Weeks as columns */}
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => {
                        // Skip Sunday (0), Tuesday (2), Thursday (4), Saturday (6) for labels
                        // But show all days in the grid
                        if (!day.date) {
                          return (
                            <div
                              key={dayIndex}
                              className="w-[14px] h-[14px]"
                            />
                          );
                        }

                        const intensity = getActivityIntensity(day.activityCount);

                        return (
                          <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "w-[14px] h-[14px] rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:ring-offset-1",
                                  getIntensityColor(intensity)
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="whitespace-pre-line text-sm">
                                {getTooltipContent(day)}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 ml-10 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((intensity) => (
                      <div
                        key={intensity}
                        className={cn(
                          "w-[14px] h-[14px] rounded-sm",
                          getIntensityColor(intensity)
                        )}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Message */}
          {currentStreak > 0 && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-sm">
                    {currentStreak} day quiz streak! 🔥
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep it going! Complete a quiz today to maintain your streak.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStreak === 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-sm">Start your quiz streak today!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete a quiz today to begin building your streak. Green squares show quiz activity days.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
