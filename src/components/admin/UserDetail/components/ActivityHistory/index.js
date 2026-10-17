import ActivityItem from "@/components/admin/UserDetail/components/ActivityHistory/components/ActivityItem";
import { adminTexts } from "@/components/admin/data/texts";

// What an account did over time, newest first: the trips it saved (deleted ones too) and the itineraries it made.
// `history`: server/admin/users's.
const ActivityHistory = ({ history, lang }) => {
  const texts = adminTexts(lang).user.history;
  return (
    <div className="grid grid-cols-1 gap-4">
      <p className="text-sm text-muted-foreground">{texts.hint}</p>
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">{texts.empty}</p>
      ) : (
        <ol className="grid divide-y">
          {history.map((event, index) => (
            <ActivityItem key={`${event.type}-${event.at}-${index}`} event={event} lang={lang} />
          ))}
        </ol>
      )}
    </div>
  );
};

export default ActivityHistory;
