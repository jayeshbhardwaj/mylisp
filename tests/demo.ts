/*
Demo Script:
1. Create Sample Assets
(asset_create {"assetId" "1234" "invoiceId" "null" "assetCategory" "ac1" "assetClearingAccountSegments" "COA" "assetCost" "230" "assetCreationDate" "2022-02-11" "assetPlacedInService" "2022-03-04" "assetDescription" "IT Equip"})
(asset_create {"assetId" "1235" "invoiceId" "568" "assetCategory" "ac2" "assetClearingAccountSegments" "COA" "assetCost" "233" "assetCreationDate" "2022-02-12" "assetPlacedInService" "2022-04-04" "assetDescription" "IT Equip"})

2. Update assets
(asset_update "1234" {"invoiceId" "569"})

3. List asset versions
(asset_versions "1234")
 */