// Prisma Client wrapper
// Note: Run `npm run db:generate` after setting up your database

let prisma: PrismaClientType | null = null;

// Type for PrismaClient - will be available after running prisma generate
type PrismaClientType = {
  chatSession: {
    findMany: (args?: object) => Promise<object[]>;
    findUnique: (args: object) => Promise<object | null>;
    create: (args: object) => Promise<object>;
    update: (args: object) => Promise<object>;
    delete: (args: object) => Promise<object>;
  };
  message: {
    create: (args: object) => Promise<object>;
  };
  document: {
    findMany: (args?: object) => Promise<object[]>;
    findUnique: (args: object) => Promise<object | null>;
    create: (args: object) => Promise<object>;
    update: (args: object) => Promise<object>;
    updateMany: (args: object) => Promise<object>;
    delete: (args: object) => Promise<object>;
  };
  libraryItem: {
    findMany: (args?: object) => Promise<object[]>;
    findUnique: (args: object) => Promise<object | null>;
    create: (args: object) => Promise<object>;
    update: (args: object) => Promise<object>;
    updateMany: (args: object) => Promise<object>;
    delete: (args: object) => Promise<object>;
  };
  $disconnect: () => Promise<void>;
};

// Initialize Prisma Client lazily
const getPrismaClient = async (): Promise<PrismaClientType> => {
  if (prisma) return prisma;

  try {
    // Dynamic import to handle case where prisma generate hasn't been run
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaModule = await import('@prisma/client') as any;
    const PrismaClient = prismaModule.PrismaClient || prismaModule.default?.PrismaClient;
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
    return new Proxy(
      {},
      {
        get(_, method) {
          return async (...args: unknown[]) => {
            const client = await getPrismaClient();
            const model = client[prop];
            if (typeof model === 'object' && model !== null && method in model) {
              return (model as Record<string, (...args: unknown[]) => Promise<unknown>>)[method as string](...args);
            }
            throw new Error(`Method ${String(method)} not found on ${String(prop)}`);
          };
        },
      }
    );
  },
});

export default prismaProxy;
