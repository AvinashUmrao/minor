import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PlagiarismReport } from '@/types/plagiarism';

export const generatePlagiarismReportPDF = (report: PlagiarismReport) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Plagiarism Analysis Report', 105, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(report.assignmentTitle, 105, yPos, { align: 'center' });
  yPos += 15;

  doc.setTextColor(0, 0, 0);

  // Summary Statistics
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, yPos);
  yPos += 10;

  const stats = [
    { label: 'Total Submissions', value: report.analysis.totalSubmissions.toString() },
    { label: 'Total Comparisons', value: report.analysis.matches.length.toString() },
    { label: 'Flagged Matches', value: report.analysis.statistics.flaggedCount.toString() },
    { label: 'Average Similarity', value: `${(report.analysis.statistics.averageScore * 100).toFixed(1)}%` },
    { label: 'Highest Similarity', value: `${(report.analysis.statistics.highestScore * 100).toFixed(1)}%` },
    { label: 'Unique Submissions', value: report.analysis.statistics.uniqueSubmissions.toString() },
  ];

  let xOffset = 20;
  stats.forEach((stat, idx) => {
    if (idx > 0 && idx % 3 === 0) {
      yPos += 30;
      xOffset = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(xOffset, yPos, 55, 25, 3, 3, 'F');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 150, 243);
    doc.text(stat.value, xOffset + 27.5, yPos + 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(stat.label, xOffset + 27.5, yPos + 20, { align: 'center' });

    xOffset += 60;
  });

  yPos += 35;
  doc.setTextColor(0, 0, 0);

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Flagged Matches
  const flaggedMatches = report.analysis.matches.filter(m => m.isFlagged);
  
  if (flaggedMatches.length > 0) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Flagged Matches (High Risk)', 20, yPos);
    yPos += 5;

    const flaggedTableData = flaggedMatches.map(match => [
      match.studentName1,
      match.studentName2,
      `${(match.overallScore * 100).toFixed(1)}%`,
      `${(match.algorithms.jaccard * 100).toFixed(1)}%`,
      `${(match.algorithms.cosine * 100).toFixed(1)}%`,
      `${(match.algorithms.tfidf * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Student 1', 'Student 2', 'Overall', 'Jaccard', 'Cosine', 'TF-IDF']],
      body: flaggedTableData,
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // All Matches
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('All Similarity Matches', 20, yPos);
  yPos += 5;

  const allMatchesData = report.analysis.matches
    .sort((a, b) => b.overallScore - a.overallScore)
    .map(match => [
      match.studentName1,
      match.studentName2,
      `${(match.overallScore * 100).toFixed(1)}%`,
      match.isFlagged ? 'Yes' : 'No',
      match.matchedSegments.length.toString(),
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Student 1', 'Student 2', 'Similarity', 'Flagged', 'Segments']],
    body: allMatchesData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2 },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.cell.raw === 'Yes') {
        data.cell.styles.textColor = [220, 38, 38];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Detailed Algorithm Scores
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Algorithm Scores', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Top 10 matches by similarity score:', 20, yPos);
  yPos += 5;

  const topMatches = report.analysis.matches
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 10);

  topMatches.forEach((match, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${match.studentName1} ↔ ${match.studentName2}`, 20, yPos);
    yPos += 7;

    const algorithmData = [
      ['Jaccard Similarity', `${(match.algorithms.jaccard * 100).toFixed(2)}%`],
      ['Cosine Similarity', `${(match.algorithms.cosine * 100).toFixed(2)}%`],
      ['TF-IDF Similarity', `${(match.algorithms.tfidf * 100).toFixed(2)}%`],
      ['Levenshtein Similarity', `${(match.algorithms.levenshtein * 100).toFixed(2)}%`],
      ['LCS Similarity', `${(match.algorithms.lcs * 100).toFixed(2)}%`],
    ];

    if (match.algorithms.semantic !== undefined) {
      algorithmData.push(['Semantic Similarity', `${(match.algorithms.semantic * 100).toFixed(2)}%`]);
    }

    if (match.algorithms.ast !== undefined) {
      algorithmData.push(['AST Similarity', `${(match.algorithms.ast * 100).toFixed(2)}%`]);
      algorithmData.push(['CFG Similarity', `${(match.algorithms.cfg! * 100).toFixed(2)}%`]);
      algorithmData.push(['Winnowing Score', `${(match.algorithms.winnowing! * 100).toFixed(2)}%`]);
    }

    autoTable(doc, {
      startY: yPos,
      body: algorithmData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 40 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `plagiarism-report-${report.assignmentId}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
