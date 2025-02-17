import { jest } from '@jest/globals';
import UIService from '../src/js/modules/ui';

describe('UIService', () => {
    let uiService;

    beforeEach(() => {
        document.body.innerHTML = `
            <input id="address-input" />
            <input id="to-address" />
            <input id="amount" />
            <button id="check-balance-btn">Check Balance</button>
            <button id="send-transaction-btn">Send Transaction</button>
            <button id="block-count-btn">Get Block Count</button>
            <span id="eth-balance">-</span>
            <span id="block-count">-</span>
            <span id="transaction-status">-</span>
            <span id="transaction-hash">-</span>
            <div id="notification" class="hidden">
                <span id="notification-message"></span>
                <button id="notification-close">×</button>
            </div>
            <div id="loading-overlay" class="hidden"></div>
        `;

        uiService = new UIService();
    });

    describe('updateBalance', () => {
        it('should update balance display', () => {
            uiService.updateBalance('1.5');
            expect(uiService.balanceDisplay.textContent).toBe('1.5');
        });
    });

    describe('updateBlockCount', () => {
        it('should update block count display', () => {
            uiService.updateBlockCount(12345);
            expect(uiService.blockCountDisplay.textContent).toBe('12345');
        });
    });

    describe('updateTransactionStatus', () => {
        it('should update transaction status without hash', () => {
            uiService.updateTransactionStatus('Pending');
            expect(uiService.transactionStatus.textContent).toBe('Pending');
            expect(uiService.transactionHash.textContent).toBe('-');
        });
    });

    describe('notification system', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should show and auto-hide notification', () => {
            uiService.showNotification('Test message', 'success');

            expect(uiService.notification.className).toContain('success');
            expect(uiService.notificationMessage.textContent).toBe('Test message');

            jest.advanceTimersByTime(5000);
            expect(uiService.notification.className).toContain('hidden');
        });

        it('should manually hide notification', () => {
            uiService.showNotification('Test message');
            uiService.hideNotification();
            expect(uiService.notification.className).toContain('hidden');
        });
    });

    describe('loading overlay', () => {
        it('should show loading overlay', () => {
            uiService.showLoading();
            expect(uiService.loadingOverlay.classList.contains('hidden')).toBe(false);
        });

        it('should hide loading overlay', () => {
            uiService.hideLoading();
            expect(uiService.loadingOverlay.classList.contains('hidden')).toBe(true);
        });
    });

    describe('form handling', () => {
        it('should reset form', () => {
            uiService.toAddressInput.value = '0x123';
            uiService.amountInput.value = '1.5';
            uiService.transactionStatus.textContent = 'Confirmed';
            uiService.transactionHash.textContent = '0xtxhash';

            uiService.resetForm();

            expect(uiService.toAddressInput.value).toBe('');
            expect(uiService.amountInput.value).toBe('');
            expect(uiService.transactionStatus.textContent).toBe('-');
            expect(uiService.transactionHash.textContent).toBe('-');
        });

        it('should get input values', () => {
            uiService.addressInput.value = '0x123';
            uiService.toAddressInput.value = '0x456';
            uiService.amountInput.value = '1.5';

            const values = uiService.getInputValues();

            expect(values).toEqual({
                addressInput: '0x123',
                toAddress: '0x456',
                amount: '1.5'
            });
        });
    });
});