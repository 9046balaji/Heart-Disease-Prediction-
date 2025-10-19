import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  CheckCircle,
  AlertTriangle,
  Timer,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  intensity: "low" | "moderate" | "high";
  equipmentNeeded: string[];
  instructions: string[];
  safetyNotes: string[];
  gifUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface WorkoutInterfaceProps {
  workout: {
    id: string;
    title: string;
    exercises: Exercise[];
    duration: number; // total duration in minutes
    intensity: "low" | "moderate" | "high";
  };
  onExerciseComplete: (exerciseId: string, duration: number) => void;
  onWorkoutComplete: (workoutId: string, completedExercises: number, totalExercises: number) => void;
  onExit: () => void;
}

export default function WorkoutInterface({ 
  workout, 
  onExerciseComplete, 
  onWorkoutComplete,
  onExit 
}: WorkoutInterfaceProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(workout.exercises[0]?.duration || 60);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showSafetyCheck, setShowSafetyCheck] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise = workout.exercises[currentExerciseIndex];

  // Initialize timer when component mounts or exercise changes
  useEffect(() => {
    setTimeRemaining(currentExercise?.duration || 60);
    setIsPlaying(false);
    
    // Clean up timer on unmount or exercise change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentExerciseIndex, currentExercise?.duration]);

  // Handle timer
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleExerciseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const resetTimer = () => {
    setIsPlaying(false);
    setTimeRemaining(currentExercise?.duration || 60);
  };

  const handleExerciseComplete = () => {
    setIsPlaying(false);
    
    // Mark exercise as completed
    if (!completedExercises.includes(currentExercise.id)) {
      setCompletedExercises(prev => [...prev, currentExercise.id]);
      onExerciseComplete(currentExercise.id, currentExercise.duration);
    }
    
    // Move to next exercise or complete workout
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Workout complete
      onWorkoutComplete(workout.id, completedExercises.length + 1, workout.exercises.length);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setIsPlaying(false);
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setIsPlaying(false);
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low": return "bg-green-100 text-green-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSafetyCheckComplete = () => {
    setShowSafetyCheck(false);
  };

  // If showing safety check, render that first
  if (showSafetyCheck) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            Pre-Exercise Safety Check
          </CardTitle>
          <CardDescription>Please confirm the following before starting your workout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Safety Information</AlertTitle>
            <AlertDescription>
              Stop exercising immediately if you experience chest pain, dizziness, or shortness of breath.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <span>Are you feeling well today?</span>
              <Badge variant="secondary">Required</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <span>Do you have any chest pain or discomfort?</span>
              <Badge variant="secondary">Required</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <span>Do you feel dizzy or lightheaded?</span>
              <Badge variant="secondary">Required</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <span>Have you taken your medication as prescribed today?</span>
              <Badge variant="secondary">Required</Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={onExit}
            >
              Cancel Workout
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSafetyCheckComplete}
            >
              I Confirm, Start Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-6 w-6" />
                {workout.title}
              </CardTitle>
              <CardDescription>
                {workout.exercises.length} exercises • {workout.duration} min
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getIntensityColor(workout.intensity)}>
                {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)} Intensity
              </Badge>
              <Button variant="outline" size="sm" onClick={onExit}>
                Exit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Workout Progress</span>
                <span>
                  {completedExercises.length} / {workout.exercises.length} exercises
                </span>
              </div>
              <Progress 
                value={(completedExercises.length / workout.exercises.length) * 100} 
                className="h-2" 
              />
            </div>
            
            {/* Exercise Progress */}
            <div className="flex overflow-x-auto gap-2 py-2">
              {workout.exercises.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border w-20 ${
                    index === currentExerciseIndex 
                      ? "border-primary bg-primary/10" 
                      : completedExercises.includes(exercise.id)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                  }`}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentExerciseIndex(index);
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    index === currentExerciseIndex 
                      ? "bg-primary text-primary-foreground" 
                      : completedExercises.includes(exercise.id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-100"
                  }`}>
                    {completedExercises.includes(exercise.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center truncate w-full">
                    {exercise.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Exercise */}
      {currentExercise && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentExercise.name}
                  {completedExercises.includes(currentExercise.id) && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getIntensityColor(currentExercise.intensity)}>
                  {currentExercise.intensity.charAt(0).toUpperCase() + currentExercise.intensity.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-mono bg-muted px-2 py-1 rounded">
                  <Timer className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Media Display */}
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center relative">
                  {currentExercise.videoUrl ? (
                    <div className="w-full h-full relative">
                      {/* In a real app, this would be an actual video player */}
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="bg-gray-300 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-2" />
                          <p className="text-muted-foreground">Video Player</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
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
                            onClick={resetTimer}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : currentExercise.gifUrl ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {/* In a real app, this would display the GIF */}
                      <div className="text-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-2" />
                        <p className="text-muted-foreground">Exercise GIF</p>
                      </div>
                    </div>
                  ) : currentExercise.imageUrl ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {/* In a real app, this would display the image */}
                      <div className="text-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-2" />
                        <p className="text-muted-foreground">Exercise Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Exercise demonstration will be available soon
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Equipment needed */}
                {currentExercise.equipmentNeeded.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Equipment Needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentExercise.equipmentNeeded.map((item, index) => (
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
              </div>
              
              {/* Instructions */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentExercise.description}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Instructions</h4>
                  <ol className="space-y-2">
                    {currentExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-2 text-sm">
                        <span className="font-medium text-primary">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <Separator />
                
                {/* Safety notes */}
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <h4 className="font-medium text-sm text-yellow-800 mb-2">Safety Notes</h4>
                  <ul className="space-y-1">
                    {currentExercise.safetyNotes.map((note, index) => (
                      <li key={index} className="flex gap-2 text-sm text-yellow-700">
                        <span>⚠️</span>
                        <span>{note}</span>
                      </li>
                    ))}
                    <li className="flex gap-2 text-sm text-yellow-700">
                      <span>⚠️</span>
                      <span>Stop immediately if you feel any pain or discomfort</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Exercise Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleNextExercise}
                  disabled={currentExerciseIndex === workout.exercises.length - 1}
                >
                  Next
                  <SkipForward className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                {completedExercises.includes(currentExercise.id) ? (
                  <Button variant="outline" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Exercise Completed
                  </Button>
                ) : (
                  <Button 
                    onClick={handleExerciseComplete}
                    disabled={isPlaying}
                  >
                    Mark as Complete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workout Completion */}
      {completedExercises.length === workout.exercises.length && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Workout Complete!</h3>
            <p className="text-muted-foreground mb-6">
              Great job! You've completed all exercises in your workout.
            </p>
            <Button onClick={() => onWorkoutComplete(workout.id, completedExercises.length, workout.exercises.length)}>
              Finish Workout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}