import {Node, TLBoolean, TLFunction, TLString, TLSymbol, TLType} from "./types";
import {AssetAttributes} from "./aql_types";


export const ns: Map<TLSymbol, TLFunction> = (() => {
    const ns: { [symbol: string]: typeof TLFunction.prototype.func; } = {
        "asset_create"(assetID: TLType, assetAttrs: TLType): TLString {
            if(assetID.type != Node.Number){
                throw new Error("Bad Asset Id")
            }
            if(assetAttrs.type != Node.HashMap){
                throw new Error("Expected hash map for attributes")
            }
            let asset:AssetAttributes = new AssetAttributes(assetAttrs.stringMap)
            return new TLString(asset.toString())
        },
        "asset_update"(assetID: TLType, assetAttrs: TLType): TLString {
            if(assetID.type != Node.Number){
                throw new Error("Bad Asset Id")
            }
            if(assetAttrs.type != Node.HashMap){
                throw new Error("Expected hash map for attributes")
            }
            let asset:AssetAttributes = new AssetAttributes(assetAttrs.stringMap)
            return new TLString(asset.toString())
        },
        "asset_versions"(assetID: TLType): TLString {
            if(assetID.type != Node.Number){
                throw new Error("Bad Asset Id")
            }

            return new TLString("")
        }
    };

    const map = new Map<TLSymbol, TLFunction>();
    Object.keys(ns).forEach(key => map.set(TLSymbol.get(key), TLFunction.fromBootstrap(ns[key])));
    return map;
})();


/*
asset_create, asset_update/transfer, asset_retire

asset_lineage
v1:create
v2:retired


asset_create -> List() -> updateCSV()
a,b,c
{attr:val, attr1:val1}

 */