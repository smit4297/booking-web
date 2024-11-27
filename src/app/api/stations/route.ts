import { NextResponse } from 'next/server';
import stations from '@/lib/stations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Validate search term
    if (!search || search.trim() === '') {
      return NextResponse.json(
        { message: 'Search term is required and must be a string.' },
        { status: 400 }
      );
    }

    const searchTerm = search.trim().toLowerCase();

    // Perform case-insensitive filtering
    const results = stations.filter((station) =>
      station.toLowerCase().includes(searchTerm)
    );

    // Limit results to prevent overwhelming the client
    const limitedResults = results.slice(0, 100);

    // Return results as JSON
    return NextResponse.json({
      stations: limitedResults,
      totalCount: results.length,
    });
  } catch (error: any) {
    console.error('Error in search API:', error);

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}