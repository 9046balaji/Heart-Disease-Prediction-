import { useState } from "react";
import { ShoppingCart, Printer, Share2, CheckCircle, Circle, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  purchased: boolean;
}

interface GroceryListScreenProps {
  groceryList: Record<string, GroceryItem[]>;
  mealPlanName: string;
  onToggleItem: (itemId: string) => void;
  onExport: () => void;
  onPrint: () => void;
  onShare: () => void;
}

export default function GroceryListScreen({ 
  groceryList, 
  mealPlanName, 
  onToggleItem, 
  onExport, 
  onPrint, 
  onShare 
}: GroceryListScreenProps) {
  const [filter, setFilter] = useState<string>("all");
  
  const getAllItems = () => {
    return Object.values(groceryList).flat();
  };
  
  const getFilteredItems = () => {
    const allItems = getAllItems();
    if (filter === "purchased") return allItems.filter(item => item.purchased);
    if (filter === "pending") return allItems.filter(item => !item.purchased);
    return allItems;
  };
  
  const getItemCounts = () => {
    const allItems = getAllItems();
    const total = allItems.length;
    const purchased = allItems.filter(item => item.purchased).length;
    const pending = total - purchased;
    return { total, purchased, pending };
  };
  
  const { total, purchased, pending } = getItemCounts();
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "produce": return "🥬";
      case "dairy": return "🥛";
      case "meat & seafood": return "🥩";
      case "bakery": return "🍞";
      case "frozen": return "❄️";
      case "canned & jarred goods": return "🥫";
      case "dry goods": return "🍚";
      case "condiments & spices": return "🧂";
      case "beverages": return "🥤";
      case "health & beauty": return "🧴";
      default: return "🛒";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Grocery List
          </h1>
          <p className="text-muted-foreground">Shopping list for {mealPlanName}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Package className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Purchased</p>
                <p className="text-2xl font-bold text-green-600">{purchased}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Circle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Items ({total})
        </Button>
        <Button 
          variant={filter === "pending" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({pending})
        </Button>
        <Button 
          variant={filter === "purchased" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("purchased")}
        >
          Purchased ({purchased})
        </Button>
      </div>

      {/* Grocery List by Category */}
      <div className="space-y-6">
        {Object.entries(groceryList).map(([category, items]) => {
          // Filter items based on current filter
          const filteredItems = items.filter(item => {
            if (filter === "purchased") return item.purchased;
            if (filter === "pending") return !item.purchased;
            return true;
          });
          
          // Don't show categories with no items after filtering
          if (filteredItems.length === 0) return null;
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  {category}
                  <Badge variant="secondary">{filteredItems.length}</Badge>
                </CardTitle>
                <CardDescription>Items you need to buy in this section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        item.purchased 
                          ? "bg-green-50 border-green-200" 
                          : "bg-card hover:bg-accent"
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.purchased}
                        onCheckedChange={() => onToggleItem(item.id)}
                        className="h-5 w-5"
                      />
                      <label 
                        htmlFor={item.id} 
                        className={`flex-1 cursor-pointer ${
                          item.purchased ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.quantity}</div>
                      </label>
                      {item.purchased && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shopping Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Shopping Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Shop produce first to ensure freshness</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Check your pantry before purchasing dry goods</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Buy dairy and meat last to keep them cold</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Stick to your list to avoid impulse purchases</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}