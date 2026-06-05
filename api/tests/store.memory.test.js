import { describe, expect, test } from 'vitest';
import { createMemoryStore } from '../src/store.memory.js';

describe('memory store', () => {
  test('creates notes and lists newest first', async () => {
    const store = createMemoryStore();

    await store.createNote({ id: 'n1', authorId: 'ed_1', authorName: 'A', text: 'first', color: 'pink', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    await store.createNote({ id: 'n2', authorId: 'ed_1', authorName: 'A', text: 'second', color: 'blue', createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' });

    const notes = await store.listNotes();

    expect(notes.map((note) => note.id)).toEqual(['n2', 'n1']);
  });

  test('revokes an editor', async () => {
    const store = createMemoryStore();
    await store.createEditor({ id: 'ed_1', displayName: '珊珊', status: 'active', createdAt: '2026-01-01T00:00:00.000Z' });

    await store.revokeEditor('ed_1', '2026-01-02T00:00:00.000Z');
    const editor = await store.getEditor('ed_1');

    expect(editor.status).toBe('revoked');
    expect(editor.revokedAt).toBe('2026-01-02T00:00:00.000Z');
  });
});
