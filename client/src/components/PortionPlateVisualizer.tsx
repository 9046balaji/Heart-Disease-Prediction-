import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Scale, Plus, Utensils, AlertTriangle } from "lucide-react";

// Utility function to sanitize input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// Utility function to validate portion calculation data
const validatePortionData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.foodType || data.foodType.trim() === "") {
    errors.push("Food type is required");
  }
  
  if (!data.portionSize || !['small', 'medium', 'large'].includes(data.portionSize)) {
    errors.push("Invalid portion size");
  }
  
  if (data.quantity < 1) {
    errors.push("Quantity must be at least 1");
  }
  
  return errors;
};

interface PortionGuideline {
  id: string;
  foodCategory: string;
  foodType: string;
  smallPortion: string;
  mediumPortion: string;
  largePortion: string;
  caloriesPerUnit: number;
}

interface PortionCalculation {
  foodType: string;
  portionSize: string;
  quantity: number;
  totalCalories: number;
}

const PortionPlateVisualizer: React.FC = () => {
  const { toast } = useToast();
  const [guidelines, setGuidelines] = useState<PortionGuideline[]>([]);
  const [selectedFoodType, setSelectedFoodType] = useState("");
  const [selectedPortionSize, setSelectedPortionSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch portion guidelines on component mount
  useEffect(() => {
    fetchPortionGuidelines();
  }, []);

  const fetchPortionGuidelines = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/portion/guidelines', {
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
        throw new Error(errorData.error?.message || `Failed to fetch portion guidelines: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Validate the response data structure
      if (!result || !result.data) {
        throw new Error('Invalid response format from server');
      }
      
      setGuidelines(result.data || []);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.');
        toast({
          title: "Request Timeout",
          description: "The request took too long to complete. Please try again.",
          variant: "destructive"
        });
      } else {
        setError(error.message || 'Failed to fetch portion guidelines. Please try again.');
        toast({
          title: "Error",
          description: error.message || "Failed to fetch portion guidelines. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateCalories = async () => {
    // Clear previous errors
    setErrors([]);
    setError(null);
    
    // Sanitize inputs
    const sanitizedFoodType = sanitizeInput(selectedFoodType);
    const sanitizedPortionSize = sanitizeInput(selectedPortionSize);
    
    // Validate form data
    const validationErrors = validatePortionData({
      foodType: sanitizedFoodType,
      portionSize: sanitizedPortionSize,
      quantity: quantity
    });
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    setCalculating(true);

    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/portion/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          foodType: sanitizedFoodType,
          portionSize: sanitizedPortionSize,
          quantity: quantity
        }),
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
        throw new Error(errorData.error?.message || `Failed to calculate calories: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Validate the response data structure
      if (!result || !result.data || typeof result.data.totalCalories !== 'number') {
        throw new Error('Invalid response format from server');
      }
      
      setCalculatedCalories(result.data.totalCalories);
      
      toast({
        title: "Calories Calculated",
        description: `Total calories: ${result.data.totalCalories} kcal`
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.');
        toast({
          title: "Request Timeout",
          description: "The request took too long to complete. Please try again.",
          variant: "destructive"
        });
      } else {
        setError(error.message || "Failed to calculate calories. Please try again.");
        toast({
          title: "Error",
          description: error.message || "Failed to calculate calories. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setCalculating(false);
    }
  };

  const getFoodTypes = () => {
    return Array.from(new Set(guidelines.map(g => g.foodType)));
  };

  const getSelectedGuideline = () => {
    return guidelines.find(g => g.foodType === selectedFoodType);
  };

  const renderPortionPlate = () => {
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
              onClick={fetchPortionGuidelines}
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    const guideline = getSelectedGuideline();
    
    if (!guideline) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Utensils className="h-12 w-12 mx-auto mb-4" />
            <p>Select a food type to view portion guidance</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm font-medium text-red-800">Please correct the following errors:</span>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
              selectedPortionSize === "small" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedPortionSize("small")}
          >
            <div className="text-2xl mb-2">🍽️</div>
            <h3 className="font-medium">Small Portion</h3>
            <p className="text-sm text-muted-foreground mt-1">{guideline.smallPortion}</p>
          </div>
          
          <div 
            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
              selectedPortionSize === "medium" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedPortionSize("medium")}
          >
            <div className="text-2xl mb-2">🍽️</div>
            <h3 className="font-medium">Medium Portion</h3>
            <p className="text-sm text-muted-foreground mt-1">{guideline.mediumPortion}</p>
          </div>
          
          <div 
            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
              selectedPortionSize === "large" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedPortionSize("large")}
          >
            <div className="text-2xl mb-2">🍽️</div>
            <h3 className="font-medium">Large Portion</h3>
            <p className="text-sm text-muted-foreground mt-1">{guideline.largePortion}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setQuantity(value);
                }
              }}
            />
          </div>
          
          <div className="flex-1">
            <Label>Calories per Unit</Label>
            <div className="p-2 bg-muted rounded text-center">
              {guideline.caloriesPerUnit || "N/A"} kcal
            </div>
          </div>
        </div>
        
        {calculatedCalories !== null && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Calories:</span>
              <span className="text-2xl font-bold text-green-700">{calculatedCalories} kcal</span>
            </div>
          </div>
        )}
        
        <Button 
          onClick={calculateCalories}
          className="w-full"
          disabled={!selectedFoodType || !selectedPortionSize || calculating}
        >
          {calculating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Calculating...
            </>
          ) : (
            <>
              <Scale className="h-4 w-4 mr-2" />
              Calculate Calories
            </>
          )}
        </Button>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading portion guidelines...</span>
    </div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Portion Guidance
        </CardTitle>
        <CardDescription>Visualize and calculate appropriate portion sizes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="food-type">Food Type</Label>
              <Select value={selectedFoodType} onValueChange={(value) => {
                const sanitizedValue = sanitizeInput(value);
                setSelectedFoodType(sanitizedValue);
                // Reset portion selection and calculation when food type changes
                setSelectedPortionSize("");
                setCalculatedCalories(null);
                setErrors([]);
              }}>
                <SelectTrigger id="food-type">
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  {getFoodTypes().map((foodType) => (
                    <SelectItem key={foodType} value={foodType}>
                      {foodType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Food
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Custom Food</DialogTitle>
                  <DialogDescription>
                    Add a new food type with portion guidelines. This will be available for future use.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Custom food types would be added here in a full implementation.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {renderPortionPlate()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortionPlateVisualizer;