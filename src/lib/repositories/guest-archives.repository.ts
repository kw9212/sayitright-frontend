/**
 * 게스트 모드 아카이브 Repository (IndexedDB 사용)
 */
import { indexedDB, type GuestArchive } from '../storage/indexeddb';

export type ArchiveListItem = {
  id: string;
  preview: string;
  tone: string;
  purpose?: string;
  relationship?: string;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveDetail = ArchiveListItem & {
  content: string;
  rationale?: string;
};

export type ArchivesListQuery = {
  page?: number;
  limit?: number;
  tone?: string;
  relationship?: string;
  purpose?: string;
  from?: string;
  to?: string;
};

export type ArchivesListResponse = {
  ok: boolean;
  data: {
    items: ArchiveListItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export type ArchiveDetailResponse = {
  ok: boolean;
  data: ArchiveDetail;
};

export class GuestArchivesRepository {
  async list(query?: ArchivesListQuery): Promise<ArchivesListResponse> {
    const archives = await indexedDB.getAll<GuestArchive>('archives');

    // 필터링
    let filtered = [...archives];

    if (query?.tone) {
      filtered = filtered.filter((a) => a.tone === query.tone);
    }

    if (query?.relationship) {
      filtered = filtered.filter((a) => a.relationship === query.relationship);
    }

    if (query?.purpose) {
      filtered = filtered.filter((a) => a.purpose === query.purpose);
    }

    // 날짜 필터 (7일 제한 적용)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filtered = filtered.filter((a) => new Date(a.createdAt) >= sevenDaysAgo);

    // 정렬 (최신순)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 페이지네이션
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    const items = filtered.slice(start, end).map((a) => ({
      id: a.id,
      preview: a.content.substring(0, 100),
      tone: a.tone,
      purpose: a.purpose,
      relationship: a.relationship,
      createdAt: a.createdAt,
      updatedAt: a.createdAt,
    }));

    return {
      ok: true,
      data: {
        items,
        total: filtered.length,
        page,
        limit,
      },
    };
  }

  async get(id: string): Promise<ArchiveDetailResponse> {
    const archive = await indexedDB.getById<GuestArchive>('archives', id);

    if (!archive) {
      throw new Error('아카이브를 찾을 수 없습니다.');
    }

    return {
      ok: true,
      data: {
        id: archive.id,
        content: archive.content,
        preview: archive.content.substring(0, 100),
        tone: archive.tone,
        purpose: archive.purpose,
        relationship: archive.relationship,
        rationale: archive.rationale,
        createdAt: archive.createdAt,
        updatedAt: archive.createdAt,
      },
    };
  }

  async create(data: Partial<GuestArchive>): Promise<{ ok: boolean; data: { id: string } }> {
    const id = `guest-archive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const archive: GuestArchive = {
      id,
      title: data.title || '',
      content: data.content || '',
      tone: data.tone || 'neutral',
      purpose: data.purpose || '',
      relationship: data.relationship || '',
      rationale: data.rationale,
      createdAt: now,
    };

    await indexedDB.add('archives', archive);

    return {
      ok: true,
      data: { id },
    };
  }

  async remove(id: string): Promise<void> {
    await indexedDB.delete('archives', id);
  }

  async count(): Promise<number> {
    return await indexedDB.count('archives');
  }

  async cleanupOld(): Promise<void> {
    const archives = await indexedDB.getAll<GuestArchive>('archives');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const archive of archives) {
      if (new Date(archive.createdAt) < sevenDaysAgo) {
        await indexedDB.delete('archives', archive.id);
      }
    }
  }
}

export const guestArchivesRepository = new GuestArchivesRepository();
