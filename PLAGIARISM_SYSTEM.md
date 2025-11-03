# Plagiarism Detection & Assignment System

## 🎯 Overview

A comprehensive plagiarism detection and assignment management system integrated into LearnWise Smart Hub. This module operates independently from other systems (leaderboard, rating, streak) and provides advanced multi-algorithm plagiarism detection for both text and code submissions.

## ✨ Key Features

### For Teachers
- **Assignment Creation**: Create dynamic assignments with support for:
  - Text/Essay submissions
  - Code submissions (JavaScript, TypeScript, Python, Java, C++, C)
  - PDF uploads
  - Image uploads
- **Submission Management**: View all student submissions in one place
- **Advanced Plagiarism Detection**: Run multi-algorithm analysis on submissions
- **Detailed Reports**: View side-by-side comparisons with highlighted similarities
- **PDF Export**: Download comprehensive plagiarism analysis reports

### For Students
- **Assignment Dashboard**: View all assignments organized by status (Pending, Submitted, Overdue)
- **Easy Submission**: Submit text or code directly through the interface
- **Update Submissions**: Modify submissions before the deadline
- **Status Tracking**: Monitor submission status and deadlines

## 🔬 Plagiarism Detection Algorithms

### Text Analysis Algorithms

1. **Jaccard Similarity**
   - Measures overlap between word sets
   - Range: 0-1 (0 = no similarity, 1 = identical)

2. **Cosine Similarity**
   - Calculates angle between document vectors
   - Effective for detecting similar content with different word order

3. **TF-IDF (Term Frequency-Inverse Document Frequency)**
   - Weighs word importance across documents
   - Identifies significant term overlap

4. **Levenshtein Distance**
   - Character-level edit distance
   - Detects minor text modifications

5. **LCS (Longest Common Subsequence)**
   - Finds longest matching character sequences
   - Identifies copied segments

6. **Semantic Similarity**
   - Simplified word embedding approach
   - Detects meaning-based similarities

### Code-Specific Algorithms

1. **AST (Abstract Syntax Tree) Analysis**
   - Analyzes code structure independent of formatting
   - Detects structural similarities

2. **CFG (Control Flow Graph) Similarity**
   - Compares program logic flow
   - Identifies algorithmic similarities

3. **Winnowing Fingerprinting**
   - Creates k-gram fingerprints of code
   - Efficient for large-scale comparisons

4. **Variable Renaming Detection**
   - Identifies code with renamed variables
   - Catches common plagiarism tactics

## 📊 Scoring System

### Overall Similarity Score
- Weighted combination of all applicable algorithms
- **Text Assignments**: Equal weights across 6 algorithms
- **Code Assignments**: Higher weights for AST, CFG, and Winnowing

### Flagging Thresholds
- **≥ 60%**: Automatically flagged as high risk
- **40-59%**: Medium risk (yellow warning)
- **< 40%**: Low risk (green)

## 🗂️ File Structure

```
src/
├── types/
│   └── plagiarism.ts                    # Type definitions
├── lib/
│   ├── plagiarismDetection.ts          # All detection algorithms
│   ├── plagiarismStorage.ts            # LocalStorage utilities
│   └── plagiarismPdfGenerator.ts       # PDF report generation
├── components/
│   └── plagiarism/
│       ├── CreateAssignmentDialog.tsx   # Assignment creation form
│       ├── AssignmentCard.tsx           # Assignment display card
│       ├── SubmissionForm.tsx           # Student submission form
│       ├── PlagiarismDashboard.tsx      # Analysis dashboard
│       └── SimilarityVisualization.tsx  # Side-by-side comparison
└── pages/
    ├── PlagiarismPage.tsx               # Role selection page
    ├── TeacherPlagiarismPage.tsx        # Teacher interface
    └── StudentPlagiarismPage.tsx        # Student interface
```

## 🚀 Usage Guide

### Accessing the System

1. Navigate to `/plagiarism` in your browser
2. Select your role:
   - **Teacher**: Create and manage assignments, analyze plagiarism
   - **Student**: View and submit assignments

### For Teachers

#### Creating an Assignment
1. Click "Create Assignment"
2. Fill in:
   - Title and description
   - Assignment type (text/code/pdf/image)
   - Max score
   - Due date
   - Detailed instructions
   - (For code) Programming language
3. Click "Create Assignment"

