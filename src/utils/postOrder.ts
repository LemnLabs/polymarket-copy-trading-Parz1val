import { ClobClient, OrderType, Side } from '@polymarket/clob-client';
import { UserActivityInterface, UserPositionInterface } from '../interfaces/User';
import { getUserActivityModel } from '../models/userHistory';
import { ENV } from '../config/env';

const RETRY_LIMIT = ENV.RETRY_LIMIT;

const postOrder = async (
    clobClient: ClobClient,
    condition: string,
    my_position: UserPositionInterface | undefined,
    user_position: UserPositionInterface | undefined,
    trade: UserActivityInterface,
    my_balance: number,
    user_balance: number,
    userAddress: string
) => {
    const UserActivity = getUserActivityModel(userAddress);

    if (condition === 'merge') {
        if (!my_position) {
            await UserActivity.updateOne({ _id: trade._id }, { bot: true });
            return;
        }
        let remaining = my_position.size;
        let retry = 0;
        while (remaining > 0 && retry < RETRY_LIMIT) {
            const orderBook = await clobClient.getOrderBook(trade.asset);
            if (!orderBook.bids?.length) {
                await UserActivity.updateOne({ _id: trade._id }, { bot: true });
                break;
            }
            const maxPriceBid = orderBook.bids.reduce((max, bid) =>
                parseFloat(bid.price) > parseFloat(max.price) ? bid : max
            , orderBook.bids[0]);
            let order_arges;
            if (remaining <= parseFloat(maxPriceBid.size)) {
                order_arges = { side: Side.SELL, tokenID: my_position.asset, amount: remaining, price: parseFloat(maxPriceBid.price) };
            } else {
                order_arges = { side: Side.SELL, tokenID: my_position.asset, amount: parseFloat(maxPriceBid.size), price: parseFloat(maxPriceBid.price) };
            }
            if (order_arges.amount <= 0) break;
            const signedOrder = await clobClient.createMarketOrder(order_arges);
            const resp = await clobClient.postOrder(signedOrder, OrderType.FOK);
            if (resp.success) {
                retry = 0;
                remaining -= order_arges.amount;
                await new Promise((r) => setTimeout(r, 500));
            } else {
                retry++;
                await new Promise((r) => setTimeout(r, 2000));
            }
        }
        if (retry >= RETRY_LIMIT) {
            await UserActivity.updateOne({ _id: trade._id }, { bot: true, botExcutedTime: retry });
        } else {
            await UserActivity.updateOne({ _id: trade._id }, { bot: true });
        }
    } else if (condition === 'buy') {
        const denom = user_balance + trade.usdcSize;
        if (denom <= 0 || my_balance <= 0) {
            await UserActivity.updateOne({ _id: trade._id }, { bot: true });
            return;
        }
        const ratio = my_balance / denom;
        let remaining = Math.min(trade.usdcSize * ratio, my_balance);
        let retry = 0;
        while (remaining > 0 && retry < RETRY_LIMIT) {
            const orderBook = await clobClient.getOrderBook(trade.asset);
            if (!orderBook.asks?.length) {
                await UserActivity.updateOne({ _id: trade._id }, { bot: true });
                break;
            }
            const minPriceAsk = orderBook.asks.reduce((min, ask) =>
                parseFloat(ask.price) < parseFloat(min.price) ? ask : min
            , orderBook.asks[0]);
            if (parseFloat(minPriceAsk.price) - 0.05 > trade.price) {
                await UserActivity.updateOne({ _id: trade._id }, { bot: true });
                break;
            }
            let order_arges;
            if (remaining <= parseFloat(minPriceAsk.size) * parseFloat(minPriceAsk.price)) {
                order_arges = { side: Side.BUY, tokenID: trade.asset, amount: remaining, price: parseFloat(minPriceAsk.price) };
            } else {
                order_arges = { side: Side.BUY, tokenID: trade.asset, amount: parseFloat(minPriceAsk.size) * parseFloat(minPriceAsk.price), price: parseFloat(minPriceAsk.price) };
            }
            if (order_arges.amount <= 0) break;
            const signedOrder = await clobClient.createMarketOrder(order_arges);
            const resp = await clobClient.postOrder(signedOrder, OrderType.FOK);
            if (resp.success) {
                retry = 0;
                remaining -= order_arges.amount;
                await new Promise((r) => setTimeout(r, 500));
            } else {
                retry++;
                await new Promise((r) => setTimeout(r, 2000));
            }
        }
        await UserActivity.updateOne({ _id: trade._id }, retry >= RETRY_LIMIT ? { bot: true, botExcutedTime: retry } : { bot: true });
    } else if (condition === 'sell') {
        let remaining = 0;
        if (!my_position) {
            await UserActivity.updateOne({ _id: trade._id }, { bot: true });
        } else if (!user_position) {
            remaining = my_position.size;
        } else {
            remaining = my_position.size * (trade.size / (user_position.size + trade.size));
        }
        let retry = 0;
        while (remaining > 0 && retry < RETRY_LIMIT) {
            const orderBook = await clobClient.getOrderBook(trade.asset);
            if (!orderBook.bids?.length) {
                await UserActivity.updateOne({ _id: trade._id }, { bot: true });
                break;
            }
            const maxPriceBid = orderBook.bids.reduce((max, bid) =>
                parseFloat(bid.price) > parseFloat(max.price) ? bid : max
            , orderBook.bids[0]);
            const bidPrice = parseFloat(maxPriceBid.price);
            if (trade.price && bidPrice + 0.05 < trade.price) {
                await UserActivity.updateOne({ _id: trade._id }, { bot: true });
                break;
            }
            let order_arges;
            if (remaining <= parseFloat(maxPriceBid.size)) {
                order_arges = { side: Side.SELL, tokenID: trade.asset, amount: remaining, price: bidPrice };
            } else {
                order_arges = { side: Side.SELL, tokenID: trade.asset, amount: parseFloat(maxPriceBid.size), price: bidPrice };
            }
            if (order_arges.amount <= 0) break;
            const signedOrder = await clobClient.createMarketOrder(order_arges);
            const resp = await clobClient.postOrder(signedOrder, OrderType.FOK);
            if (resp.success) {
                retry = 0;
                remaining -= order_arges.amount;
                await new Promise((r) => setTimeout(r, 500));
            } else {
                retry++;
                await new Promise((r) => setTimeout(r, 2000));
            }
        }
        await UserActivity.updateOne({ _id: trade._id }, retry >= RETRY_LIMIT ? { bot: true, botExcutedTime: retry } : { bot: true });
    }
};

export default postOrder;
