/**
 * Member notes are stored as a JSON array in members.notes (no separate table).
 * Shape: [{ id, text, created_at, updated_at }]
 */

export type MemberNote = {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
};

export function parseMemberNotes(raw: string | null): MemberNote[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      // Legacy plain-text note
      return [
        {
          id: crypto.randomUUID(),
          text: raw,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }
    return parsed.filter(
      (n): n is MemberNote =>
        typeof n === "object" &&
        n !== null &&
        typeof (n as MemberNote).id === "string" &&
        typeof (n as MemberNote).text === "string",
    );
  } catch {
    return [
      {
        id: crypto.randomUUID(),
        text: raw,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export function serializeMemberNotes(notes: MemberNote[]): string {
  return JSON.stringify(notes);
}

export function addNote(notes: MemberNote[], text: string): MemberNote[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      text: text.trim(),
      created_at: now,
      updated_at: now,
    },
    ...notes,
  ];
}

export function updateNote(
  notes: MemberNote[],
  id: string,
  text: string,
): MemberNote[] {
  const now = new Date().toISOString();
  return notes.map((n) =>
    n.id === id ? { ...n, text: text.trim(), updated_at: now } : n,
  );
}

export function deleteNote(notes: MemberNote[], id: string): MemberNote[] {
  return notes.filter((n) => n.id !== id);
}
