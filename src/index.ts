const request = require("axios");

import { normalise, validateIp, IPResponse } from "./interface";

const defaultProviders: string[] = [
    "https://extreme-ip-lookup.com/json/*",
    "http://free.ipwhois.io/json/*",
    "https://ipapi.co/json/*",
    "https://freegeoip.app/json/*",
    "https://get.geojs.io/v1/ip/geo.json*"
];

const log = console.tron.logImportant;

class InvalidIPError extends Error {
    constructor() {
        super();
        this.message = "Invalid IP address.";
    }
}

class ProviderError extends Error {
    constructor() {
        super();
        this.message = "All providers failed.";
    }
}

interface Callback {
    (err: InvalidIPError | ProviderError, res: IPResponse | null): void;
}

export default function(
    ip: string,
    additionalProviders?: string[],
    callback?: Callback
): Promise<IPResponse | InvalidIPError | ProviderError | Error> | void {
    const providers: string[] = (additionalProviders || [])
        .concat(defaultProviders);

    // if (true) {
    //     return callback
    //         ? callback(new InvalidIPError(), null)
    //         : Promise.reject(new InvalidIPError());
    // }

    function retry(i: number, callback: Callback) {
        if (!providers[i]) {
            return callback(new ProviderError(), null);
        }

        const url = providers[i].replace("*", ip || "");

        log("trying: " + url);

        request.get(url).then((res) => {
            if (res.status !== 200 || !res.data) {
              return callback(null, normalised);
            }
            const json ={...res.data}
            if (json.lat) json.latitude = json.lat;
            if (json.lat) json.latitude = json.lat;
            if (json.lon) json.longitude = json.lon;
            console.tron.logImportant(json);
            if (json.error || !json.latitude || !json.longitude) {
                return retry(++i, callback);
            }

            return callback(null, json);
        }).catch((err) => {
          return retry(++i, callback);
        });
    }
    if (callback) {

        retry(0, callback);
    } else {
        return new Promise((resolve, reject) => {
            retry(0, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }
}

