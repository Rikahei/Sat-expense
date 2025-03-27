// src/utils/db.js
import { openDB } from 'idb';
import { DateTime } from 'luxon';

const DB_NAME = 'spending-db';
const DB_VERSION = 2;
const SPENDING_STORE = 'spending';

async function initDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(SPENDING_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('spending_category', 'spending_category', { unique: false });
      }
    },
  });
}

async function addSpendingEntry(entry) {
  const db = await initDatabase();
  const tx = db.transaction(SPENDING_STORE, 'readwrite');
  const store = tx.objectStore(SPENDING_STORE);

  await store.add(entry);
  await tx.done;
  console.log('Spending entry added:', entry);
}

async function getAllSpendingEntries() {
    const db = await initDatabase();
    return db.getAll(SPENDING_STORE);
}

async function getSpendingByMonth(year, month) {
  // get data from year & month by indexed timestamp.
  const db = await initDatabase();
  const tx = db.transaction(SPENDING_STORE, 'readonly');
  const store = tx.objectStore(SPENDING_STORE);
  const index = store.index('timestamp');
  const start = DateTime.fromObject({ year, month, day: 1 }).toMillis();
  const end = DateTime.fromObject({ year, month, day: 1 }).plus({ months: 1 }).toMillis();

  const range = IDBKeyRange.bound(start, end, false, true);
  return index.getAll(range);
}

async function clearDatabase() {
  const db = await initDatabase();
  const tx = db.transaction(SPENDING_STORE, 'readwrite');
  const store = tx.objectStore(SPENDING_STORE);
  await store.clear();
  await tx.done;
}

async function getSpendingEntryById(id) {
    const db = await initDatabase();
    return db.get(SPENDING_STORE, id);
}

async function deleteSpendingEntry(id) {
    const db = await initDatabase();
    const tx = db.transaction(SPENDING_STORE, 'readwrite');
    const store = tx.objectStore(SPENDING_STORE);
    await store.delete(id);
    await tx.done;
}

export { addSpendingEntry, getAllSpendingEntries, getSpendingByMonth, clearDatabase, getSpendingEntryById, deleteSpendingEntry };
