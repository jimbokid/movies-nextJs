import fs from 'node:fs/promises';
import path from 'node:path';
import { TonightPickRecord } from '@/types/tonight';

type TonightStore = Record<string, TonightPickRecord>;

const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(STORE_DIR, 'tonight-picks.json');

let memoryStore: TonightStore = {};

async function ensureStoreFile() {
    await fs.mkdir(STORE_DIR, { recursive: true }).catch(() => undefined);
    try {
        await fs.access(STORE_PATH);
    } catch {
        await fs.writeFile(STORE_PATH, JSON.stringify({}, null, 2), 'utf-8').catch(() => undefined);
    }
}

async function readFromDisk(): Promise<TonightStore> {
    await ensureStoreFile();
    try {
        const content = await fs.readFile(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as TonightStore;
        }
    } catch (error) {
        console.error('Failed to read tonight store, using memory store', error);
    }
    return memoryStore;
}

async function writeToDisk(store: TonightStore) {
    memoryStore = store;
    try {
        await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to persist tonight store', error);
    }
}

export async function getTonightPick(dateKey: string): Promise<TonightPickRecord | null> {
    const store = await readFromDisk();
    return store[dateKey] ?? null;
}

export async function saveTonightPick(record: TonightPickRecord): Promise<void> {
    const store = await readFromDisk();
    store[record.dateKey] = record;
    await writeToDisk(store);
}
