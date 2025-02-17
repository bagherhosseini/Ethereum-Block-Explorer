export const validateInput = {
    address: (address) => {
        if (!address) return 'Address is required';
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return 'Invalid Ethereum address format';
        }
        return null;
    },

    amount: (amount) => {
        if (!amount) return 'Amount is required';
        if (isNaN(amount) || amount <= 0) {
            return 'Amount must be a positive number';
        }
        return null;
    }
};

export const formatError = (error) => {
    if (error.code === 'ACTION_REJECTED') {
        return 'Transaction rejected by user';
    }
    return error.message.split('(')[0].trim();
};