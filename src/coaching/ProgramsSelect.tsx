import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface CoachingProgram {
  patient_id: string;
  program_title: string;
  emoji: string;
  description: string;
  goals: string[];
  duration_weeks: number;
  weekly_plan: {
    week: number;
    focus: string;
    activities: string[];
  }[];
}

interface ProgramSelectProps {
  programs: CoachingProgram[];
}

export default function ProgramSelect({ programs }: ProgramSelectProps) {
  const [selectedProgram, setSelectedProgram] =
    useState<CoachingProgram | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedProgram) {
      const storageKey = `progress-${selectedProgram.patient_id}-${selectedProgram.program_title}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) setProgress(JSON.parse(stored));
      else setProgress({});
    }
  }, [selectedProgram]);

  const handleCheck = (key: string, checked: boolean) => {
    if (!selectedProgram) return;
    const storageKey = `progress-${selectedProgram.patient_id}-${selectedProgram.program_title}`;
    const updated = { ...progress, [key]: checked };
    setProgress(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="w-full mt-8 space-y-6">
      <h2 className="text-2xl font-bold">
        Your personalized well-being programs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {programs.map((program, index) => (
          <SingleProgram
            key={index}
            program={program}
            selectedProgram={selectedProgram}
            handleSelectProgram={setSelectedProgram}
          />
        ))}
      </div>

      {selectedProgram && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedProgram.program_title}
            </CardTitle>
            <Goals goals={selectedProgram.goals} />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="week-1" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                {selectedProgram.weekly_plan.map((week) => (
                  <TabsTrigger key={week.week} value={`week-${week.week}`}>
                    Week {week.week}
                  </TabsTrigger>
                ))}
              </TabsList>
              {selectedProgram.weekly_plan.map((week) => (
                <TabsContent
                  key={week.week}
                  value={`week-${week.week}`}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">{week.focus}</h3>
                  <Separator />
                  <ul className="space-y-3">
                    {week.activities.map((activity, i) => {
                      const activityKey = `${selectedProgram.program_title}-week-${week.week}-activity-${i}`;
                      return (
                        <li
                          key={activityKey}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            id={activityKey}
                            checked={progress[activityKey] || false}
                            onCheckedChange={(checked) =>
                              handleCheck(activityKey, Boolean(checked))
                            }
                          />
                          <label htmlFor={activityKey} className="text-sm">
                            {activity}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const SingleProgram = ({
  program,
  selectedProgram,
  handleSelectProgram,
}: {
  program: CoachingProgram;
  selectedProgram: CoachingProgram | null;
  handleSelectProgram: (program: CoachingProgram) => void;
}) => {
  return (
    <Card
      onClick={() => handleSelectProgram(program)}
      className={`w-full cursor-pointer ${selectedProgram?.program_title === program.program_title ? "ring-2 ring-blue-500" : ""}`}
    >
      <CardHeader>
        <CardTitle className="text-md">
          <div className="flex flex-col gap-3">
            <span className="text-3xl">{program.emoji} </span>
            <div className="text-wrap">{program.program_title}</div>
            <div className="text-muted-foreground font-light text-sm">
              {program.description}
            </div>
          </div>
        </CardTitle>
        <Goals goals={program.goals} />
      </CardHeader>
    </Card>
  );
};

const Goals = ({ goals }: { goals: string[] }) => {
  return (
    <div className="text-sm mt-2">
      <span className="font-semibold">Goals:</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {goals.map((goal, i) => (
          <span
            key={i}
            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            {goal}
          </span>
        ))}
      </div>
    </div>
  );
};
