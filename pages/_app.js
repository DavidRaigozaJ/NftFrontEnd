import '../styles/globals.css'
import {MoralisProvider} from "react-moralis"
import Header from "../components/Header"
import { NotificationProvider } from "web3uikit"  
import Head from "next/head"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
  cache: new InMemoryCache(), 
  uri:"https://api.studio.thegraph.com/query/45275/pepematilda/v0.0.1",

})

export default function App({ Component, pageProps }) {
  
  
  return( 
    <div>
    <Head>
    <title>PepeMatilda Marketplace</title>

            <meta name="description" content="Marketplace" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
</Head>

    <MoralisProvider initializeOnMount={false}>
      <ApolloProvider client={client}>
      <NotificationProvider>
      <Header />
  <Component {...pageProps} />
        </NotificationProvider>
      </ApolloProvider>
   </MoralisProvider>
   </div>


  )
}
