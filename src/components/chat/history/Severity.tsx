import { SeverityType } from "@/data/mock/symptoms";

const Severity = ({ severity }: { severity: string }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Severity
      </span>
      {severity === SeverityType.Low ? (
        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
          {severity}
        </span>
      ) : severity === SeverityType.Medium ? (
        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
          {severity}
        </span>
      ) : severity === SeverityType.High ? (
        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold">
          {severity}
        </span>
      ) : severity === SeverityType.Urgent ? (
        <span className="inline-block px-2 py-1 bg-red-500 text-white rounded text-sm font-semibold">
          {severity}
        </span>
      ) : (
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-semibold">
          {SeverityType.None}
        </span>
      )}
    </div>
  );
};
export default Severity;
