'use client';

import { NoteListItem } from '@/lib/repositories/notes.repository';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Edit } from 'lucide-react';

interface NoteItemProps {
  note: NoteListItem;
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onEdit: (note: NoteListItem) => void;
}

export function NoteItem({
  note,
  isDeleteMode,
  isSelected,
  onToggleSelect,
  onToggleStar,
  onEdit,
}: NoteItemProps) {
  const handleCardClick = () => {
    if (isDeleteMode) {
      onToggleSelect(note.id);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`p-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 
        transition-colors ${
          isDeleteMode && isSelected ? 'border-red-500 bg-red-950/20' : ''
        } ${isDeleteMode ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        {isDeleteMode ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(note.id)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 mt-1 rounded border-gray-600 bg-zinc-800 
              text-red-500 focus:ring-red-500 cursor-pointer"
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(note.id);
            }}
            className="shrink-0 mt-1"
            aria-label={note.isStarred ? '중요 표시 해제' : '중요 표시'}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                note.isStarred
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-gray-500 hover:text-yellow-500'
              }`}
            />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-white mb-2">{note.term}</h3>

          {note.description && (
            <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">{note.description}</p>
          )}

          {note.example && (
            <div className="mt-2 p-2 bg-zinc-800 rounded border border-zinc-700">
              <p className="text-xs text-gray-400 mb-1">예시:</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.example}</p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            {new Date(note.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>

        {!isDeleteMode && (
          <div className="flex gap-1 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="h-8 w-8 p-0 hover:bg-zinc-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
