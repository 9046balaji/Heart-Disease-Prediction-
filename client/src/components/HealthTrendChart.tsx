import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";

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
  cholesterol?: Array<{ date: string; totalCholesterol: number }>;
  hba1c?: Array<{ date: string; hba1c: number }>;
  symptoms?: Array<{ date: string; count: number }>;
  compositeRisk?: Array<{ date: string; riskScore: number; contributingFactors: Array<{ factor: string; contribution: number }> }>;
}

const HealthTrendChart: React.FC = () => {
  const { toast } = useToast();
  const [trendData, setTrendData] = useState<TrendData>({});
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [error, setError] = useState<string | null>(null);

  // Fetch health trends on component mount
  useEffect(() => {
    fetchHealthTrends();
  }, []);

  const fetchHealthTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (timeRange && timeRange !== "all") {
        queryParams.append('timeRange', timeRange);
      }
      
      const response = await fetch(`/api/health/trends?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
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
      if (error.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.');
        toast({
          title: "Request Timeout",
          description: "The request took too long to complete. Please try again.",
          variant: "destructive"
        });
      } else {
        setError(error.message || 'Failed to fetch health trends. Please try again.');
        toast({
          title: "Error",
          description: error.message || "Failed to fetch health trends. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (selectedMetric === "bloodPressure" || selectedMetric === "all") {
      const bpData = trendData.bloodPressure || [];
      if (bpData.length > 0) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bpData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value, name) => [
                  `${value} mmHg`, 
                  name === 'systolic' ? 'Systolic' : 'Diastolic'
                ]}
              />
              <Legend />
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
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }

    if (selectedMetric === "cholesterol" || (selectedMetric === "all" && !trendData.bloodPressure)) {
      const cholesterolData = trendData.cholesterol || [];
      if (cholesterolData.length > 0) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cholesterolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${value} mg/dL`, "Total Cholesterol"]}
              />
              <Line 
                type="monotone" 
                dataKey="totalCholesterol" 
                stroke="#ffc658" 
                name="Total Cholesterol"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }

    if (selectedMetric === "hba1c" || (selectedMetric === "all" && !trendData.bloodPressure && !trendData.cholesterol)) {
      const hba1cData = trendData.hba1c || [];
      if (hba1cData.length > 0) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hba1cData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${value}%`, "HbA1c"]}
              />
              <Line 
                type="monotone" 
                dataKey="hba1c" 
                stroke="#ff7300" 
                name="HbA1c"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }

    if (selectedMetric === "symptoms" || (selectedMetric === "all" && !trendData.bloodPressure && !trendData.cholesterol && !trendData.hba1c)) {
      const symptomsData = trendData.symptoms || [];
      if (symptomsData.length > 0) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={symptomsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [value, "Symptom Count"]}
              />
              <Bar 
                dataKey="count" 
                fill="#8884d8" 
                name="Symptom Count"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }

    if (selectedMetric === "compositeRisk" || (selectedMetric === "all" && !trendData.bloodPressure && !trendData.cholesterol && !trendData.hba1c && !trendData.symptoms)) {
      const compositeRiskData = trendData.compositeRisk || [];
      if (compositeRiskData.length > 0) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={compositeRiskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${value}%`, "Risk Score"]}
              />
              <Line 
                type="monotone" 
                dataKey="riskScore" 
                stroke="#ff0000" 
                name="Composite Risk"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }

    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4" />
          <p>No data available for the selected metric</p>
          <p className="text-sm mt-2">Record more health data to see trends</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading health trends...</span>
    </div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Health Trends
        </CardTitle>
        <CardDescription>Track your health metrics over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold">Trend Analysis</h3>
          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={(value) => {
              const sanitizedValue = sanitizeInput(value);
              setTimeRange(sanitizedValue);
              // Refresh data when time range changes
              setTimeout(fetchHealthTrends, 0);
            }}>
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
            <Select value={selectedMetric} onValueChange={(value) => {
              const sanitizedValue = sanitizeInput(value);
              setSelectedMetric(sanitizedValue);
            }}>
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
            <Button variant="outline" onClick={fetchHealthTrends}>
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="h-80">
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
  );
};

export default HealthTrendChart;