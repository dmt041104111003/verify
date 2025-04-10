import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { NextResponse } from 'next/server';

// Initialize Blockfrost API client
const blockfrost = new BlockFrostAPI({
    projectId: 'preprodwAoQrS3Nc0RhHqm8awt9yISNlW9Z6TW6',
    network: 'preprod',
});

export async function GET(
    request: Request,
    { params }: { params: { policyId: string; txHash: string } }
) {
    try {
        const { policyId, txHash } = params;
        console.log(' [NFT Query] Starting with policyId:', policyId, 'txHash:', txHash);

        // Get transaction details
        console.log(' [NFT Query] Getting transaction:', txHash);
        const txDetails = await blockfrost.txs(txHash);
        console.log(' [NFT Query] Transaction details:', txDetails);

        // Get metadata from transaction
        const txMetadata = await blockfrost.txsMetadata(txHash);
        console.log(' [NFT Query] Transaction metadata:', txMetadata);

        // Get minted assets from transaction
        const txUtxos = await blockfrost.txsUtxos(txHash);
        console.log(' [NFT Query] Transaction UTXOs:', txUtxos);

        // Find the NFT in the outputs
        const mintedAsset = txUtxos.outputs.find(output => 
            output.amount.find(amt => amt.unit !== 'lovelace')
        );

        if (!mintedAsset) {
            throw new Error('No NFT found in transaction outputs');
        }

        const assetInfo = mintedAsset.amount.find(amt => amt.unit !== 'lovelace');
        if (!assetInfo) {
            throw new Error('No NFT found in transaction outputs');
        }

        console.log(' [NFT Query] Found NFT:', assetInfo.unit);

        // Get asset details
        const assetDetails = await blockfrost.assetsById(assetInfo.unit);
        console.log(' [NFT Query] Asset details:', assetDetails);

        // Format metadata according to CIP-721
        const nftMetadata = {
            "721": {
                [policyId]: {
                    [assetInfo.unit.slice(56)]: {
                        name: assetDetails.onchain_metadata?.name || "Unknown",
                        image: assetDetails.onchain_metadata?.image || {},
                        mediaType: assetDetails.onchain_metadata?.mediaType || "image/png",
                        description: assetDetails.onchain_metadata?.description || "",
                        properties: assetDetails.onchain_metadata?.properties || {}
                    }
                }
            }
        };

        return NextResponse.json({
            success: true,
            policyId,
            assetName: assetInfo.unit.slice(56),
            courseTitle: assetDetails.onchain_metadata?.name || "Unknown",
            metadata: nftMetadata,
            mintTransaction: {
                txHash,
                block: txDetails.block_height,
                timestamp: txDetails.block_time
            }
        });

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to get NFT information'
        }, { status: 500 });
    }
}
