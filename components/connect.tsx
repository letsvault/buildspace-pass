import { NFTMetadata } from "@thirdweb-dev/sdk";
import { ThirdwebNftMedia } from "@thirdweb-dev/react";
import  Image  from "next/image";


import styles from "../styles/Connect.module.css";

interface connectProps {
    mintedNft: NFTMetadata | null
}

interface applicationProps {
    size: string,
    tagline: string,
    builtWith: string,
    link: string,
}

const SingleApp = (props: applicationProps) => {
    const height = props.size === 'large' ? '300px' : '145px';
    return (
        <form  action={props.link} method="get" target="_blank">
            <button 
                className={styles.appButton} 
                style={{height:height, cursor: props.link ? 'pointer' : 'default'}} 
                disabled={!props.link}>
                    <h3 className={styles.appButtonTagline}>{props.tagline}</h3>
                    <p className={styles.builtWith}>Built with {props.builtWith}{!props.link ? " (Coming Soon)" : ""}</p>
            </button>
        </form>
    )
}

const Connect = (props: connectProps) => {
    const applications = [
        {
            size: "small",
            tagline: "Join the conversation",
            builtWith: "Discord",
            link: "",
        },
        {
            size: "small",
            tagline: "Find local events",
            builtWith: "LittleAtlas",
            link: "",
        },
        {
            size: "small",
            tagline: "Check out our job board",
            builtWith: "Console",
            link: "",
        },
    ];

    return (
        <div style={{'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center'}}>
            <h1>buildspace nights + weekends</h1>
            <div style={{'border': '3px solid white', 'borderRadius' : '1.5rem', 'height': '300px', 'width': '400px', 'margin': '0px 0px 20px 20px'}}>
                <Image height={300} width={400} style={{'borderRadius' : '1.5rem'}}src="/builderpass.png" alt="builder pass" ></Image>
            </div>
            <div className={styles.connectColumns}>
                    {applications.map((application => {
                        return (
                            <SingleApp 
                            key={application.tagline}
                            size={application.size}
                            tagline={application.tagline}
                            builtWith={application.builtWith}
                            link={application.link}
                        ></SingleApp>
                        )

                    }) )}
            </div>
        </div>

    )
}

export default Connect;