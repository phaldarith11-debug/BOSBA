import { Construction } from "lucide-react";

interface Props {
  title: string;
  /** Short sentence describing what this screen will do. */
  description: string;
  /** Optional bullet list of planned capabilities. */
  features?: string[];
  /** Milestone tag shown in the badge, e.g. "Milestone 2". */
  milestone?: string;
}

/** Placeholder for dashboard screens whose functionality lands in a later milestone. */
export function ComingSoon({ title, description, features, milestone = "Milestone 2" }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Construction className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Coming soon</p>
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {milestone}
            </span>
          </div>
        </div>

        {features && features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
