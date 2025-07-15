import '@testing-library/jest-dom'

// Mock IndexedDB for testing environment
const mockIndexedDB = {
  open: () => {
    return Promise.resolve({
      result: {
        objectStoreNames: {
          contains: () => false
        },
        createObjectStore: () => ({
          createIndex: () => {}
        }),
        transaction: () => ({
          objectStore: () => ({
            add: () => Promise.resolve(),
            get: () => Promise.resolve(),
            put: () => Promise.resolve(),
            delete: () => Promise.resolve(),
            getAll: () => Promise.resolve([]),
            clear: () => Promise.resolve()
          })
        })
      }
    });
  }
};

// @ts-expect-error - IndexedDB mock for testing
global.indexedDB = mockIndexedDB;