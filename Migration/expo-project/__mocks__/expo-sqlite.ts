// Mock for expo-sqlite module
export const openDatabaseAsync = jest.fn();
export const openDatabaseSync = jest.fn();
export const deleteDatabaseAsync = jest.fn();
export const deleteDatabaseSync = jest.fn();

export class SQLiteDatabase {
  execAsync = jest.fn();
  getAllAsync = jest.fn();
  getFirstAsync = jest.fn();
  runAsync = jest.fn();
  withTransactionAsync = jest.fn();
  closeAsync = jest.fn();
}

export default {
  openDatabaseAsync,
  openDatabaseSync,
  deleteDatabaseAsync,
  deleteDatabaseSync,
  SQLiteDatabase,
};
