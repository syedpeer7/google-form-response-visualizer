
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, Upload } from "lucide-react";

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

    // Enhanced Google Sheets CSV validation
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

  const handlePasteExample = () => {
    setCsvUrl("https://docs.google.com/spreadsheets/d/e/2PACX-1vRnmh4zemM9fQ7fhg4sXFyg3mJEH9h1VRBvCgsnL6SvE-0XvceUocNAifhgY_mtQSeW3_L4L8_tVoN8/pub?gid=1226447504&single=true&output=csv");
    toast.info("Example CSV URL pasted! Click 'Load Dashboard' to visualize data.");
  };

  return (
    <div className="space-y-4">
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
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <strong>How to get a CSV URL:</strong> In Google Sheets, go to File → Share → Publish to web → Select CSV → Publish → Copy link
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePasteExample} 
          className="text-xs flex items-center gap-1"
          disabled={isLoading}
        >
          <Upload size={14} />
          Use Example Data
        </Button>
      </div>
    </div>
  );
};

export default CsvInput;
