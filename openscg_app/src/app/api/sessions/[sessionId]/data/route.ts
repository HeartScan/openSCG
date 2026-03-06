import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * GET /api/sessions/[sessionId]/data
 * Retrieves session data from Redis
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    
    try {
        const data = await redis.get(`session:${sessionId}:data`);
        
        if (!data) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return new NextResponse(data, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Redis GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/sessions/[sessionId]/data
 * Persists full session data to Redis with TTL
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const body = await request.json();

        // Validate basic structure
        if (!body.samples || !Array.isArray(body.samples)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Store as string in Redis with 30-day TTL (2592000 seconds)
        await redis.set(`session:${sessionId}:data`, JSON.stringify(body), 'EX', 2592000);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Redis POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
