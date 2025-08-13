"use client"

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, Shield, CheckCircle } from 'lucide-react';

export function SolanaLoginButton() {
  const { publicKey, signMessage, connected } = useWallet();
  const { connection } = useConnection();
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSolanaLogin = async () => {
    if (!publicKey || !signMessage) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Create a message to sign with timestamp for security
      const timestamp = Date.now();
      const message = new TextEncoder().encode(
        `Sign this message to authenticate with AGENT.\n\nTimestamp: ${timestamp}\nPublic Key: ${publicKey.toBase58()}\n\nThis request will not trigger any blockchain transaction.`
      );

      // Sign the message
      const signature = await signMessage(message);

      // Convert signature to string for backend verification
      const signatureString = Buffer.from(signature).toString('hex');
      const publicKeyString = publicKey.toBase58();
      const messageString = Buffer.from(message).toString('hex');

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

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { access_token, refresh_token, user } = await response.json();
      
      // Set the session in Supabase with access and refresh tokens
      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token
        });
        if (sessionError) {
          throw sessionError;
        }
        
        // Login successful - the useUser context will handle the state update
        console.log('Solana authentication successful', { user: user.id });
      } else {
        throw new Error('No tokens returned from authentication');
      }
      
    } catch (err) {
      console.error('Solana login error:', err);
      const error = err as Error;
      if (error.message === 'User rejected the request.') {
        setError('Wallet signature was cancelled');
      } else if (error.message.includes('Authentication failed')) {
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
        <div className="wallet-adapter-button-trigger">
          <WalletMultiButton className="!w-full !justify-center !bg-gradient-to-r !from-purple-600 !to-indigo-600 !border-purple-500/30 !text-white hover:!from-purple-700 hover:!to-indigo-700 !transition-all !duration-200" />
        </div>
        
        {connected && publicKey && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Wallet Connected</span>
            </div>
            
            <Button 
              onClick={handleSolanaLogin}
              disabled={isLoading}
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
