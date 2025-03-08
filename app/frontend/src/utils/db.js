// src/utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'spending-db';
const DB_VERSION = 1;
const SPENDING_STORE = 'spending';

async function initDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(SPENDING_STORE, {
          autoIncrement: true, // Automatically generate unique keys
        });
      }
    },
  });
}

async function addSpendingEntry(entry) {
  const db = await initDatabase();
  const tx = db.transaction(SPENDING_STORE, 'readwrite');
  const store = tx.objectStore(SPENDING_STORE);
  await store.add(entry); // Add the entry
  await tx.done;
  console.log('Spending entry added:', entry);
}

async function getAllSpendingEntries() {
    const db = await initDatabase();
    return db.getAll(SPENDING_STORE);
}

async function getSpendingByMonth(month, year) {
    const db = await initDatabase();
    const tx = db.transaction(SPENDING_STORE, 'readonly');
    const store = tx.objectStore(SPENDING_STORE);
    // Assuming your spending entries have a 'date' property in YYYY-MM-DD format
    const spendingEntries = await store.getAll();

    const filteredEntries = spendingEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp); // Assuming you store date as a string
        const entryMonth = entryDate.getMonth() + 1; // Month is 0-indexed
        const entryYear = entryDate.getFullYear();
        return entryMonth === month && entryYear === year;
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

export { addSpendingEntry, getAllSpendingEntries, getSpendingByMonth, clearDatabase };
