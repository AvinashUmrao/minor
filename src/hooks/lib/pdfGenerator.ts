import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BadgeProgress } from '@/types/gamification';
import type { UserStreak, UserRating, RatingBreakdown } from '@/types/gamification';
import type { StudentProgress } from './gamification';

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
  rating: UserRating;
  breakdown: RatingBreakdown;
}

export const generateProgressReportPDF = (data: ProgressReportData) => {
  try {
    const doc = new jsPDF();
    
    // Solid color theme
    const primaryBlue: [number, number, number] = [59, 130, 246];
    const lightBlue: [number, number, number] = [219, 234, 254];
    const darkText: [number, number, number] = [30, 41, 59];
    const grayText: [number, number, number] = [100, 116, 139];
    
    // Full page header with solid color
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, 210, 60, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('PROGRESS', 105, 35, { align: 'center' });
    
    // Date
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(reportDate, 105, 48, { align: 'center' });
    
    // Main content area
    let yPos = 80;
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    
    // Stats Grid - 2x2 layout
    const stats = [
      { label: 'Current Streak', value: `${data.streak.currentStreak}`, unit: 'days', color: [251, 146, 60] as const },
      { label: 'Badges Earned', value: `${data.badgeStats.earned}`, unit: 'badges', color: [234, 179, 8] as const },
      { label: 'Current Rating', value: `${data.rating.current}`, unit: 'points', color: [59, 130, 246] as const },
      { label: 'Active Days', value: `${data.streakStats.totalActiveDays}`, unit: 'days', color: [34, 197, 94] as const },
    ];
    
    // Draw stat boxes in 2x2 grid
    const boxWidth = 80;
    const boxHeight = 50;
    const spacing = 10;
    const startX = 25;
    
    stats.forEach((stat, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (boxWidth + spacing);
      const y = yPos + row * (boxHeight + spacing);
      
      // Box background
      doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      doc.roundedRect(x, y, boxWidth, boxHeight, 4, 4, 'F');
      
      // Value
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.text(stat.value, x + boxWidth / 2, y + 22, { align: 'center' });
      
      // Unit
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(stat.unit, x + boxWidth / 2, y + 32, { align: 'center' });
      
      // Label
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(stat.label, x + boxWidth / 2, y + 44, { align: 'center' });
    });
    
    yPos += 130;
    
    // Performance Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Performance Summary', 25, yPos);
    yPos += 12;
    
    // Summary box
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.roundedRect(25, yPos, 160, 40, 4, 4, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    
    yPos += 12;
    doc.text(`• Longest Streak: ${data.streak.longestStreak} days`, 35, yPos);
    yPos += 8;
    doc.text(`• Peak Rating: ${data.rating.peak} points`, 35, yPos);
    yPos += 8;
    doc.text(`• Badges Progress: ${data.badgeStats.earned}/${data.badgeStats.total} earned`, 35, yPos);
    
    yPos += 20;
    
    // Achievement Highlight
    if (data.badgeStats.earned > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text('Recent Achievement', 25, yPos);
      yPos += 12;
      
      const latestBadge = data.badges.find(b => b.isUnlocked);
      if (latestBadge && latestBadge.badge) {
        doc.setFillColor(254, 249, 195);
        doc.roundedRect(25, yPos, 160, 25, 4, 4, 'F');
        
        doc.setFontSize(20);
        doc.text(latestBadge.badge.icon || '🏆', 35, yPos + 17);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(latestBadge.badge.name, 50, yPos + 12);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text(latestBadge.badge.description, 50, yPos + 20);
      }
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('LearnWise Smart Hub - Your Learning Journey', 105, 285, { align: 'center' });
    
    // Save the PDF
    const fileName = `progress-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating progress report PDF:', error);
    throw new Error('Failed to generate progress report. Please try again.');
  }
};

// ============================================
// Second Function with fixes
// ============================================

export const generateProgressPDF = (progress: StudentProgress, suggestions: string[]) => {
  try {
    const doc = new jsPDF();

    // Theme colors (use as [R,G,B])
    const primary: [number, number, number] = [59, 130, 246];
    const lightBlue: [number, number, number] = [219, 234, 254];
    const darkText: [number, number, number] = [30, 41, 59];
    const gray: [number, number, number] = [100, 116, 139];

    // ----- HEADER (compact) -----
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Progress Report', 105, 14, { align: 'center' });

    // Date
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
    doc.setFontSize(9);
    doc.text(reportDate, 105, 23, { align: 'center' });

    // ----- STATS GRID -----
    let y = 38;

    const stats = [
      { label: 'Current Streak', value: `${progress.currentStreak}`, unit: 'days' },
      { label: 'Badges Earned', value: `${progress.badges.length}`, unit: 'badges' },
      { label: 'Total Score', value: `${progress.totalScore}`, unit: 'pts' },
      { label: 'Avg Accuracy', value: `${progress.averageAccuracy ?? 0}%`, unit: '' },
    ];

    const boxW = 80, boxH = 30, startX = 20, gap = 10;

    stats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (boxW + gap);
      const rectY = y + row * (boxH + gap);

      doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      doc.roundedRect(x, rectY, boxW, boxH, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(stat.value, x + boxW / 2, rectY + 12, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      if (stat.unit) {
        doc.text(stat.unit, x + boxW / 2, rectY + 18, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(stat.label, x + boxW / 2, rectY + 25, { align: 'center' });
    });

    y += 72;

    // ----- BADGES TABLE (compact) -----
    if (progress.badges.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(`Badges Earned (${progress.badges.length})`, 20, y);

      autoTable(doc, {
        startY: y + 3,
        head: [['Icon', 'Badge', 'Description']],
        body: progress.badges.slice(0, 3).map(b => [b.icon, b.name, b.description]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: lightBlue, fontSize: 8 },
        theme: 'grid',
        tableWidth: 170,
        margin: { left: 20 },
      });

      // Properly access finalY after autoTable
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    // ----- IMPROVEMENT TIPS -----
    // Check if we have space for tips (max y should be ~270)
    if (y < 240) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text('Improvement Tips', 20, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);

      // Calculate how many tips fit
      const availableSpace = 270 - y;
      const maxTips = Math.min(Math.floor(availableSpace / 5), suggestions.length, 6);
      suggestions.slice(0, maxTips).forEach((tip, i) => {
        const truncatedTip = tip.length > 80 ? tip.substring(0, 77) + '...' : tip;
        doc.text(`• ${truncatedTip}`, 22, y + 5 * (i + 1));
      });
    }

    // ----- FOOTER -----
    doc.setFontSize(7);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('LearnWise Smart Hub • Your Learning Journey', 105, 287, { align: 'center' });

    doc.save('progress-report.pdf');
  } catch (error) {
    console.error('Error generating progress PDF:', error);
    throw new Error('Failed to generate progress PDF. Please try again.');
  }
};