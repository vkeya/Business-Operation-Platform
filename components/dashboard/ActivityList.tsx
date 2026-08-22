interface ActivityListProps {
  activities: {
    id: string;
    title: string;
    description: string;
    value: string;
  }[];
}

export default function ActivityList({
  activities,
}: ActivityListProps) {
  return (
    <div className="divide-y divide-slate-100">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {activity.title}
            </p>
            <p className="text-xs text-slate-500">
              {activity.description}
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-900">
            {activity.value}
          </p>
        </div>
      ))}
    </div>
  );
}
