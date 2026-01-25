/**
 * 게스트 모드 노트 Repository (IndexedDB 사용)
 */
import { indexedDB, type GuestNote } from '../storage/indexeddb';

export type NoteItem = {
  id: string;
  term: string;
  description: string | null;
  example: string | null;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotesListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  sort?: 'latest' | 'oldest' | 'term_asc' | 'term_desc';
};

export type NotesListResponse = {
  notes: NoteItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateNoteRequest = {
  term: string;
  description?: string;
  example?: string;
};

export type UpdateNoteRequest = {
  term?: string;
  description?: string;
  example?: string;
};

export class GuestNotesRepository {
  async list(query?: NotesListQuery): Promise<NotesListResponse> {
    let notes = await indexedDB.getAll<GuestNote>('notes');

    // 검색
    if (query?.q) {
      const searchTerm = query.q.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.term.toLowerCase().includes(searchTerm) ||
          n.description?.toLowerCase().includes(searchTerm) ||
          n.example?.toLowerCase().includes(searchTerm),
      );
    }

    // 정렬
    const sort = query?.sort || 'latest';
    if (sort === 'latest') {
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      notes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'term_asc') {
      notes.sort((a, b) => a.term.localeCompare(b.term));
    } else if (sort === 'term_desc') {
      notes.sort((a, b) => b.term.localeCompare(a.term));
    }

    // 페이지네이션
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    const items = notes.slice(start, end);
    const totalPages = Math.ceil(notes.length / limit);

    return {
      notes: items,
      pagination: {
        page,
        limit,
        total: notes.length,
        totalPages,
      },
    };
  }

  async get(id: string): Promise<NoteItem> {
    const note = await indexedDB.getById<GuestNote>('notes', id);

    if (!note) {
      throw new Error('노트를 찾을 수 없습니다.');
    }

    return note;
  }

  async create(data: CreateNoteRequest): Promise<NoteItem> {
    const id = `guest-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const note: GuestNote = {
      id,
      term: data.term,
      description: data.description || null,
      example: data.example || null,
      isStarred: false,
      createdAt: now,
      updatedAt: now,
    };

    await indexedDB.add('notes', note);

    return note;
  }

  async update(id: string, data: UpdateNoteRequest): Promise<NoteItem> {
    const existing = await indexedDB.getById<GuestNote>('notes', id);

    if (!existing) {
      throw new Error('노트를 찾을 수 없습니다.');
    }

    const updated: GuestNote = {
      ...existing,
      term: data.term ?? existing.term,
      description: data.description ?? existing.description,
      example: data.example ?? existing.example,
      updatedAt: new Date().toISOString(),
    };

    await indexedDB.update('notes', updated);

    return updated;
  }

  async toggleStar(id: string): Promise<NoteItem> {
    const existing = await indexedDB.getById<GuestNote>('notes', id);

    if (!existing) {
      throw new Error('노트를 찾을 수 없습니다.');
    }

    const updated: GuestNote = {
      ...existing,
      isStarred: !existing.isStarred,
      updatedAt: new Date().toISOString(),
    };

    await indexedDB.update('notes', updated);

    return updated;
  }

  async remove(id: string): Promise<void> {
    await indexedDB.delete('notes', id);
  }

  async count(): Promise<number> {
    return await indexedDB.count('notes');
  }
}

export const guestNotesRepository = new GuestNotesRepository();
