// Mock Convex server types
export type QueryInitializer = string;
export type MutationInitializer = string;

export const query = (name: string): QueryInitializer => name;
export const mutation = (name: string): MutationInitializer => name;

export const v = {
  id: (table: string) => table as any,
  string: () => "" as any,
  number: () => 0 as any,
  boolean: () => true as any,
  optional: (validator: any) => validator,
  union: (...validators: any[]) => validators[0],
  literal: (value: string) => value,
  array: (validator: any) => [] as any,
  object: (schema: Record<string, any>) => ({} as any),
};

export const getCurrentUser = async (ctx: any) => ({ _id: "user_123" as any, email: "test@example.com" });

export class Database {
  get(id: string) { return null; }
  query(table: string) { return { collect: () => Promise.resolve([]) }; }
  insert(table: string, doc: any) { return Promise.resolve("new_id"); }
  patch(id: string, doc: any) { return Promise.resolve(); }
  delete(id: string) { return Promise.resolve(); }
}

export const ctx = { db: new Database() };