
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChartBar, Table } from "lucide-react";
import CsvInput from "@/components/CsvInput";
import DataTable from "@/components/DataTable";
import ChartSection from "@/components/ChartSection";

const Index = () => {
  const [data, setData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("table");
  
  const loadCsv = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      
      const textData = await response.text();
      const parsedData = parseCsvData(textData);
      
      if (parsedData.length === 0 || parsedData[0].length === 0) {
        throw new Error("The CSV file appears to be empty");
      }
      
      setData(parsedData);
      toast.success("Data loaded successfully!");
    } catch (error) {
      console.error("Error loading CSV:", error);
      toast.error("Failed to load CSV. Check the URL and ensure the sheet is published publicly.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseCsvData = (csvText: string): string[][] => {
    // Parse CSV with consideration for quoted fields that may contain commas
    const result: string[][] = [];
    const lines = csvText.split(/\r?\n/);
    
    lines.forEach(line => {
      if (line.trim() === '') return;
      
      const fields: string[] = [];
      let field = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            // Handle escaped quotes (double quotes within quotes)
            field += '"';
            i++; // Skip the next quote
          } else {
            // Toggle the in-quotes state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          fields.push(field);
          field = '';
        } else {
          field += char;
        }
      }
      
      // Don't forget the last field
      fields.push(field);
      result.push(fields);
    });
    
    return result;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1 text-blue-600">Form Insight Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Visualize Google Form responses from published Google Sheets
      </p>
      
      <Card className="mb-6 p-6 shadow-sm border">
        <CsvInput onLoadCsv={loadCsv} isLoading={isLoading} />
        <p className="text-xs text-muted-foreground mt-3">
          <strong>How to get a CSV URL:</strong> In Google Sheets, go to File → Share → Publish to web → Select CSV → Publish → Copy link
        </p>
      </Card>
      
      <div className="mb-6">
        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab} 
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Response Visualization
            </h2>
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table size={16} /> Data Table
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <ChartBar size={16} /> Charts
              </TabsTrigger>
            </TabsList>
          </div>
          
          <Card className="shadow-sm border">
            <TabsContent value="table" className="mt-0">
              <div className="p-4">
                <DataTable data={data} isLoading={isLoading} />
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="mt-0">
              <div className="p-4">
                <ChartSection data={data} />
              </div>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
