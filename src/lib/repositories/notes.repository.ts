const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:3001';

export interface Note {
  id: string;
  term: string;
  description: string | null;
  example: string | null;
  isStarred: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface NoteListItem {
  id: string;
  term: string;
  description: string | null;
  example: string | null;
  isStarred: boolean;
  createdAt: string | Date;
}

export interface NotesListQuery {
  q?: string;
  sort?: 'latest' | 'oldest' | 'term_asc' | 'term_desc';
  page?: number;
  limit?: number;
}

export interface NotesListResponse {
  notes: NoteListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateNoteRequest {
  term: string;
  description?: string;
  example?: string;
}

export interface UpdateNoteRequest {
  term?: string;
  description?: string;
  example?: string;
}

export interface INotesRepository {
  list(query: NotesListQuery): Promise<NotesListResponse>;
  get(id: string): Promise<Note>;
  create(data: CreateNoteRequest): Promise<Note>;
  update(id: string, data: UpdateNoteRequest): Promise<Note>;
  remove(id: string): Promise<void>;
  toggleStar(id: string): Promise<Note>;
}

class NotesAPIRepository implements INotesRepository {
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || errorData?.message || '요청 처리 중 오류가 발생했습니다.';

      console.error('Notes API Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      throw new Error(errorMessage);
    }

    return response;
  }

  async list(query: NotesListQuery): Promise<NotesListResponse> {
    const params = new URLSearchParams();
    if (query.q) {
      params.append('q', query.q);
    }
    if (query.sort) {
      params.append('sort', query.sort);
    }
    if (query.page) {
      params.append('page', query.page.toString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${API_BASE_URL}/v1/notes?${params.toString()}`;
    const response = await this.fetchWithAuth(url);
    const data = await response.json();
    return data.data;
  }

  async get(id: string): Promise<Note> {
    const url = `${API_BASE_URL}/v1/notes/${id}`;
    const response = await this.fetchWithAuth(url);
    const data = await response.json();
    return data.data;
  }

  async create(data: CreateNoteRequest): Promise<Note> {
    const url = `${API_BASE_URL}/v1/notes`;
    const response = await this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  }

  async update(id: string, data: UpdateNoteRequest): Promise<Note> {
    const url = `${API_BASE_URL}/v1/notes/${id}`;
    const response = await this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  }

  async remove(id: string): Promise<void> {
    const url = `${API_BASE_URL}/v1/notes/${id}`;
    await this.fetchWithAuth(url, {
      method: 'DELETE',
    });
  }

  async toggleStar(id: string): Promise<Note> {
    const url = `${API_BASE_URL}/v1/notes/${id}/star`;
    const response = await this.fetchWithAuth(url, {
      method: 'PATCH',
    });
    const result = await response.json();
    return result.data;
  }
}

export const notesRepository: INotesRepository = new NotesAPIRepository();
