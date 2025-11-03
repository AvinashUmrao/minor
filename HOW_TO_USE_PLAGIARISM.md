# How to Use Plagiarism Detection System - Step by Step

## 🎯 Quick Access

**URL**: `http://localhost:8082/plagiarism`

---

## 📍 Step-by-Step Guide

### Step 1: Navigate to Plagiarism System
1. Open your browser
2. Go to: `http://localhost:8082/plagiarism`
3. You'll see the **Role Selection Page**

### Step 2: Choose Your Role

You'll see TWO cards:

```
┌─────────────────┐  ┌─────────────────┐
│    👨‍🏫 Teacher   │  │    👨‍🎓 Student   │
│                 │  │                 │
│ [Continue as    │  │ [Continue as    │
│    Teacher]     │  │    Student]     │
└─────────────────┘  └─────────────────┘
```

**Click one of the buttons!**

---

## 👨‍🏫 As Teacher (Testing Plagiarism Detection)

### After clicking "Continue as Teacher":

1. **You'll see**: Teacher Dashboard with 2 assignments
   - "Introduction to Data Structures" (Text)
   - "Implement Binary Search" (Code)

2. **Click**: "Introduction to Data Structures" card

3. **You'll see**: Two tabs
   - Submissions (4 students already submitted!)
   - Plagiarism Analysis

4. **Click**: "Plagiarism Analysis" tab

5. **Click**: "Run Analysis" button (green button)

6. **Wait**: 1-2 seconds

7. **See Results**:
   - Total comparisons: 6
   - Flagged matches: 1-2 (red badges)
   - Match cards with similarity scores

8. **Click**: "Details" on any match to see:
   - Side-by-side comparison
   - Highlighted similar text
   - All algorithm scores

9. **Click**: "Download Report" to get PDF

### To Switch to Student View:
- Click **"Switch to Student"** button (top of page, next to "Teacher Dashboard" badge)

---

## 👨‍🎓 As Student (Submitting Assignments)

### After clicking "Continue as Student":

1. **You'll see**: Student Dashboard with:
   - Summary cards (Pending, Submitted, Overdue)
   - List of available assignments

2. **To Submit**:
   - Click "View Assignment" on any assignment card
   - A dialog opens with assignment details

3. **For Text/Code Assignments**:
   - Type your answer in the text area
   - Click "Submit Assignment"

4. **For PDF/Image Assignments** (if teacher creates one):
   - Click the upload area
   - Select files from your computer
   - Add optional notes
   - Click "Submit Assignment"

### To Switch to Teacher View:
- Click **"Switch to Teacher"** button (top of page, next to "Student Dashboard" badge)

---

## 🔄 Switching Between Roles

### Method 1: Use Switch Button
- On Teacher page: Click "Switch to Student"
- On Student page: Click "Switch to Teacher"
- Confirm the dialog
- You'll return to role selection page

### Method 2: Navigate Directly
- Go to: `http://localhost:8082/plagiarism`
- Choose your role again

### Method 3: Clear and Restart
```javascript
// Open browser console (F12)
localStorage.removeItem('plagiarism_current_user');
localStorage.removeItem('plagiarism_user_role');
location.reload();
```

---

## 📊 What You'll See

### Role Selection Page
```
┌─────────────────────────────────────────┐
│   Plagiarism Detection System           │
│   Select Your Role                      │
│                                         │
│   ┌──────────┐      ┌──────────┐      │
│   │ Teacher  │      │ Student  │      │
│   │          │      │          │      │
│   │ [Button] │      │ [Button] │      │
│   └──────────┘      └──────────┘      │
└─────────────────────────────────────────┘
```

### Teacher Dashboard
```
┌─────────────────────────────────────────┐
│ [Teacher Dashboard] [Switch to Student] │
│ Plagiarism Detection System             │
│                                         │
│ [Create Assignment]                     │
│                                         │
│ ┌──────────┐  ┌──────────┐            │
│ │Assignment│  │Assignment│            │
│ │    1     │  │    2     │            │
│ └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Student Dashboard
```
┌─────────────────────────────────────────┐
│ [Student Dashboard] [Switch to Teacher] │
│ My Assignments                          │
│                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │Pend │ │Submi│ │Over │               │
│ │ing  │ │tted │ │due  │               │
│ └─────┘ └─────┘ └─────┘               │
│                                         │
│ Available Assignments:                  │
│ ┌──────────┐  ┌──────────┐            │
│ │Assignment│  │Assignment│            │
│ └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

---

## ✅ Quick Test Checklist

### Test 1: View as Teacher
- [ ] Go to `/plagiarism`
- [ ] Click "Continue as Teacher"
- [ ] See 2 assignments
- [ ] Click first assignment
- [ ] See 4 submissions
- [ ] Click "Plagiarism Analysis"
- [ ] Click "Run Analysis"
- [ ] See results with similarity scores

### Test 2: View as Student
- [ ] Click "Switch to Student" button
- [ ] See student dashboard
- [ ] See available assignments
- [ ] Click "View Assignment"
- [ ] See assignment details
- [ ] See submission form

### Test 3: Switch Roles
- [ ] Click "Switch to Teacher"
- [ ] Confirm dialog
- [ ] Return to role selection
- [ ] Choose role again

---

## 🎯 Demo Flow (5 Minutes)

1. **Start**: Go to `/plagiarism`
2. **Select**: Click "Continue as Teacher"
3. **View**: See 2 assignments with dummy data
4. **Open**: Click "Introduction to Data Structures"
5. **Check**: See 4 student submissions
6. **Analyze**: Go to "Plagiarism Analysis" tab
7. **Run**: Click "Run Analysis" button
8. **Results**: See similarity scores (Alex vs Emma ~88%)
9. **Details**: Click "Details" on top match
10. **Compare**: See side-by-side with highlights
11. **Report**: Click "Download Report"
12. **Switch**: Click "Switch to Student"
13. **Student View**: See assignments from student perspective
14. **Done**: You've seen both views!

---

## 🐛 Troubleshooting

### Problem: "Can't see role selection page"
**Solution**: 
- Go directly to: `http://localhost:8082/plagiarism`
- Or clear storage and refresh

### Problem: "Stuck in one role"
**Solution**:
- Click "Switch to [Other Role]" button at top
- Or clear localStorage and refresh

### Problem: "No assignments showing"
**Solution**:
- Data auto-initializes on first load
- Try refreshing the page
- Or clear localStorage to reinitialize

### Problem: "Can't switch roles"
**Solution**:
```javascript
// Browser console
localStorage.clear();
location.reload();
```

---

## 📝 Important Notes

1. **Role Selection Page**: Shows when you first visit `/plagiarism`
2. **Switch Button**: Available on both Teacher and Student dashboards
3. **Dummy Data**: Automatically loads 2 assignments + 8 submissions
4. **Persistence**: Your role is saved in localStorage
5. **Testing**: You can switch between roles anytime

---

## 🎉 You're Ready!

The plagiarism detection system is fully functional with:
- ✅ Role selection page
- ✅ Teacher dashboard
- ✅ Student dashboard
- ✅ Switch role buttons
- ✅ Dummy data pre-loaded
- ✅ All features working

**Just go to `/plagiarism` and start exploring!** 🚀

---

**Need Help?**
- Check if dev server is running: `npm run dev`
- Verify URL: `http://localhost:8082/plagiarism`
- Look for "Switch to [Role]" button at top of dashboards
- Clear localStorage if stuck
