import { useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Exercise {
  name: string;
  description: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
  equipmentNeeded: string[];
  instructions: string[];
  safetyNotes: string[];
  videoUrl?: string;
}

interface ExerciseDemoProps {
  exercise: Exercise;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function ExerciseDemo({ exercise, onPlay, onPause }: ExerciseDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const resetDemo = () => {
    setIsPlaying(false);
  };

  // For demo purposes, we'll use a placeholder image
  // In a real app, this would be the actual video or GIF
  const demoImageUrl = "/placeholder-exercise-demo.jpg";

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {exercise.name}
            </CardTitle>
            <CardDescription>
              {exercise.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              exercise.intensity === "high" 
                ? "bg-red-100 text-red-800" 
                : exercise.intensity === "moderate" 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {exercise.intensity.charAt(0).toUpperCase() + exercise.intensity.slice(1)} Intensity
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Demo video container */}
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
            {exercise.videoUrl ? (
              <div className="w-full h-full flex items-center justify-center relative">
                {/* In a real app, this would be an actual video player */}
                <img 
                  src={demoImageUrl} 
                  alt={exercise.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  {isPlaying ? (
                    <Button 
                      size="icon" 
                      className="h-16 w-16 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
                      onClick={handlePause}
                    >
                      <Pause className="h-8 w-8 text-black" />
                    </Button>
                  ) : (
                    <Button 
                      size="icon" 
                      className="h-16 w-16 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
                      onClick={handlePlay}
                    >
                      <Play className="h-8 w-8 text-black ml-1" />
                    </Button>
                  )}
                </div>
                
                {/* Video controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8"
                      onClick={resetDemo}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    {exercise.duration} min
                  </div>
                </div>
              </div>
            ) : (
              // Placeholder for exercises without videos
              <div className="text-center p-8">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Exercise demonstration will be available soon
                </p>
              </div>
            )}
          </div>
          
          {/* Equipment needed */}
          {exercise.equipmentNeeded.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Equipment Needed</h4>
              <div className="flex flex-wrap gap-2">
                {exercise.equipmentNeeded.map((item, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div>
            <h4 className="font-medium text-sm mb-2">Instructions</h4>
            <ol className="space-y-2">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="font-medium text-primary">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
          
          {/* Safety notes */}
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <h4 className="font-medium text-sm text-yellow-800 mb-2">Safety Notes</h4>
            <ul className="space-y-1">
              {exercise.safetyNotes.map((note, index) => (
                <li key={index} className="flex gap-2 text-sm text-yellow-700">
                  <span>⚠️</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}