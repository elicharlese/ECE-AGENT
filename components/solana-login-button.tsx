"use client"

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, Shield, CheckCircle } from 'lucide-react';

type Props = { className?: string; onLinked?: () => void }

type WalletAuthResponse = { linked?: boolean }
function isWalletAuthResponse(x: unknown): x is WalletAuthResponse {
  if (typeof x !== 'object' || x === null) return false
  const rec = x as Record<string, unknown>
  return rec.linked === undefined || typeof rec.linked === 'boolean'
}

// A minimal, UI-matching wallet connect button that only opens the wallet modal.
// Styled to match the "Continue with Google" outline button on the /auth page.
export function ConnectWalletButton({ className }: Props) {
  const { setVisible } = useWalletModal();
  return (
    <Button
      type="button"
      onClick={() => setVisible(true)}
      variant="outline"
      className={`w-full h-12 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl transition-colors ${className ?? ''}`}
    >
      <span className="inline-flex items-center">
        <Wallet className="mr-2 h-5 w-5" />
        Connect Wallet
      </span>
    </Button>
  );
}

export function SolanaLoginButton({ className, onLinked }: Props) {
  const { publicKey, signMessage, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to convert bytes to hex without Buffer (browser-safe)
  const bytesToHex = (bytes: Uint8Array) =>
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const handleSolanaLogin = async () => {
    if (!publicKey || !signMessage) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Create a message to sign with timestamp for security
      const timestamp = Date.now();
      const message = new TextEncoder().encode(
        `Sign this message to authenticate with AGENT.\n\nTimestamp: ${timestamp}\nPublic Key: ${publicKey.toBase58()}\n\nThis request will not trigger any blockchain transaction.`
      );

      // Sign the message
      const signature = await signMessage(message);

      // Convert signature to string for backend verification
      const signatureString = bytesToHex(signature);
      const publicKeyString = publicKey.toBase58();
      const messageString = bytesToHex(message);

      // Send to backend for verification and user creation/login
      const response = await fetch('/api/auth/solana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: publicKeyString,
          signature: signatureString,
          message: messageString,
          timestamp
        }),
      });

      // Handle linking vs. login flows
      if (response.status === 401) {
        // Not signed in; we currently only support post-auth wallet linking
        setError('Please sign in with email/password or Google first, then link your wallet.');
        return;
      }

      if (!response.ok) {
        const t = await response.text().catch(() => '')
        throw new Error(t || 'Authentication failed');
      }

      const jsonUnknown: unknown = await response.json();
      if (isWalletAuthResponse(jsonUnknown) && jsonUnknown.linked) {
        // Wallet linked to current Supabase user account
        console.log('Solana wallet linked to account');
        setError('');
        setSuccess('Wallet successfully linked to your account.');
        onLinked?.();
        return;
      }

      // Future: support wallet-first login issuing Supabase tokens from backend
      // For now, anything else is unexpected
      throw new Error('Unsupported response from wallet auth endpoint');
      
    } catch (err) {
      console.error('Solana login error:', err);
      const message = err instanceof Error ? err.message : String(err);
      if (message === 'User rejected the request.') {
        setError('Wallet signature was cancelled');
      } else if (message.includes('Authentication failed')) {
        setError('Authentication failed. Please try again.');
      } else {
        setError('Failed to authenticate with Solana wallet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {connected && publicKey && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Wallet Connected</span>
            </div>
            
            <Button 
              onClick={handleSolanaLogin}
              disabled={isLoading || !signMessage}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign & Authenticate
                </>
              )}
            </Button>
            {!signMessage && (
              <p className="text-xs text-amber-400 text-center">
                Your connected wallet doesn&apos;t support message signing.
              </p>
            )}
          </div>
        )}
        
        {!connected && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
              <Wallet className="h-4 w-4" />
              <span>Connect your Solana wallet</span>
            </div>
            <p className="text-xs text-gray-500">
              Sign a message to authenticate securely
            </p>
          </div>
        )}
      </div>
      
      {success && (
        <Alert className="bg-emerald-900/20 border-emerald-500/50">
          <AlertDescription className="text-emerald-300">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
          <AlertDescription className="text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
