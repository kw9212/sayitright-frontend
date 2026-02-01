import { tokenStore } from '../auth/token';

export type TemplateListItem = {
  id: string;
  title?: string;
  preview: string;
  tone: string;
  purpose?: string;
  target?: string;
  relationship?: string;
  createdAt: string;
  updatedAt: string;
};

export type TemplateDetail = TemplateListItem & {
  content: string;
  rationale?: string;
};

export type TemplatesListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  tone?: string;
  relationship?: string;
  purpose?: string;
  from?: string;
  to?: string;
};

export type TemplatesListResponse = {
  ok: boolean;
  data: {
    items: TemplateListItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export type TemplateDetailResponse = {
  ok: boolean;
  data: TemplateDetail;
};

export type CreateTemplateRequest = {
  sourceArchiveId?: string;
  title?: string;
  content: string;
  tone: string;
  relationship?: string;
  purpose?: string;
  rationale?: string;
};

export type CreateTemplateResponse = {
  ok: boolean;
  data: {
    id: string;
  };
};

export type UpdateTemplateRequest = {
  title?: string;
  content?: string;
  tone?: string;
  relationship?: string;
  purpose?: string;
  rationale?: string;
};

export type UpdateTemplateResponse = {
  ok: boolean;
  data: TemplateDetail;
};

export interface ITemplatesRepository {
  list(query?: TemplatesListQuery): Promise<TemplatesListResponse>;

  get(id: string): Promise<TemplateDetailResponse>;

  remove(id: string): Promise<{ ok: boolean }>;

  create(data: CreateTemplateRequest): Promise<CreateTemplateResponse>;

  update(id: string, data: UpdateTemplateRequest): Promise<UpdateTemplateResponse>;
}

class TemplatesAPIRepository implements ITemplatesRepository {
  private baseUrl = '/api/proxy/v1/templates';

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await response.json();

      if (response.ok && data?.data?.accessToken) {
        const newToken = data.data.accessToken;
        tokenStore.setAccessToken(newToken);
        return newToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return null;
  }

  private async fetchWithAuth<T = unknown>(
    url: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<T> {
    const accessToken = tokenStore.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 && retryCount === 0) {
        const newToken = await this.refreshAccessToken();

        if (newToken) {
          return this.fetchWithAuth(url, options, retryCount + 1);
        }
      }

      const errorData = await response.json().catch(() => null);

      let userMessage = '요청 처리 중 오류가 발생했습니다.';

      if (response.status === 401) {
        userMessage = '로그인이 필요합니다.';
      } else if (response.status === 403) {
        userMessage = '접근 권한이 없습니다.';
      } else if (response.status === 404) {
        userMessage = '요청한 리소스를 찾을 수 없습니다.';
      } else if (response.status >= 500) {
        userMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (errorData?.error?.message) {
        userMessage = Array.isArray(errorData.error.message)
          ? errorData.error.message.join(', ')
          : errorData.error.message;
      }

      throw new Error(userMessage);
    }

    return response.json();
  }

  async list(query: TemplatesListQuery = {}): Promise<TemplatesListResponse> {
    const params = new URLSearchParams();

    if (query.page) {
      params.set('page', query.page.toString());
    }

    if (query.limit) {
      params.set('limit', query.limit.toString());
    }

    if (query.q) {
      params.set('q', query.q);
    }

    if (query.tone) {
      params.set('tone', query.tone);
    }

    if (query.relationship) {
      params.set('relationship', query.relationship);
    }

    if (query.purpose) {
      params.set('purpose', query.purpose);
    }

    if (query.from) {
      params.set('from', query.from);
    }

    if (query.to) {
      params.set('to', query.to);
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    return this.fetchWithAuth(url);
  }

  async get(id: string): Promise<TemplateDetailResponse> {
    const url = `${this.baseUrl}/${id}`;
    return this.fetchWithAuth(url);
  }

  async remove(id: string): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/${id}`;
    return this.fetchWithAuth(url, { method: 'DELETE' });
  }

  async create(data: CreateTemplateRequest): Promise<CreateTemplateResponse> {
    return this.fetchWithAuth(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateTemplateRequest): Promise<UpdateTemplateResponse> {
    const url = `${this.baseUrl}/${id}`;
    return this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const templatesRepository: ITemplatesRepository = new TemplatesAPIRepository();
