import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    try {
            const { userToken } = req.body;
            const tokenId = 1;
            const response = await fetch('https://paper.xyz/api/v1/nft/token-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.PAPER_API_SECRET_KEY}`,
                },
                body: JSON.stringify({
                    userToken,
                    clientId: process.env.NEXT_PUBLIC_PAPER_UNIVERSITY_ACCESS_CLIENT_ID,
                    tokenType: 'erc1155',
                    chainName: 'Polygon',
                    contractAddress: process.env.CONTRACT_ADDRESS,
                    tokenIds: [tokenId],
                }),
            })

            if (response.status === 200) {
                const nftsHeld = await response.json();
                res.status(200).json(nftsHeld[0]);
            }
        }
    
    catch (error){
        console.log(error);
        res.status(500).json(error);
    }
}