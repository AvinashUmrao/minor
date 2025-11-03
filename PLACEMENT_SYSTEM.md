# Placement Analytics System

## Overview

The Placement Analytics System is a comprehensive module for tracking and analyzing campus placement data. It supports the data format with company information, roles, packages, and selected students.

**Important:** The system automatically handles two different package formats:
- **Rupee format**: Large numbers like `9425000` (₹94.25 LPA)
- **LPA format**: Decimal numbers like `9.5` (₹9.5 LPA)

All package values are automatically converted to LPA for consistent display and calculations.

## Data Format

The system expects data in the following JSON format:

```json
{
  "ok": true,
  "data": [
    {
      "_id": "unique-id",
      "company": "Company Name",
      "roles": [
        {
          "role": "Role Title",
          "package": 9.5,
          "package_details": "INR 9.5 LPA"
        }
      ],
      "job_location": ["Location1", "Location2"],
      "joining_date": "2025-01-01" or null,
      "students_selected": [
        {
          "name": "Student Name",
          "enrollment_number": "12345678",
          "email": "student@example.com" or null,
          "role": "Role Title",
          "package": 9.5,  // Can be 9.5 (LPA) or 9425000 (rupees)
          "branch": "Computer Science"  // Optional field
        }
      ],
      "number_of_offers": 29,
      "additional_info": "Additional information about the placement",
      "email_subject": "Email subject",
      "email_sender": "Sender Name <email@example.com>",
      "saved_at": "2025-09-18T05:40:41.636Z"
    }
  ]
}
```

## File Structure

```
src/
├── types/
│   └── placement.ts          # TypeScript type definitions
├── data/
│   └── placementData.ts      # Sample data and utility functions
├── lib/
│   ├── placementUtils.ts     # Helper functions for data manipulation
│   └── packageConverter.ts   # Package format conversion utilities
└── pages/
    └── Placements.tsx        # Main placements page component
```

## Features

### 1. **Overview Tab**
- Displays all companies with placement records
- Shows roles offered by each company
- Lists all selected students with their details
- Displays additional information and metadata

### 2. **Students Tab**
- Lists all placed students across all companies
- Shows student details including:
  - Name and enrollment number
  - Email address
  - Company and role
  - Package offered
- Searchable by name, enrollment number, company, or role

### 3. **Analytics Tab**
- Package distribution statistics:
  - Highest package
  - Average package
  - Median package
  - Lowest package
- Company-wise statistics:
  - Number of offers per company
  - Max, average, and min packages per company

### 4. **Search Functionality**
- Real-time search across all tabs
- Filters students, companies, and roles

### 5. **Package Format Handling**
The system intelligently handles two package formats:

**Format Detection:**
- Values > 1000 are treated as rupees (e.g., `9425000` = ₹94.25 LPA)
- Values ≤ 1000 are treated as LPA (e.g., `9.5` = ₹9.5 LPA)

**Available Functions:**
```typescript
import { 
  convertToLPA,           // Convert any format to LPA
  convertToRupees,        // Convert any format to rupees
  formatPackage,          // Format for display (₹X.XX LPA)
  formatPackageInRupees,  // Format in Indian currency (₹X,XX,XXX)
  getPackageDisplay       // Get all formats at once
} from "@/lib/packageConverter";

// Examples:
convertToLPA(9425000);     // Returns: 94.25
convertToLPA(9.5);         // Returns: 9.5
formatPackage(9425000);    // Returns: "₹94.25 LPA"
formatPackage(9.5);        // Returns: "₹9.50 LPA"
```

## Usage

### Adding New Placement Data

1. **Update the data file** (`src/data/placementData.ts`):

```typescript
import { PlacementResponse } from "@/types/placement";

export const placementData: PlacementResponse = {
  ok: true,
  data: [
    // Add your placement records here
  ]
};
```

2. **Or fetch from an API**:

```typescript
import { fetchPlacementData } from "@/lib/placementUtils";

// In your component
const [data, setData] = useState<PlacementResponse | null>(null);

useEffect(() => {
  fetchPlacementData()
    .then(setData)
    .catch(console.error);
}, []);
```

3. **Or load from a JSON file**:

```typescript
import { fetchPlacementDataFromFile } from "@/lib/placementUtils";

// In your component
fetchPlacementDataFromFile('/data/placements.json')
  .then(setData)
  .catch(console.error);
```

### Utility Functions

The system provides several utility functions in `placementData.ts`:

