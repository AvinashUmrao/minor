import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BadgeProgress } from '@/types/gamification';
import type { UserStreak, StreakData, UserRating, RatingBreakdown, RatingMilestone } from '@/types/gamification';

interface ProgressReportData {
  badges: BadgeProgress[];
  badgeStats: {
    total: number;
    earned: number;
    inProgress: number;
    locked: number;
  };
  streak: UserStreak;
  streakStats: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    thisMonthActiveDays: number;
    averageActivitiesPerDay: number;
  };
  calendarData: StreakData[];
  rating: UserRating;
  breakdown: RatingBreakdown;
  milestones: RatingMilestone[];
  tips: string[];
  // Firebase user profile data (overrides rating if provided)
  userProfile?: {
    currentRating: number;
    peakRating: number;
    currentCategory: string;
    totalQuizzes: number;
    totalQuestionsAttempted: number;
    totalCorrectAnswers: number;
    overallAccuracy: number;
  };
}

// Generate dummy 1-week data for demonstration
const generateDummyWeekData = (): StreakData[] => {
  const today = new Date();
  const weekData: StreakData[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    weekData.push({
      date: dateStr,
      activityCount: Math.floor(Math.random() * 5) + 2, // 2-6 activities
      quizzesTaken: Math.floor(Math.random() * 3) + 1, // 1-3 quizzes
      minutesStudied: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
      blogsRead: Math.floor(Math.random() * 3), // 0-2 blogs
      blogsCreated: Math.random() > 0.7 ? 1 : 0, // 30% chance of creating a blog
    });
  }
  
  return weekData;
};

