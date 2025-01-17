import { setup } from 'axios-cache-adapter';

const api = setup({
    baseURL: 'https://api.aavegotchi.land',

    cache: {
        maxAge: 10 * 60 * 1000, // caching for 10 mins
        exclude: { query: false }
    }
});

const noCacheOptions = {
    cache: { maxAge: 0 }
};

export class AavegothilandApi {
    public static getAddressInfo(address: any, disableCache?: any): Promise<any> {
        return api.get(`/address_info?address=${address}`, disableCache && noCacheOptions);
    }
}
