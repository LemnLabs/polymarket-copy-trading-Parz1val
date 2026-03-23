import { ClobClient } from '@polymarket/clob-client';
import { UserActivityInterface, UserPositionInterface } from '../interfaces/User';
import { ENV } from '../config/env';
import { getUserActivityModel } from '../models/userHistory';
import fetchData from '../utils/fetchData';
import spinner from '../utils/spinner';
import getMyBalance from '../utils/getMyBalance';
import postOrder from '../utils/postOrder';
import getTargetUsers from '../utils/targetUsers';

const RETRY_LIMIT = ENV.RETRY_LIMIT;
const PROXY_WALLET = ENV.PROXY_WALLET;

type PendingTrade = {
    trade: UserActivityInterface;
    userAddress: string;
};

let temp_trades: PendingTrade[] = [];

const readTempTrade = async () => {
    const targetUsers = getTargetUsers();
    const allTrades: PendingTrade[] = [];

    for (const userAddress of targetUsers) {
        const UserActivity = getUserActivityModel(userAddress);
        const userTrades = (
            await UserActivity.find({
                $and: [
                    { type: 'TRADE' },
                    { bot: false },
                    {
                        $or: [
                            { botExcutedTime: { $exists: false } },
                            { botExcutedTime: { $lt: RETRY_LIMIT } },
                        ],
                    },
                ],
            }).exec()
        ).map((trade: any) => trade as UserActivityInterface);

        for (const trade of userTrades) {
            allTrades.push({ trade, userAddress });
        }
    }

    temp_trades = allTrades;
};

const doTrading = async (clobClient: ClobClient) => {
    for (const pendingTrade of temp_trades) {
        const { trade, userAddress } = pendingTrade;
        const UserActivity = getUserActivityModel(userAddress);

        try {
            console.log('copying trade', trade.transactionHash);

            const my_positions_raw = await fetchData(
                `https://data-api.polymarket.com/positions?user=${PROXY_WALLET}`
            );
            const user_positions_raw = await fetchData(
                `https://data-api.polymarket.com/positions?user=${userAddress}`
            );

            const my_positions: UserPositionInterface[] = Array.isArray(my_positions_raw) ? my_positions_raw : [];
            const user_positions: UserPositionInterface[] = Array.isArray(user_positions_raw) ? user_positions_raw : [];

            const my_position = my_positions.find((p) => p.conditionId === trade.conditionId);
            const user_position = user_positions.find((p) => p.conditionId === trade.conditionId);

            const my_balance = await getMyBalance(PROXY_WALLET);
            const user_balance = await getMyBalance(userAddress);

            let condition: string;
            if (trade.side === 'BUY') {
                condition = 'buy';
            } else if (trade.side === 'SELL') {
                condition = 'sell';
            } else {
                if (my_position && !user_position) condition = 'merge';
                else if (trade.side === 'MERGE') condition = 'merge';
                else condition = trade.side.toLowerCase();
            }

            await postOrder(clobClient, condition, my_position, user_position, trade, my_balance, user_balance, userAddress);
            console.log('done', trade.transactionHash);
        } catch (err) {
            console.error('trade failed', trade.transactionHash, err);
            await UserActivity.updateOne({ _id: trade._id }, { bot: true, botExcutedTime: RETRY_LIMIT });
        }
    }
};

const tradeExcutor = async (clobClient: ClobClient) => {
    while (true) {
        await readTempTrade();
        if (temp_trades.length > 0) {
            spinner.stop();
            console.log(temp_trades.length, 'tx to copy');
            await doTrading(clobClient);
        } else {
            spinner.start('waiting for target wallet trades');
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
};

export default tradeExcutor;
