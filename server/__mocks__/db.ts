// Manual Jest mock for database module
// This provides chainable jest.fn() methods for query builder pattern

export const mockDbInstance = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  returning: jest.fn().mockResolvedValue([]),
  execute: jest.fn().mockResolvedValue([]),
  limit: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  
  // Helper to reset all mocks between tests
  __resetMocks() {
    Object.keys(this).forEach(k => {
      const fn = (this as any)[k];
      if (typeof fn?.mockReset === 'function') {
        fn.mockReset();
        // Re-chain for query builder methods
        if (['select', 'from', 'where', 'insert', 'values', 'update', 'set', 'delete', 'limit', 'orderBy'].includes(k)) {
          fn.mockReturnThis();
        }
      }
    });
  }
};

export const db = Promise.resolve(mockDbInstance);

export const initDb = jest.fn().mockResolvedValue(mockDbInstance);

export default { db, initDb };
