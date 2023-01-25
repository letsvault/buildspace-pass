import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    try {
        const { userToken } = req.body;
        const resp = await fetch('https://paper.xyz/api/v1/oauth/user-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PAPER_API_SECRET_KEY}`,
            },
            body: JSON.stringify({
                userToken,
                clientId: process.env.NEXT_PUBLIC_PAPER_UNIVERSITY_ACCESS_CLIENT_ID,
            }),
        });

        if (resp.status === 200) {
            const userDetails = await resp.json();
            res.status(200).json(userDetails);
        }
    }
    catch (error){
        console.log(error);
        res.status(500).json(error);
    }
}