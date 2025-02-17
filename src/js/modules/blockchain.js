const ethers = window.ethers;

class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.isConnected = false;
        this.userAddress = null;
    }

    async connect() {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.provider = new window.ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();
            this.isConnected = true;

            // Listen for account changes
            window.ethereum.on('accountsChanged', () => window.location.reload());
            window.ethereum.on('chainChanged', () => window.location.reload());

            return this.userAddress;
        } catch (error) {
            this.isConnected = false;
            throw error;
        }
    }

    async initialize() {
        try {
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.provider = new window.ethers.BrowserProvider(window.ethereum);
                try {
                    this.signer = await this.provider.getSigner();
                } catch (signerError) {
                    console.warn('Failed to get signer, continuing in read-only mode');
                }
            } else {
                const alchemyUrl = process.env.ALCHEMY_URL || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key';
                this.provider = new window.ethers.JsonRpcProvider(alchemyUrl);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Blockchain initialization failed:', errorMessage);
            throw new Error('Failed to initialize blockchain connection');
        }
    }

    async getBalance(address) {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        try {
            const balance = await this.provider.getBalance(address);
            return window.ethers.formatEther(balance);
        } catch (error) {
            throw new Error('Failed to get balance: ' + (error.message || error));
        }
    }

    async getBlockCount() {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        try {
            return await this.provider.getBlockNumber();
        } catch (error) {
            throw new Error('Failed to get block count: ' + (error.message || error));
        }
    }

    async sendTransaction(toAddress, amount) {
        if (!this.signer) {
            throw new Error('MetaMask not connected. Please connect your wallet.');
        }
        try {
            const tx = await this.signer.sendTransaction({
                to: toAddress,
                value: window.ethers.parseEther(amount.toString())
            });
            return tx;
        } catch (error) {
            throw new Error('Failed to send transaction: ' + (error.message || error));
        }
    }

    isValidAddress(address) {
        return window.ethers.isAddress(address);
    }

    checkConnection() {
        return {
            isConnected: this.isConnected,
            address: this.userAddress
        };
    }
}

export default BlockchainService;