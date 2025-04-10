'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Certificate, ApiResponse } from './types/certificate';

export default function Home() {
  const [policyId, setPolicyId] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  // Get URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPolicyId = params.get('policyId');
    const urlTxHash = params.get('txHash');

    if (urlPolicyId && urlTxHash) {
      setPolicyId(urlPolicyId);
      setTxHash(urlTxHash);
      handleCheck(urlPolicyId, urlTxHash);
    }
  }, []);

  const handleCheck = async (pId: string, tHash: string) => {
    if (!pId.trim() || !tHash.trim()) {
      setError('Please enter both Policy ID and Transaction Hash');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get NFT info using policy ID and transaction hash
      const { data: nftData } = await axios.get<ApiResponse>(
        `/api/nft/info/by-policy/${pId}/${tHash}`
      );

      if (nftData.success) {
        if (nftData.policyId && nftData.assetName && nftData.courseTitle && nftData.metadata && nftData.mintTransaction) {
          setCertificate({
            policyId: nftData.policyId,
            assetName: nftData.assetName,
            courseTitle: nftData.courseTitle,
            metadata: nftData.metadata,
            mintTransaction: nftData.mintTransaction
          });
        } else {
          setError('Invalid certificate data received');
        }
      } else {
        setError('Could not find certificate NFT information');
      }

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Error fetching certificate information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Certificate Verifier</h2>
          <p className="text-gray-600">Enter Policy ID and Transaction Hash to verify certificate</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy ID</label>
            <input
              type="text"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              placeholder="Enter Policy ID"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter Transaction Hash"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleCheck(policyId, txHash)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {certificate && (
          <div className="space-y-6 bg-white shadow rounded-lg p-6">
            <div>
              <h3 className="text-gray-600 mb-2">Policy ID</h3>
              <div className="bg-gray-50 p-4 rounded">
                {certificate.policyId}
              </div>
            </div>

            <div>
              <h3 className="text-gray-600 mb-2">Asset Name</h3>
              <div className="bg-gray-50 p-4 rounded">
                {certificate.assetName}
              </div>
            </div>

            <div>
              <h3 className="text-gray-600 mb-2">Course Title</h3>
              <div className="bg-gray-50 p-4 rounded">
                {certificate.courseTitle}
              </div>
            </div>

            {certificate.mintTransaction && (
              <div>
                <h3 className="text-gray-600 mb-2">Mint Transaction</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="mb-2">
                    <span className="font-bold">Transaction Hash: </span>{certificate.mintTransaction.txHash}
                  </div>
                  <div className="mb-2">
                    <span className="font-bold">Block: </span>{certificate.mintTransaction.block}
                  </div>
                  <div>
                    <span className="font-bold">Timestamp: </span>
                    {new Date(certificate.mintTransaction.timestamp * 1000).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-gray-600 mb-2">Metadata (CIP-721)</h3>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="font-mono text-sm whitespace-pre">
                  {JSON.stringify(certificate.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6">
              <a
                href={`https://preprod.cardanoscan.io/token/${certificate.policyId}${certificate.assetName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
              >
                View on Explorer
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
