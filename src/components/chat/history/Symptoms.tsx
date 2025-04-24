import { UNCLEAR_SYMPTOM } from "@/data/mock/symptoms";

const Symptoms = ({ symptoms }: { symptoms: string }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Symptoms
      </span>
      <div className="flex flex-wrap gap-2">
        {symptoms === UNCLEAR_SYMPTOM ? (
          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm font-semibold">
            {UNCLEAR_SYMPTOM}
          </span>
        ) : (
          symptoms?.split(",").map((symptom, i) => (
            <span
              key={i}
              className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-semibold"
            >
              {symptom}
            </span>
          ))
        )}
      </div>
    </div>
  );
};
export default Symptoms;
