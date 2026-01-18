'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { MainHeader } from '@/components/layout/MainHeader';
import { tokenStore } from '@/lib/auth/token';
import { notesRepository, NoteListItem, Note } from '@/lib/repositories/notes.repository';
import { NoteItem } from './components/NoteItem';
import { NoteEditModal } from './components/NoteEditModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { toast } from 'sonner';

export default function NotesPage() {
  const auth = useAuth();

  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOption, setSortOption] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    const refreshTokenOnMount = async () => {
      if (auth.status === 'authenticated' && tokenStore.getAccessToken()) {
        try {
          const response = await fetch('/api/auth/refresh', { method: 'POST' });
          const data = await response.json();

          if (response.ok && data?.data?.accessToken) {
            tokenStore.setAccessToken(data.data.accessToken);
          }
        } catch (error) {
          console.error('토큰 갱신 실패:', error);
        }
      }
    };

    void refreshTokenOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = useCallback(async () => {
    if (auth.status !== 'authenticated') {
      return;
    }

    setIsLoading(true);
    try {
      const response = await notesRepository.list({
        q: searchTerm || undefined,
        sort: sortOption as 'latest' | 'oldest' | 'term_asc' | 'term_desc',
        page: currentPage,
        limit: 10,
      });

      setNotes(response.notes);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('용어 목록 조회 실패:', error);
      toast.error(error instanceof Error ? error.message : '용어 목록 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [auth.status, searchTerm, sortOption, currentPage]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setIsEditModalOpen(true);
  };

  const handleEditNote = (note: NoteListItem) => {
    setEditingNote(note as Note);
    setIsEditModalOpen(true);
  };

  const handleSaveNote = async (data: { term: string; description?: string; example?: string }) => {
    try {
      if (editingNote) {
        await notesRepository.update(editingNote.id, data);
        toast.success('용어가 수정되었습니다.');
      } else {
        await notesRepository.create(data);
        toast.success('용어가 추가되었습니다.');
      }
      await fetchNotes();
    } catch (error) {
      throw error;
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds(new Set());
  };

  const toggleNoteSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast.error('삭제할 용어를 선택해주세요.');
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map((id) => notesRepository.remove(id)));
      toast.success(`${selectedIds.size}개의 용어가 삭제되었습니다.`);
      setShowDeleteModal(false);
      setSelectedIds(new Set());
      setIsDeleteMode(false);
      await fetchNotes();
    } catch (error) {
      console.error('용어 삭제 실패:', error);
      toast.error(error instanceof Error ? error.message : '용어 삭제에 실패했습니다.');
    }
  };

  const handleToggleStar = async (id: string) => {
    try {
      await notesRepository.toggleStar(id);
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, isStarred: !note.isStarred } : note)),
      );
    } catch (error) {
      console.error('중요 표시 토글 실패:', error);
      toast.error('중요 표시 변경에 실패했습니다.');
    }
  };

  if (auth.status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MainHeader title="용어 노트" showBackButton />

      <div className="sticky top-[73px] z-10 bg-black border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 
                    w-4 h-4 text-gray-400"
                />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="용어, 설명, 예시 검색..."
                  className="pl-10 bg-zinc-900 border-zinc-800"
                />
              </div>
              <Button onClick={handleSearch} size="sm">
                검색
              </Button>
            </div>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
                <SelectItem value="term_asc">가나다순</SelectItem>
                <SelectItem value="term_desc">가나다 역순</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleAddNote} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              추가
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">총 {total}개의 용어</div>
            <div className="flex gap-2">
              {isDeleteMode ? (
                <>
                  <Button variant="default" size="sm" onClick={toggleDeleteMode}>
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={selectedIds.size === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제 ({selectedIds.size})
                  </Button>
                </>
              ) : (
                <Button variant="default" size="sm" onClick={toggleDeleteMode}>
                  선택 삭제
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">로딩 중...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              {searchTerm ? '검색 결과가 없습니다.' : '저장된 용어가 없습니다.'}
            </p>
            <Button onClick={handleAddNote}>
              <Plus className="w-4 h-4 mr-2" />첫 용어 추가하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isDeleteMode={isDeleteMode}
                isSelected={selectedIds.has(note.id)}
                onToggleSelect={toggleNoteSelection}
                onToggleStar={handleToggleStar}
                onEdit={handleEditNote}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            <span className="text-sm text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              다음
            </Button>
          </div>
        )}
      </div>

      <NoteEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        count={selectedIds.size}
        noteTerms={notes.filter((note) => selectedIds.has(note.id)).map((note) => note.term)}
      />
    </div>
  );
}
