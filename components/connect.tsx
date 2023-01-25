import { NFTMetadata } from "@thirdweb-dev/sdk";
import { ThirdwebNftMedia } from "@thirdweb-dev/react";

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
            link: "https://discord.gg/5GXRS5Bp8R",
        },
        {
            size: "small",
            tagline: "Connect with local alums",
            builtWith: "LittleAtlas",
            link: "",
        },
        {
            size: "small",
            tagline: "Find a new career",
            builtWith: "Console",
            link: "",
        },
        {
            size: "small",
            tagline: "Audit online classes",
            builtWith: "LinkU Stream",
            link: "",
        },
        {
            size: "small",
            tagline: "Give back",
            builtWith: "LinkU Give",
            link: "",
        },
        {
            size: "small",
            tagline: "Get updates from ExampleU",
            builtWith: "XMTP",
            link: "",
        }
    ];

    return (
        <div>
            <h1>Example University</h1>
            <div className={styles.connectColumns}>
                    {props?.mintedNft !== null ? 
                        <ThirdwebNftMedia 
                        className={styles.nftStyle}
                        metadata={props.mintedNft} />
                    : {}
                    }
                    
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