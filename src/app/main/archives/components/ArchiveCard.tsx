import { type ArchiveListItem } from '@/lib/repositories/archives.repository';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { getToneLabel, getRelationshipLabel, getPurposeLabel } from '@/lib/constants/filter-labels';

type Props = {
  archive: ArchiveListItem;
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onViewDetails?: () => void;
};

export default function ArchiveCard({
  archive,
  isDeleteMode,
  isSelected,
  onToggleSelect,
  onViewDetails,
}: Props) {
  const formattedDate = new Date(archive.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayTitle = archive.title || formattedDate;

  const handleClick = () => {
    if (isDeleteMode) {
      onToggleSelect();
    } else if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <Card
      className={`relative transition-all cursor-pointer bg-zinc-800 ${
        isDeleteMode
          ? 'hover:border-red-400'
          : 'hover:border-zinc-600 hover:shadow-lg hover:shadow-blue-500/10'
      } ${isSelected ? 'border-red-500 bg-red-950/20' : 'border-zinc-700'}`}
      onClick={handleClick}
    >
      {isDeleteMode && (
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
              isSelected ? 'bg-red-600 border-red-600' : 'border-zinc-600 bg-zinc-900'
            }`}
          >
            {isSelected && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 pr-10 text-zinc-300">{displayTitle}</CardTitle>
        <CardDescription className="text-xs">{formattedDate}</CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">{archive.preview}</p>
      </CardContent>

      <CardFooter className="flex-wrap gap-2 pt-0">
        <span
          className="px-2 py-1 text-xs rounded-full bg-blue-900/30 
          text-blue-300 border border-blue-700/30"
          title={archive.tone}
        >
          {getToneLabel(archive.tone)}
        </span>
        {archive.relationship && (
          <span
            className="px-2 py-1 text-xs rounded-full bg-green-900/30 
            text-green-300 border border-green-700/30"
            title={archive.relationship}
          >
            {getRelationshipLabel(archive.relationship)}
          </span>
        )}
        {archive.purpose && (
          <span
            className="px-2 py-1 text-xs rounded-full bg-purple-900/30 
              text-purple-300 border border-purple-700/30"
            title={archive.purpose}
          >
            {getPurposeLabel(archive.purpose)}
          </span>
        )}
      </CardFooter>

      {!isDeleteMode && (
        <div
          className="absolute inset-0 bg-linear-to-t from-blue-500/0 to-blue-500/0 
          hover:from-blue-500/5 hover:to-blue-500/0 rounded-xl pointer-events-none transition-all"
          title={archive.tone}
        />
      )}
    </Card>
  );
}
