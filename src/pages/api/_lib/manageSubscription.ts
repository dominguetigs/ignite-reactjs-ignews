import { Collection, Create, Get, Index, Match, Select } from 'faunadb';

import { fauna } from '../../../services/fauna';
import { stripe } from '../../../services/stripe';

export async function saveSubscription(subscriptionId: string, custormerId: string) {
  const userRef = await fauna.query(
    Select('ref', Get(Match(Index('user_by_stripe_customer_id', custormerId))))
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    user_id: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  await fauna.query(Create(Collection('subscriptions', { data: subscriptionData })));
}
