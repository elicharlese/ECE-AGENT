"use client"

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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

      // Create a message to sign
      const message = new TextEncoder().encode(
        `Sign this message to login to the chat app. Nonce: ${Date.now()}`
      );

      // Sign the message
      const signature = await signMessage(message);

      // Convert signature to string for Supabase
      const signatureString = Buffer.from(signature).toString('hex');
      const publicKeyString = publicKey.toBase58();

      // Call Supabase function to verify and create/login user
      // This would typically be a custom Supabase function or edge function
      // For now, we'll simulate the process
      
      // In a real implementation, you would:
      // 1. Send the publicKey and signature to your backend
      // 2. Verify the signature on the backend
      // 3. If valid, create or retrieve the user in Supabase Auth
      // 4. Return a JWT token or session
      
      // For demo purposes, we'll create a mock user
      console.log('Solana login successful', { publicKey: publicKeyString, signature: signatureString });
      
      // Simulate successful login
      // In a real app, you would integrate this with your Supabase auth system
      // For example, using Supabase's custom authentication or a custom endpoint
      
      // This is a placeholder - you would replace this with actual Supabase integration
      alert(`Solana login successful!\nPublic Key: ${publicKeyString}\n\nIn a real implementation, this would integrate with Supabase Auth.`);
      
    } catch (err) {
      console.error('Solana login error:', err);
      setError('Failed to login with Solana wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-500">
        Or connect with Solana
      </div>
      
      <div className="flex flex-col gap-3">
        <WalletMultiButton className="w-full justify-center" />
        
        {connected && publicKey && (
          <Button 
            onClick={handleSolanaLogin}
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-purple-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Login with Solana'
            )}
          </Button>
        )}
      </div>
      
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-2">
        Connect your Solana wallet and sign a message to authenticate
      </div>
    </div>
  );
}
