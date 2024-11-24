import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

// Function to extract JSON from AI response text
const extractJsonFromAiResponse = (text: string): any[] => {
  try {
    // Find content between ```json and ``` markers
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // If no markers found, try parsing the whole text
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return [];
  }
};

interface AnalysisDisplayProps {
  aiOutput: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ aiOutput }) => {
    if (!aiOutput) {
        return (
            <div className="flex items-center justify-center p-4 text-yellow-600">
              <AlertCircle className="mr-2" />
              <span>No requirements data found or invalid format</span>
            </div>
        );
    }

    const requirements = extractJsonFromAiResponse(aiOutput);

  if (!requirements.length) {
    return (
        <div className="flex items-center justify-center p-4 text-yellow-600">
          {aiOutput}
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {requirements.map((req, index) => (
        <Card key={req['Requirement ID'] || index} className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">
              {req['Requirement ID']}
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {req['EARS Pattern']}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-500 mb-1">Original Requirement</h3>
                <p className="text-sm">{req['Original Requirement']}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-500 mb-1">Final Requirement</h3>
                <p className="text-sm">{req['Final Requirement']}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-500 mb-1">Requirement Feedback</h3>
                <ul className="list-disc list-inside text-sm">
                  {req['Requirement Feedback'].split(';').map((feedback: string, idx: number) => (
                    <li key={idx} className="text-sm py-1">
                      {feedback.trim()}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-500 mb-1">Compliance Feedback</h3>
                <ul className="list-disc list-inside text-sm">
                  {req['Compliance Feedback'].split(';').map((feedback: string, idx: number) => (
                    <li key={idx} className="text-sm py-1">
                      {feedback.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisDisplay; 