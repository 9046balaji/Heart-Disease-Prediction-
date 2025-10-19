import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, TrendingUp, AlertTriangle, Download, 
  Calendar, Filter, BarChart3, PieChartIcon, 
  AreaChartIcon, RefreshCw
} from "lucide-react";
import { authenticatedFetch } from "@/utils/auth";

// Add html2canvas import for image export
import html2canvas from 'html2canvas';

// Utility function to sanitize input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

interface HealthTrend {
  date: string;
  [key: string]: any;
}

interface TrendData {
  bloodPressure?: Array<{ date: string; systolic: number; diastolic: number }>;
  cholesterol?: Array<{ date: string; totalCholesterol: number; ldl?: number; hdl?: number }>;
  hba1c?: Array<{ date: string; hba1c: number }>;
  symptoms?: Array<{ date: string; count: number; type?: string }>;
  compositeRisk?: Array<{ date: string; riskScore: number; contributingFactors: Array<{ factor: string; contribution: number }> }>;
}

// Add interface for comparative analysis data
interface ComparativeAnalysisData {
  latestData: {
    bloodPressure?: { systolic: number; diastolic: number };
    cholesterol?: { total: number; ldl?: number; hdl?: number };
    hba1c?: number;
    compositeRisk?: { score: number; factors: Array<{ factor: string; contribution: number }> };
  };
  metricRanges: Array<{
    metric: string;
    optimalRange: { min: number | null; max: number | null };
    normalRange: { min: number | null; max: number | null };
    highRiskRange: { min: number | null; max: number | null };
  }>;
}

interface DashboardConfig {
  chartType: 'line' | 'bar' | 'area' | 'pie';
  metrics: string[];
  timeRange: string;
  showLegend: boolean;
  showGrid: boolean;
}

