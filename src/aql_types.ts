import {TLHashMap, TLString, TLType} from "./types";

export const enum ASSET_STATES{
    NEW,
    CIP,
    IN_SERVICE,
    RETIRED,
}

class FixedAssetVersioned{
     attributes:AssetAttributes|undefined;
     public FixedAsset(attr:AssetAttributes){
        this.attributes = attr;
     }

}

export class AssetAttributes{
    invoice:string|undefined;
    assetCategory:string|undefined;
    assetClearingAccountSegments:string|undefined
    assetCost:string|undefined
    assetCreationDate:string|undefined
    assetPlacedInService:string|undefined
    assetDescription:string|undefined
    assetLastUpdated:string|undefined
    assetVersion:string|undefined
    //attribMap:Map<string,string> = new Map();
    //state:ASSET_STATES|undefined
    constructor(tlMap : { [key: string]: TLType }){
        this.invoice = (tlMap["invoice"] as TLString).v
        this.assetCategory = (tlMap["assetCategory"] as TLString).v
        this.assetClearingAccountSegments = (tlMap["assetClearingAccountSegments"] as TLString).v
        this.assetCost = (tlMap["assetCost"] as TLString).v
        this.assetCreationDate = (tlMap["assetCreationDate"] as TLString).v
        this.assetPlacedInService = (tlMap["assetPlacedInService"] as TLString).v
        this.assetDescription = (tlMap["assetDescription"] as TLString).v
        this.assetLastUpdated = (tlMap["assetLastUpdated"] as TLString).v
        this.assetVersion = (tlMap["assetVersion"] as TLString).v
        //this.state = parseInt(attrMap.get("assetState")|"0",10)
        //this.attribMap = attrMap


    }

    public toString():string{
        return "AssetDetails:" + JSON.stringify(this)
    }
}