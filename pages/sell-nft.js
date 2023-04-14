import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import {Form, useNotification, Button} from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import nftAbi from "../constants/BasicNft"
import nftMarketplaceAbi from "../constants/MarketPlace"
import networkMapping from "../constants/networkMapping"
import { useEffect, useState } from "react"


export default function Home() {
  const {chainId, account, isWeb3Enabled } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString : "31337"
  const marketplaceAddress = networkMapping[chainString].MarketPlace[0]
  const disparch = useNotification()
  const [proceeds, setProceeds] = useState("0")

  const { runContractFunction } = useWeb3Contract()

  async function approveAndList(data) {
    console.log("Approving...")
    const nftAddress = data.data[0].inputResult
    const tokenId = data.data[1].inputResult
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

    const approveOptions = {
      abi: nftAbi,
      contractAddress: "nftAddress",
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    }

    await runContractFunction({
      params:approveOptions,
      onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error)

      }
    })
  }

    async function handleApproveSuccess(tx, nftAddress, tokenId, price){
      console.log("Time to list!")
      await tx.wait()
      const listOptions = 
  + {
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "listItem",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      price: price,
    },

  }  
  await runContractFunction({
    params: listOptions,
    onSuccess: () => handelListSuccess(),
    onError: (error) => console.log(error),
  })
}

    async function handelListSuccess(){
      dispatch({
        type: "success",
        message: "NFT listing",
        title: "NFT listed",
        position: "topR",
      })
    }

    const handleWithdrawSuccess = () => {
      dispatch({
        type: "success",
        message: "Withdrawing proceeds",
        position: "topR",
      })
    }

    async function setupUi(){
      const returnedProceeds = await runContractFunction({
        params: {
          abi: nftMarketplaceAbi,
          contractAddress: marketplaceAddress,
          functionName: "getProceeds",
          params: {
            seller: account,
          },
        },
        onError: (error) => console.log(error),
      })
      if (returnedProceeds){
        setProceeds(returnedProceeds.toString())
      }
    }

    useEffect(() => {
      setupUi()
    }, [proceeds, account, isWeb3Enabled, chainId])
  
  
    return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          {
            name: "Nft Address",
            type: "text",
            inputWidth: "50%",
            value:"",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price",
        },
        ]}
        title="sell your Nft!!"
        id="Main Form"
      
      />

    <div>Withdraw {proceeds} proceeds</div>
    {proceeds != "0" ? (
      <Button
      onClick={() => {
        runContractFunction({
          params: {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "withdrawProceeds",
            params: {},
        },
        onError: (error) => console.log(error),
        onSuccess: () => handleWithdrawSuccess,
      } )
    }}
    text="Withdraw"
    type="button"
      />
    ):(
      <div>No proceeds</div>
    )}
    </div>
        
     )

  }