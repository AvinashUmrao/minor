import { PlacementResponse } from "@/types/placement";
import { convertToLPA } from "@/lib/packageConverter";

// Sample placement data - replace with actual API data
export const placementData: PlacementResponse = {
  ok: true,
  data: [
    {
      _id: "68cb9b59c3d9b8e75632a946",
      company: "Infosys",
      roles: [
        {
          role: "Specialist Programmer",
          package: 9.5,
          package_details: "INR 9.5 LPA"
        },
        {
          role: "Digital Specialist Engineer",
          package: 6.25,
          package_details: "INR 6.25 LPA"
        }
      ],
      job_location: [],
      joining_date: null,
      students_selected: [
        {
          name: "Pratham Goyal",
          enrollment_number: "22102032",
          email: "777.pratham.goy@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Mohd Shoaib",
          enrollment_number: "22102116",
          email: "mohdshoaib54445@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Ashish Kumar Sajwal",
          enrollment_number: "22103004",
          email: "aksyout@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "GURKIRT SINGH",
          enrollment_number: "22103322",
          email: "gurkirtsinghsandhu1984@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Arnav Goyal",
          enrollment_number: "22103336",
          email: "goyalagf@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Jatin Narwani",
          enrollment_number: "9922103169",
          email: "jatinnarwani46@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Rewant Sharma",
          enrollment_number: "9922103216",
          email: "rewantsharma2804@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Ashutosh Sultania",
          enrollment_number: "221B105",
          email: "ashutoshsultania0802@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Shubham Kumar",
          enrollment_number: "221B379",
          email: "shubham142003kumar@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "VINIT CHOUDHARY",
          enrollment_number: "221B444",
          email: "vinitchoudhary2004@gmail.com",
          role: "Specialist Programmer",
          package: 9.5
        },
        {
          name: "Shubhanker Anand",
          enrollment_number: "21803023",
          email: "shubhankeranand18@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Parul Nil",
          enrollment_number: "22102146",
          email: "parul30082003@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Prateek Kumar",
          enrollment_number: "22103052",
          email: "prateekkumaroneandonly1@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Aryan Singh",
          enrollment_number: "22103130",
          email: "aryan09cc@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Tanush Rajput",
          enrollment_number: "22103157",
          email: "tanushrajput20@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Manasvi Goel",
          enrollment_number: "22103219",
          email: "manasvigoel249@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Adamya Singh",
          enrollment_number: "22103244",
          email: "adamyasingh54@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Yashvardhan Jain",
          enrollment_number: "22103286",
          email: "starkey0731@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Prakhar Madnani",
          enrollment_number: "22104057",
          email: "prakhar.madnani@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Laveena Gupta",
          enrollment_number: "22104062",
          email: "laveenagupta29@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Khushi Agarwal",
          enrollment_number: "9922103001",
          email: "agarwalkhushi308@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Prasoon Kumar Rai",
          enrollment_number: "9922103022",
          email: "prasoonrai911@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Tanishq Vats",
          enrollment_number: "9922103028",
          email: "tanishqvats620@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Ankita Jha",
          enrollment_number: "9922103166",
          email: "ankita6mar@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Ashish kumar Singh",
          enrollment_number: "221B102",
          email: "ashish.singhsuttle@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Harshit Shrivastava",
          enrollment_number: "221B177",
          email: "harshitshrivastava340@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Kaushal Kumar",
          enrollment_number: "221B202",
          email: "kaushal1514500@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Rudra Yadav",
          enrollment_number: "221B379",
          email: "officialrudra85@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        },
        {
          name: "Yashasvi Pandey",
          enrollment_number: "221B461",
          email: "yashasvipandey59@gmail.com",
          role: "Digital Specialist Engineer",
          package: 6.25
        }
      ],
      number_of_offers: 29,
      additional_info: "This email is a forwarded message regarding HackWithInfy 2025 offers for Batch 2026. Students were interviewed on 3rd and 4th September 2025 for the Specialist Programmer role. Based on interview performance, candidates were selected for either Specialist Programmer or Digital Specialist Engineer roles. This is a conditional job offer, subject to background verification. Infosys reserves the right to revoke the offer in case of falsification of data or any discrepancy during the verification process. The original email was sent by Anita Marwaha (anitamarwaha.tnp@gmail.com) on Thursday, 18 September 2025, 10:26 am.",
      email_subject: "Fwd: HackWithInfy 2025 (Batch 2026) - Specialist Programmer Role - Offers",
      email_sender: "Tashif Ahmad Khan <tashifkhan010@gmail.com>",
      saved_at: "2025-09-18T05:40:41.636Z"
    }
  ]
};

// Utility functions to work with placement data
export const getCompanyStats = (data: PlacementResponse) => {
  return data.data.map(record => {
    const packages = record.students_selected.map(s => convertToLPA(s.package));
    return {
      company: record.company,
      totalOffers: record.number_of_offers,
      roles: record.roles,
      avgPackage: packages.reduce((a, b) => a + b, 0) / packages.length,
      maxPackage: Math.max(...packages),
      minPackage: Math.min(...packages)
    };
  });
};

export const getAllStudents = (data: PlacementResponse) => {
  return data.data.flatMap(record => 
    record.students_selected.map(student => ({
      ...student,
      company: record.company
    }))
  );
};

export const getStudentsByCompany = (data: PlacementResponse, company: string) => {
  const record = data.data.find(r => r.company === company);
  return record ? record.students_selected : [];
};

export const getStudentsByRole = (data: PlacementResponse, role: string) => {
  return data.data.flatMap(record => 
    record.students_selected
      .filter(student => student.role === role)
      .map(student => ({
        ...student,
        company: record.company
      }))
  );
};

export const getTotalPlacements = (data: PlacementResponse) => {
  return data.data.reduce((total, record) => total + record.number_of_offers, 0);
};

export const getUniqueCompanies = (data: PlacementResponse) => {
  return [...new Set(data.data.map(record => record.company))];
};

export const getPackageDistribution = (data: PlacementResponse) => {
  const allPackages = data.data.flatMap(record => 
    record.students_selected.map(s => convertToLPA(s.package))
  );
  
  return {
    highest: Math.max(...allPackages),
    lowest: Math.min(...allPackages),
    average: allPackages.reduce((a, b) => a + b, 0) / allPackages.length,
    median: allPackages.sort((a, b) => a - b)[Math.floor(allPackages.length / 2)]
  };
};
