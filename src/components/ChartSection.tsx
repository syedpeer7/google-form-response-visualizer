
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface ChartSectionProps {
  data: string[][];
}

// We'll use a variety of colors for the chart
const CHART_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#14b8a6", // Teal
  "#f97316", // Orange
];

const ChartSection = ({ data }: ChartSectionProps) => {
  const [chartData, setChartData] = useState<{ 
    questionIndex: number;
    question: string;
    answers: { name: string; value: number; percentage: number }[];
  }[]>([]);

  useEffect(() => {
    if (data.length <= 1) return; // No data or only header row
    
    const headers = data[0];
    const possibleChartData = headers.map((header, headerIndex) => {
      // Skip first column which is often the timestamp
      if (headerIndex === 0) return null;

      const responses = data.slice(1).map(row => row[headerIndex]);
      
      // Count unique responses
      const responseCounts: Record<string, number> = {};
      responses.forEach(response => {
        if (!response) return; // Skip empty responses
        responseCounts[response] = (responseCounts[response] || 0) + 1;
      });

      // If we have too many unique values (> 10), or only one unique value,
      // this is likely not a multiple choice question
      const uniqueValues = Object.keys(responseCounts);
      if (uniqueValues.length > 10 || uniqueValues.length <= 1) {
        return null;
      }

      // Convert to chart format
      const totalResponses = responses.filter(r => !!r).length;
      const chartFormat = Object.entries(responseCounts).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalResponses) * 100)
      }));

      return {
        questionIndex: headerIndex,
        question: header,
        answers: chartFormat
      };
    }).filter(Boolean);

    setChartData(possibleChartData as any);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No multiple-choice questions detected in the data.
        <br />
        Charts are automatically generated for questions with 2-10 unique response options.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)] md:h-[calc(100vh-280px)] w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        {chartData.map((chart) => (
          <Card key={chart.questionIndex} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base font-medium text-balance">
                {chart.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bar">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-medium">
                    {chart.answers.reduce((sum, item) => sum + item.value, 0)} responses
                  </div>
                  <TabsList>
                    <TabsTrigger value="bar">Bar</TabsTrigger>
                    <TabsTrigger value="pie">Pie</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="bar" className="mt-0">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chart.answers}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => [`${value} (${chart.answers.find(a => a.value === value)?.percentage}%)`, 'Responses']}
                        />
                        <Bar dataKey="value">
                          {chart.answers.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="pie" className="mt-0">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chart.answers}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {chart.answers.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => {
                            const item = chart.answers.find(a => a.value === value);
                            return [`${value} (${item?.percentage}%)`, 'Responses'];
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="mt-0">
                  <div className="overflow-hidden border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left text-xs font-medium text-muted-foreground uppercase">Response</th>
                          <th className="p-2 text-right text-xs font-medium text-muted-foreground uppercase">Count</th>
                          <th className="p-2 text-right text-xs font-medium text-muted-foreground uppercase">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chart.answers.map((answer, i) => (
                          <tr key={i} className={cn("border-t", i % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                            <td className="p-2 text-sm">{answer.name}</td>
                            <td className="p-2 text-sm text-right">{answer.value}</td>
                            <td className="p-2 text-sm text-right">{answer.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChartSection;
