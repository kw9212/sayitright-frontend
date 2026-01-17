import { type ArchiveListItem } from '@/lib/repositories/archives.repository';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type Props = {
  archives: ArchiveListItem[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirmModal({ archives, isOpen, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="max-w-md max-h-[80vh] overflow-hidden flex flex-col 
          bg-zinc-900 text-white border-zinc-700"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 
                  1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 
                  16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            아카이브 삭제 확인
          </DialogTitle>
          <DialogDescription className="text-zinc-300">
            선택한 <strong className="text-white">{archives.length}개</strong>의 아카이브를
            삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-4">
          <div
            className="bg-zinc-800 border border-zinc-700 
              rounded-lg p-4 max-h-48 overflow-y-auto"
          >
            <p className="text-sm text-zinc-400 mb-2">삭제될 아카이브:</p>
            <ul className="space-y-2">
              {archives.map((archive) => (
                <li key={archive.id} className="flex items-start gap-2 text-sm">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="flex-1 text-zinc-300 line-clamp-1">
                    {archive.title || new Date(archive.createdAt).toLocaleString('ko-KR')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4">
            <p className="text-red-300 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 
                  4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              주의!
            </p>
            <ul className="text-sm text-red-200 space-y-1">
              <li>
                • 삭제된 아카이브는 <strong>영구적으로 삭제</strong>됩니다.
              </li>
              <li>
                • 삭제 후 <strong>복구할 수 없습니다</strong>.
              </li>
              <li>• 신중하게 확인 후 진행해주세요.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 
              rounded-lg transition-colors font-semibold"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 
              rounded-lg transition-colors font-semibold"
          >
            삭제 ({archives.length}개)
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
