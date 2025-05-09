/**
 * Main Application
 * Handles UI interactions and connects all components
 */

const App = {
    // Initialize the application
    init() {
        // Initialize components
        this.initComponents();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render wallets list
        this.renderWalletsList();
        
        console.log('App initialized');
    },
    
    // Initialize all components
    initComponents() {
        // Elements
        this.elements = {
            walletsList: document.getElementById('wallets-list'),
            emptyWallets: document.getElementById('empty-wallets'),
            addWalletBtn: document.getElementById('add-wallet-btn'),
            addWalletModal: document.getElementById('add-wallet-modal'),
            walletDetailsModal: document.getElementById('wallet-details-modal'),
            walletAddressInput: document.getElementById('wallet-address'),
            walletNameInput: document.getElementById('wallet-name'),
            scanQrBtn: document.getElementById('scan-qr-btn'),
            saveWalletBtn: document.getElementById('save-wallet-btn'),
            walletDetailTitle: document.getElementById('wallet-detail-title'),
            walletAddressDisplay: document.getElementById('wallet-address-display'),
            
            // Asset tabs and sections
            coinsTab: document.getElementById('coins-tab'),
            nftsTab: document.getElementById('nfts-tab'),
            coinsSection: document.getElementById('coins-section'),
            nftsSection: document.getElementById('nfts-section'),
            coinsList: document.getElementById('coins-list'),
            nftsList: document.getElementById('nfts-list'),
            coinsLoading: document.getElementById('coins-loading'),
            nftsLoading: document.getElementById('nfts-loading'),
            refreshAssetsBtn: document.getElementById('refresh-assets-btn'),
            
            // Transaction elements
            transactionsList: document.getElementById('transactions-list'),
            transactionsLoading: document.getElementById('transactions-loading'),
            
            removeWalletBtn: document.getElementById('remove-wallet-btn'),
            closeModalBtns: document.querySelectorAll('.close-modal')
        };
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Add wallet button
        this.elements.addWalletBtn.addEventListener('click', () => this.openAddWalletModal());
        
        // Scan QR button
        this.elements.scanQrBtn.addEventListener('click', () => this.scanQRCode());
        
        // Save wallet button
        this.elements.saveWalletBtn.addEventListener('click', () => this.saveWallet());
        
        // Remove wallet button
        this.elements.removeWalletBtn.addEventListener('click', () => this.removeWallet());
        
        // Asset tabs
        this.elements.coinsTab.addEventListener('click', () => this.switchAssetTab('coins'));
        this.elements.nftsTab.addEventListener('click', () => this.switchAssetTab('nfts'));
        
        // Refresh assets button
        this.elements.refreshAssetsBtn.addEventListener('click', () => {
            if (this.currentWalletId) {
                this.refreshAssets(this.currentWalletId);
            }
        });
        
        // Close modal buttons
        this.elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    },
    
    // Switch between asset tabs (coins/NFTs)
    switchAssetTab(tab) {
        // Update tab active states
        this.elements.coinsTab.classList.toggle('active', tab === 'coins');
        this.elements.nftsTab.classList.toggle('active', tab === 'nfts');
        
        // Update section visibility
        this.elements.coinsSection.classList.toggle('active', tab === 'coins');
        this.elements.nftsSection.classList.toggle('active', tab === 'nfts');
        
        // Haptic feedback
        TelegramApp.hapticFeedback('selection');
    },
    
    // Render the wallets list
    renderWalletsList() {
        const wallets = WalletManager.getWallets();
        const walletsList = this.elements.walletsList;
        
        // Clear the list
        while (walletsList.firstChild) {
            if (walletsList.firstChild === this.elements.emptyWallets) {
                break;
            }
            walletsList.removeChild(walletsList.firstChild);
        }
        
        // Show empty state if no wallets
        if (wallets.length === 0) {
            this.elements.emptyWallets.style.display = 'block';
            return;
        }
        
        // Hide empty state
        this.elements.emptyWallets.style.display = 'none';
        
        // Add wallet items
        wallets.forEach(wallet => {
            const walletItem = document.createElement('div');
            walletItem.className = 'wallet-item';
            walletItem.dataset.id = wallet.id;
            walletItem.dataset.address = wallet.address;
            
            walletItem.innerHTML = `
                <div class="wallet-info">
                    <h3>${wallet.name}</h3>
                    <div class="wallet-address">${SuiAPI.formatAddress(wallet.address)}</div>
                </div>
                <div class="wallet-balance">
                    <div class="loading-balance">Loading...</div>
                </div>
            `;
            
            // Add click event to open wallet details
            walletItem.addEventListener('click', () => {
                this.openWalletDetails(wallet.id);
            });
            
            // Insert at the beginning of the list
            walletsList.insertBefore(walletItem, walletsList.firstChild);
            
            // Fetch and update balance
            this.updateWalletBalance(wallet.id);
        });
    },
    
    // Update a wallet's balance in the UI
    async updateWalletBalance(walletId) {
        const wallet = WalletManager.getWalletById(walletId);
        if (!wallet) return;
        
        const walletItem = document.querySelector(`.wallet-item[data-id="${walletId}"]`);
        if (!walletItem) return;
        
        const balanceElement = walletItem.querySelector('.wallet-balance');
        
        try {
            // Get SUI balance
            const balanceData = await SuiAPI.getBalance(wallet.address);
            
            // Format and display balance
            const formattedBalance = SuiAPI.formatCoinAmount(balanceData.totalBalance);
            balanceElement.innerHTML = `${formattedBalance} SUI`;
        } catch (error) {
            console.error('Error updating wallet balance:', error);
            balanceElement.innerHTML = 'Error loading balance';
        }
    },
    
    // Open the add wallet modal
    openAddWalletModal() {
        // Reset form
        this.elements.walletAddressInput.value = '';
        this.elements.walletNameInput.value = '';
        
        // Show modal
        this.elements.addWalletModal.style.display = 'block';
        
        // Show back button
        TelegramApp.showBackButton();
        
        // Focus on address input
        setTimeout(() => {
            this.elements.walletAddressInput.focus();
        }, 100);
    },
    
    // Scan QR code for wallet address
    scanQRCode() {
        TelegramApp.scanQR((text) => {
            // Check if the scanned text is a valid Sui address
            if (SuiAPI.validateAddress(text)) {
                this.elements.walletAddressInput.value = text;
            } else {
                // Check if the text contains a Sui address
                const match = text.match(/0x[a-fA-F0-9]{64}/);
                if (match) {
                    this.elements.walletAddressInput.value = match[0];
                } else {
                    TelegramApp.showAlert('Invalid QR code. Please scan a valid Sui wallet address.');
                }
            }
        });
    },
    
    // Save a new wallet
    saveWallet() {
        const address = this.elements.walletAddressInput.value.trim();
        const name = this.elements.walletNameInput.value.trim();
        
        if (!address) {
            TelegramApp.showAlert('Please enter a wallet address');
            return;
        }
        
        try {
            // Add the wallet
            WalletManager.addWallet(address, name);
            
            // Close the modal
            this.closeModal(this.elements.addWalletModal);
            
            // Render the updated wallets list
            this.renderWalletsList();
            
            // Show success message
            TelegramApp.showAlert('Wallet added successfully');
            TelegramApp.hapticFeedback('success');
        } catch (error) {
            TelegramApp.showAlert(error.message);
            TelegramApp.hapticFeedback('error');
        }
    },
    
    // Open wallet details
    async openWalletDetails(walletId) {
        const wallet = WalletManager.getWalletById(walletId);
        if (!wallet) {
            TelegramApp.showAlert('Wallet not found');
            return;
        }
        
        // Set current wallet ID
        this.currentWalletId = walletId;
        
        // Update UI
        this.elements.walletDetailTitle.textContent = wallet.name;
        this.elements.walletAddressDisplay.textContent = wallet.address;
        
        // Reset coins list
        this.elements.coinsList.innerHTML = '';
        this.elements.coinsList.appendChild(this.elements.coinsLoading);
        this.elements.coinsLoading.style.display = 'block';
        
        // Reset NFTs list
        this.elements.nftsList.innerHTML = '';
        this.elements.nftsList.appendChild(this.elements.nftsLoading);
        this.elements.nftsLoading.style.display = 'block';
        
        // Reset transactions list
        this.elements.transactionsList.innerHTML = '';
        this.elements.transactionsList.appendChild(this.elements.transactionsLoading);
        this.elements.transactionsLoading.style.display = 'block';
        
        // Default to coins tab
        this.switchAssetTab('coins');
        
        // Show modal
        this.elements.walletDetailsModal.style.display = 'block';
        
        // Show back button
        TelegramApp.showBackButton();
        
        // Fetch wallet data
        this.fetchAndRenderWalletDetails(walletId);
    },
    
    // Refresh assets for a wallet
    async refreshAssets(walletId) {
        if (!walletId) return;
        
        // Show loading indicators
        this.elements.coinsList.innerHTML = '';
        this.elements.coinsList.appendChild(this.elements.coinsLoading);
        this.elements.coinsLoading.style.display = 'block';
        
        this.elements.nftsList.innerHTML = '';
        this.elements.nftsList.appendChild(this.elements.nftsLoading);
        this.elements.nftsLoading.style.display = 'block';
        
        // Show loading state on refresh button
        this.elements.refreshAssetsBtn.classList.add('loading');
        this.elements.refreshAssetsBtn.disabled = true;
        
        try {
            // Fetch wallet data
            const data = await WalletManager.fetchWalletData(walletId);
            
            // Render assets
            this.renderCoins(data.balances);
            this.renderNFTs(data.ownedObjects);
            
            // Haptic feedback for success
            TelegramApp.hapticFeedback('success');
        } catch (error) {
            console.error('Error refreshing assets:', error);
            TelegramApp.hapticFeedback('error');
        } finally {
            // Reset refresh button
            this.elements.refreshAssetsBtn.classList.remove('loading');
            this.elements.refreshAssetsBtn.disabled = false;
        }
    },
    
    // Fetch and render wallet details
    async fetchAndRenderWalletDetails(walletId) {
        try {
            const data = await WalletManager.fetchWalletData(walletId);
            
            // Render coins
            this.renderCoins(data.balances);
            
            // Render NFTs
            this.renderNFTs(data.ownedObjects);
            
            // Render transactions
            this.renderTransactions(data.transactions);
        } catch (error) {
            console.error('Error fetching wallet details:', error);
            
            // Show error messages
            this.elements.coinsLoading.textContent = 'Error loading coins';
            this.elements.nftsLoading.textContent = 'Error loading NFTs';
            this.elements.transactionsLoading.textContent = 'Error loading transactions';
            
            TelegramApp.hapticFeedback('error');
        }
    },
    
    // Render coins
    renderCoins(balances) {
        const coinsList = this.elements.coinsList;
        
        // Hide loading indicator
        this.elements.coinsLoading.style.display = 'none';
        
        // Clear previous content
        while (coinsList.firstChild) {
            if (coinsList.firstChild === this.elements.coinsLoading) {
                break;
            }
            coinsList.removeChild(coinsList.firstChild);
        }
        
        // If no coins, show message
        if (balances.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.textContent = 'No coins found in this wallet';
            coinsList.appendChild(emptyMessage);
            return;
        }
        
        // Add coins
        balances.forEach(coin => {
            const assetItem = document.createElement('div');
            assetItem.className = 'asset-item';
            
            // Get coin symbol and metadata
            let coinSymbol = 'Unknown';
            let coinName = '';
            let formattedBalance = SuiAPI.formatCoinAmount(coin.totalBalance);
            let valueInUsd = '';
            
            // Use metadata if available
            if (coin.metadata) {
                coinSymbol = coin.metadata.symbol;
                coinName = coin.metadata.name;
                formattedBalance = SuiAPI.formatCoinAmount(coin.totalBalance, coin.metadata.decimals);
                
                // Calculate USD value if price is available
                if (coin.metadata.price) {
                    const balanceNum = parseFloat(formattedBalance);
                    const priceNum = parseFloat(coin.metadata.price);
                    const usdValue = balanceNum * priceNum;
                    valueInUsd = `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            } else {
                // Extract symbol from coin type if no metadata
                const coinParts = coin.coinType.split('::');
                coinSymbol = coinParts[coinParts.length - 1];
            }
            
            // Create HTML for coin item
            let coinHtml = `
                <div class="asset-info">
                    <h4>${coinSymbol}</h4>
                    <div class="asset-type">${coinName || coin.coinType}</div>
                </div>
                <div class="asset-value-container">
                    <div class="asset-balance">${formattedBalance} ${coinSymbol}</div>
            `;
            
            // Add USD value if available
            if (valueInUsd) {
                coinHtml += `<div class="asset-value">${valueInUsd}</div>`;
            }
            
            coinHtml += `</div>`;
            
            assetItem.innerHTML = coinHtml;
            coinsList.appendChild(assetItem);
        });
    },
    
    // Render NFTs
    renderNFTs(ownedObjects) {
        const nftsList = this.elements.nftsList;
        
        // Hide loading indicator
        this.elements.nftsLoading.style.display = 'none';
        
        // Clear previous content
        while (nftsList.firstChild) {
            if (nftsList.firstChild === this.elements.nftsLoading) {
                break;
            }
            nftsList.removeChild(nftsList.firstChild);
        }
        
        // Filter out coins and system objects to get only NFTs
        const nfts = ownedObjects.data.filter(obj => {
            return !obj.data.type.includes('0x2::coin::Coin');
        });
        
        // If no NFTs, show message
        if (nfts.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.textContent = 'No NFTs found in this wallet';
            nftsList.appendChild(emptyMessage);
            return;
        }
        
        // Add NFTs
        nfts.forEach(nft => {
            const nftItem = document.createElement('div');
            nftItem.className = 'nft-item';
            
            // Get NFT data
            let nftName = 'Unnamed NFT';
            let nftCollection = '';
            let imageUrl = '';
            
            // Try to get display data
            if (nft.data.display && nft.data.display.data) {
                const displayData = nft.data.display.data;
                nftName = displayData.name || nftName;
                nftCollection = displayData.creator || '';
                imageUrl = displayData.image_url || '';
            }
            
            // Try to get data from content if available
            if (nft.data.content && nft.data.content.fields) {
                const fields = nft.data.content.fields;
                nftName = fields.name || nftName;
                imageUrl = fields.url || imageUrl;
                
                // Get collection name from type if not available
                if (!nftCollection) {
                    const typeParts = nft.data.type.split('::');
                    if (typeParts.length >= 2) {
                        nftCollection = typeParts[1];
                    }
                }
            }
            
            // Create HTML for NFT item
            nftItem.innerHTML = `
                <div class="nft-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${nftName}" onerror="this.onerror=null; this.src=''; this.parentNode.innerHTML='NFT';">` : 'NFT'}
                </div>
                <div class="nft-name">${nftName}</div>
                <div class="nft-collection">${nftCollection}</div>
            `;
            
            // Add click event to show NFT details
            nftItem.addEventListener('click', () => {
                this.showNFTDetails(nft);
            });
            
            nftsList.appendChild(nftItem);
        });
    },
    
    // Show NFT details in a popup
    showNFTDetails(nft) {
        // Get NFT data
        let nftName = 'Unnamed NFT';
        let nftDescription = '';
        let imageUrl = '';
        let attributes = [];
        let objectId = nft.data.objectId;
        
        // Try to get display data
        if (nft.data.display && nft.data.display.data) {
            const displayData = nft.data.display.data;
            nftName = displayData.name || nftName;
            nftDescription = displayData.description || '';
            imageUrl = displayData.image_url || '';
        }
        
        // Try to get data from content if available
        if (nft.data.content && nft.data.content.fields) {
            const fields = nft.data.content.fields;
            nftName = fields.name || nftName;
            nftDescription = fields.description || nftDescription;
            imageUrl = fields.url || imageUrl;
            attributes = fields.attributes || [];
        }
        
        // Create attributes HTML
        let attributesHtml = '';
        if (attributes.length > 0) {
            attributesHtml = '<div class="nft-attributes"><h4>Attributes</h4><ul>';
            attributes.forEach(attr => {
                attributesHtml += `<li><strong>${attr.trait_type}:</strong> ${attr.value}</li>`;
            });
            attributesHtml += '</ul></div>';
        }
        
        // Show NFT details in a popup
        TelegramApp.showPopup(
            nftName,
            `
            ${imageUrl ? `<img src="${imageUrl}" alt="${nftName}" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;">` : ''}
            <p>${nftDescription}</p>
            <p><strong>Object ID:</strong> ${objectId}</p>
            ${attributesHtml}
            `,
            [
                {type: 'default', text: 'Close'},
                {type: 'default', text: 'View in Explorer', url: `https://explorer.sui.io/object/${objectId}`}
            ]
        );
    },
    
    // Render transactions
    renderTransactions(transactions) {
        const transactionsList = this.elements.transactionsList;
        
        // Hide loading indicator
        this.elements.transactionsLoading.style.display = 'none';
        
        // Clear previous content
        while (transactionsList.firstChild) {
            if (transactionsList.firstChild === this.elements.transactionsLoading) {
                break;
            }
            transactionsList.removeChild(transactionsList.firstChild);
        }
        
        // If no transactions, show message
        if (transactions.data.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.textContent = 'No transactions found for this wallet';
            transactionsList.appendChild(emptyMessage);
            return;
        }
        
        // Add transactions
        transactions.data.forEach(tx => {
            const txItem = document.createElement('div');
            txItem.className = 'transaction-item';
            
            // Format timestamp
            const timestamp = new Date(tx.timestampMs).toLocaleString();
            
            // Determine transaction type
            let txType = 'Transaction';
            if (tx.effects && tx.effects.events) {
                // Check for common event types
                const events = tx.effects.events;
                if (events.some(e => e.type.includes('CoinBalanceChange'))) {
                    txType = 'Transfer';
                } else if (events.some(e => e.type.includes('MoveEvent'))) {
                    txType = 'Contract Call';
                }
            }
            
            txItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-type">${txType}</div>
                    <div class="transaction-time">${timestamp}</div>
                </div>
                <div class="transaction-hash">${SuiAPI.formatAddress(tx.digest)}</div>
            `;
            
            // Add click event to open transaction in explorer
            txItem.addEventListener('click', () => {
                window.open(`https://explorer.sui.io/txblock/${tx.digest}`, '_blank');
            });
            
            transactionsList.appendChild(txItem);
        });
    },
    
    // Remove the current wallet
    removeWallet() {
        if (!this.currentWalletId) return;
        
        const wallet = WalletManager.getWalletById(this.currentWalletId);
        if (!wallet) return;
        
        TelegramApp.showConfirm(`Are you sure you want to remove ${wallet.name}?`, (confirmed) => {
            if (confirmed) {
                // Remove the wallet
                WalletManager.removeWallet(this.currentWalletId);
                
                // Close the modal
                this.closeModal(this.elements.walletDetailsModal);
                
                // Render the updated wallets list
                this.renderWalletsList();
                
                // Reset current wallet ID
                this.currentWalletId = null;
                
                // Show success message
                TelegramApp.showAlert('Wallet removed successfully');
                TelegramApp.hapticFeedback('success');
            }
        });
    },
    
    // Close a modal
    closeModal(modal) {
        modal.style.display = 'none';
        TelegramApp.hideBackButton();
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
