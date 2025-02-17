import { jest } from '@jest/globals';
import BlockchainService from '../src/js/modules/blockchain';

describe('BlockchainService', () => {
    let blockchainService;
    let mockProvider;
    let mockSigner;
    let consoleWarnSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockProvider = {
            getBalance: jest.fn(),
            getBlockNumber: jest.fn(),
            getSigner: jest.fn().mockResolvedValue(mockSigner)
        };

        mockSigner = {
            sendTransaction: jest.fn()
        };

        global.window.ethers = {
            BrowserProvider: jest.fn(() => mockProvider),
            JsonRpcProvider: jest.fn(() => mockProvider),
            parseEther: jest.fn(val => val + '000000000000000000'),
            formatEther: jest.fn(val => val),
            isAddress: jest.fn(() => true)
        };

        global.window.ethereum = {
            request: jest.fn().mockResolvedValue([])
        };

        process.env.ALCHEMY_URL = 'https://mock-alchemy-url';

        mockProvider.getSigner.mockResolvedValue(mockSigner);

        blockchainService = new BlockchainService();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('initialization', () => {
        it('should initialize successfully with MetaMask', async () => {
            await blockchainService.initialize();

            expect(window.ethereum.request).toHaveBeenCalledWith({
                method: 'eth_requestAccounts'
            });
            expect(window.ethers.BrowserProvider).toHaveBeenCalledWith(window.ethereum);
            expect(blockchainService.provider).not.toBeNull();
            expect(blockchainService.signer).not.toBeNull();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should continue in read-only mode if signer fails', async () => {
            mockProvider.getSigner.mockRejectedValueOnce(new Error('Failed to get signer'));
            await blockchainService.initialize();
            expect(blockchainService.provider).not.toBeNull();
            expect(blockchainService.signer).toBeNull();
            expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to get signer, continuing in read-only mode');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should handle complete initialization failure', async () => {
            window.ethereum.request.mockRejectedValueOnce(new Error('User rejected'));
            await expect(blockchainService.initialize())
                .rejects
                .toThrow('Failed to initialize blockchain connection');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('getBalance', () => {
        it('should return formatted balance for valid address', async () => {
            const mockBalance = '1.5000000000000000';
            mockProvider.getBalance.mockResolvedValue(mockBalance);
            window.ethers.formatEther.mockReturnValue('1.5');

            blockchainService.provider = mockProvider;
            const balance = await blockchainService.getBalance('0x123...');

            expect(balance).toBe('1.5');
            expect(mockProvider.getBalance).toHaveBeenCalledWith('0x123...');
        });

        it('should handle getBalance failure', async () => {
            blockchainService.provider = mockProvider;
            mockProvider.getBalance.mockRejectedValue(new Error('Network error'));

            await expect(blockchainService.getBalance('0x123...'))
                .rejects
                .toThrow('Failed to get balance');
        });
    });

    describe('getBlockCount', () => {
        it('should return current block number', async () => {
            blockchainService.provider = mockProvider;
            mockProvider.getBlockNumber.mockResolvedValue(12345);

            const blockCount = await blockchainService.getBlockCount();

            expect(blockCount).toBe(12345);
            expect(mockProvider.getBlockNumber).toHaveBeenCalled();
        });

        it('should handle getBlockCount failure', async () => {
            blockchainService.provider = mockProvider;
            mockProvider.getBlockNumber.mockRejectedValue(new Error('Network error'));

            await expect(blockchainService.getBlockCount())
                .rejects
                .toThrow('Failed to get block count');
        });
    });

    describe('sendTransaction', () => {
        it('should send transaction successfully', async () => {
            const mockTx = {
                hash: '0xtxhash',
                wait: jest.fn().mockResolvedValue({})
            };
            mockSigner.sendTransaction.mockResolvedValue(mockTx);

            blockchainService.provider = mockProvider;
            blockchainService.signer = mockSigner;

            const amount = '1.0';
            const toAddress = '0xrecipient';

            const result = await blockchainService.sendTransaction(toAddress, amount);

            expect(result).toBe(mockTx);
            expect(mockSigner.sendTransaction).toHaveBeenCalledWith({
                to: toAddress,
                value: '1.0000000000000000000'
            });
        });
    });
});