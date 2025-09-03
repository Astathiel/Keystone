import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const moodEmojis = ['😢', '😔', '😐', '😊', '😄'];
const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

export function DailyMood() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [savedMood, setSavedMood] = useState<number | null>(null);

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
  };

  const handleSaveMood = () => {
    if (selectedMood !== null) {
      setSavedMood(selectedMood);
      // Here you would typically save to a database
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Mood</CardTitle>
        <p className="text-muted-foreground">{today}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center space-x-2">
          {moodEmojis.map((emoji, index) => {
            const moodValue = index + 1;
            return (
              <button
                key={index}
                onClick={() => handleMoodSelect(moodValue)}
                className={`p-3 rounded-full transition-all hover:scale-110 ${
                  selectedMood === moodValue 
                    ? 'bg-primary/10 ring-2 ring-primary' 
                    : 'hover:bg-accent'
                }`}
                title={moodLabels[index]}
              >
                <span className="text-2xl">{emoji}</span>
              </button>
            );
          })}
        </div>
        
        {selectedMood && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Selected: {moodLabels[selectedMood - 1]}
            </p>
            <Button 
              onClick={handleSaveMood}
              className="w-full"
              disabled={savedMood === selectedMood}
            >
              {savedMood === selectedMood ? 'Mood Saved!' : 'Save Mood'}
            </Button>
          </div>
        )}

        {savedMood && (
          <div className="text-center p-3 bg-accent rounded-lg">
            <p className="text-sm">Today's mood: {moodEmojis[savedMood - 1]} {moodLabels[savedMood - 1]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}