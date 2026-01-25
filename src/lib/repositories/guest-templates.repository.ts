/**
 * 게스트 모드 템플릿 Repository (IndexedDB 사용)
 */
import { indexedDB, type GuestTemplate } from '../storage/indexeddb';
import type {
  TemplateListItem,
  TemplateDetail,
  TemplatesListQuery,
  TemplatesListResponse,
  TemplateDetailResponse,
  CreateTemplateRequest,
  CreateTemplateResponse,
  UpdateTemplateRequest,
  UpdateTemplateResponse,
} from './templates.repository';

export class GuestTemplatesRepository {
  async list(query?: TemplatesListQuery): Promise<TemplatesListResponse> {
    const templates = await indexedDB.getAll<GuestTemplate>('templates');

    // 필터링
    let filtered = [...templates];

    if (query?.tone) {
      filtered = filtered.filter((t) => t.tone === query.tone);
    }

    if (query?.relationship) {
      filtered = filtered.filter((t) => t.relationship === query.relationship);
    }

    if (query?.purpose) {
      filtered = filtered.filter((t) => t.purpose === query.purpose);
    }

    // 정렬 (최신순)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 페이지네이션
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    const items = filtered.slice(start, end).map((t) => ({
      id: t.id,
      title: t.title,
      preview: t.content.substring(0, 100),
      tone: t.tone,
      purpose: t.purpose,
      relationship: t.relationship,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
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

  async get(id: string): Promise<TemplateDetailResponse> {
    const template = await indexedDB.getById<GuestTemplate>('templates', id);

    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    return {
      ok: true,
      data: {
        id: template.id,
        title: template.title,
        content: template.content,
        preview: template.content.substring(0, 100),
        tone: template.tone,
        purpose: template.purpose,
        relationship: template.relationship,
        rationale: template.rationale,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    };
  }

  async create(data: CreateTemplateRequest): Promise<CreateTemplateResponse> {
    const id = `guest-template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const template: GuestTemplate = {
      id,
      title: data.title || '',
      content: data.content,
      tone: data.tone,
      purpose: data.purpose || '',
      relationship: data.relationship || '',
      rationale: data.rationale,
      createdAt: now,
      updatedAt: now,
    };

    await indexedDB.add('templates', template);

    return {
      ok: true,
      data: { id },
    };
  }

  async update(id: string, data: UpdateTemplateRequest): Promise<UpdateTemplateResponse> {
    const existing = await indexedDB.getById<GuestTemplate>('templates', id);

    if (!existing) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    const updated: GuestTemplate = {
      ...existing,
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      tone: data.tone ?? existing.tone,
      purpose: data.purpose ?? existing.purpose,
      relationship: data.relationship ?? existing.relationship,
      rationale: data.rationale ?? existing.rationale,
      updatedAt: new Date().toISOString(),
    };

    await indexedDB.update('templates', updated);

    return {
      ok: true,
      data: {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        preview: updated.content.substring(0, 100),
        tone: updated.tone,
        purpose: updated.purpose,
        relationship: updated.relationship,
        rationale: updated.rationale,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }

  async remove(id: string): Promise<void> {
    await indexedDB.delete('templates', id);
  }

  async count(): Promise<number> {
    return await indexedDB.count('templates');
  }
}

export const guestTemplatesRepository = new GuestTemplatesRepository();
