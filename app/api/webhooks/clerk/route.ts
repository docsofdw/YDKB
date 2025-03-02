import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Create a Supabase client with proper headers
function createClient() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ 
    cookies: () => cookieStore,
    options: {
      global: {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      },
    },
  });
  return supabase;
}

export async function POST(req: Request) {
  // Set CORS headers
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: responseHeaders });
  }
  
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
      headers: responseHeaders
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', {
      status: 400,
      headers: responseHeaders
    });
  }

  // Get the event type
  const eventType = evt.type;

  // Initialize Supabase client
  const supabase = createClient();

  // Handle the different event types
  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, created_at } = evt.data;
        const email = email_addresses && email_addresses[0]?.email_address;

        // Insert the new user into your Supabase users table
        const { data, error } = await supabase
          .from('users')
          .insert([
            { 
              clerk_id: id, 
              email: email 
            }
          ])
          .select();

        if (error) {
          console.error('Error inserting user into Supabase:', error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: responseHeaders });
        }

        // Initialize user stats
        const userId = data[0].id;
        await supabase
          .from('user_stats')
          .insert([{ user_id: userId }]);

        return NextResponse.json({ success: true, message: 'User created in Supabase' }, { headers: responseHeaders });
      }

      case 'user.updated': {
        const { id, email_addresses } = evt.data;
        const email = email_addresses && email_addresses[0]?.email_address;

        // Update the user in your Supabase users table
        const { error } = await supabase
          .from('users')
          .update({ 
            email: email,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_id', id);

        if (error) {
          console.error('Error updating user in Supabase:', error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: responseHeaders });
        }

        return NextResponse.json({ success: true, message: 'User updated in Supabase' }, { headers: responseHeaders });
      }

      case 'user.deleted': {
        const { id } = evt.data;

        // Get the Supabase user ID
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', id)
          .single();

        if (fetchError) {
          console.error('Error fetching user from Supabase:', fetchError);
          return NextResponse.json({ success: false, error: fetchError.message }, { status: 500, headers: responseHeaders });
        }

        // Delete user stats first (foreign key constraint)
        if (userData) {
          await supabase
            .from('user_stats')
            .delete()
            .eq('user_id', userData.id);
        }

        // Delete the user
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('clerk_id', id);

        if (deleteError) {
          console.error('Error deleting user from Supabase:', deleteError);
          return NextResponse.json({ success: false, error: deleteError.message }, { status: 500, headers: responseHeaders });
        }

        return NextResponse.json({ success: true, message: 'User deleted from Supabase' }, { headers: responseHeaders });
      }

      default:
        return NextResponse.json({ success: true, message: 'Webhook received' }, { headers: responseHeaders });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: responseHeaders }
    );
  }
} 