```typescript
// Get company statistics
const stats = getCompanyStats(placementData);

// Get all students across all companies
const students = getAllStudents(placementData);

// Get students by company
const infosysStudents = getStudentsByCompany(placementData, "Infosys");

// Get students by role
const programmers = getStudentsByRole(placementData, "Specialist Programmer");

// Get total placements
const total = getTotalPlacements(placementData);

// Get unique companies
const companies = getUniqueCompanies(placementData);

// Get package distribution
const packages = getPackageDistribution(placementData);
```

### Advanced Filtering (from `placementUtils.ts`)

```typescript
import {
  filterByCompany,
  filterByDateRange,
  sortByOffers,
  sortByDate,
  getPlacementStats
} from "@/lib/placementUtils";

// Filter by company
const techCompanies = filterByCompany(placementData, "tech");

// Filter by date range
const recentPlacements = filterByDateRange(
  placementData,
  new Date("2025-01-01"),
  new Date("2025-12-31")
);

// Sort by number of offers
const topCompanies = sortByOffers(placementData, false); // descending

// Sort by date
const latestFirst = sortByDate(placementData, false); // descending

// Get comprehensive statistics
const stats = getPlacementStats(placementData);
```

### Exporting Data

```typescript
import { downloadCSV } from "@/lib/placementUtils";

// Export all placement data to CSV
downloadCSV(placementData, 'campus-placements-2025.csv');
```

## Customization

### Modifying the UI

The main component is in `src/pages/Placements.tsx`. You can customize:

- **Colors and styling**: Update the Tailwind classes
- **Layout**: Modify the grid structure and card layouts
- **Tabs**: Add or remove tabs in the `Tabs` component
- **Statistics**: Add custom metrics in the stats cards

### Adding New Features

1. **Add new filters**:
```typescript
const [filterRole, setFilterRole] = useState<string>("");

const filteredByRole = allStudents.filter(student =>
  !filterRole || student.role === filterRole
);
```

2. **Add charts/graphs**:
```typescript
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

// Add chart component in the Analytics tab
```

3. **Add export options**:
```typescript
import { exportToCSV } from "@/lib/placementUtils";

const handleExport = () => {
  const csv = exportToCSV(placementData);
  // Process CSV data
};
```

## API Integration

To integrate with a backend API:

1. **Create an API endpoint** that returns data in the expected format
2. **Update the fetch function**:

```typescript
// In placementUtils.ts
export const fetchPlacementData = async (): Promise<PlacementResponse> => {
  const response = await fetch('https://your-api.com/placements');
  const data = await response.json();
  return data;
};
```

3. **Use in component**:

```typescript
import { useEffect, useState } from 'react';
import { fetchPlacementData } from '@/lib/placementUtils';

const Placements = () => {
  const [data, setData] = useState<PlacementResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacementData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  // Render component with data
};
```

## Type Safety

All data structures are fully typed using TypeScript:

- `PlacementResponse`: The main response wrapper
- `PlacementRecord`: Individual company placement record
- `Role`: Role information with package details
- `SelectedStudent`: Student placement information
- `CompanyStats`: Computed statistics for a company
- `StudentPlacement`: Student with company information

## Navigation

The Placements page is accessible via:
- **URL**: `/placements`
- **Navbar**: Click on "Placements" in the navigation menu
- **Icon**: Briefcase icon (💼)

## Best Practices

1. **Data Validation**: Always validate incoming data structure
2. **Error Handling**: Implement proper error boundaries
3. **Loading States**: Show loading indicators during data fetch
4. **Search Optimization**: Debounce search inputs for better performance
5. **Accessibility**: Ensure all interactive elements are keyboard accessible
6. **Responsive Design**: Test on multiple screen sizes

## Troubleshooting

### Data not displaying
- Check if `placementData.ok` is `true`
- Verify `placementData.data` is an array
- Check browser console for errors

### Search not working
- Ensure search query state is properly connected
- Verify filter logic includes all required fields

### Styling issues
- Check if Tailwind CSS is properly configured
- Verify all required UI components are imported

## Future Enhancements

- [ ] Add data visualization with charts
- [ ] Implement advanced filtering (by package range, role type, etc.)
- [ ] Add pagination for large datasets
- [ ] Export to multiple formats (PDF, Excel)
- [ ] Add comparison features between companies
- [ ] Implement real-time data updates
- [ ] Add student profile pages
- [ ] Include placement trends over years
