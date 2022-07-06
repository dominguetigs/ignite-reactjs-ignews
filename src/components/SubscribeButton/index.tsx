import { signIn, useSession } from 'next-auth/react';

import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { status } = useSession();

  function handleSubscribe() {
    if (status === 'unauthenticated') {
      signIn('github');
      return;
    }

    // Create stripe checkout session
  }

  return (
    <button type="button" className={styles.subscribeButton} onClick={handleSubscribe}>
      Subscribe now
    </button>
  );
}
