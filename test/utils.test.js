import { validateInput, formatError } from '../src/js/modules/utils';

describe('validateInput', () => {
    describe('address validation', () => {
        it('should validate correct Ethereum address', () => {
            const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
            expect(validateInput.address(address)).toBeNull();
        });

        it('should reject empty address', () => {
            expect(validateInput.address('')).toBe('Address is required');
        });

        it('should reject invalid address format', () => {
            expect(validateInput.address('invalid')).toBe('Invalid Ethereum address format');
            expect(validateInput.address('0x123')).toBe('Invalid Ethereum address format');
        });
    });

    describe('amount validation', () => {
        it('should validate correct amount', () => {
            expect(validateInput.amount('1.5')).toBeNull();
            expect(validateInput.amount('0.001')).toBeNull();
        });

        it('should reject empty amount', () => {
            expect(validateInput.amount('')).toBe('Amount is required');
        });

        it('should reject invalid amounts', () => {
            expect(validateInput.amount('0')).toBe('Amount must be a positive number');
            expect(validateInput.amount('-1')).toBe('Amount must be a positive number');
            expect(validateInput.amount('abc')).toBe('Amount must be a positive number');
        });
    });
});

describe('formatError', () => {
    it('should format user rejection error', () => {
        const error = { code: 'ACTION_REJECTED', message: 'User rejected transaction' };
        expect(formatError(error)).toBe('Transaction rejected by user');
    });

    it('should format general error', () => {
        const error = { message: 'Network error (connection timeout)' };
        expect(formatError(error)).toBe('Network error');
    });
});