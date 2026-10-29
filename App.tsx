import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import Login from './Login';
import Editor from './Editor';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [notAdmin, setNotAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  async function verify(s: Session | null) {
    setSession(s);
    setNotAdmin(false);
    setIsAdmin(false);
    if (!s?.user?.email) return setChecked(true);
    // RLS only returns this row to admins, so an empty result means no access.
    const { data } = await supabase.from('admin_users').select('email').eq('email', s.user.email).maybeSingle();
    if (data) setIsAdmin(true);
    else {
      setNotAdmin(true);
      await supabase.auth.signOut();
      setSession(null);
    }
    setChecked(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => verify(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => verify(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!checked) return <div className="center muted">Loading…</div>;
  if (!session || !isAdmin) return <Login notAdmin={notAdmin} />;
  return <Editor email={session.user.email ?? ''} />;
}
