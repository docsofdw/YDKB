import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Create a Supabase client with proper headers
function createClient() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
      global: {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      },
    }
  );
  return supabase;
}

// Fallback data in case the database query fails
const fallbackCollegeData = [
  { id: 1, name: 'Harvard University' },
  { id: 2, name: 'Stanford University' },
  { id: 3, name: 'Massachusetts Institute of Technology' },
  { id: 4, name: 'Yale University' },
  { id: 5, name: 'Princeton University' },
  { id: 6, name: 'University of California, Berkeley' },
  { id: 7, name: 'University of Michigan' },
  { id: 8, name: 'Duke University' },
  { id: 9, name: 'Columbia University' },
  { id: 10, name: 'University of Pennsylvania' },
  // Add more colleges as needed
];

export async function GET(request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  
  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  
  if (!search || search.length < 3) {
    return NextResponse.json([], { headers });
  }
  
  try {
    // Create a Supabase client
    const supabase = createClient();
    
    // Query the colleges table
    const { data, error } = await supabase
      .from('colleges')
      .select('id, name')
      .ilike('name', `%${search}%`)
      .order('name')
      .limit(10);
    
    if (error) {
      console.error('Error fetching colleges from database:', error);
      // Fall back to the hardcoded data if there's an error
      const filteredFallbackData = fallbackCollegeData.filter(college => 
        college.name.toLowerCase().includes(search.toLowerCase())
      );
      return NextResponse.json(filteredFallbackData.slice(0, 10), { headers });
    }
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Error in colleges API route:', error);
    
    // Fall back to the hardcoded data if there's an error
    const filteredFallbackData = fallbackCollegeData.filter(college => 
      college.name.toLowerCase().includes(search.toLowerCase())
    );
    
    return NextResponse.json(filteredFallbackData.slice(0, 10), { headers });
  }
}