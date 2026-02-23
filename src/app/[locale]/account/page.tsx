import { SessionProvider } from '@/components/SessionProvider';
import { AccountClient } from './AccountClient';

export const metadata = {
  title: 'Account — FacelessHub',
};

export default function AccountPage() {
  return (
    <SessionProvider>
      <AccountClient />
    </SessionProvider>
  );
}
