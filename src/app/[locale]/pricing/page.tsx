import { SessionProvider } from '@/components/SessionProvider';
import { PricingClient } from './PricingClient';

export default function PricingPage() {
  return (
    <SessionProvider>
      <PricingClient />
    </SessionProvider>
  );
}
