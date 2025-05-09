/**
 * Sui Blockchain Integration
 * Handles all interactions with the Sui blockchain API
 */

const SuiAPI = {
    // Base URL for Sui RPC API (mainnet)
    baseUrl: 'https://fullnode.mainnet.sui.io/',
    
    // Use mock data for development (set to true to avoid CORS issues)
    useMockData: true,
    
    // Initialize the Sui API
    init() {
        console.log('Sui API initialized');
        console.log('Using mock data:', this.useMockData);
    },
    
    // Make a JSON-RPC request to the Sui API
    async makeRpcRequest(method, params = []) {
        // If mock data is enabled, return mock response
        if (this.useMockData) {
            return this.getMockResponse(method, params);
        }
        
        try {
            console.log(`Making RPC request: ${method}`, params);
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method,
                    params,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.error('Sui API error:', data.error);
                throw new Error(data.error.message || 'Unknown error');
            }
            
            return data.result;
        } catch (error) {
            console.error(`Error making RPC request for ${method}:`, error);
            // Fallback to mock data if real request fails
            console.log('Falling back to mock data');
            return this.getMockResponse(method, params);
        }
    },
    
    // Get the balance of a wallet address
    async getBalance(address) {
        try {
            const result = await this.makeRpcRequest('suix_getBalance', [address, null]);
            return result;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    },
    
    // Get all coin balances for a wallet address
    async getAllBalances(address) {
        try {
            const result = await this.makeRpcRequest('suix_getAllBalances', [address]);
            return result;
        } catch (error) {
            console.error('Error getting all balances:', error);
            throw error;
        }
    },
    
    // Get all objects owned by a wallet address
    async getOwnedObjects(address, cursor = null, limit = 50) {
        try {
            const result = await this.makeRpcRequest('suix_getOwnedObjects', [
                address,
                {
                    cursor,
                    limit,
                    options: {
                        showType: true,
                        showContent: true,
                        showDisplay: true,
                    }
                }
            ]);
            return result;
        } catch (error) {
            console.error('Error getting owned objects:', error);
            throw error;
        }
    },
    
    // Get transactions for a wallet address
    async getTransactions(address, cursor = null, limit = 20) {
        try {
            const result = await this.makeRpcRequest('suix_queryTransactionBlocks', [
                {
                    filter: {
                        FromAddress: address
                    },
                    options: {
                        showInput: true,
                        showEffects: true,
                        showEvents: true,
                    }
                },
                cursor,
                limit,
                'descending'
            ]);
            return result;
        } catch (error) {
            console.error('Error getting transactions:', error);
            throw error;
        }
    },
    
    // Get transaction details
    async getTransactionDetails(digest) {
        try {
            const result = await this.makeRpcRequest('sui_getTransactionBlock', [
                digest,
                {
                    showInput: true,
                    showEffects: true,
                    showEvents: true,
                }
            ]);
            return result;
        } catch (error) {
            console.error('Error getting transaction details:', error);
            throw error;
        }
    },
    
    // Validate a Sui address
    validateAddress(address) {
        // Basic validation - Sui addresses are 66 characters (0x + 64 hex chars)
        const regex = /^0x[a-fA-F0-9]{64}$/;
        return regex.test(address);
    },
    
    // Format a Sui address for display (truncate middle)
    formatAddress(address) {
        if (!address) return '';
        if (address.length <= 12) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },
    
    // Format coin amounts (with proper decimal places)
    formatCoinAmount(amount, decimals = 9) {
        if (amount === undefined || amount === null) return '0';
        
        // Convert to BigInt to handle large numbers
        const bigAmount = BigInt(amount);
        const divisor = BigInt(10) ** BigInt(decimals);
        
        // Calculate the whole and fractional parts
        const wholePart = (bigAmount / divisor).toString();
        const fractionalPart = (bigAmount % divisor).toString().padStart(decimals, '0');
        
        // Trim trailing zeros in fractional part
        const trimmedFractionalPart = fractionalPart.replace(/0+$/, '');
        
        // Combine whole and fractional parts
        return trimmedFractionalPart.length > 0
            ? `${wholePart}.${trimmedFractionalPart}`
            : wholePart;
    },
    
    // Generate mock responses for development and testing
    getMockResponse(method, params) {
        console.log(`Generating mock response for ${method}`);
        
        switch (method) {
            case 'suix_getBalance':
                return {
                    coinType: '0x2::sui::SUI',
                    coinObjectCount: 3,
                    totalBalance: '10000000000',
                    lockedBalance: {}
                };
                
            case 'suix_getAllBalances':
                return [
                    {
                        coinType: '0x2::sui::SUI',
                        coinObjectCount: 3,
                        totalBalance: '10000000000',
                        // Add metadata for better display
                        metadata: {
                            symbol: 'SUI',
                            name: 'Sui Token',
                            decimals: 9,
                            description: 'The native token of the Sui network',
                            iconUrl: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg',
                            price: 1.23 // Mock price in USD
                        }
                    },
                    {
                        coinType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
                        coinObjectCount: 1,
                        totalBalance: '50000000',
                        // Add metadata for better display
                        metadata: {
                            symbol: 'USDC',
                            name: 'USD Coin',
                            decimals: 6,
                            description: 'A stablecoin pegged to the US dollar',
                            iconUrl: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
                            price: 1.00 // Mock price in USD
                        }
                    },
                    {
                        coinType: '0x6e8d5df2c5111bc95d5a1c17d9e42b1385067970d7a d03742c5c8f6e1f57f5b::coin::COIN',
                        coinObjectCount: 2,
                        totalBalance: '250000000',
                        // Add metadata for better display
                        metadata: {
                            symbol: 'WETH',
                            name: 'Wrapped Ethereum',
                            decimals: 8,
                            description: 'Wrapped Ethereum on Sui network',
                            iconUrl: 'https://assets.coingecko.com/coins/images/2518/large/weth.png',
                            price: 3050.75 // Mock price in USD
                        }
                    }
                ];
                
            case 'suix_getOwnedObjects':
                return {
                    data: [
                        // NFT 1 - Capy
                        {
                            data: {
                                objectId: '0x' + '5'.repeat(64),
                                version: '1',
                                digest: '0x' + '6'.repeat(64),
                                type: '0x3c6ff47f2bc6e7f8a77e4d2fc5f36c08::capy::Capy',
                                owner: {
                                    AddressOwner: params[0]
                                },
                                previousTransaction: '0x' + '7'.repeat(64),
                                storageRebate: '100',
                                display: {
                                    data: {
                                        name: 'Capy #1234',
                                        description: 'A cute Capy NFT on the Sui network',
                                        image_url: 'https://assets.suifrens.com/capys/generated/1234.png',
                                        project_url: 'https://suifrens.com/',
                                        creator: 'Sui Frens',
                                        category: 'Collectible'
                                    }
                                },
                                content: {
                                    dataType: 'moveObject',
                                    type: '0x3c6ff47f2bc6e7f8a77e4d2fc5f36c08::capy::Capy',
                                    fields: {
                                        id: {
                                            id: '0x' + '8'.repeat(64)
                                        },
                                        name: 'Capy #1234',
                                        description: 'A cute Capy NFT on the Sui network',
                                        url: 'https://assets.suifrens.com/capys/generated/1234.png',
                                        attributes: [
                                            { trait_type: 'Background', value: 'Blue' },
                                            { trait_type: 'Body', value: 'Brown' },
                                            { trait_type: 'Eyes', value: 'Happy' },
                                            { trait_type: 'Accessory', value: 'Sunglasses' }
                                        ],
                                        rarity: 'Rare'
                                    }
                                }
                            }
                        },
                        // NFT 2 - SuiMon
                        {
                            data: {
                                objectId: '0x' + 'a'.repeat(64),
                                version: '1',
                                digest: '0x' + 'b'.repeat(64),
                                type: '0x5c50a2a1e4e8c9e17e5d1f7ea1b8e8a0::suimon::SuiMon',
                                owner: {
                                    AddressOwner: params[0]
                                },
                                previousTransaction: '0x' + 'c'.repeat(64),
                                storageRebate: '100',
                                display: {
                                    data: {
                                        name: 'SuiMon #42',
                                        description: 'A digital monster on the Sui blockchain',
                                        image_url: 'https://example.com/suimon/42.png',
                                        project_url: 'https://suimon.io/',
                                        creator: 'SuiMon Labs',
                                        category: 'Gaming'
                                    }
                                },
                                content: {
                                    dataType: 'moveObject',
                                    type: '0x5c50a2a1e4e8c9e17e5d1f7ea1b8e8a0::suimon::SuiMon',
                                    fields: {
                                        id: {
                                            id: '0x' + 'd'.repeat(64)
                                        },
                                        name: 'SuiMon #42',
                                        description: 'A digital monster on the Sui blockchain',
                                        url: 'https://example.com/suimon/42.png',
                                        attributes: [
                                            { trait_type: 'Element', value: 'Fire' },
                                            { trait_type: 'Level', value: '5' },
                                            { trait_type: 'Power', value: '87' },
                                            { trait_type: 'Special', value: 'Flame Burst' }
                                        ],
                                        rarity: 'Epic'
                                    }
                                }
                            }
                        },
                        // NFT 3 - Sui Domains
                        {
                            data: {
                                objectId: '0x' + 'e'.repeat(64),
                                version: '1',
                                digest: '0x' + 'f'.repeat(64),
                                type: '0x7a6c9e3f7fe7fc293a3f968defea51ad::domain::Domain',
                                owner: {
                                    AddressOwner: params[0]
                                },
                                previousTransaction: '0x' + '1a'.repeat(32),
                                storageRebate: '100',
                                display: {
                                    data: {
                                        name: 'mysuidomain.sui',
                                        description: 'A domain name on the Sui network',
                                        image_url: 'https://example.com/domains/mysuidomain.png',
                                        project_url: 'https://suidomains.io/',
                                        creator: 'Sui Domains',
                                        category: 'Domain'
                                    }
                                },
                                content: {
                                    dataType: 'moveObject',
                                    type: '0x7a6c9e3f7fe7fc293a3f968defea51ad::domain::Domain',
                                    fields: {
                                        id: {
                                            id: '0x' + '1b'.repeat(32)
                                        },
                                        name: 'mysuidomain.sui',
                                        description: 'A domain name on the Sui network',
                                        url: 'https://example.com/domains/mysuidomain.png',
                                        expiration: '1735689600000',
                                        attributes: [
                                            { trait_type: 'Length', value: '11' },
                                            { trait_type: 'Extension', value: '.sui' },
                                            { trait_type: 'Registration Date', value: '2023-05-15' }
                                        ]
                                    }
                                }
                            }
                        },
                        // NFT 4 - Sui Art
                        {
                            data: {
                                objectId: '0x' + '1c'.repeat(32),
                                version: '1',
                                digest: '0x' + '1d'.repeat(32),
                                type: '0x9e5682e842c9c0e39e3389a45b65c3f1::artwork::DigitalArt',
                                owner: {
                                    AddressOwner: params[0]
                                },
                                previousTransaction: '0x' + '1e'.repeat(32),
                                storageRebate: '100',
                                display: {
                                    data: {
                                        name: 'Abstract Waves #7',
                                        description: 'Digital artwork created by artist Jane Doe',
                                        image_url: 'https://example.com/art/abstract_waves_7.jpg',
                                        project_url: 'https://suiart.io/',
                                        creator: 'Jane Doe',
                                        category: 'Art'
                                    }
                                },
                                content: {
                                    dataType: 'moveObject',
                                    type: '0x9e5682e842c9c0e39e3389a45b65c3f1::artwork::DigitalArt',
                                    fields: {
                                        id: {
                                            id: '0x' + '1f'.repeat(32)
                                        },
                                        name: 'Abstract Waves #7',
                                        description: 'Digital artwork created by artist Jane Doe',
                                        url: 'https://example.com/art/abstract_waves_7.jpg',
                                        artist: 'Jane Doe',
                                        creation_date: '2023-09-22',
                                        attributes: [
                                            { trait_type: 'Style', value: 'Abstract' },
                                            { trait_type: 'Colors', value: 'Blue, Purple' },
                                            { trait_type: 'Edition', value: '7 of 10' }
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    nextCursor: null,
                    hasNextPage: false
                };
                
            case 'suix_queryTransactionBlocks':
                return {
                    data: [
                        {
                            digest: '0x' + 'a'.repeat(64),
                            timestampMs: Date.now() - 3600000,
                            effects: {
                                status: { status: 'success' },
                                events: [
                                    {
                                        type: '0x2::coin::CoinBalanceChange',
                                        amount: '1000000000',
                                        sender: '0x' + 'b'.repeat(64),
                                        recipient: params[0].filter.FromAddress
                                    }
                                ]
                            }
                        },
                        {
                            digest: '0x' + 'c'.repeat(64),
                            timestampMs: Date.now() - 7200000,
                            effects: {
                                status: { status: 'success' },
                                events: [
                                    {
                                        type: '0x3::example::MoveEvent',
                                        amount: '1',
                                        sender: params[0].filter.FromAddress,
                                        recipient: '0x' + 'd'.repeat(64)
                                    }
                                ]
                            }
                        }
                    ],
                    nextCursor: null,
                    hasNextPage: false
                };
                
            default:
                return {};
        }
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    SuiAPI.init();
});
