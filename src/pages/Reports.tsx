import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Building, Users, BarChart3, PieChart } from 'lucide-react';
import { mockAnalytics, mockAgents, mockProperties, mockClients } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  // Sample report data
  const salesReport = [
    { period: 'Q1 2024', revenue: 2850000, properties: 35, avgPrice: 425000 },
    { period: 'Q2 2024', revenue: 3200000, properties: 42, avgPrice: 458000 },
    { period: 'Q3 2024', revenue: 2980000, properties: 38, avgPrice: 442000 },
    { period: 'Q4 2024', revenue: 3450000, properties: 45, avgPrice: 475000 }
  ];

  const agentReport = mockAgents.map(agent => ({
    name: agent.name,
    sales: agent.totalSales,
    listings: agent.activeListings,
    clients: agent.clientsCount,
    rating: agent.rating,
    commission: agent.totalSales * 0.03 // 3% commission rate
  }));

  const propertyReport = [
    { type: 'Houses', sold: 28, avgPrice: 675000, totalRevenue: 18900000 },
    { type: 'Apartments', sold: 45, avgPrice: 425000, totalRevenue: 19125000 },
    { type: 'Condos', sold: 18, avgPrice: 580000, totalRevenue: 10440000 },
    { type: 'Townhouses', sold: 12, avgPrice: 525000, totalRevenue: 6300000 }
  ];

  const clientReport = [
    { status: 'Active', count: mockClients.filter(c => c.status === 'active').length },
    { status: 'Converted', count: mockClients.filter(c => c.status === 'converted').length },
    { status: 'Inactive', count: mockClients.filter(c => c.status === 'inactive').length }
  ];

  const reportsData = {
    overview: {
      title: 'Business Overview',
      description: 'Comprehensive business performance metrics',
      data: salesReport
    },
    agents: {
      title: 'Agent Performance',
      description: 'Individual agent sales and performance metrics',
      data: agentReport
    },
    properties: {
      title: 'Property Analysis',
      description: 'Property type performance and market analysis',
      data: propertyReport
    },
    clients: {
      title: 'Client Analytics',
      description: 'Client acquisition and conversion metrics',
      data: clientReport
    }
  };

  const exportReport = (format: string) => {
    // Simulate export functionality
    const reportData = reportsData[selectedReport as keyof typeof reportsData];
    console.log(`Exporting ${reportData.title} as ${format.toUpperCase()}`);
    // In a real app, this would generate and download the file
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate detailed business reports and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Business Overview</SelectItem>
                  <SelectItem value="agents">Agent Performance</SelectItem>
                  <SelectItem value="properties">Property Analysis</SelectItem>
                  <SelectItem value="clients">Client Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="btn-primary w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">$12.4M</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  +18% YoY
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Properties Sold</p>
                <p className="text-2xl font-bold text-success">103</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  +12% YoY
                </div>
              </div>
              <Building className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-accent">89</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  +25% YoY
                </div>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold text-warning">$485K</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  +8% YoY
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Display */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{reportsData[selectedReport as keyof typeof reportsData].title}</CardTitle>
              <p className="text-muted-foreground">
                {reportsData[selectedReport as keyof typeof reportsData].description}
              </p>
            </div>
            <Badge variant="outline">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Chart */}
            <div>
              {selectedReport === 'overview' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {selectedReport === 'agents' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']} />
                    <Bar dataKey="sales" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {selectedReport === 'properties' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={propertyReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value) => [Number(value), 'Properties Sold']} />
                    <Bar dataKey="sold" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {selectedReport === 'clients' && (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={clientReport}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {clientReport.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Right Data Table */}
            <div className="space-y-4">
              <h4 className="font-semibold">Detailed Breakdown</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {selectedReport === 'overview' && salesReport.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{item.period}</p>
                      <p className="text-sm text-muted-foreground">{item.properties} properties</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-muted-foreground">Avg: ${item.avgPrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                {selectedReport === 'agents' && agentReport.map((agent, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">Rating: {agent.rating}/5</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(agent.sales / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-muted-foreground">{agent.clients} clients</p>
                    </div>
                  </div>
                ))}
                
                {selectedReport === 'properties' && propertyReport.map((property, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{property.type}</p>
                      <p className="text-sm text-muted-foreground">{property.sold} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(property.totalRevenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-muted-foreground">Avg: ${property.avgPrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                {selectedReport === 'clients' && clientReport.map((client, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{client.status} Clients</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{client.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Actions */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => exportReport('pdf')} className="h-20 flex-col">
              <FileText className="h-8 w-8 mb-2" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')} className="h-20 flex-col">
              <Download className="h-8 w-8 mb-2" />
              Download CSV
            </Button>
            <Button variant="outline" onClick={() => exportReport('email')} className="h-20 flex-col">
              <Calendar className="h-8 w-8 mb-2" />
              Schedule Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;