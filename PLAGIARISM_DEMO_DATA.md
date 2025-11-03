# Plagiarism Detection - Demo Data Guide

## 🎯 Overview

The system now includes **comprehensive dummy data** with 2 assignments and 8 submissions, perfectly designed to demonstrate the plagiarism detection algorithms.

---

## 📚 Sample Assignments

### Assignment 1: Introduction to Data Structures (Text)
- **Type**: Text/Essay
- **Submissions**: 4 students
- **Similarity Levels**: High (80%+), Medium (40-60%), Low (<40%)
- **Purpose**: Demonstrate text plagiarism detection

### Assignment 2: Implement Binary Search (Code)
- **Type**: Code (JavaScript)
- **Submissions**: 4 students
- **Similarity Levels**: Very High (90%+), High (70-80%), Medium (50-60%)
- **Purpose**: Demonstrate code plagiarism detection with AST/CFG/Winnowing

---

## 👥 Sample Students

1. **Alex Thompson** (student1)
2. **Emma Wilson** (student2)
3. **Michael Chen** (student3)
4. **Sarah Martinez** (student4)

---

## 📊 Expected Plagiarism Results

### Text Assignment (assign1)

#### High Similarity Pair 🚨
**Alex Thompson vs Emma Wilson**
- **Expected Score**: ~85-90%
- **Why**: Nearly identical content with minor word changes
- **Detection**: 
  - Jaccard: ~85%
  - Cosine: ~90%
  - TF-IDF: ~88%
  - LCS: ~87%
- **Flagged**: YES (Red)

**Sample Matched Text:**
```
Student 1: "Data structures are fundamental components in computer science..."
Student 2: "Data structures are fundamental building blocks in computer science..."
```

#### Medium Similarity Pair ⚠️
**Alex Thompson vs Sarah Martinez**
- **Expected Score**: ~45-55%
- **Why**: Same topic, different approach and vocabulary
- **Detection**:
  - Jaccard: ~50%
  - Cosine: ~48%
  - Semantic: ~52%
- **Flagged**: NO (Yellow)

#### Low Similarity Pair ✅
**Michael Chen vs Sarah Martinez**
- **Expected Score**: ~25-35%
- **Why**: Different content focus (Michael: advanced structures, Sarah: basics)
- **Detection**:
  - Jaccard: ~30%
  - Cosine: ~28%
- **Flagged**: NO (Green)

---

### Code Assignment (assign2)

#### Very High Similarity Pair 🚨🚨
**Alex Thompson vs Emma Wilson**
- **Expected Score**: ~92-95%
- **Why**: Same algorithm, only variable names changed
- **Detection**:
  - AST: ~95%
  - CFG: ~95%
  - Winnowing: ~93%
  - Variable Renaming: DETECTED
- **Flagged**: YES (Red)

**Code Comparison:**
```javascript
// Alex: left, right, mid
// Emma: start, end, middle
// Same structure, renamed variables!
```

#### High Similarity Pair 🚨
**Alex Thompson vs Michael Chen**
- **Expected Score**: ~75-80%
- **Why**: Same algorithm, added error handling
- **Detection**:
  - AST: ~80%
  - CFG: ~78%
  - Winnowing: ~76%
- **Flagged**: YES (Red)

#### Medium Similarity Pair ⚠️
**Alex Thompson vs Sarah Martinez**
- **Expected Score**: ~70-75%
- **Why**: Same algorithm, arrow function vs regular function
- **Detection**:
  - AST: ~72%
  - Winnowing: ~70%
- **Flagged**: YES (Red)

---

## 🚀 How to Test

### Step 1: Clear Existing Data (Optional)
```javascript
// Open browser console on /plagiarism page
localStorage.clear();
// Refresh page
```

### Step 2: Access System
1. Navigate to: `http://localhost:8082/plagiarism`
2. Select **"Teacher"** role
3. You'll see 2 assignments with submissions

### Step 3: View Submissions
1. Click on **"Introduction to Data Structures"**
2. Go to **"Submissions"** tab
3. See 4 student submissions

### Step 4: Run Plagiarism Analysis
1. Go to **"Plagiarism Analysis"** tab
2. Click **"Run Analysis"**
3. Wait 1-2 seconds for processing
4. View results!

### Step 5: Explore Results
- **Overall Statistics**: See total comparisons, flagged matches
- **Match List**: Sorted by similarity score
- **Algorithm Breakdown**: View individual algorithm scores
- **Details**: Click to see side-by-side comparison

### Step 6: Download Report
1. Click **"Download Report"**
2. Get comprehensive PDF with all analysis

---

## 🔍 What to Look For

### Text Assignment Results

#### Expected Flagged Matches (≥60%)
1. ✅ **Alex vs Emma**: ~88% (Very High)
   - Nearly identical paragraphs
   - Same sentence structures
   - Minor word substitutions

#### Expected Medium Risk (40-59%)
2. ⚠️ **Alex vs Sarah**: ~50% (Medium)
   - Same topic coverage
   - Different writing style
   - Some common phrases

#### Expected Low Risk (<40%)
3. ✅ **Michael vs Sarah**: ~30% (Low)
   - Different focus areas
   - Unique content
   - Minimal overlap

### Code Assignment Results

#### Expected Flagged Matches (≥60%)
1. 🚨 **Alex vs Emma**: ~93% (Critical)
   - **Variable Renaming Detected!**
   - Identical algorithm structure
   - Same logic flow
   - Only variable names changed

2. 🚨 **Alex vs Michael**: ~78% (High)
   - Same core algorithm
   - Added error handling
   - Similar structure