export const generateProgressReportPDF = (data: ProgressReportData) => {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Use Firebase data if available, otherwise fall back to localStorage rating
  const currentRating = data.userProfile?.currentRating ?? data.rating.current;
  const peakRating = data.userProfile?.peakRating ?? data.rating.peak;
  const userTotalQuizzes = data.userProfile?.totalQuizzes ?? 0;
  const userAccuracy = data.userProfile?.overallAccuracy ?? 0;
  
  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Progress Report', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Quick Stats Overview
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Quick Stats Overview', 20, yPos);
  yPos += 10;
  
  // Stats boxes
  const stats = [
    { label: 'Badges Earned', value: data.badgeStats.earned.toString(), color: [255, 193, 7] },
    { label: 'Current Streak', value: `${data.streak.currentStreak} days`, color: [255, 87, 34] },
    { label: 'Current Rating', value: currentRating.toString(), color: [33, 150, 243] },
    { label: 'Active Days', value: data.streakStats.totalActiveDays.toString(), color: [76, 175, 80] },
  ];
  
  let xOffset = 20;
  stats.forEach((stat, idx) => {
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1);
    doc.roundedRect(xOffset, yPos, 40, 25, 3, 3, 'F');
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value, xOffset + 20, yPos + 12, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(stat.label, xOffset + 20, yPos + 20, { align: 'center' });
    
    xOffset += 45;
  });
  
  yPos += 35;
  doc.setTextColor(0, 0, 0);
  
  // Weekly Activity Section (Dummy Data)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Weekly Activity (Last 7 Days)', 20, yPos);
  yPos += 5;
  
  const weekData = generateDummyWeekData();
  const weekTableData = weekData.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return [
      dayName,
      day.activityCount.toString(),
      day.quizzesTaken.toString(),
      `${day.minutesStudied} min`,
      day.blogsRead.toString(),
      day.blogsCreated.toString(),
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Activities', 'Quizzes', 'Study Time', 'Blogs Read', 'Blogs Created']],
    body: weekTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Weekly Summary
  const totalActivities = weekData.reduce((sum, day) => sum + day.activityCount, 0);
  const totalQuizzes = weekData.reduce((sum, day) => sum + day.quizzesTaken, 0);
  const totalMinutes = weekData.reduce((sum, day) => sum + day.minutesStudied, 0);
  const totalBlogs = weekData.reduce((sum, day) => sum + day.blogsRead + day.blogsCreated, 0);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, yPos, 170, 25, 3, 3, 'F');
  
  yPos += 8;
  doc.text(`📊 Weekly Summary: ${totalActivities} total activities | ${totalQuizzes} quizzes | ${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m study time | ${totalBlogs} blogs`, 25, yPos);
  yPos += 7;
  doc.text(`📈 Daily Average: ${(totalActivities / 7).toFixed(1)} activities | ${(totalMinutes / 7).toFixed(0)} minutes`, 25, yPos);
  
  yPos += 20;
  
  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  // Badges Section
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Badges Progress', 20, yPos);
  yPos += 5;
  
  const earnedBadges = data.badges.filter(b => b.isUnlocked);
  const inProgressBadges = data.badges.filter(b => !b.isUnlocked && b.progress > 0);
  
  if (earnedBadges.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Earned Badges (${earnedBadges.length})`, 20, yPos);
    yPos += 5;
    
    const earnedTableData = earnedBadges.slice(0, 10).map(bp => [
      bp.badge.icon,
      bp.badge.name,
      bp.badge.rarity,
      bp.badge.category,
      bp.earnedAt ? new Date(bp.earnedAt).toLocaleDateString() : 'N/A',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['', 'Badge', 'Rarity', 'Category', 'Earned Date']],
      body: earnedTableData,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80], fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  if (inProgressBadges.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`In Progress (${inProgressBadges.length})`, 20, yPos);
    yPos += 5;
    
    const progressTableData = inProgressBadges.slice(0, 10).map(bp => [
      bp.badge.icon,
      bp.badge.name,
      `${Math.round(bp.progress)}%`,
      bp.badge.requirement,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['', 'Badge', 'Progress', 'Requirement']],
      body: progressTableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 152, 0], fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  // Rating Section
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rating Analysis', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Current Rating: ${currentRating}`, 20, yPos);
  yPos += 7;
  doc.text(`Peak Rating: ${peakRating}`, 20, yPos);
  yPos += 7;
  
  // Show Firebase stats if available
  if (data.userProfile) {
    doc.text(`Category: ${data.userProfile.currentCategory.toUpperCase()}`, 20, yPos);
    yPos += 7;
    doc.text(`Accuracy: ${userAccuracy.toFixed(1)}%`, 20, yPos);
    yPos += 7;
    doc.text(`Total Quizzes: ${userTotalQuizzes}`, 20, yPos);
    yPos += 7;
    doc.text(`Questions Attempted: ${data.userProfile.totalQuestionsAttempted}`, 20, yPos);
    yPos += 7;
    doc.text(`Correct Answers: ${data.userProfile.totalCorrectAnswers}`, 20, yPos);
    yPos += 7;
  } else {
    doc.text(`Percentile: Top ${data.rating.percentile}%`, 20, yPos);
    yPos += 7;
    doc.text(`Trend: ${data.rating.trend.charAt(0).toUpperCase() + data.rating.trend.slice(1)}`, 20, yPos);
    yPos += 7;
  }
  yPos += 5;
  
  // Rating Breakdown
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Rating Breakdown', 20, yPos);
  yPos += 5;
  
  const breakdownData = [
    ['Base Rating', data.breakdown.base.toString()],
    ['Quiz Performance', `+${data.breakdown.quizPerformance}`],
    ['Accuracy Bonus', `+${data.breakdown.accuracyBonus}`],
    ['Streak Bonus', `+${data.breakdown.streakBonus}`],
    ['Consistency Bonus', `+${data.breakdown.consistencyBonus}`],
    ['Penalty', data.breakdown.penalty < 0 ? data.breakdown.penalty.toString() : '0'],
    ['Total', data.breakdown.total.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: breakdownData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 40 },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  // Improvement Tips
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Personalized Tips', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  data.tips.slice(0, 8).forEach((tip, idx) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const lines = doc.splitTextToSize(`${idx + 1}. ${tip}`, 170);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6 + 3;
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | LearnWise Smart Hub`,
      105,
      290,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const fileName = `progress-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
