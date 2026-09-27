import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      handle: string;
      role: string;
      banned: boolean;
      image?: string | null;
    };
  }
}
