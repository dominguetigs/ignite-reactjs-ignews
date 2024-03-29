import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';

import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { status, data } = useSession();
  const router = useRouter();

  const d = data as any;

  async function handleSubscribe() {
    if (status === 'unauthenticated') {
      signIn('github');
      return;
    }

    if (d?.activeSubscription) {
      router.push('/posts');
      return;
    }

    // Create stripe checkout session
    try {
      const response = await api.post('/stripe/subscribe');

      const { sessionId } = response.data;

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <button type="button" className={styles.subscribeButton} onClick={handleSubscribe}>
      Subscribe now
    </button>
  );
}
