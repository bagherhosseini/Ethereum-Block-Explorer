// src/js/modules/ui.js
class UIService {
    constructor() {
        // Input elements
        this.addressInput = document.getElementById('address-input');
        this.toAddressInput = document.getElementById('to-address');
        this.amountInput = document.getElementById('amount');

        // Button elements
        this.checkBalanceBtn = document.getElementById('check-balance-btn');
        this.sendTransactionBtn = document.getElementById('send-transaction-btn');
        this.blockCountBtn = document.getElementById('block-count-btn');
        this.connectWalletBtn = document.getElementById('connect-wallet-btn');

        // Display elements
        this.balanceDisplay = document.getElementById('eth-balance');
        this.blockCountDisplay = document.getElementById('block-count');
        this.transactionStatus = document.getElementById('transaction-status');
        this.transactionHash = document.getElementById('transaction-hash');
        this.notification = document.getElementById('notification');
        this.notificationMessage = document.getElementById('notification-message');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.mainContent = document.getElementById('main-content');

        // Initialize close button for notifications
        document.getElementById('notification-close').addEventListener('click',
            () => this.hideNotification());
    }

    updateBalance(balance) {
        this.balanceDisplay.textContent = balance;
    }

    updateBlockCount(count) {
        this.blockCountDisplay.textContent = count;
    }

    updateTransactionStatus(status, hash = '') {
        this.transactionStatus.textContent = status;
        if (hash) {
            this.transactionHash.textContent = hash;
            this.transactionHash.href = `https://sepolia.etherscan.io/tx/${hash}`;
        }
    }

    showNotification(message, type = 'success') {
        this.notificationMessage.textContent = message;
        this.notification.className = `notification ${type}`;
        setTimeout(() => this.hideNotification(), 5000);
    }

    hideNotification() {
        this.notification.className = 'notification hidden';
    }

    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    resetForm() {
        this.toAddressInput.value = '';
        this.amountInput.value = '';
        this.transactionStatus.textContent = '-';
        this.transactionHash.textContent = '-';
    }

    getInputValues() {
        return {
            addressInput: this.addressInput.value,
            toAddress: this.toAddressInput.value,
            amount: this.amountInput.value
        };
    }

    updateConnectionStatus(isConnected, address = '') {
        if (isConnected) {
            this.mainContent.classList.remove('disconnected');
            this.connectWalletBtn.textContent = address.slice(0, 6) + '...' + address.slice(-4);
            this.connectWalletBtn.classList.add('connected');
        } else {
            this.mainContent.classList.add('disconnected');
            this.connectWalletBtn.textContent = 'Connect Wallet';
            this.connectWalletBtn.classList.remove('connected');
        }
    }
}

export default UIService;