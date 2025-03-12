// src/utils/db.js
import { openDB } from 'idb';
import { DateTime } from 'luxon';

const DB_NAME = 'spending-db';
const DB_VERSION = 1;
const SPENDING_STORE = 'spending';

async function initDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(SPENDING_STORE, {
          keyPath: 'id', // Use 'id' as the key path
          // autoIncrement: true, // Remove autoIncrement as we'll manage IDs ourselves
        });
      }
    },
  });
}

async function addSpendingEntry(entry) {
  const db = await initDatabase();
  const tx = db.transaction(SPENDING_STORE, 'readwrite');
  const store = tx.objectStore(SPENDING_STORE);

  // Ensure the entry has an 'id' property
  if (!entry.id) {
    throw new Error("Spending entry must have an 'id' property.");
  }

  await store.add(entry);
  await tx.done;
  console.log('Spending entry added:', entry);
}

async function getAllSpendingEntries() {
    const db = await initDatabase();
    return db.getAll(SPENDING_STORE);
}

async function getSpendingByMonth(startOfMonthISO, endOfMonthISO) {
    const db = await initDatabase();
    const tx = db.transaction(SPENDING_STORE, 'readonly');
    const store = tx.objectStore(SPENDING_STORE);
    const spendingEntries = await store.getAll(); // Still inefficient for large datasets

    const startOfMonth = DateTime.fromISO(startOfMonthISO);
    const endOfMonth = DateTime.fromISO(endOfMonthISO);

    const filteredEntries = spendingEntries.filter(entry => {
        const entryDateTime = DateTime.fromISO(entry.timestamp);
        return entryDateTime >= startOfMonth && entryDateTime <= endOfMonth;
    });

    await tx.done;
    return filteredEntries;
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
