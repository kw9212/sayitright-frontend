import { type ArchiveListItem } from '@/lib/repositories/archives.repository';
import { getToneLabel, getRelationshipLabel, getPurposeLabel } from '@/lib/constants/filter-labels';

type Props = {
  archive: ArchiveListItem;
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onViewDetails?: () => void;
};

export default function ArchiveRow({
  archive,
  isDeleteMode,
  isSelected,
  onToggleSelect,
  onViewDetails,
}: Props) {
  const formattedDate = new Date(archive.createdAt).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedFullDate = new Date(archive.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClick = () => {
    if (isDeleteMode) {
      onToggleSelect();
    } else if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 px-3 md:px-4 py-3 rounded-lg transition-all cursor-pointer ${
        isDeleteMode ? 'hover:bg-red-950/20' : 'hover:bg-zinc-800/50'
      } ${isSelected ? 'bg-red-950/30 border border-red-700/50' : 'border border-transparent'}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 md:gap-4">
        {isDeleteMode && (
          <div className="shrink-0">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? 'bg-red-600 border-red-600' : 'border-zinc-600 bg-zinc-900'
              }`}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        <div className="shrink-0 text-xs md:text-sm text-zinc-400" title={formattedFullDate}>
          {formattedDate}
        </div>

        {!isDeleteMode && (
          <div className="md:hidden shrink-0 text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2 md:w-80 md:shrink-0">
        <span
          className="px-2 py-0.5 text-xs rounded-full bg-blue-900/30 
            text-blue-300 border border-blue-700/30"
        >
          {getToneLabel(archive.tone)}
        </span>
        {archive.relationship && (
          <span
            className="px-2 py-0.5 text-xs rounded-full bg-green-900/30 
              text-green-300 border border-green-700/30"
            title={archive.relationship}
          >
            {getRelationshipLabel(archive.relationship)}
          </span>
        )}
        {archive.purpose && (
          <span
            className="px-2 py-0.5 text-xs rounded-full bg-purple-900/30 
              text-purple-300 border border-purple-700/30"
            title={archive.purpose}
          >
            {getPurposeLabel(archive.purpose)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 truncate">{archive.preview}</p>
      </div>

      {!isDeleteMode && (
        <div className="hidden md:block shrink-0 text-zinc-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
