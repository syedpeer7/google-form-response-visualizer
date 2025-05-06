
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

interface CsvInputProps {
  onLoadCsv: (url: string) => void;
  isLoading: boolean;
}

const CsvInput = ({ onLoadCsv, isLoading }: CsvInputProps) => {
  const [csvUrl, setCsvUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvUrl.trim()) {
      toast.error("Please enter a CSV URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(csvUrl);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Check if it's likely to be a Google Sheets CSV export URL
    if (!csvUrl.includes("docs.google.com") && 
        !csvUrl.includes("spreadsheets") && 
        !csvUrl.includes("output=csv") && 
        !csvUrl.endsWith(".csv")) {
      toast.warning("URL doesn't appear to be a Google Sheets CSV. Make sure you've published the sheet to the web as CSV.", {
        duration: 5000,
      });
    }
    
    onLoadCsv(csvUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Paste Google Sheet CSV URL..."
          value={csvUrl}
          onChange={(e) => setCsvUrl(e.target.value)}
          className="w-full"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must be a publicly published Google Sheet CSV URL
        </p>
      </div>
      <Button type="submit" disabled={isLoading} className="flex items-center gap-2 whitespace-nowrap">
        {isLoading ? "Loading..." : "Load Dashboard"}
        {!isLoading && <ArrowRight size={16} />}
      </Button>
    </form>
  );
};

export default CsvInput;
