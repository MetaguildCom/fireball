import { createContext, useState } from 'react';

import { Sorting } from 'shared/models';
import { GotchiIcon, KekIcon, RareTicketIcon, WarehouseIcon, AnvilIcon } from 'components/Icons/Icons';
import { EthersApi, InstallationsApi, MainApi, TheGraphApi, TicketsApi, TilesApi } from 'api';
import { CommonUtils, GotchiverseUtils, GraphUtils, InstallationsUtils, ItemUtils, TilesUtils } from 'utils';

export const ClientContext = createContext({});

export const ClientContextProvider = (props: any) => {
    const [gotchis, setGotchis] = useState<any[]>([]);
    const [gotchisSorting, setGotchisSorting] = useState<Sorting>({ type: 'modifiedRarityScore', dir: 'desc' });
    const [loadingGotchis, setLoadingGotchis] = useState<boolean>(true);

    const [lendings, setLendings] = useState<any[]>([]);
    const [lendingsSorting, setLendingsSorting] = useState<Sorting>({ type: 'totalTokens', dir: 'desc' });
    const [loadingLendings, setLoadingLendings] = useState<boolean>(true);

    const [warehouse, setWarehouse] = useState<any[]>([]);
    const [warehouseSorting, setWarehouseSorting] = useState<Sorting>({ type: 'rarityId', dir: 'desc' });
    const [loadingWarehouse, setLoadingWarehouse] = useState<boolean>(false);

    const [installations, setInstallations] = useState<any[]>([]);
    const [loadingInstallations, setLoadingInstallations] = useState<boolean>(true);

    const [tiles, setTiles] = useState<any[]>([]);
    const [loadingTiles, setLoadingTiles] = useState<boolean>(true);

    const [tickets, setTickets] = useState<any[]>([]);
    const [loadingTickets, setLoadingTickets] = useState<boolean>(true);

    const [realm, setRealm] = useState<any[]>([]);
    const [realmSorting, setRealmSorting] = useState<Sorting>({ type: 'size', dir: 'desc' });
    const [loadingRealm, setLoadingRealm] = useState<boolean>(true);

    const [reward, setReward] = useState<any>(null);
    const [rewardCalculating, setRewardCalculating] = useState<boolean>(false);
    const [rewardCalculated, setRewardCalculated] = useState<boolean>(false);
    const [realmView, setRealmView] = useState<string>('list');

    const navData: any[] = [
        {
            name: 'gotchis',
            icon: <GotchiIcon width={24} height={24} />,
            loading: loadingGotchis,
            items: gotchis.length
        },
        {
            name: 'lendings',
            icon: <GotchiIcon width={24} height={24} />,
            loading: loadingLendings,
            items: lendings.length
        },
        {
            name: 'warehouse',
            icon: <WarehouseIcon width={24} height={24} />,
            loading: loadingWarehouse,
            items: warehouse.length
        },
        {
            name: 'installations',
            icon: <AnvilIcon width={24} height={24} />,
            loading: loadingInstallations || loadingTiles,
            items: installations.length + tiles.length
        },
        {
            name: 'tickets',
            icon: <RareTicketIcon width={24} height={24} />,
            loading: loadingTickets,
            items: tickets.length
        },
        {
            name: 'realm',
            icon: <KekIcon width={24} height={24} alt='realm' />,
            loading: loadingRealm,
            items: realm.length
        }
    ];

    const getClientData = (address: string): void => {
        getGotchis(address);
        getLendings(address);
        getInventory(address);
        getTickets(address);
        getRealm(address);
        getInstallations(address);
        getTiles(address);

        // reset
        setWarehouse([]);
    };

    const getGotchis = (address: string): void => {
        setLoadingGotchis(true);

        TheGraphApi.getGotchisByAddress(address).then((response) => {
            const wearables: any[] = [];
            const { type: gSortType, dir: gSortDir } = gotchisSorting;
            const { type: wSortType, dir: wSortDir } = warehouseSorting;

            // collect all equipped wearables
            response.forEach((item: any) => {
                const equipped: any = item.equippedWearables.filter((item: any) => item > 0);

                for (const wearable of equipped) {
                    const index: number = wearables.findIndex(item => item.id === wearable);

                    if ((wearable >= 162 && wearable <= 198) || wearable === 210) continue; // skip badges or h1 bg

                    if (wearables[index] === undefined) {
                        wearables.push({
                            id: wearable,
                            balance: 1,
                            rarity: ItemUtils.getItemRarityById(wearable),
                            rarityId: ItemUtils.getItemRarityId(ItemUtils.getItemRarityById(wearable)),
                            holders: [item.id],
                            category: 0
                        });
                    } else {
                        wearables[index].balance += 1;
                        wearables[index].holders.push(item.id);
                    }
                }
            });

            setWarehouse((existing: any[]) => CommonUtils.basicSort(
                [...existing, ...wearables].reduce((items: any[], current: any) => {
                    const duplicated: any = items.find((item: any) => item.id === current.id);

                    if (duplicated) {
                        duplicated.balance += current.balance;
                        duplicated.holders = current.holders;

                        return items;
                    }

                    return items.concat(current);
                }, []), wSortType, wSortDir));

            setGotchis(CommonUtils.basicSort(response, gSortType, gSortDir));
            setLoadingGotchis(false);
        }).catch((error: any) => {
            console.log(error);
            setGotchis([]);
            setLoadingGotchis(false);
        });
    };

    const getLendings = (address: string): void => {
        setLoadingLendings(true);

        TheGraphApi.getLendingsByAddress(address)
            .then((lendings: any[]) => {
                const balancesRequest: any[] = [];
                const { type, dir } = lendingsSorting;

                for (let i = 0; i < lendings.length; i++) {
                    balancesRequest.push(TheGraphApi.getIncomeById(lendings[i].id, lendings[i].timeAgreed));
                }

                Promise.all(balancesRequest).then((balances: any[]) => {
                    balances.forEach((balance: any, i: number) => {
                        lendings[i].fud = balance.FUDAmount;
                        lendings[i].fomo = balance.FOMOAmount;
                        lendings[i].alpha = balance.ALPHAAmount;
                        lendings[i].kek = balance.KEKAmount;
                        lendings[i].totalTokens = balance.FUDAmount + balance.FOMOAmount + balance.ALPHAAmount + balance.KEKAmount;
                        lendings[i].income = GotchiverseUtils.countAlchemicaEfficency(balance.FUDAmount, balance.FOMOAmount, balance.ALPHAAmount, balance.KEKAmount);
                        lendings[i].endTime = parseInt(lendings[i].timeAgreed) + parseInt(lendings[i].period);
                    });

                    setLendings(CommonUtils.basicSort(lendings, type, dir));
                    setLoadingLendings(false);
                });
            }
        );
    };

    const getInventory = (address: string): void => {
        setLoadingWarehouse(true);

        MainApi.getInventoryByAddress(address).then((response: any) => {
            const modified: any[] = [];
            const { type, dir } = warehouseSorting;

            response.items.forEach((item: any) => {
                modified.push({
                    id: +item.itemId,
                    rarity: ItemUtils.getItemRarityById(item.itemId),
                    rarityId: ItemUtils.getItemRarityId(ItemUtils.getItemRarityById(item.itemId)),
                    balance: +item.balance,
                    category: item.itemId >= 126 && item.itemId <= 129 ? 2 : 0 // TODO: temporary solution to determine if item is consumable or not
                });
            });

            setWarehouse((existing: any[]) => CommonUtils.basicSort(
                [...existing, ...modified].reduce((items, current) => {
                    const duplicated = items.find((item: any) => item.id === current.id);

                    if (duplicated) {
                        duplicated.balance += current.balance;
                        duplicated.holders = current.holders;

                        return items;
                    }

                    return items.concat(current);
                }, []), type, dir));
            setLoadingWarehouse(false);

        }).catch((error) => {
            console.log(error);
            setWarehouse([]);
            setLoadingWarehouse(false);
        });
    };

    const getInstallations = (address: string): void => {
        setLoadingInstallations(true);

        InstallationsApi.getInstallationsByAddress(address).then(response => {
            const installations: any[] = response.map((item: any) => {
                const id: any = EthersApi.formatBigNumber(item.installationId._hex);

                return {
                    type: 'installation',
                    name: InstallationsUtils.getNameById(id),
                    balance: EthersApi.formatBigNumber(item.balance._hex),
                    id: id,
                    level: InstallationsUtils.getLevelById(id)
                };
            });

            setInstallations(installations);
            setLoadingInstallations(false);
        });
    };

    const getTiles = (address: string): void => {
        setLoadingTiles(true);

        TilesApi.getTilesByAddress(address).then((response: any) => {
            const tiles: any[] = response.map((item: any) => {
                const id: any = EthersApi.formatBigNumber(item.tileId._hex);

                return {
                    type: 'tile',
                    name: TilesUtils.getNameById(id),
                    balance: EthersApi.formatBigNumber(item.balance._hex),
                    id: id
                };
            });

            setTiles(tiles);
            setLoadingTiles(false);
        });
    };

    const getTickets = (address: string): void => {
        setLoadingTickets(true);

        TicketsApi.getTicketsByAddress(address).then((response: any) => {
            const modified = response.filter((item: any) => item.balance > 0);

            setTickets(modified);
            setLoadingTickets(false);
        }).catch((error) => {
            console.log(error);
        });
    };

    const getRealm = (address: string): void => {
        setLoadingRealm(true);

        TheGraphApi.getRealmByAddress(address)
            .then((res: any) => {
                const { type, dir } = realmSorting;

                const modified: any[] = res.map((parcel: any) => ({
                    ...parcel,
                    channeling: { loading: true },
                    installations: { loading: true }
                }));

                setRealm(CommonUtils.basicSort(modified, type, dir));
                setLoadingRealm(false);
            })
            .catch((error) => {
                console.log(error);
                setRealm([]);
                setLoadingRealm(false);
            });
    };

    const calculateReward = () => {
        setRewardCalculating(true);

        TheGraphApi.getAllGotchies().then((response: any) => {
            const brsLeaders: any[] = CommonUtils.basicSort(response, 'modifiedRarityScore');
            const kinLeaders: any[] = CommonUtils.basicSort(response, 'kinship');
            const expLeaders: any[] = CommonUtils.basicSort(response, 'experience');

            gotchis.forEach((item: any, index: number) => {
                const BRS: any = GraphUtils.calculateRewards(brsLeaders.findIndex(x => x.id === item.id), 'BRS');
                const KIN: any = GraphUtils.calculateRewards(kinLeaders.findIndex(x => x.id === item.id), 'KIN');
                const EXP: any = GraphUtils.calculateRewards(expLeaders.findIndex(x => x.id === item.id), 'EXP');

                gotchis[index] = {
                    ...item,
                    reward: BRS.reward + KIN.reward + EXP.reward,
                    rewardStats: [BRS, KIN, EXP]
                };
            });

            setReward(gotchis.reduce((prev: any, next: any) => prev + next.reward, 0));
            setRewardCalculating(false);
            setRewardCalculated(true);
        });
    };

    return (
        <ClientContext.Provider value={{
            gotchis,
            gotchisSorting,
            loadingGotchis,
            setGotchis,
            setGotchisSorting,

            lendings,
            lendingsSorting,
            loadingLendings,
            setLendings,
            setLendingsSorting,

            warehouse,
            warehouseSorting,
            loadingWarehouse,
            setWarehouse,
            setWarehouseSorting,

            installations,
            loadingInstallations,

            tiles,
            loadingTiles,

            tickets,
            loadingTickets,

            realm,
            realmView,
            realmSorting,
            loadingRealm,
            setRealm,
            setRealmView,
            setRealmSorting,
            setLoadingRealm,

            reward,
            rewardCalculated,
            rewardCalculating,
            calculateReward,

            navData,
            getClientData
        }}>
            { props.children }
        </ClientContext.Provider>
    );
};
