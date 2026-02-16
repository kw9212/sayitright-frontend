/**
 * IndexedDB 유틸리티 테스트
 */

import { indexedDB } from './indexeddb';

describe('IndexedDB 유틸리티', () => {
  let mockDB: {
    objectStoreNames: { contains: jest.Mock };
    createObjectStore: jest.Mock;
    transaction: jest.Mock;
  };
  let mockTransaction: {
    objectStore: jest.Mock;
  };
  let mockStore: {
    getAll: jest.Mock;
    get: jest.Mock;
    add: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
    clear: jest.Mock;
    count: jest.Mock;
    createIndex: jest.Mock;
  };
  let mockRequest: {
    result: unknown;
    error: Error | null;
    onsuccess: (() => void) | null;
    onerror: (() => void) | null;
    onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null;
  };

  beforeEach(() => {
    // Mock IndexedDB store
    mockStore = {
      getAll: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      count: jest.fn(),
      createIndex: jest.fn(),
    };

    // Mock transaction
    mockTransaction = {
      objectStore: jest.fn().mockReturnValue(mockStore),
    };

    // Mock DB
    mockDB = {
      objectStoreNames: {
        contains: jest.fn().mockReturnValue(false),
      },
      createObjectStore: jest.fn().mockReturnValue(mockStore),
      transaction: jest.fn().mockReturnValue(mockTransaction),
    };

    // Mock IDBOpenDBRequest
    mockRequest = {
      result: mockDB,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    };

    // Mock window.indexedDB.open
    global.indexedDB = {
      open: jest.fn().mockReturnValue(mockRequest),
    } as unknown as IDBFactory;

    // Clear any cached DB promise
    (indexedDB as { dbPromise: Promise<IDBDatabase> | null }).dbPromise = null;
  });

  describe('DB 초기화', () => {
    it('DB를 열 수 있다', async () => {
      // Trigger onsuccess
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      expect(global.indexedDB.open).toHaveBeenCalledWith('sayitright_guest_db', 1);
    });

    it('onupgradeneeded에서 templates 스토어를 생성한다', async () => {
      const upgradeEvent = {
        target: { result: mockDB } as IDBOpenDBRequest,
      } as IDBVersionChangeEvent;

      setTimeout(() => {
        if (mockRequest.onupgradeneeded) {
          mockRequest.onupgradeneeded(upgradeEvent);
        }
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      expect(mockDB.objectStoreNames.contains).toHaveBeenCalledWith('templates');
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('templates', {
        keyPath: 'id',
      });
      expect(mockStore.createIndex).toHaveBeenCalledWith('createdAt', 'createdAt', {
        unique: false,
      });
    });

    it('onupgradeneeded에서 archives 스토어를 생성한다', async () => {
      const upgradeEvent = {
        target: { result: mockDB } as IDBOpenDBRequest,
      } as IDBVersionChangeEvent;

      setTimeout(() => {
        if (mockRequest.onupgradeneeded) {
          mockRequest.onupgradeneeded(upgradeEvent);
        }
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      expect(mockDB.objectStoreNames.contains).toHaveBeenCalledWith('archives');
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('archives', {
        keyPath: 'id',
      });
    });

    it('onupgradeneeded에서 notes 스토어를 생성한다', async () => {
      const upgradeEvent = {
        target: { result: mockDB } as IDBOpenDBRequest,
      } as IDBVersionChangeEvent;

      setTimeout(() => {
        if (mockRequest.onupgradeneeded) {
          mockRequest.onupgradeneeded(upgradeEvent);
        }
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      expect(mockDB.objectStoreNames.contains).toHaveBeenCalledWith('notes');
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('notes', {
        keyPath: 'id',
      });
    });

    it('notes 스토어에 term, isStarred 인덱스를 생성한다', async () => {
      let lastCreateIndexCall = 0;
      mockStore.createIndex.mockImplementation(() => {
        lastCreateIndexCall++;
      });

      const upgradeEvent = {
        target: { result: mockDB } as IDBOpenDBRequest,
      } as IDBVersionChangeEvent;

      setTimeout(() => {
        if (mockRequest.onupgradeneeded) {
          mockRequest.onupgradeneeded(upgradeEvent);
        }
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      // notes store의 createIndex 호출 확인
      const calls = mockStore.createIndex.mock.calls;
      const noteIndexCalls = calls.slice(-2); // 마지막 2개 (term, isStarred)

      expect(noteIndexCalls[0]).toEqual(['term', 'term', { unique: false }]);
      expect(noteIndexCalls[1]).toEqual(['isStarred', 'isStarred', { unique: false }]);
    });

    it('이미 존재하는 스토어는 생성하지 않는다', async () => {
      mockDB.objectStoreNames.contains.mockReturnValue(true);

      const upgradeEvent = {
        target: { result: mockDB } as IDBOpenDBRequest,
      } as IDBVersionChangeEvent;

      setTimeout(() => {
        if (mockRequest.onupgradeneeded) {
          mockRequest.onupgradeneeded(upgradeEvent);
        }
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      expect(mockDB.createObjectStore).not.toHaveBeenCalled();
    });

    it('DB 열기 실패 시 에러를 던진다', async () => {
      const error = new Error('DB open failed');
      mockRequest.error = error;

      setTimeout(() => {
        if (mockRequest.onerror) {
          mockRequest.onerror();
        }
      }, 0);

      await expect((indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB()).rejects.toThrow(
        error,
      );
    });

    it('DB promise를 캐시한다', async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      // 첫 번째 호출
      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      // 두 번째 호출
      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();

      // open은 한 번만 호출되어야 함
      expect(global.indexedDB.open).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      // DB 초기화
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('모든 데이터를 조회할 수 있다', async () => {
      const mockData = [
        { id: '1', title: 'Template 1' },
        { id: '2', title: 'Template 2' },
      ];

      const getAllRequest = {
        result: mockData,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = indexedDB.getAll('templates');

      setTimeout(() => {
        if (getAllRequest.onsuccess) {
          getAllRequest.onsuccess();
        }
      }, 0);

      const result = await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readonly');
      expect(mockTransaction.objectStore).toHaveBeenCalledWith('templates');
      expect(mockStore.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('빈 배열을 반환할 수 있다', async () => {
      const getAllRequest = {
        result: [],
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = indexedDB.getAll('templates');

      setTimeout(() => {
        if (getAllRequest.onsuccess) {
          getAllRequest.onsuccess();
        }
      }, 0);

      const result = await promise;

      expect(result).toEqual([]);
    });

    it('getAll 실패 시 에러를 던진다', async () => {
      const error = new Error('getAll failed');
      const getAllRequest = {
        result: null,
        error,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = indexedDB.getAll('templates');

      setTimeout(() => {
        if (getAllRequest.onerror) {
          getAllRequest.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('getById', () => {
    beforeEach(async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('ID로 데이터를 조회할 수 있다', async () => {
      const mockData = { id: '123', title: 'Template 1' };

      const getRequest = {
        result: mockData,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.get.mockReturnValue(getRequest);

      const promise = indexedDB.getById('templates', '123');

      setTimeout(() => {
        if (getRequest.onsuccess) {
          getRequest.onsuccess();
        }
      }, 0);

      const result = await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readonly');
      expect(mockStore.get).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockData);
    });

    it('존재하지 않는 ID는 undefined를 반환한다', async () => {
      const getRequest = {
        result: undefined,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.get.mockReturnValue(getRequest);

      const promise = indexedDB.getById('templates', 'nonexistent');

      setTimeout(() => {
        if (getRequest.onsuccess) {
          getRequest.onsuccess();
        }
      }, 0);

      const result = await promise;

      expect(result).toBeUndefined();
    });

    it('getById 실패 시 에러를 던진다', async () => {
      const error = new Error('getById failed');
      const getRequest = {
        result: null,
        error,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.get.mockReturnValue(getRequest);

      const promise = indexedDB.getById('templates', '123');

      setTimeout(() => {
        if (getRequest.onerror) {
          getRequest.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('add', () => {
    beforeEach(async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('데이터를 추가할 수 있다', async () => {
      const newData = { id: '123', title: 'New Template' };

      const addRequest = {
        result: null,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.add.mockReturnValue(addRequest);

      const promise = indexedDB.add('templates', newData);

      setTimeout(() => {
        if (addRequest.onsuccess) {
          addRequest.onsuccess();
        }
      }, 0);

      await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readwrite');
      expect(mockStore.add).toHaveBeenCalledWith(newData);
    });

    it('add 실패 시 에러를 던진다', async () => {
      const error = new Error('add failed');
      const addRequest = {
        result: null,
        error,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.add.mockReturnValue(addRequest);

      const promise = indexedDB.add('templates', { id: '123' });

      setTimeout(() => {
        if (addRequest.onerror) {
          addRequest.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('데이터를 업데이트할 수 있다', async () => {
      const updatedData = { id: '123', title: 'Updated Template' };

      const putRequest = {
        result: null,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.put.mockReturnValue(putRequest);

      const promise = indexedDB.update('templates', updatedData);

      setTimeout(() => {
        if (putRequest.onsuccess) {
          putRequest.onsuccess();
        }
      }, 0);

      await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readwrite');
      expect(mockStore.put).toHaveBeenCalledWith(updatedData);
    });

    it('update 실패 시 에러를 던진다', async () => {
      const error = new Error('update failed');
      const putRequest = {
        result: null,
        error,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.put.mockReturnValue(putRequest);

      const promise = indexedDB.update('templates', { id: '123' });

      setTimeout(() => {
        if (putRequest.onerror) {
          putRequest.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('데이터를 삭제할 수 있다', async () => {
      const deleteRequest = {
        result: null,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = indexedDB.delete('templates', '123');

      setTimeout(() => {
        if (deleteRequest.onsuccess) {
          deleteRequest.onsuccess();
        }
      }, 0);

      await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readwrite');
      expect(mockStore.delete).toHaveBeenCalledWith('123');
    });

    it('delete 실패 시 에러를 던진다', async () => {
      const error = new Error('delete failed');
      const deleteRequest = {
        result: null,
        error,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = indexedDB.delete('templates', '123');

      setTimeout(() => {
        if (deleteRequest.onerror) {
          deleteRequest.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('모든 데이터를 삭제할 수 있다', async () => {
      const clearRequest = {
        result: null,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.clear.mockReturnValue(clearRequest);

      const promise = indexedDB.clear('templates');

      setTimeout(() => {
        if (clearRequest.onsuccess) {
          clearRequest.onsuccess();
        }
      }, 0);

      await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readwrite');
      expect(mockStore.clear).toHaveBeenCalled();
    });

    it('clear 실패 시 에러를 던진다', async () => {
      const error = new Error('clear failed');
      const clearRequest = {
        result: null,
        error,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.clear.mockReturnValue(clearRequest);

      const promise = indexedDB.clear('templates');

      setTimeout(() => {
        if (clearRequest.onerror) {
          clearRequest.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('데이터 개수를 조회할 수 있다', async () => {
      const countRequest = {
        result: 5,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.count.mockReturnValue(countRequest);

      const promise = indexedDB.count('templates');

      setTimeout(() => {
        if (countRequest.onsuccess) {
          countRequest.onsuccess();
        }
      }, 0);

      const result = await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readonly');
      expect(mockStore.count).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('데이터가 없으면 0을 반환한다', async () => {
      const countRequest = {
        result: 0,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.count.mockReturnValue(countRequest);

      const promise = indexedDB.count('templates');

      setTimeout(() => {
        if (countRequest.onsuccess) {
          countRequest.onsuccess();
        }
      }, 0);

      const result = await promise;

      expect(result).toBe(0);
    });

    it('count 실패 시 에러를 던진다', async () => {
      const error = new Error('count failed');
      const countRequest = {
        result: null,
        error,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };

      mockStore.count.mockReturnValue(countRequest);

      const promise = indexedDB.count('templates');

      setTimeout(() => {
        if (countRequest.onerror) {
          countRequest.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('통합 시나리오', () => {
    beforeEach(async () => {
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await (indexedDB as { openDB: () => Promise<IDBDatabase> }).openDB();
    });

    it('CRUD 흐름이 정상 동작한다', async () => {
      const newItem = { id: '123', title: 'Test Item' };

      // Add
      const addRequest = {
        result: null,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      mockStore.add.mockReturnValue(addRequest);
      const addPromise = indexedDB.add('templates', newItem);
      setTimeout(() => {
        if (addRequest.onsuccess) addRequest.onsuccess();
      }, 0);
      await addPromise;

      // Get
      const getRequest = {
        result: newItem,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      mockStore.get.mockReturnValue(getRequest);
      const getPromise = indexedDB.getById('templates', '123');
      setTimeout(() => {
        if (getRequest.onsuccess) getRequest.onsuccess();
      }, 0);
      const getResult = await getPromise;

      expect(getResult).toEqual(newItem);

      // Update
      const updatedItem = { ...newItem, title: 'Updated Item' };
      const putRequest = {
        result: null,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      mockStore.put.mockReturnValue(putRequest);
      const updatePromise = indexedDB.update('templates', updatedItem);
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess();
      }, 0);
      await updatePromise;

      // Delete
      const deleteRequest = {
        result: null,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      mockStore.delete.mockReturnValue(deleteRequest);
      const deletePromise = indexedDB.delete('templates', '123');
      setTimeout(() => {
        if (deleteRequest.onsuccess) deleteRequest.onsuccess();
      }, 0);
      await deletePromise;

      expect(mockStore.add).toHaveBeenCalledWith(newItem);
      expect(mockStore.get).toHaveBeenCalledWith('123');
      expect(mockStore.put).toHaveBeenCalledWith(updatedItem);
      expect(mockStore.delete).toHaveBeenCalledWith('123');
    });

    it('여러 스토어를 동시에 사용할 수 있다', async () => {
      // Templates count
      const templatesCountRequest = {
        result: 3,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      mockStore.count.mockReturnValue(templatesCountRequest);
      const templatesPromise = indexedDB.count('templates');
      setTimeout(() => {
        if (templatesCountRequest.onsuccess) templatesCountRequest.onsuccess();
      }, 0);
      const templatesCount = await templatesPromise;

      // Archives count
      const archivesCountRequest = {
        result: 5,
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      mockStore.count.mockReturnValue(archivesCountRequest);
      const archivesPromise = indexedDB.count('archives');
      setTimeout(() => {
        if (archivesCountRequest.onsuccess) archivesCountRequest.onsuccess();
      }, 0);
      const archivesCount = await archivesPromise;

      expect(templatesCount).toBe(3);
      expect(archivesCount).toBe(5);
      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readonly');
      expect(mockDB.transaction).toHaveBeenCalledWith('archives', 'readonly');
    });
  });
});
