import * as prismic from '@prismicio/client';

export function getPrismicClient() {
  const client = prismic.createClient(prismic.getRepositoryEndpoint('ignews-7'), {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return client;
}
