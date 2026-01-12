// Prisma Client wrapper with proper type safety
// Note: Run `npm run db:generate` after setting up your database

let prisma: PrismaClientType | null = null;

// Enum types matching Prisma schema
export type MessageRole = 'user' | 'assistant';
export type LibraryItemType = 'document' | 'uploaded_html';

// Model types based on Prisma schema
export interface ChatSessionModel {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: MessageModel[];
  document?: DocumentModel | null;
}

export interface MessageModel {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sessionId: string;
}

export interface DocumentModel {
  id: string;
  title: string;
  marpContent: string;
  htmlContent: string;
  presetId: string | null;
  templateIds: string[];
  createdAt: Date;
  updatedAt: Date;
  chatSessionId: string | null;
}

export interface LibraryItemModel {
  id: string;
  title: string;
  type: LibraryItemType;
  htmlContent: string;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
  documentId: string | null;
}

export interface PresetModel {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  templateIds: string[];
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Query argument types
interface FindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  take?: number;
  skip?: number;
}

interface FindUniqueArgs {
  where: Record<string, unknown>;
  include?: Record<string, boolean | Record<string, unknown>>;
}

interface CreateArgs<T> {
  data: Partial<T> & Record<string, unknown>;
  include?: Record<string, boolean | Record<string, unknown>>;
}

interface UpdateArgs<T> {
  where: Record<string, unknown>;
  data: Partial<T>;
  include?: Record<string, boolean | Record<string, unknown>>;
}

interface DeleteArgs {
  where: Record<string, unknown>;
}

interface UpdateManyArgs<T> {
  where: Record<string, unknown>;
  data: Partial<T>;
}

// Model delegate type with proper generics
interface ModelDelegate<T> {
  findMany: (args?: FindManyArgs) => Promise<T[]>;
  findUnique: (args: FindUniqueArgs) => Promise<T | null>;
  create: (args: CreateArgs<T>) => Promise<T>;
  update: (args: UpdateArgs<T>) => Promise<T>;
  delete: (args: DeleteArgs) => Promise<T>;
  updateMany: (args: UpdateManyArgs<T>) => Promise<{ count: number }>;
  deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
  count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
}

// Type for PrismaClient
type PrismaClientType = {
  chatSession: ModelDelegate<ChatSessionModel>;
  message: ModelDelegate<MessageModel>;
  document: ModelDelegate<DocumentModel>;
  libraryItem: ModelDelegate<LibraryItemModel>;
  preset: ModelDelegate<PresetModel>;
  $disconnect: () => Promise<void>;
  $connect: () => Promise<void>;
};

// Initialize Prisma Client lazily
const getPrismaClient = async (): Promise<PrismaClientType> => {
  if (prisma) return prisma;

  try {
    // Dynamic import to handle case where prisma generate hasn't been run
    const prismaModule = await import('@prisma/client');
    const PrismaClient = (prismaModule as { PrismaClient?: new (options?: object) => unknown }).PrismaClient
      || (prismaModule as { default?: { PrismaClient?: new (options?: object) => unknown } }).default?.PrismaClient;

    if (!PrismaClient) {
      throw new Error('PrismaClient not found in @prisma/client');
    }

    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }) as unknown as PrismaClientType;

    return prisma;
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    throw new Error('Database not available. Please run: npm run db:generate && npm run db:push');
  }
};

// Export a proxy that lazily initializes Prisma
const prismaProxy = new Proxy({} as PrismaClientType, {
  get(_, prop: keyof PrismaClientType) {
    // Handle special methods
    if (prop === '$disconnect' || prop === '$connect') {
      return async () => {
        const client = await getPrismaClient();
        return (client[prop] as () => Promise<void>)();
      };
    }

    // Handle model delegates
    return new Proxy(
      {} as ModelDelegate<unknown>,
      {
        get(_, method: string) {
          return async (...args: unknown[]) => {
            const client = await getPrismaClient();
            const model = client[prop] as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>;
            if (typeof model === 'object' && model !== null && method in model) {
              return model[method](...args);
            }
            throw new Error(`Method ${method} not found on ${String(prop)}`);
          };
        },
      }
    );
  },
});

export default prismaProxy;
