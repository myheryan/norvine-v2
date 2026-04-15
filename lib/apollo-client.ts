import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

let PROD_URI = 'https://api.norvine.co.id/graphql'

const client = new ApolloClient({
  link: new HttpLink({
    uri: PROD_URI, 
  }),
  cache: new InMemoryCache(),
});

export default client