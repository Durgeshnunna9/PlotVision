import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Building, Users, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState("all");

  const [agents, setAgents] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  // Fetch data from Supabase
  async function fetchReportData(reportType: string) {
    switch (reportType) {
      case 'overview':
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('*');
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('*');
        if (propError || clientError) throw new Error('Failed to fetch overview data');
        return { properties, clients };
  
      case 'agents':
        const { data: agents, error: agentError } = await supabase
          .from('agents')
          .select('*');
        if (agentError) throw new Error('Failed to fetch agents data');
        return agents;
  
      case 'properties':
        const { data: allProperties, error: allPropError } = await supabase
          .from('properties')
          .select('*');
        if (allPropError) throw new Error('Failed to fetch properties data');
        return allProperties;
  
      case 'clients':
        const { data: allClients, error: allClientsError } = await supabase
          .from('clients')
          .select('*');
        if (allClientsError) throw new Error('Failed to fetch clients data');
        return allClients;
  
      default:
        return [];
    }
  }

  function exportToCSV(data: any[], fileName: string) {
    if (!data || data.length === 0) {
      alert('No data to export!');
      return;
    }
  
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // header row
      ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(',')) // data rows
    ];
  
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  

  function exportToPDF(data: any[], fileName: string) {
    if (!data || data.length === 0) {
      alert('No data to export!');
      return;
    }
  
    const doc = new jsPDF();
  
    const headers = [Object.keys(data[0])];
    const rows = data.map(Object.values);
  
    // Cast doc to any so TypeScript doesn't complain about autoTable
    (doc as any).autoTable({
      head: headers,
      body: rows
    });
  
    doc.save(`${fileName}.pdf`);
  }

  
  useEffect(() => {
    const fetchData = async () => {
      const { data: agentsData } = await supabase.from('agents').select('*');
      const { data: propertiesData } = await supabase.from('properties').select('*');
      const { data: clientsData } = await supabase.from('clients').select('*');

      setAgents(agentsData || []);
      setProperties(propertiesData || []);
      setClients(clientsData || []);
    };

    fetchData();
  }, []);

  // Generate report data dynamically
  const salesReport = [
    {
      period: 'This Month',
      revenue: properties.reduce((sum, p) => sum + (p.price || 0), 0),
      properties: properties.length,
      avgPrice: properties.length ? Math.round(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length) : 0
    }
  ];

  const agentReport = agents.map(agent => ({
    name: agent.name,
    sales: agent.total_sales || 0,
    listings: agent.active_listings || 0,
    clients: agent.clients_count || 0,
    rating: agent.rating || 0,
    commission: ((agent.total_sales || 0) * 0.03).toFixed(2)
  }));

  const propertyReport = ['Houses', 'Apartments', 'Condos', 'Townhouses'].map(type => {
    const filtered = properties.filter(p => p.type === type);
    const sold = filtered.length;
    const totalRevenue = filtered.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgPrice = sold ? Math.round(totalRevenue / sold) : 0;
    return { type, sold, avgPrice, totalRevenue };
  });

  const clientReport = ['Active', 'Converted', 'Inactive'].map(status => ({
    status,
    count: clients.filter(c => c.status?.toLowerCase() === status.toLowerCase()).length
  }));

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
  const agentPerformance = agents.map(agent => ({
    name: agent.name.split(' ')[0] || "Unknown",
    sales: agent.total_sales || 0,
    listings: agent.active_listings || 0,
    clients: agent.clients_count || 0,
    rating: agent.rating || 0
  }));
  const filteredData = selectedAgent === 'all'
    ? agentPerformance
    : agentPerformance.filter(agent => agent.name === selectedAgent);


  // const exportReport = (format: string) => {
  //   const reportData = reportsData[selectedReport as keyof typeof reportsData];
  //   console.log(`Exporting ${reportData.title} as ${format.toUpperCase()}`);
  // };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate detailed business reports and insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const data = await fetchReportData(selectedReport);
              // Check if data is the overview object
              if ('properties' in data && 'clients' in data) {
                // Merge properties and clients into a single array
                const exportData = [
                  ...data.properties.map((p: any) => ({ ...p, type: 'Property' })),
                  ...data.clients.map((c: any) => ({ ...c, type: 'Client' }))
                ];
                exportToPDF(exportData, selectedReport);
              } else {
                // data is already an array
                exportToPDF(data, selectedReport);
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>

            <Button
            variant="outline"
            onClick={async () => {
              const data = await fetchReportData(selectedReport);
              
              // Check if data is the overview object
              if ('properties' in data && 'clients' in data) {
                // Merge properties and clients into a single array
                const exportData = [
                  ...data.properties.map((p: any) => ({ ...p, type: 'Property' })),
                  ...data.clients.map((c: any) => ({ ...c, type: 'Client' }))
                ];
                exportToCSV(exportData, selectedReport);
              } else {
                // data is already an array
                exportToCSV(data, selectedReport);
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Report Selector */}
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
                <SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger>
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
                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
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
                <BarChart3 className="h-4 w-4 mr-2" /> Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Charts */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{reportsData[selectedReport as keyof typeof reportsData].title}</CardTitle>
              <p className="text-muted-foreground">{reportsData[selectedReport as keyof typeof reportsData].description}</p>
            </div>
            <Badge variant="outline">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {selectedReport === 'overview' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {selectedReport === 'agents' && (
                <ResponsiveContainer width="100%" height={450}>
                  <CardContent>
                      {/* Container for dropdown + chart */}
                      <div className="flex flex-col gap-4">
                        {/* Dropdown */}
                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Agent" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Agents</SelectItem>
                            {agentPerformance.map(agent => (
                              <SelectItem key={agent.name} value={agent.name}>{agent.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Chart */}
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={
                              selectedAgent === 'all'
                                ? agentPerformance
                                : agentPerformance.filter(agent => agent.name === selectedAgent)
                            }
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']} />
                            <Bar dataKey="sales" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                </ResponsiveContainer>
              )}

              {selectedReport === 'properties' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={propertyReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={v => [Number(v), 'Properties Sold']} />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
