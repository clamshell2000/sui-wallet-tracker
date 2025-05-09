/**
 * Wallet Management
 * Handles storing and retrieving wallet addresses, and fetching wallet data
 */

const WalletManager = {
    // Storage key for wallets
    STORAGE_KEY: 'sui_tracker_wallets',
    
    // Initialize the wallet manager
    init() {
        // Initialize the wallets array from local storage
        this.wallets = this.getWallets();
        console.log('Wallet Manager initialized');
    },
    
    // Get all wallets from local storage
    getWallets() {
        const walletsJson = localStorage.getItem(this.STORAGE_KEY);
        return walletsJson ? JSON.parse(walletsJson) : [];
    },
    
    // Save wallets to local storage
    saveWallets(wallets) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wallets));
        this.wallets = wallets;
    },
    
    // Add a new wallet
    addWallet(address, name = '') {
        // Validate the address
        if (!SuiAPI.validateAddress(address)) {
            throw new Error('Invalid Sui wallet address');
        }
        
        // Check if wallet already exists
        const existingWallet = this.wallets.find(wallet => wallet.address.toLowerCase() === address.toLowerCase());
        if (existingWallet) {
            throw new Error('Wallet already exists');
        }
        
        // Create a new wallet object
        const newWallet = {
            id: Date.now().toString(),
            address,
            name: name || `Wallet ${this.wallets.length + 1}`,
            dateAdded: new Date().toISOString()
        };
        
        // Add to wallets array and save
        const updatedWallets = [...this.wallets, newWallet];
        this.saveWallets(updatedWallets);
        
        return newWallet;
    },
    
    // Remove a wallet
    removeWallet(walletId) {
        const updatedWallets = this.wallets.filter(wallet => wallet.id !== walletId);
        this.saveWallets(updatedWallets);
    },
    
    // Update a wallet
    updateWallet(walletId, updates) {
        const updatedWallets = this.wallets.map(wallet => {
            if (wallet.id === walletId) {
                return { ...wallet, ...updates };
            }
            return wallet;
        });
        
        this.saveWallets(updatedWallets);
    },
    
    // Get a wallet by ID
    getWalletById(walletId) {
        return this.wallets.find(wallet => wallet.id === walletId);
    },
    
    // Get a wallet by address
    getWalletByAddress(address) {
        return this.wallets.find(wallet => wallet.address.toLowerCase() === address.toLowerCase());
    },
    
    // Fetch wallet data (balance, assets, etc.)
    async fetchWalletData(walletId) {
        const wallet = this.getWalletById(walletId);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        
        try {
            // Get all balances
            const balances = await SuiAPI.getAllBalances(wallet.address);
            
            // Get owned objects (NFTs, etc.)
            const ownedObjects = await SuiAPI.getOwnedObjects(wallet.address);
            
            // Get  transactions
            const transactions = await SuiAPI.getTransactions(wallet.address);
            
            return {
                wallet,
                balances,
                ownedObjects,
                transactions
            };
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            throw error;
        }
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    WalletManager.init();
});
