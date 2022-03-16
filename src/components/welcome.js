import React, { useState } from 'react';
import Modal from 'react-modal';
import { useWallet } from "use-wallet";
import { ethers } from "ethers";
import { useHistory } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';
import { metatokenContract } from '../contracts';
import { useBlockchainContext } from "../context";

import title from '../assets/img/first/title.png';
import { Link } from 'react-router-dom';

const adminAddress = "0x668362101bE157114cdf59b7680dDdf99233164E";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#f1ecd9',
        border: '2px solid #edd79a',
        borderRadius: '10px',
        padding: '30px',
        minWidth: '550px'
    },
};

Modal.setAppElement('#root');

export default function Welcome() {
    const wallet = useWallet();
    let history = useHistory();
    const [tokenstate, setTokenState] = useState(false);
    const [feeamount, setFeeAmount] = useState('0');
    const [reqamount, setReqAmount] = useState('0');
    const [waiting, setWaiting] = useState(false);
    const [state, socket,
        {
            getBalance,
            checkbalance,
            getFeeAmount,
            getRequireAmount,
            setUserState,
        }] = useBlockchainContext();

    const [modalIsOpen, setIsOpen] = useState(false);
    React.useEffect(() => {
        new Audio("Mario/Content/audio/1.mp3").play();
        checkConnection();
        getBalance();

    }, []);


    function openModal() {
        if (wallet.status !== 'connected') {
            NotificationManager.warning('Please connect Wallet');
            return;
        }
        else if (state.balance == '0') {
            return;
        }
        else {
            setFeeAmount(getFeeAmount());
            setReqAmount(getRequireAmount());
            if (checkbalance()) {
                setTokenState(true);
            }
            setIsOpen(true);
        }
    }
    function closeModal() {
        setIsOpen(false);
    }

    const play = async () => {
        setUserState();
        history.push("/play");

        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const signer = provider.getSigner();
        // var SignedCoinContract = metatokenContract.connect(signer);
        // var tx = await SignedCoinContract.transfer(adminAddress, feeamount)
        //     .catch((err) => {
        //     });
        // if (tx != undefined) {
        //     setWaiting(true);
        //     await tx.wait();
        //     setUserState();
        //     history.push("/play");
        // }
    }

    const handleChainChanged = (chainId) => {
        let { ethereum } = window;
        if (ethereum && ethereum.isConnected() && Number(chainId) === 56) {
            onConnect();
        }
        else {
            NotificationManager.error('Incorrect Chain');
        }
    };

    const checkConnection = async () => {
        let { ethereum } = window;
        if (ethereum !== undefined) {
            const chainId = await ethereum.request({ method: "eth_chainId" });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length !== 0 && Number(chainId) === 56) {
                onConnect();
            }
            else {
                NotificationManager.error('Incorrect Chain');
            }
            ethereum.on("chainChanged", handleChainChanged);
        }
    };

    const onConnect = async () => {
        let { ethereum } = window;
        const chainId = await ethereum.request({ method: "eth_chainId" });
        if (Number(chainId) != 56) {
            NotificationManager.error('Incorrect Chain');
        }
        if (wallet.status !== "connected") {
            wallet.connect().catch((err) => {
                NotificationManager.error("please check metamask!");
            });
        }
    };

    const disconnect = () => {
        if (wallet.status === "connected") {
            wallet.reset()
        }
    };

    return (
        <div className='background'>
            <div className='image'>
                {/*<img src={title} alt='title' className='title' />*/}
                <button className="btn pure-material-button-contained" onClick={wallet.status !== "connected" ? onConnect : disconnect}>
                    {wallet.status === "connected" ?
                        (
                            <div style={{ textTransform: "none", }}>
                                Disconnect
                            </div>
                        ) :
                        (
                            <div style={{ textTransform: "none" }}>
                                {wallet.status === "connecting" ? (
                                    <div>
                                        <span className="spinner-border" role="status" style={{ width: "1.5em", height: "1.5em", marginRight: 10, }}></span>
                                        <span className="sr-only ">
                                            Loading...
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        Connect
                                    </div>
                                )}
                            </div>
                        )}
                </button>
                <button className='btn pure-material-button-contained' onClick={openModal}>Start Now</button>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <div className='m-header'>
                    Welcome to Play !
                </div>
                <div className='m-body'>
                    <div className='m-comment-txt'>Need to have to hold more than 50 USD worth<br /> of MMX tokens to start the game.</div>
                    <div className='m-values'>
                        <div className='m-left'>Holding Tokens</div>
                        <div className='m-right'>&nbsp;&nbsp;:&nbsp;&nbsp;<span>{state.balance}</span> <span className='m-mmx'> MMX</span></div>
                    </div>
                    <div className='m-values'>
                        <div className='m-left'>Required Tokens</div>
                        <div className='m-right'>&nbsp;&nbsp;:&nbsp;&nbsp;<span>{reqamount}</span><span className='m-mmx'> MMX</span></div>
                    </div>
                </div>
                <div className='m-footer'>
                    <div>Entrance fee = {ethers.utils.formatUnits(feeamount, 9)} MMX</div>
                    {
                        tokenstate === false ?
                            <div>
                                <div className='m-token-error'>Holding Tokens are not enough. <Link to={{ pathname: "https://pancakeswap.finance/swap?outputCurrency=0x7c0c35e1303a3bf917d6498d300c90f04b5aa134" }} target="_blank" >Buy Now</Link></div>
                            </div>
                            :
                            waiting
                                ?
                                <div className='waiting-btn pure-material-button-contained'>Waiting...</div>
                                :
                                <button className='go-btn pure-material-button-contained' onClick={play}>Go to Start</button>
                    }
                </div>
            </Modal>
        </div>
    )
}
