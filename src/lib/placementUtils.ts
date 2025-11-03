import { PlacementResponse, PlacementRecord } from "@/types/placement";
import { convertToLPA } from "./packageConverter";

/**
 * Fetch placement data from an API endpoint
 * Replace the URL with your actual API endpoint
 */
export const fetchPlacementData = async (): Promise<PlacementResponse> => {
  try {
    // Replace this URL with your actual API endpoint
    const response = await fetch('/api/placements');
    
    if (!response.ok) {
      throw new Error('Failed to fetch placement data');
    }
    
    const data: PlacementResponse = await response.json();
    
    // Validate the response structure
    if (!data.ok || !Array.isArray(data.data)) {
      throw new Error('Invalid data format');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching placement data:', error);
    throw error;
  }
};

/**
 * Fetch placement data from a JSON file
 */
export const fetchPlacementDataFromFile = async (filePath: string): Promise<PlacementResponse> => {
  try {
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error('Failed to fetch placement data file');
    }
    
    const data: PlacementResponse = await response.json();
    
    // Validate the response structure
    if (!data.ok || !Array.isArray(data.data)) {
      throw new Error('Invalid data format in file');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching placement data from file:', error);
    throw error;
  }
};

/**
 * Filter placement records by company name
 */
export const filterByCompany = (
  data: PlacementResponse,
  companyName: string
): PlacementRecord[] => {
  return data.data.filter(record =>
    record.company.toLowerCase().includes(companyName.toLowerCase())
  );
};

/**
 * Filter placement records by date range
 */
export const filterByDateRange = (
  data: PlacementResponse,
  startDate: Date,
  endDate: Date
): PlacementRecord[] => {
  return data.data.filter(record => {
    const savedDate = new Date(record.saved_at);
    return savedDate >= startDate && savedDate <= endDate;
  });
};

/**
 * Sort placement records by number of offers
 */
export const sortByOffers = (
  data: PlacementResponse,
  ascending: boolean = false
): PlacementRecord[] => {
  return [...data.data].sort((a, b) => {
    return ascending
      ? a.number_of_offers - b.number_of_offers
      : b.number_of_offers - a.number_of_offers;
  });
};

/**
 * Sort placement records by date
 */
export const sortByDate = (
  data: PlacementResponse,
  ascending: boolean = false
): PlacementRecord[] => {
  return [...data.data].sort((a, b) => {
    const dateA = a.saved_at ? new Date(a.saved_at).getTime() : 0;
    const dateB = b.saved_at ? new Date(b.saved_at).getTime() : 0;
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Get placement statistics
 */
export const getPlacementStats = (data: PlacementResponse) => {
  const totalStudents = data.data.reduce(
    (sum, record) => sum + record.students_selected.length,
    0
  );
  
  const totalOffers = data.data.reduce(
    (sum, record) => sum + record.number_of_offers,
    0
  );
  
  const allPackages = data.data.flatMap(record =>
    record.students_selected.map(s => convertToLPA(s.package))
  );
  
  const uniqueRoles = new Set(
    data.data.flatMap(record =>
      record.students_selected.map(s => s.role)
    )
  );
  
  return {
    totalCompanies: data.data.length,
    totalStudents,
    totalOffers,
    uniqueRoles: Array.from(uniqueRoles),
    packageStats: {
      highest: Math.max(...allPackages),
      lowest: Math.min(...allPackages),
      average: allPackages.reduce((a, b) => a + b, 0) / allPackages.length,
      median: allPackages.sort((a, b) => a - b)[Math.floor(allPackages.length / 2)]
    }
  };
};

/**
 * Export placement data to CSV format
 */
export const exportToCSV = (data: PlacementResponse): string => {
  const headers = [
    'Student Name',
    'Enrollment Number',
    'Email',
    'Company',
    'Role',
    'Package (LPA)',
    'Date'
  ];
  
  const rows = data.data.flatMap(record =>
    record.students_selected.map(student => [
      student.name,
      student.enrollment_number,
      student.email || 'N/A',
      record.company,
      student.role,
      convertToLPA(student.package).toFixed(2),
      record.saved_at ? new Date(record.saved_at).toLocaleDateString() : 'N/A'
    ])
  );
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (data: PlacementResponse, filename: string = 'placements.csv') => {
  const csvContent = exportToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
