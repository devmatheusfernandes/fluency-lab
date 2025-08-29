// app/api/admin/users/[userId]/financials/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserService } from '@/services/userService';

const userService = new UserService();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'manager'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const paymentHistory = await userService.getUserFinancialHistory(params.userId);
    return NextResponse.json(paymentHistory);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
