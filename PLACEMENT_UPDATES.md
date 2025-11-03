# Placement System Updates - Package Format Handling

## Problem Identified

The placement data comes in two different package formats:
1. **Rupee format**: `9425000` (representing ₹94.25 LPA)
2. **LPA format**: `9.5` (representing ₹9.5 LPA)

Additionally, some fields like `email`, `saved_at`, and `additional_info` can be `null` or optional.

## Solution Implemented

### 1. Created Package Converter Utility (`src/lib/packageConverter.ts`)

A comprehensive utility that automatically detects and converts between formats:

```typescript
// Auto-detection logic: values > 1000 are rupees, ≤ 1000 are LPA
convertToLPA(9425000)  // → 94.25
convertToLPA(9.5)      // → 9.5

// Formatting for display
formatPackage(9425000) // → "₹94.25 LPA"
formatPackage(9.5)     // → "₹9.50 LPA"
```

**Available Functions:**
- `convertToLPA(value)` - Convert any format to LPA
- `convertToRupees(value)` - Convert any format to rupees
- `formatPackage(value)` - Format for display (₹X.XX LPA)
- `formatPackageInRupees(value)` - Format in Indian currency
- `isInRupees(value)` - Check if value is in rupee format
- `getPackageDisplay(value)` - Get all formats at once

### 2. Updated Type Definitions (`src/types/placement.ts`)

Made fields nullable/optional to match actual data:

```typescript
export interface SelectedStudent {
  name: string;
  enrollment_number: string;
  email: string | null;           // Can be null
  role: string;
  package: number;                // Handles both formats
  branch?: string;                // Optional field
}

export interface PlacementRecord {
  // ... other fields
  job_location: string[] | null;  // Can be null
  additional_info?: string;       // Optional
  email_subject?: string;         // Optional
  email_sender?: string;          // Optional
  saved_at?: string;              // Optional
}
```

### 3. Updated Data Utilities (`src/data/placementData.ts`)

All utility functions now convert packages to LPA:

```typescript
export const getCompanyStats = (data: PlacementResponse) => {
  return data.data.map(record => {
    const packages = record.students_selected.map(s => convertToLPA(s.package));
    // ... calculations use normalized LPA values
  });
};

export const getPackageDistribution = (data: PlacementResponse) => {
  const allPackages = data.data.flatMap(record => 
    record.students_selected.map(s => convertToLPA(s.package))
  );
  // ... all stats in LPA
};
```

### 4. Updated Placements Page (`src/pages/Placements.tsx`)

All package displays use the formatter:

```typescript
// Before:
<p>₹{student.package} LPA</p>

// After:
<p>{formatPackage(student.package)}</p>
```

Conditional rendering for nullable fields:

```typescript
{student.email && (
  <p><Mail className="w-4 h-4" />{student.email}</p>
)}

{record.saved_at && (
  <Badge>{new Date(record.saved_at).toLocaleDateString()}</Badge>
)}
```

### 5. Updated Placement Utils (`src/lib/placementUtils.ts`)

- CSV export converts packages to LPA
- Handles null values gracefully
- Date sorting handles optional `saved_at` field

```typescript
export const exportToCSV = (data: PlacementResponse): string => {
  const rows = data.data.flatMap(record =>
    record.students_selected.map(student => [
      student.name,
      student.enrollment_number,
      student.email || 'N/A',                    // Handle null
      record.company,
      student.role,
      convertToLPA(student.package).toFixed(2),  // Convert to LPA
      record.saved_at ? new Date(record.saved_at).toLocaleDateString() : 'N/A'
    ])
  );
  // ...
};
```

## Files Modified

1. ✅ `src/types/placement.ts` - Updated type definitions
2. ✅ `src/lib/packageConverter.ts` - **NEW FILE** - Package conversion utilities
3. ✅ `src/data/placementData.ts` - Added package conversion to utilities
4. ✅ `src/pages/Placements.tsx` - Updated all displays to use formatter
5. ✅ `src/lib/placementUtils.ts` - Updated all functions to handle formats
6. ✅ `PLACEMENT_SYSTEM.md` - Updated documentation

## How It Works

### Automatic Format Detection

The system uses a simple threshold:
- **If package > 1000**: Treat as rupees, divide by 100,000 to get LPA
- **If package ≤ 1000**: Already in LPA format

This works because:
- Minimum realistic package in rupees: ~300,000 (₹3 LPA)
- Maximum realistic package in LPA: ~200 (₹2 Crore)
- Threshold of 1000 safely separates the two formats

### Example Conversions

| Input Value | Detected As | Converted to LPA | Displayed As |
|-------------|-------------|------------------|--------------|
| 9425000     | Rupees      | 94.25            | ₹94.25 LPA   |
| 950000      | Rupees      | 9.50             | ₹9.50 LPA    |
| 18          | LPA         | 18.00            | ₹18.00 LPA   |
| 9.5         | LPA         | 9.50             | ₹9.50 LPA    |
| 6.25        | LPA         | 6.25             | ₹6.25 LPA    |

## Testing

To test with different formats, update `src/data/placementData.ts`:

```typescript
// Mix of formats - all will display correctly
students_selected: [
  { name: "Student 1", package: 9425000 },  // Rupees
  { name: "Student 2", package: 9.5 },      // LPA
  { name: "Student 3", package: 1800000 },  // Rupees
]
```

All will be normalized and displayed consistently in the UI.

## Benefits

1. ✅ **Backward Compatible**: Works with existing LPA format data
2. ✅ **Forward Compatible**: Handles new rupee format data
3. ✅ **Automatic**: No manual conversion needed
4. ✅ **Type Safe**: Full TypeScript support
5. ✅ **Consistent Display**: All packages shown in LPA format
6. ✅ **Accurate Calculations**: Stats use normalized values
7. ✅ **Null Safe**: Handles missing/optional fields gracefully

## Usage in Your Code

```typescript
import { formatPackage, convertToLPA } from "@/lib/packageConverter";

// Display a package value
<p>{formatPackage(student.package)}</p>

// Use in calculations
const avgPackage = packages.map(convertToLPA)
  .reduce((a, b) => a + b, 0) / packages.length;

// Check format
if (isInRupees(packageValue)) {
  console.log("This is in rupee format");
}
```

## Next Steps

1. Replace sample data in `src/data/placementData.ts` with your actual data
2. Data can be in either format - the system handles both automatically
3. All displays, calculations, and exports will work correctly
4. No code changes needed when switching between formats
