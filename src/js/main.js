import BlockchainService from './modules/blockchain.js';
import UIService from './modules/ui.js';
import { validateInput, formatError } from './modules/utils.js';

class App {
    constructor() {
        this.blockchain = new BlockchainService();
        this.ui = new UIService();
        this.initializeApp();
    }

    async initializeApp() {
        this.ui.connectWalletBtn.addEventListener('click', () => this.connectWallet());
        await this.checkConnection();
        this.initializeEventListeners();
    }

    async connectWallet() {
        try {
            this.ui.showLoading();
            const address = await this.blockchain.connect();
            this.ui.updateConnectionStatus(true, address);
            this.ui.showNotification('Wallet connected successfully!');
        } catch (error) {
            this.ui.showNotification(formatError(error), 'error');
            this.ui.updateConnectionStatus(false);
        } finally {
            this.ui.hideLoading();
        }
    }

    async checkConnection() {
        const { isConnected, address } = this.blockchain.checkConnection();
        this.ui.updateConnectionStatus(isConnected, address);
    }

    initializeEventListeners() {
        this.ui.checkBalanceBtn.addEventListener('click', async () => {
            const { addressInput } = this.ui.getInputValues();

            const validationError = validateInput.address(addressInput);
            if (validationError) {
                this.ui.showNotification(validationError, 'error');
                return;
            }

            try {
                this.ui.showLoading();
                const balance = await this.blockchain.getBalance(addressInput);
                this.ui.updateBalance(balance);
            } catch (error) {
                this.ui.showNotification(formatError(error), 'error');
            } finally {
                this.ui.hideLoading();
            }
        });

        document.getElementById('transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const { toAddress, amount } = this.ui.getInputValues();

            const addressError = validateInput.address(toAddress);
            const amountError = validateInput.amount(amount);

            if (addressError) {
                this.ui.showNotification(addressError, 'error');
                return;
            }
            if (amountError) {
                this.ui.showNotification(amountError, 'error');
                return;
            }

            try {
                this.ui.showLoading();
                this.ui.updateTransactionStatus('Pending...');

                const tx = await this.blockchain.sendTransaction(toAddress, amount);
                this.ui.updateTransactionStatus('Confirming...', tx.hash);

                await tx.wait();
                this.ui.updateTransactionStatus('Confirmed', tx.hash);
                this.ui.showNotification('Transaction successful!');
                this.ui.resetForm();
            } catch (error) {
                this.ui.updateTransactionStatus('Failed');
                this.ui.showNotification(formatError(error), 'error');
            } finally {
                this.ui.hideLoading();
            }
        });

        this.ui.blockCountBtn.addEventListener('click', async () => {
            try {
                this.ui.showLoading();
                const blockCount = await this.blockchain.getBlockCount();
                this.ui.updateBlockCount(blockCount);
            } catch (error) {
                this.ui.showNotification(formatError(error), 'error');
            } finally {
                this.ui.hideLoading();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});