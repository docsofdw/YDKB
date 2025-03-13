import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminApiKey = process.env.ADMIN_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${adminApiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get migration name from request body
    const { migrationName } = await request.json();
    
    if (!migrationName) {
      return NextResponse.json({ error: 'Migration name is required' }, { status: 400 });
    }

    // Construct path to migration file
    const migrationPath = path.join(process.cwd(), 'app', 'lib', `${migrationName}.sql`);
    
    // Check if migration file exists
    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json({ error: `Migration file not found: ${migrationName}.sql` }, { status: 404 });
    }

    // Read migration SQL
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Execute migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: migrationSql });

    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json({ error: `Migration failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Migration ${migrationName} executed successfully` });
  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 