// Supabase Edge Function: send-push-notification
// Triggered via Supabase Database Webhooks on:
//   - messages INSERT  → notify the recipient
//   - matches INSERT   → notify both users
//   - call_sessions INSERT → notify the callee

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

async function sendExpoPush(tokens: string[], title: string, body: string, data: object) {
  const messages = tokens
    .filter(t => t && t.startsWith('ExponentPushToken'))
    .map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }));

  if (messages.length === 0) return;

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
}

async function getPushToken(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', userId)
    .maybeSingle();
  return data?.push_token || null;
}

async function getFirstName(userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', userId)
    .maybeSingle();
  return data?.first_name || 'Someone';
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { type, table, record } = payload;

    if (table === 'messages' && type === 'INSERT') {
      // Notify the OTHER user in the match
      const { data: match } = await supabase
        .from('matches')
        .select('user_a_id, user_b_id')
        .eq('id', record.match_id)
        .maybeSingle();

      if (!match) return new Response('ok');

      const recipientId = match.user_a_id === record.from_user_id
        ? match.user_b_id
        : match.user_a_id;

      const [token, senderName] = await Promise.all([
        getPushToken(recipientId),
        getFirstName(record.from_user_id),
      ]);

      if (token) {
        await sendExpoPush(
          [token],
          `New message from ${senderName}`,
          record.content?.substring(0, 100) || '📷 Sent a photo',
          { type: 'message', matchId: record.match_id, matchName: senderName }
        );
      }
    }

    else if (table === 'matches' && type === 'INSERT') {
      // Notify both users of the new match
      const [tokenA, tokenB, nameA, nameB] = await Promise.all([
        getPushToken(record.user_a_id),
        getPushToken(record.user_b_id),
        getFirstName(record.user_a_id),
        getFirstName(record.user_b_id),
      ]);

      const notifs: Promise<void>[] = [];
      if (tokenA) {
        notifs.push(sendExpoPush(
          [tokenA],
          "It's a Match! 💕",
          `You and ${nameB} matched! Say hello!`,
          { type: 'match', matchId: record.id, matchName: nameB }
        ));
      }
      if (tokenB) {
        notifs.push(sendExpoPush(
          [tokenB],
          "It's a Match! 💕",
          `You and ${nameA} matched! Say hello!`,
          { type: 'match', matchId: record.id, matchName: nameA }
        ));
      }
      await Promise.all(notifs);
    }

    else if (table === 'call_sessions' && type === 'INSERT' && record.status === 'ringing') {
      // Notify the callee
      const { data: match } = await supabase
        .from('matches')
        .select('user_a_id, user_b_id')
        .eq('id', record.match_id)
        .maybeSingle();

      if (!match) return new Response('ok');

      const calleeId = match.user_a_id === record.from_user_id
        ? match.user_b_id
        : match.user_a_id;

      const [token, callerName] = await Promise.all([
        getPushToken(calleeId),
        getFirstName(record.from_user_id),
      ]);

      if (token) {
        await sendExpoPush(
          [token],
          `Incoming ${record.kind === 'video' ? 'Video' : 'Voice'} Call 📞`,
          `${callerName} is calling you!`,
          { type: 'call', matchId: record.match_id, matchName: callerName, sessionId: record.id }
        );
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('send-push-notification error:', err);
    return new Response('error', { status: 500 });
  }
});