#### Running Plagiarism Analysis
1. Click on an assignment
2. Go to "Plagiarism Analysis" tab
3. Click "Run Analysis" (requires at least 2 submissions)
4. View results:
   - Overall statistics
   - Individual match scores
   - Algorithm breakdown
5. Click "Details" on any match to see side-by-side comparison
6. Download PDF report for documentation

#### Understanding Results
- **Overall Score**: Weighted average of all algorithms
- **Flagged Matches**: Automatically highlighted in red
- **Matched Segments**: Specific text/code portions that are similar
- **Algorithm Breakdown**: Individual scores from each detection method

### For Students

#### Submitting an Assignment
1. View available assignments on the dashboard
2. Click "View Assignment" on any assignment card
3. Read the instructions carefully
4. Enter your answer/code in the text area
5. Click "Submit Assignment"
6. You can update your submission before the deadline

#### Tracking Submissions
- **Pending**: Not yet submitted
- **Submitted**: Successfully submitted
- **Overdue**: Past the deadline without submission

## 🔧 Technical Details

### Data Storage
- All data stored in browser's LocalStorage
- Keys:
  - `plagiarism_assignments`: All assignments
  - `plagiarism_submissions`: All submissions
  - `plagiarism_analyses`: Analysis results
  - `plagiarism_current_user`: Current user info
  - `plagiarism_user_role`: Current role

### Algorithm Weights

**Text Assignments:**
```javascript
{
  jaccard: 0.15,
  cosine: 0.20,
  tfidf: 0.20,
  levenshtein: 0.15,
  lcs: 0.15,
  semantic: 0.15
}
```

**Code Assignments:**
```javascript
{
  jaccard: 0.10,
  cosine: 0.10,
  tfidf: 0.10,
  levenshtein: 0.10,
  lcs: 0.10,
  semantic: 0.10,
  ast: 0.15,
  cfg: 0.15,
  winnowing: 0.10
}
```

### Performance Considerations
- Analysis runs client-side
- O(n²) comparison complexity (all pairs)
- Recommended: < 50 submissions per assignment for optimal performance
- Large submissions may take longer to analyze

## 📝 Sample Data

The system initializes with sample assignments:
1. **Introduction to Data Structures** (Text)
2. **Implement Binary Search** (Code)

Sample users:
- **Teacher**: Dr. Sarah Johnson (teacher1)
- **Student**: Alex Thompson (student1)

## 🎨 UI Features

### Visual Highlights
- Color-coded similarity scores (green/yellow/red)
- Progress bars for algorithm scores
- Highlighted matched segments in side-by-side view
- Badge indicators for flagged submissions

### Responsive Design
- Mobile-friendly interface
- Adaptive grid layouts
- Scrollable content areas
- Touch-friendly buttons

## 🔒 Independence from Other Systems

This module is completely independent:
- ❌ Does NOT affect gamification badges
- ❌ Does NOT impact rating calculations
- ❌ Does NOT interfere with streak tracking
- ❌ Does NOT modify leaderboard scores
- ✅ Operates in isolated LocalStorage namespace
- ✅ Separate routing and navigation
- ✅ Independent user management

## 🚦 Getting Started

1. **Access the system**: Navigate to `/plagiarism`
2. **Choose role**: Select Teacher or Student
3. **Explore features**:
   - Teachers: Create an assignment and run analysis
   - Students: Submit to available assignments
4. **View results**: Analyze plagiarism reports and comparisons

## 📊 PDF Report Contents

Generated reports include:
- Summary statistics
- Flagged matches table
- All similarity matches
- Detailed algorithm scores for top 10 matches
- Timestamp and assignment information

## 🎯 Best Practices

### For Teachers
- Set clear assignment instructions
- Run analysis after all submissions are in
- Review flagged matches manually
- Use multiple algorithm scores for context
- Download reports for record-keeping

### For Students
- Submit original work
- Cite sources when applicable
- Review instructions carefully
- Submit before the deadline
- Keep a local copy of your work

## 🔮 Future Enhancements

Potential improvements:
- Multi-language support for code analysis
- Integration with external plagiarism databases
- Real-time similarity checking during submission
- Batch assignment creation
- Export to multiple formats (CSV, JSON)
- Advanced filtering and search
- Email notifications for teachers
- Submission history tracking

## 📞 Support

For issues or questions:
1. Check the assignment instructions
2. Review the algorithm breakdown
3. Contact your teacher/administrator
4. Refer to this documentation

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**System**: LearnWise Smart Hub - Plagiarism Detection Module
