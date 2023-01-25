import type { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient({
    credentials: {
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
  });
const name = 'projects/204118709939/secrets/University/versions/latest';


async function getSecretVersion() {
    const [version] = await client.accessSecretVersion({
      name: name,
    });

    const payload = version.payload?.data?.toString();

    return payload;
};

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    try {
        const { recipientWalletAddress } = req.body;
        const key = await getSecretVersion();

        if (key) {
            const sdk = ThirdwebSDK.fromPrivateKey(
                key,
                "polygon",
            );
    
            const contractAddress = process.env.CONTRACT_ADDRESS as string;
            const contract = await sdk.getContract(contractAddress, "edition-drop");

            const tokenId = 1;
            const quantity = 1;
            
            await contract.claimTo(recipientWalletAddress as string, tokenId, quantity);

            const metadata = (await contract.get(tokenId)).metadata;

            res.status(200).json(metadata);
            }
    }
    catch (error){
        console.log(error);
        res.status(500).json(error);
    }
}