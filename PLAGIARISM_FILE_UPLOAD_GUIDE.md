# File Upload System - Complete Guide

## 📤 Overview

The plagiarism detection system now supports **file uploads** for PDF and image assignments, allowing students to submit documents and images directly through the platform.

---

## 🎯 Supported Assignment Types

### 1. **Text Assignments**
- Primary: Text input (required)
- Optional: File attachments
- Use case: Essays, written responses

### 2. **Code Assignments**
- Primary: Code input (required)
- Optional: File attachments
- Use case: Programming exercises

### 3. **PDF Assignments** ⭐ NEW
- Primary: PDF file upload (required)
- Optional: Additional notes
- Use case: Reports, research papers, documents

### 4. **Image Assignments** ⭐ NEW
- Primary: Image file upload (required)
- Optional: Additional notes
- Use case: Diagrams, screenshots, photos

---

## 👨‍🏫 For Teachers

### Creating a File Upload Assignment

#### Step 1: Open Create Assignment Dialog
```
Click "Create Assignment" button on teacher dashboard
```

#### Step 2: Select Assignment Type
```
Choose from dropdown:
- Text/Essay (traditional text input)
- Code (code editor)
- PDF Upload (file upload required) ⭐
- Image Upload (file upload required) ⭐
```

#### Step 3: Fill Assignment Details
```
Title: "Submit Your Research Paper"
Description: "Upload your completed research paper"
Type: PDF Upload
Max Score: 100
Due Date: [Select date]
Instructions: "Upload your paper in PDF format. Include references."
```

#### Step 4: Create
```
Click "Create Assignment"
Students will now see file upload interface
```

### Viewing Student Submissions with Files

When students submit files, you'll see:

```
📎 2 file(s) attached
  📄 research-paper.pdf (1.2 MB)
  📄 references.pdf (450 KB)
  
📝 Additional Notes:
"Completed all sections as per guidelines"
```

**Features:**
- File count badge
- File names with icons
- File sizes
- File type indicators
- Optional student notes

---

## 👨‍🎓 For Students

### Submitting a PDF Assignment

#### Step 1: Open Assignment
```
Navigate to: Student Dashboard → Click assignment card
```

#### Step 2: Upload Files
```
┌─────────────────────────────────┐
│     📤 Upload PDF File(s) *     │
│                                 │
│   ┌───────────────────────┐   │
│   │         ⬆️             │   │
│   │  Click to upload or   │   │
│   │   drag and drop       │   │
│   │                       │   │
│   │  PDF files (Max 5MB)  │   │
│   └───────────────────────┘   │
└─────────────────────────────────┘
```

**Actions:**
- Click the upload area
- OR drag files from your computer
- Select one or multiple PDF files
- Each file max 5MB

#### Step 3: Review Uploaded Files
```
Uploaded Files (2)
┌─────────────────────────────────┐
│ 📄 research-paper.pdf    1.2 MB │ ❌
│ 📄 references.pdf        450 KB │ ❌
└─────────────────────────────────┘
```

**Actions:**
- Click ❌ to remove any file
- Upload more files if needed

#### Step 4: Add Optional Notes
```
Additional Notes (Optional)
┌─────────────────────────────────┐
│ Add any additional notes or     │
│ comments...                     │
│                                 │
└─────────────────────────────────┘
```

#### Step 5: Submit
```
[Submit Assignment] ← Click to submit
```

### Submitting an Image Assignment

Same process as PDF, but:
- Accepts: JPG, PNG, GIF, WEBP
- Multiple images allowed
- Max 5MB per image

**Example:**
```
Uploaded Files (3)
┌─────────────────────────────────┐
│ 🖼️ diagram1.png         890 KB │ ❌
│ 🖼️ screenshot.jpg       1.1 MB │ ❌
│ 🖼️ flowchart.png        650 KB │ ❌
└─────────────────────────────────┘
```

---

## 🔧 Technical Details

### File Processing

1. **Selection**: User selects files
2. **Validation**: 
   - Check file size (≤ 5MB)
   - Check file type (PDF or Image)
3. **Encoding**: Convert to base64
4. **Storage**: Save in LocalStorage
5. **Display**: Show in teacher view

### File Storage Format

```typescript
{
  id: "file_1234567890_0.123",
  name: "research-paper.pdf",
  type: "application/pdf",
  size: 1258291, // bytes
  data: "data:application/pdf;base64,JVBERi0xLjQK...",
  uploadedAt: "2025-11-01T02:00:00.000Z"
}
```

### Storage Limits

| Item | Limit | Notes |
|------|-------|-------|
| File Size | 5 MB | Per file |
| Total Storage | ~5-10 MB | Browser LocalStorage limit |
| Files per Submission | Unlimited | Limited by total storage |
| File Types | PDF, Images | Based on assignment type |

---

## ✅ Validation Rules

### File Size Validation
```
❌ File too large
"File research-paper.pdf is too large. Max size is 5MB."

✅ File accepted
File uploaded successfully
```

