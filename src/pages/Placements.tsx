import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Briefcase, 
  Search,
  Mail,
  Calendar,
  DollarSign,
  Award,
  MapPin
} from "lucide-react";
import { 
  placementData, 
  getCompanyStats, 
  getAllStudents, 
  getTotalPlacements,
  getPackageDistribution,
  getUniqueCompanies
} from "@/data/placementData";
import { formatPackage, convertToLPA } from "@/lib/packageConverter";
import { PlacementRecord, SelectedStudent } from "@/types/placement";

const Placements = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const companyStats = getCompanyStats(placementData);
  const allStudents = getAllStudents(placementData);
  const totalPlacements = getTotalPlacements(placementData);
  const packageDist = getPackageDistribution(placementData);
  const companies = getUniqueCompanies(placementData);

  // Filter students based on search
  const filteredStudents = allStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.enrollment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter companies based on search
  const filteredCompanies = placementData.data.filter(record =>
    record.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Briefcase className="w-4 h-4 mr-2" />
            Placement Analytics
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Campus Placements 2025-26
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive placement statistics and student achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Placements</p>
                  <h3 className="text-3xl font-bold text-foreground">{totalPlacements}</h3>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Companies</p>
                  <h3 className="text-3xl font-bold text-foreground">{companies.length}</h3>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Highest Package</p>
                  <h3 className="text-3xl font-bold text-foreground">₹{packageDist.highest} LPA</h3>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Package</p>
                  <h3 className="text-3xl font-bold text-foreground">₹{packageDist.average.toFixed(2)} LPA</h3>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search students, companies, or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {filteredCompanies.map((record) => (
                <Card key={record._id} className="border-0 shadow-soft">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <Building2 className="w-6 h-6 text-primary" />
                          {record.company}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            {record.number_of_offers} Offers
                          </Badge>
                          {record.saved_at && (
                            <Badge variant="outline">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(record.saved_at).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Roles */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Available Roles
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {record.roles.map((role, idx) => (
                          <div key={idx} className="p-3 bg-accent/50 rounded-lg">
                            <p className="font-medium">{role.role}</p>
                            <p className="text-sm text-muted-foreground">{role.package_details}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Students */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Selected Students ({record.students_selected.length})
                      </h4>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="grid gap-2">
                          {record.students_selected.map((student, idx) => (
                            <div key={idx} className="p-3 bg-accent/30 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.enrollment_number}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-primary">{student.role}</p>
                                <p className="text-sm text-muted-foreground">{formatPackage(student.package)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {record.additional_info && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Additional Information</h4>
                        <p className="text-sm text-muted-foreground">{record.additional_info}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid gap-4">
              {filteredStudents.map((student, idx) => (
                <Card key={idx} className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{student.name}</h3>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline">{student.enrollment_number}</Badge>
                          </p>
                          {student.email && (
                            <p className="text-muted-foreground flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {student.email}
                            </p>
                          )}
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {student.company}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            {student.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="text-lg px-4 py-2">
                          {formatPackage(student.package)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Package Distribution */}
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Package Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">Highest Package</span>
                    <span className="font-bold text-success">₹{packageDist.highest} LPA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">Average Package</span>
                    <span className="font-bold text-primary">₹{packageDist.average.toFixed(2)} LPA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">Median Package</span>
                    <span className="font-bold text-warning">₹{packageDist.median} LPA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">Lowest Package</span>
                    <span className="font-bold text-muted-foreground">₹{packageDist.lowest} LPA</span>
                  </div>
                </CardContent>
              </Card>

              {/* Company-wise Statistics */}
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Company-wise Offers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyStats.map((stat, idx) => (
                    <div key={idx} className="p-3 bg-accent/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{stat.company}</span>
                        <Badge>{stat.totalOffers} offers</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <p className="text-xs">Max</p>
                          <p className="font-medium">₹{stat.maxPackage}</p>
                        </div>
                        <div>
                          <p className="text-xs">Avg</p>
                          <p className="font-medium">₹{stat.avgPackage.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs">Min</p>
                          <p className="font-medium">₹{stat.minPackage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Placements;
