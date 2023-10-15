import { DNSZ } from "../shared/utils/node/dnsz/getdnsz";

// 

export type ZoneConfiguration = {
    main: ZoneConfiguration.DnsData
};

// 

export namespace ZoneConfiguration {

    export type DnsData = {
        records: DNSZ.DnsRecord[]
        origin: string,
        ttl: number
        header: string
    } & DNSZ.DnsData;

    export function isValid(configuration: ZoneConfiguration) {
        return (
            configuration.main
            && configuration.main.records instanceof Array
            && typeof configuration.main.origin === "string"
            && typeof configuration.main.ttl === "number"
            && typeof configuration.main.header === "string"
        )
    }

}