import {AssetAttributes} from "./aql_types";

const fs = require('fs/promises');

import results from "../results.json";
import {TLHashMap, TLString, TLType} from "./types";


export function getAsset(assetId: string):string[] {
    let new_results:any[] = results
    let assetArray: string[] = [];
    for (let i = 0; i < new_results.length; i++) {
        if (new_results[i]['assetId'] == assetId) {
            assetArray.push(JSON.stringify(new_results[i]));
        }
    }
    return assetArray;
}

export function updateData (assetId:string, attrs:{ [key: string]: TLType }) : string {
    let new_results:any[] = results
    let maxVersion = 0;
    let record = null
    for (let i = 0; i < new_results.length; i++) {
        if (new_results[i]['assetId'] == assetId && new_results[i]['assetVersion'] >= maxVersion) {
            record = JSON.parse(JSON.stringify(new_results[i]));
            maxVersion = new_results[i]['assetVersion']
        }
    }
    if(maxVersion == 0) return "Asset not found"

    for (let key in attrs) {
        record[key] = (attrs[key] as TLString).v
    }
    record['assetVersion'] = maxVersion+1;
    new_results.push(record);
    fs.writeFile('/Users/jayeshb/workspaces/mal-ts/results.json', JSON.stringify(new_results));

    return assetId;
}


export async function addAsset(asset: AssetAttributes) {

    let new_results: any[] = results
    new_results.push(JSON.parse(JSON.stringify(asset)))
    await fs.writeFile("/Users/jayeshb/workspaces/mal-ts/results.json", JSON.stringify(new_results));
    return asset.assetId;
}