3. 🚨 **Alex vs Sarah**: ~72% (High)
   - Arrow function vs regular function
   - Same algorithm logic
   - Different syntax style

---

## 📈 Algorithm Performance Demo

### Text Analysis Showcase

**Jaccard Similarity**
- Detects word overlap
- Alex vs Emma: ~85% (many common words)

**Cosine Similarity**
- Measures vector angles
- Alex vs Emma: ~90% (similar word distribution)

**TF-IDF**
- Weighs important terms
- Alex vs Emma: ~88% (same key terms)

**Levenshtein**
- Character-level edits
- Alex vs Emma: ~82% (minor character changes)

**LCS**
- Longest common sequences
- Alex vs Emma: ~87% (long matching sequences)

**Semantic**
- Meaning-based
- Alex vs Emma: ~85% (same concepts)

### Code Analysis Showcase

**AST (Abstract Syntax Tree)**
- Structure analysis
- Alex vs Emma: ~95% (identical structure)

**CFG (Control Flow Graph)**
- Logic flow
- Alex vs Emma: ~95% (same flow)

**Winnowing**
- Code fingerprints
- Alex vs Emma: ~93% (matching fingerprints)

**Variable Renaming Detection**
- Catches renamed variables
- Alex vs Emma: ✅ DETECTED

---

## 🎓 Educational Value

### Learning Outcomes

Students can learn:
1. **How plagiarism is detected** - See algorithms in action
2. **What triggers high scores** - Understand similarity metrics
3. **Variable renaming doesn't work** - AST/CFG catches it
4. **Paraphrasing importance** - See difference in scores
5. **Original work value** - Low similarity = unique content

### Teachers can demonstrate:
1. **Multiple algorithm approach** - More accurate than single method
2. **Code-specific detection** - Beyond simple text comparison
3. **Weighted scoring** - How overall score is calculated
4. **Visual comparison** - Side-by-side highlighting
5. **Professional reporting** - PDF export capability

---

## 💡 Testing Scenarios

### Scenario 1: Obvious Plagiarism
**Test**: Alex vs Emma (Text)
**Expected**: 85-90% similarity, FLAGGED
**Demonstrates**: Direct copying with minor changes

### Scenario 2: Variable Renaming
**Test**: Alex vs Emma (Code)
**Expected**: 92-95% similarity, FLAGGED, Variable Renaming Detected
**Demonstrates**: AST/CFG catches structural similarity

### Scenario 3: Legitimate Similarity
**Test**: Michael vs Sarah (Text)
**Expected**: 25-35% similarity, NOT FLAGGED
**Demonstrates**: Same topic doesn't mean plagiarism

### Scenario 4: Code Paraphrasing
**Test**: Alex vs Sarah (Code)
**Expected**: 70-75% similarity, FLAGGED
**Demonstrates**: Different syntax, same algorithm

---

## 📊 Statistics You'll See

### Overall Statistics
- **Total Submissions**: 4 per assignment
- **Total Comparisons**: 6 pairs per assignment (4 choose 2)
- **Flagged Matches**: 
  - Text: 1-2 matches
  - Code: 3-4 matches
- **Average Similarity**:
  - Text: ~45-55%
  - Code: ~75-85%

### Algorithm Breakdown
Each match shows:
- 6 text algorithms (Text assignments)
- 9 algorithms (Code assignments, includes AST/CFG/Winnowing)
- Overall weighted score
- Matched segments count

---

## 🎯 Demo Script

### Quick Demo (5 minutes)
1. Open teacher dashboard
2. Click "Introduction to Data Structures"
3. Show 4 submissions
4. Run analysis
5. Show Alex vs Emma match (~88%)
6. Click "Details" for side-by-side view
7. Highlight matched segments

### Full Demo (15 minutes)
1. Show both assignments
2. Explain assignment types
3. View all submissions
4. Run analysis on text assignment
5. Explain algorithm scores
6. Show side-by-side comparison
7. Run analysis on code assignment
8. Demonstrate variable renaming detection
9. Download PDF report
10. Show report contents

---

## 🔄 Resetting Data

### Clear All Data
```javascript
// Browser console
localStorage.clear();
location.reload();
```

### Clear Only Plagiarism Data
```javascript
// Browser console
localStorage.removeItem('plagiarism_assignments');
localStorage.removeItem('plagiarism_submissions');
localStorage.removeItem('plagiarism_analyses');
location.reload();
```

### Reinitialize Sample Data
```javascript
// Data will auto-initialize on next page load
// Or manually call in console:
// (requires access to functions)
```

---

## 📝 Notes

### Data Characteristics
- **Realistic**: Based on actual student submission patterns
- **Varied**: Different similarity levels for comprehensive testing
- **Educational**: Shows both plagiarism and legitimate work
- **Demonstrable**: Clear examples for each algorithm

### Similarity Ranges
- **90-100%**: Direct copy (very rare in dummy data)
- **70-89%**: High plagiarism (code examples)
- **60-69%**: Moderate plagiarism (flagged)
- **40-59%**: Medium similarity (not flagged)
- **0-39%**: Low similarity (original work)

---

## 🎉 Ready to Demo!

The system is now loaded with realistic dummy data that perfectly demonstrates:
- ✅ Text plagiarism detection
- ✅ Code plagiarism detection
- ✅ Variable renaming detection
- ✅ Multiple algorithm analysis
- ✅ Side-by-side comparison
- ✅ PDF report generation
- ✅ Flagging system
- ✅ Visual highlighting

**Just navigate to `/plagiarism`, select Teacher, and click "Run Analysis"!**

---

**Version**: 1.2.0  
**Last Updated**: November 2025  
**Feature**: Comprehensive Demo Data
