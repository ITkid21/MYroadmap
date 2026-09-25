import { Storage } from './storage.js';
import { isSupabaseConfigured, supabase } from './supabaseClient.js';

const TABLE_NAME = 'studyflow_data';
let syncHandler = null;
let syncQueue = Promise.resolve();

function report(status, message) {
  syncHandler?.({ status, message });
}

async function getUser() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (sessionData.session?.user) return sessionData.session.user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}

async function upload(userId) {
  const { error } = await supabase.from(TABLE_NAME).upsert({
    user_id: userId,
    data: Storage.getAllData(),
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

async function download(userId) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

export async function initializeCloudSync(onStatusChange) {
  syncHandler = onStatusChange;

  if (!isSupabaseConfigured) {
    report('offline', 'Add Supabase environment variables to enable cloud sync.');
    return { enabled: false };
  }

  try {
    report('syncing', 'Connecting to Supabase...');
    const user = await getUser();
    const remoteData = await download(user.id);

    if (remoteData) {
      Storage.replaceAllData(remoteData);
      report('synced', 'Cloud data loaded.');
    } else {
      await upload(user.id);
      report('synced', 'Local data backed up to the cloud.');
    }

    return { enabled: true };
  } catch (error) {
    console.error('Supabase sync initialization failed:', error);
    report('error', 'Cloud sync failed. Your local data is still available.');
    return { enabled: false, error };
  }
}

export function queueCloudSync() {
  if (!isSupabaseConfigured || !supabase) return;

  syncQueue = syncQueue
    .then(async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) return;
      report('syncing', 'Saving changes to the cloud...');
      await upload(userId);
      report('synced', 'All changes are synced.');
    })
    .catch((error) => {
      console.error('Supabase sync failed:', error);
      report('error', 'Cloud sync failed. Changes remain saved locally.');
    });
}

export async function syncNow() {
  if (!isSupabaseConfigured || !supabase) {
    report('offline', 'Add Supabase environment variables to enable cloud sync.');
    return false;
  }

  queueCloudSync();
  await syncQueue;
  return true;
}
