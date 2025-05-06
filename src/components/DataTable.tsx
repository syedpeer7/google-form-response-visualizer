import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: string[][];
  isLoading: boolean;
}

const DataTable = ({ data, isLoading }: DataTableProps) => {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState<string[][]>([]);

  useEffect(() => {
    if (!filter.trim()) {
      setFilteredData(data);
      return;
    }

    const lowerFilter = filter.toLowerCase();
    const headers = data[0] || [];
    const filtered = data.filter((row, index) => {
      // Always keep the header row
      if (index === 0) return true;
      
      // Check if any cell in this row contains the filter text
      return row.some(cell => 
        cell.toLowerCase().includes(lowerFilter)
      );
    });

    setFilteredData(filtered);
  }, [filter, data]);

  if (data.length === 0 && !isLoading) {
    return <div className="text-center py-16">No data to display. Please load a CSV file.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {data.length > 0 && (
        <Input
          placeholder="Filter responses..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
      )}
      <ScrollArea className="h-[calc(100vh-320px)] md:h-[calc(100vh-280px)]">
        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {filteredData[0]?.map((header, i) => (
                  <th 
                    key={`header-${i}`} 
                    className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap border-b"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(1).map((row, i) => (
                <tr 
                  key={`row-${i}`} 
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                >
                  {row.map((cell, j) => (
                    <td 
                      key={`cell-${i}-${j}`} 
                      className="p-3 text-sm"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={filteredData[0]?.length || 1} className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-pulse-slow h-6 w-32 bg-muted rounded"></div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DataTable;
