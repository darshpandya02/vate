export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  adminId: string;
  matchThreshold: number;
  admin?: { id: string; name: string | null; avatarUrl: string | null };
  members?: Array<{ user: { id: string; name: string | null; avatarUrl: string | null } }>;
  _count?: { members: number; matches: number };
}
