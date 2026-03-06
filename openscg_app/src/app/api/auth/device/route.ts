import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  const cookieStore = await cookies();
  let deviceCode = cookieStore.get('scg_device_code')?.value;

  if (!deviceCode) {
    deviceCode = uuidv4();
    cookieStore.set('scg_device_code', deviceCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  return NextResponse.json({ deviceCode });
}