### File Type Validation
```
❌ Wrong file type
"Invalid file type for document.docx. Please upload PDF files."

✅ Correct file type
File uploaded successfully
```

### Required Files
```
PDF/Image Assignments:
❌ Cannot submit without files
✅ Can submit with 1+ files

Text/Code Assignments:
❌ Cannot submit without text
✅ Can submit with text (files optional)
```

---

## 🎨 User Interface

### Upload Zone (Inactive)
```
┌─────────────────────────────────┐
│            ⬆️                    │
│   Click to upload or drag       │
│        and drop                 │
│                                 │
│   PDF files (Max 5MB per file)  │
└─────────────────────────────────┘
```

### Upload Zone (Hover)
```
┌═════════════════════════════════┐ ← Blue border
║            ⬆️                    ║
║   Click to upload or drag       ║
║        and drop                 ║
║                                 ║
║   PDF files (Max 5MB per file)  ║
└═════════════════════════════════┘
```

### File List
```
Uploaded Files (2)
┌─────────────────────────────────┐
│ 📄 paper.pdf           1.2 MB  ❌│
├─────────────────────────────────┤
│ 🖼️ diagram.png         890 KB  ❌│
└─────────────────────────────────┘
```

### Error Display
```
❌ File document.pdf is too large. Max size is 5MB.
```

---

## 📱 Mobile Support

### Touch-Friendly
- Large upload area
- Easy file selection
- Swipe to remove files
- Responsive layout

### Mobile Upload Flow
1. Tap upload area
2. Select from gallery/files
3. Review selection
4. Add notes (optional)
5. Tap submit

---

## 🔍 Troubleshooting

### Problem: "File too large"
**Solution**: 
- Compress the file
- Split into multiple smaller files
- Use online compression tools

### Problem: "Invalid file type"
**Solution**:
- Check assignment requirements
- Convert file to correct format
- PDF: Use PDF converter
- Image: Use image converter

### Problem: "Cannot submit"
**Solution**:
- Ensure at least one file uploaded (PDF/Image assignments)
- Check file size limits
- Verify file type is correct

### Problem: "Upload not working"
**Solution**:
- Check browser compatibility
- Clear browser cache
- Try different browser
- Check file permissions

---

## 💡 Best Practices

### For Teachers
✅ **Do:**
- Specify file format in instructions
- Set clear file size expectations
- Provide example file names
- Mention number of files needed

❌ **Don't:**
- Require very large files (>5MB)
- Accept too many file types
- Forget to mention file requirements

### For Students
✅ **Do:**
- Name files clearly (e.g., "LastName_Assignment1.pdf")
- Check file size before uploading
- Verify correct file type
- Add helpful notes
- Submit before deadline

❌ **Don't:**
- Upload wrong file type
- Exceed size limits
- Use special characters in filenames
- Wait until last minute

---

## 🎯 Use Cases

### Research Papers
```
Assignment Type: PDF Upload
Files: research-paper.pdf, references.pdf
Notes: "Includes all citations"
```

### Design Projects
```
Assignment Type: Image Upload
Files: mockup1.png, mockup2.png, final-design.jpg
Notes: "Three iterations as requested"
```

### Lab Reports
```
Assignment Type: PDF Upload
Files: lab-report.pdf, data-graphs.pdf
Notes: "All experiments completed"
```

### Screenshots
```
Assignment Type: Image Upload
Files: screenshot1.png, screenshot2.png
Notes: "Showing steps 1-5"
```

---

## 📊 Statistics

### File Upload Metrics
- **Supported Formats**: 6 (PDF, JPG, PNG, GIF, WEBP, JPEG)
- **Max File Size**: 5 MB
- **Max Files**: Unlimited (storage limited)
- **Validation**: Real-time
- **Storage**: LocalStorage (base64)

---

## 🚀 Quick Reference

### Student Checklist
- [ ] Open assignment
- [ ] Click upload area
- [ ] Select file(s)
- [ ] Verify files uploaded
- [ ] Add notes (optional)
- [ ] Click submit

### Teacher Checklist
- [ ] Create assignment
- [ ] Select PDF/Image type
- [ ] Add clear instructions
- [ ] Specify file requirements
- [ ] Set due date
- [ ] Create assignment

---

## 📞 Support

### Common Questions

**Q: Can I upload multiple files?**
A: Yes! Upload as many files as needed (within storage limits).

**Q: What if my file is too large?**
A: Compress it or split into smaller files under 5MB each.

**Q: Can I remove uploaded files?**
A: Yes, click the ❌ button next to any file before submitting.

**Q: Can I update my submission?**
A: Yes, you can update files until the deadline.

**Q: What formats are supported?**
A: PDF for PDF assignments, JPG/PNG/GIF/WEBP for image assignments.

---

**Version**: 1.1.0  
**Last Updated**: November 2025  
**Feature**: File Upload System
