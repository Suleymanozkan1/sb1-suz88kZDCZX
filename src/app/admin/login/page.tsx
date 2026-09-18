import { redirect } from 'next/navigation';

/** Giriş tek noktaya taşındı; eski adres korunuyor. */
export default function AdminLoginRedirect() {
  redirect('/giris?next=/admin');
}