interface HealthDashboardProps {
  vitals: Array<{
    name: string;
    value: string;
    unit: string;
    status: 'normal' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
  }>;
  lastUpdated: string;
  vitalHistory: Array<{
    date: string;
    [key: string]: any;
  }>;
  userId: string;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ vitals, lastUpdated, vitalHistory, userId }) => {
  const { toast } = useToast();
  const [trendData, setTrendData] = useState<TrendData>({});
  const [comparativeData, setComparativeData] = useState<ComparativeAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [error, setError] = useState<string | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    chartType: 'line',
    metrics: ['bloodPressure', 'cholesterol', 'hba1c'],
    timeRange: '30d',
    showLegend: true,
    showGrid: true
  });
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch health trends on component mount
  useEffect(() => {
    fetchHealthTrends();
    fetchComparativeAnalysis();
  }, [timeRange]);

  const fetchHealthTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (timeRange && timeRange !== "all") {
        queryParams.append('timeRange', timeRange);
      }
      
      const response = await authenticatedFetch(`/api/health/trends?${queryParams.toString()}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle authentication error
          setError("Authentication required. Please log in to view health trends.");
          toast({
            title: "Authentication Required",
            description: "Please log in to view health trends.",
            variant: "destructive"
          });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Failed to fetch health trends: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Validate the response data structure
      if (!result || !result.data) {
        throw new Error('Invalid response format from server');
      }
      
      setTrendData(result.data || {});
    } catch (error: any) {
      setError(error.message || 'Failed to fetch health trends. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to fetch health trends. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch comparative analysis data
  const fetchComparativeAnalysis = async () => {
    try {
      const response = await authenticatedFetch('/api/health/trends/comparative');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle authentication error
          toast({
            title: "Authentication Required",
            description: "Please log in to view comparative analysis.",
            variant: "destructive"
          });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Failed to fetch comparative analysis: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Validate the response data structure
      if (!result || !result.data) {
        throw new Error('Invalid response format from server');
      }
      
      setComparativeData(result.data || null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch comparative analysis data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const exportChartAsImage = async () => {
    if (chartRef.current) {
      try {
        // Use html2canvas to capture the chart as an image
        const canvas = await html2canvas(chartRef.current);
        const image = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.href = image;
        link.download = 'health_dashboard.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: "Health dashboard exported as PNG image."
        });
      } catch (error) {
        toast({
          title: "Export Failed",
          description: "Failed to export chart as image. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const exportDataAsCSV = () => {
    // Create CSV content from trend data
    let csvContent = "Date,Metric,Value\n";
    
    // Add blood pressure data
    if (trendData.bloodPressure) {
      trendData.bloodPressure.forEach(bp => {
        csvContent += `${bp.date},Systolic,${bp.systolic}\n`;
        csvContent += `${bp.date},Diastolic,${bp.diastolic}\n`;
      });
    }
    
    // Add cholesterol data
    if (trendData.cholesterol) {
      trendData.cholesterol.forEach(chol => {
        csvContent += `${chol.date},Total Cholesterol,${chol.totalCholesterol}\n`;
        if (chol.ldl !== undefined) csvContent += `${chol.date},LDL,${chol.ldl}\n`;
        if (chol.hdl !== undefined) csvContent += `${chol.date},HDL,${chol.hdl}\n`;
      });
    }
    
    // Add HbA1c data
    if (trendData.hba1c) {
      trendData.hba1c.forEach(hba => {
        csvContent += `${hba.date},HbA1c,${hba.hba1c}\n`;
      });
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'health_trends.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Health trends data exported as CSV."
    });
  };

  const renderChart = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="font-medium">Error Loading Data</p>
            <p className="text-sm mt-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchHealthTrends}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    // Render based on selected chart type
    switch (dashboardConfig.chartType) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'area':
        return renderAreaChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  const renderLineChart = () => {
    const allData: any[] = [];
    
    // Combine all data points
    if (trendData.bloodPressure) {
      trendData.bloodPressure.forEach(bp => {
        allData.push({
          date: bp.date,
          systolic: bp.systolic,
          diastolic: bp.diastolic
        });
      });
    }
    
    if (trendData.cholesterol) {
      trendData.cholesterol.forEach(chol => {
        const existing = allData.find(d => d.date === chol.date);
        if (existing) {
          existing.totalCholesterol = chol.totalCholesterol;
          existing.ldl = chol.ldl;
          existing.hdl = chol.hdl;
        } else {
          allData.push({
            date: chol.date,
            totalCholesterol: chol.totalCholesterol,
            ldl: chol.ldl,
            hdl: chol.hdl
          });
        }
      });
    }
    
    if (trendData.hba1c) {
      trendData.hba1c.forEach(hba => {
        const existing = allData.find(d => d.date === hba.date);
        if (existing) {
          existing.hba1c = hba.hba1c;
        } else {
          allData.push({
            date: hba.date,
            hba1c: hba.hba1c
          });
        }
      });
    }
    
    // Sort by date
    allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (allData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            <p>No data available for the selected metrics</p>
            <p className="text-sm mt-2">Record more health data to see trends</p>
          </div>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={allData}>
          {dashboardConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          {dashboardConfig.showLegend && <Legend />}
          {selectedMetric === "all" || selectedMetric === "bloodPressure" ? (
            <>
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Systolic"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#82ca9d" 
                name="Diastolic"
                strokeWidth={2}
              />
            </>
          ) : null}
          {selectedMetric === "all" || selectedMetric === "cholesterol" ? (
            <>
              <Line 
                type="monotone" 
                dataKey="totalCholesterol" 
                stroke="#ffc658" 
                name="Total Cholesterol"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="ldl" 
                stroke="#ff7300" 
                name="LDL"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="hdl" 
                stroke="#00ff00" 
                name="HDL"
                strokeWidth={2}
              />
            </>
          ) : null}
          {selectedMetric === "all" || selectedMetric === "hba1c" ? (
            <Line 
              type="monotone" 
              dataKey="hba1c" 
              stroke="#ff0000" 
              name="HbA1c"
              strokeWidth={2}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    const allData: any[] = [];
    
    // Combine all data points
    if (trendData.bloodPressure) {
      trendData.bloodPressure.forEach(bp => {
        allData.push({
          date: bp.date,
          systolic: bp.systolic,
          diastolic: bp.diastolic
        });
      });
    }
    
    if (trendData.cholesterol) {
      trendData.cholesterol.forEach(chol => {
        const existing = allData.find(d => d.date === chol.date);
        if (existing) {
          existing.totalCholesterol = chol.totalCholesterol;
        } else {
          allData.push({
            date: chol.date,
            totalCholesterol: chol.totalCholesterol
          });
        }
      });
    }
    
    // Sort by date
    allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (allData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>No data available for the selected metrics</p>
            <p className="text-sm mt-2">Record more health data to see trends</p>
          </div>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={allData}>
          {dashboardConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          {dashboardConfig.showLegend && <Legend />}
          {selectedMetric === "all" || selectedMetric === "bloodPressure" ? (
            <>
              <Bar 
                dataKey="systolic" 
                fill="#8884d8" 
                name="Systolic"
              />
              <Bar 
                dataKey="diastolic" 
                fill="#82ca9d" 
                name="Diastolic"
              />
            </>
          ) : null}
          {selectedMetric === "all" || selectedMetric === "cholesterol" ? (
            <Bar 
              dataKey="totalCholesterol" 
              fill="#ffc658" 
              name="Total Cholesterol"
            />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = () => {
    const allData: any[] = [];
    
    // Combine all data points
    if (trendData.compositeRisk) {
      trendData.compositeRisk.forEach(risk => {
        allData.push({
          date: risk.date,
          riskScore: risk.riskScore
        });
      });
    }
    
    // Sort by date
    allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (allData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <AreaChartIcon className="h-12 w-12 mx-auto mb-4" />
            <p>No risk data available</p>
            <p className="text-sm mt-2">Complete a risk assessment to see trends</p>
          </div>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={allData}>
          {dashboardConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value) => [`${value}%`, "Risk Score"]}
          />
          {dashboardConfig.showLegend && <Legend />}
          <Area 
            type="monotone" 
            dataKey="riskScore" 
            stroke="#ff0000" 
            fill="#ff0000" 
            fillOpacity={0.3}
            name="Composite Risk"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    // Prepare data for pie chart - show latest values
    const pieData: { name: string; value: number; color: string }[] = [];
    
    if (trendData.bloodPressure && trendData.bloodPressure.length > 0) {
      const latest = trendData.bloodPressure[trendData.bloodPressure.length - 1];
      pieData.push({ name: "Systolic", value: latest.systolic, color: "#8884d8" });
      pieData.push({ name: "Diastolic", value: latest.diastolic, color: "#82ca9d" });
    }
    
    if (trendData.cholesterol && trendData.cholesterol.length > 0) {
      const latest = trendData.cholesterol[trendData.cholesterol.length - 1];
      pieData.push({ name: "Cholesterol", value: latest.totalCholesterol, color: "#ffc658" });
    }
    
    if (trendData.hba1c && trendData.hba1c.length > 0) {
      const latest = trendData.hba1c[trendData.hba1c.length - 1];
      pieData.push({ name: "HbA1c", value: latest.hba1c, color: "#ff0000" });
    }
    
    if (pieData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <PieChartIcon className="h-12 w-12 mx-auto mb-4" />
            <p>No data available for pie chart</p>
            <p className="text-sm mt-2">Record more health data to see distribution</p>
          </div>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "Value"]} />
          {dashboardConfig.showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading health dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Dashboard
              </CardTitle>
              <CardDescription>
                Interactive visualization of your health metrics over time
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportDataAsCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportChartAsImage}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Image
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchHealthTrends}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold">Health Metrics Visualization</h3>
            <div className="flex flex-wrap gap-2">
              <Select 
                value={dashboardConfig.chartType} 
                onValueChange={(value) => {
                  const sanitizedValue = sanitizeInput(value);
                  setDashboardConfig(prev => ({ ...prev, chartType: sanitizedValue as any }));
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center gap-2">
                      <AreaChartIcon className="h-4 w-4" />
                      Area Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={timeRange} 
                onValueChange={(value) => {
                  const sanitizedValue = sanitizeInput(value);
                  setTimeRange(sanitizedValue);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={selectedMetric} 
                onValueChange={(value) => {
                  const sanitizedValue = sanitizeInput(value);
                  setSelectedMetric(sanitizedValue);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                  <SelectItem value="cholesterol">Cholesterol</SelectItem>
                  <SelectItem value="hba1c">HbA1c</SelectItem>
                  <SelectItem value="symptoms">Symptoms</SelectItem>
                  <SelectItem value="compositeRisk">Composite Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div ref={chartRef} className="h-96">
            {renderChart()}
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Blood Pressure</h4>
              <p className="text-2xl font-bold text-blue-600">
                {trendData.bloodPressure && trendData.bloodPressure.length > 0 
                  ? `${trendData.bloodPressure[trendData.bloodPressure.length - 1].systolic}/${trendData.bloodPressure[trendData.bloodPressure.length - 1].diastolic}` 
                  : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Latest reading</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Cholesterol</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {trendData.cholesterol && trendData.cholesterol.length > 0 
                  ? `${trendData.cholesterol[trendData.cholesterol.length - 1].totalCholesterol} mg/dL` 
                  : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Latest reading</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">HbA1c</h4>
              <p className="text-2xl font-bold text-orange-600">
                {trendData.hba1c && trendData.hba1c.length > 0 
                  ? `${trendData.hba1c[trendData.hba1c.length - 1].hba1c}%` 
                  : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Latest reading</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Comparative Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparative Analysis
          </CardTitle>
          <CardDescription>
            Compare your health metrics with recommended ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blood Pressure Comparison */}
            <div className="space-y-4">
              <h4 className="font-medium">Blood Pressure</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Your Systolic</span>
                  <span className="font-medium">
                    {comparativeData?.latestData.bloodPressure?.systolic ?? 
                     (trendData.bloodPressure && trendData.bloodPressure.length > 0 
                      ? trendData.bloodPressure[trendData.bloodPressure.length - 1].systolic 
                      : "N/A")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Optimal Range</span>
                  <span className="text-muted-foreground">&lt;120 mmHg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Normal Range</span>
                  <span className="text-muted-foreground">120-139 mmHg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">High Risk</span>
                  <span className="text-muted-foreground">&gt;140 mmHg</span>
                </div>
              </div>
            </div>
            
            {/* Cholesterol Comparison */}
            <div className="space-y-4">
              <h4 className="font-medium">Cholesterol</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Your Total Cholesterol</span>
                  <span className="font-medium">
                    {comparativeData?.latestData.cholesterol?.total ?? 
                     (trendData.cholesterol && trendData.cholesterol.length > 0 
                      ? trendData.cholesterol[trendData.cholesterol.length - 1].totalCholesterol 
                      : "N/A")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Optimal</span>
                  <span className="text-muted-foreground">&lt;200 mg/dL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Normal Range</span>
                  <span className="text-muted-foreground">200-239 mg/dL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">High Risk</span>
                  <span className="text-muted-foreground">&gt;240 mg/dL</span>
                </div>
              </div>
            </div>
            
            {/* HbA1c Comparison */}
            <div className="space-y-4">
              <h4 className="font-medium">HbA1c</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Your HbA1c</span>
                  <span className="font-medium">
                    {comparativeData?.latestData.hba1c ?? 
                     (trendData.hba1c && trendData.hba1c.length > 0 
                      ? trendData.hba1c[trendData.hba1c.length - 1].hba1c 
                      : "N/A")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Normal</span>
                  <span className="text-muted-foreground">&lt;5.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Prediabetes</span>
                  <span className="text-muted-foreground">5.7%-6.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Diabetes</span>
                  <span className="text-muted-foreground">&gt;6.5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboard;