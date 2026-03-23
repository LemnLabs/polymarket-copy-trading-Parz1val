import { ENV } from '../config/env';
import { UserActivityInterface } from '../interfaces/User';
import { getUserActivityModel } from '../models/userHistory';
import fetchData from '../utils/fetchData';
import getTargetUsers from '../utils/targetUsers';

const TOO_OLD_TIMESTAMP = ENV.TOO_OLD_TIMESTAMP;
const FETCH_INTERVAL = ENV.FETCH_INTERVAL;

const fetchTradeDataForUser = async (userAddress: string) => {
    try {
        const UserActivity = getUserActivityModel(userAddress);
        const activities_raw = await fetchData(
            `https://data-api.polymarket.com/activities?user=${userAddress}`
        );
        if (!Array.isArray(activities_raw) || activities_raw.length === 0) return;

        const trades = activities_raw.filter((a) => a.type === 'TRADE') as UserActivityInterface[];
        const existingDocs = await UserActivity.find({}, { transactionHash: 1 }).exec();
        const existingHashes = new Set(
            existingDocs.map((d: { transactionHash?: string | null }) => d.transactionHash).filter(Boolean) as string[]
        );
        const cutoff = Date.now() - TOO_OLD_TIMESTAMP * 60 * 60 * 1000;

        const newTrades = trades.filter((t) => !existingHashes.has(t.transactionHash) && t.timestamp >= cutoff);
        for (const trade of newTrades) {
            await UserActivity.create({
                ...trade,
                proxyWallet: userAddress,
                bot: false,
                botExcutedTime: 0,
            });
            console.log('new trade', trade.transactionHash);
        }
    } catch (err) {
        console.error('fetch trades', err);
    }
};

const tradeMonitor = async () => {
    const targetUsers = getTargetUsers();

    while (true) {
        for (const userAddress of targetUsers) {
            await fetchTradeDataForUser(userAddress);
        }
        await new Promise((r) => setTimeout(r, FETCH_INTERVAL * 1000));
    }
};

export default tradeMonitor;
