import { useState } from "react";
import { useEffect } from "react";
import { ethers } from "ethers";
import diamondAbi from "./abis/diamondABI.json";
import { Tuple } from "./types";
import { Collaterals, collateralToAddress } from "./vars";
import "./App.css";

const convertInlineSVGToBlobURL = (svg: string) => {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  return URL.createObjectURL(blob);
};

const diamondAddress = "0x86935F11C86623deC8a25696E1C19a8659CbF95d";

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [usersAddress, setUsersAddress] = useState<string>();
  const [diamondContract, setDiamondContract] = useState<ethers.Contract>();
  const [usersAavegotchis, setUsersAavegotchis] = useState<Array<any>>();
  const [selectedGotchiSideviews, setSelectedGotchiSideviews] =
    useState<Tuple<string, 4>>();
  const [previewGotchiSideviews, setPreviewGotchiSideviews] =
    useState<Tuple<string, 4>>();

  // 1) Get Users address + Contract
  const connectToNetwork = async (eth: any) => {
    try {
      await eth.enable();
      // Construct contract from users provider, the diamond contracts address and ABI
      const provider = new ethers.providers.Web3Provider(eth);
      const contract = new ethers.Contract(
        diamondAddress,
        diamondAbi,
        provider
      );
      setDiamondContract(contract);
      // Get users address
      const address = await provider.getSigner().getAddress();
      setUsersAddress(address);
    } catch (error) {
      console.log(error);
    }
  };

  // 2) Get metadetails of user's Aavegotchis
  const getAllAavegotchisOfOwner = async (
    address: string,
    contract: ethers.Contract
  ) => {
    try {
      // Returns an array of the metadetails of every Aavegotchi owned by the user
      const res = await contract.allAavegotchisOfOwner(address);
      setUsersAavegotchis(res);
    } catch (error) {
      console.log(error);
    }
  };

  // 3) Given tokenId, return Aavegotchi sideviews
  const getAavegotchiSideview = async (
    tokenId: string,
    contract: ethers.Contract
  ) => {
    try {
      // Returns an array of SVGs corresponding to each side of the Aavegotchi
      const res = await contract.getAavegotchiSideSvgs(tokenId);
      setSelectedGotchiSideviews(res);
    } catch (error) {
      console.log(error);
    }
  };

  // 3b) Fetch preview aavegotchi sideviews
  const getPreviewAavegotchiSideview = async (
    contract: ethers.Contract,
    options: {
      haunt?: "1" | "2";
      numericTraits?: Tuple<number, 6>;
      wearables?: Tuple<number, 16>;
      collateral?: Collaterals;
    }
  ) => {
    try {
      const withSetsNumericTraits: Tuple<number, 6> =
        options?.numericTraits || [50, 50, 50, 50, 50, 50];
      const equippedWearables: Tuple<number, 16> = options?.wearables || [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ];
      // Returns an array of the metadetails of every Aavegotchi owned by the user
      const res = await contract.previewSideAavegotchi(
        options?.haunt || "1",
        options?.collateral
          ? collateralToAddress[options.collateral]
          : collateralToAddress["aWETH"],
        withSetsNumericTraits,
        equippedWearables
      );
      setPreviewGotchiSideviews(res);
    } catch (error) {
      console.log(error);
    }
  };

  // On init
  useEffect(() => {
    connectToNetwork(window.ethereum);
  }, []);

  // Once contract is constructed and address is fetched
  useEffect(() => {
    if (usersAddress && diamondContract) {
      getAllAavegotchisOfOwner(usersAddress, diamondContract);
    }
  }, [usersAddress, diamondContract]);

  // Once Aavegotchis have fetched, get the first Aavegotchis sideviews + Preview gotchi sidviews
  useEffect(() => {
    if (diamondContract) {
      if (usersAavegotchis && usersAavegotchis.length > 0) {
        getAavegotchiSideview(
          usersAavegotchis[0].tokenId.toString(),
          diamondContract
        );
      }
      getPreviewAavegotchiSideview(diamondContract, {
        collateral: "aAAVE",
        wearables: [0, 55, 57, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        numericTraits: [50, 50, 50, 50, 40, 40],
      });
    }
  }, [usersAavegotchis, diamondContract]);

  return (
    <div className="App">
      <p>User: {usersAddress}</p>
      {usersAavegotchis && (
        <h2>
          Selected Aavegotchi:{" "}
          {usersAavegotchis.length > 0
            ? usersAavegotchis[0].name
            : "No gotchis"}{" "}
        </h2>
      )}
      {selectedGotchiSideviews && (
        <div>
          <img
            src={convertInlineSVGToBlobURL(selectedGotchiSideviews[0])}
            alt="Front"
            width="25%"
          />
          <img
            src={convertInlineSVGToBlobURL(selectedGotchiSideviews[1])}
            alt="Left"
            width="25%"
          />
          <img
            src={convertInlineSVGToBlobURL(selectedGotchiSideviews[2])}
            alt="Right"
            width="25%"
          />
          <img
            src={convertInlineSVGToBlobURL(selectedGotchiSideviews[3])}
            alt="Back"
            width="25%"
          />
        </div>
      )}
      {previewGotchiSideviews && (
        <div>
          <h2>Preview Aavegotchi</h2>
          <img
            src={convertInlineSVGToBlobURL(previewGotchiSideviews[0])}
            alt="Front"
            width="25%"
          />
          <img
            src={convertInlineSVGToBlobURL(previewGotchiSideviews[1])}
            alt="Left"
            width="25%"
          />
          <img
            src={convertInlineSVGToBlobURL(previewGotchiSideviews[2])}
            alt="Right"
            width="25%"
          />
          <img
            src={convertInlineSVGToBlobURL(previewGotchiSideviews[3])}
            alt="Back"
            width="25%"
          />
        </div>
      )}
    </div>
  );
}

export default App;
