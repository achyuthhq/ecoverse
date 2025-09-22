"use client";

interface DIYIdeaDisplayProps {
  diyIdea: string;
}

export default function DIYIdeaDisplay({ diyIdea }: DIYIdeaDisplayProps) {
  // Split the DIY idea into lines
  const lines = diyIdea.split('\n').filter(line => line.trim());
  
  // Find the recommendation and steps
  const recommendation = lines.find(line => line.includes('🎯') || line.includes('Recommendation'));
  const stepsStart = lines.findIndex(line => line.includes('📋') || line.includes('Steps'));
  
  const steps = stepsStart !== -1 ? lines.slice(stepsStart + 1) : [];

  // If the DIY idea is malformed, show a fallback
  if (!recommendation && steps.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800 font-medium">
            🎯 **Recommendation**: Transform this item into something creative and useful
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>📋</span>
            Steps to Make:
          </h4>
          <div className="space-y-2 pl-4">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs mt-0.5">1.</span>
              <span className="text-lg">🔧</span>
              <span>Clean and prepare the item thoroughly</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs mt-0.5">2.</span>
              <span className="text-lg">🎨</span>
              <span>Add your personal creative touch</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs mt-0.5">3.</span>
              <span className="text-lg">✨</span>
              <span>Transform it into something useful</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs mt-0.5">4.</span>
              <span className="text-lg">🎉</span>
              <span>Enjoy your eco-friendly creation!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendation && (
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800 font-medium">
            {recommendation.replace('🎯 **Recommendation**:', '').trim()}
          </p>
        </div>
      )}
      
      {steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>📋</span>
            Steps to Make:
          </h4>
          <div className="space-y-2 pl-4">
            {steps.map((step, index) => {
              // Extract emoji and step content
              const emojiMatch = step.match(/^(\d+\.\s*)([^\s]+)\s+(.+)$/);
              if (emojiMatch) {
                const [, number, emoji, content] = emojiMatch;
                return (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-gray-400 text-xs mt-0.5">{number}</span>
                    <span className="text-lg">{emoji}</span>
                    <span>{content}</span>
                  </div>
                );
              }
              
              // Fallback for steps without proper formatting
              return (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-gray-400 text-xs mt-0.5">{index + 1}.</span>
                  <span>{step.replace(/^\d+\.\s*/, '')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 