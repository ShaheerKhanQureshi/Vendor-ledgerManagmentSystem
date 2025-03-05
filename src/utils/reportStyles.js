




export const reportFonts = {
  primary: 'SF Pro Display',
  secondary: 'SF Pro Text',
  fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif',
};
export const reportColors = {
  primary: '#221F26',
  secondary: '#8E9196',
  header: '#F1F0FB',
  zebra: '#F8F8FC',
  border: '#E2E2E7',
  highlight: '#9b87f5'
};

export const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-PKR', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    return `Rs${parseFloat(amount).toFixed(2)}`;
  }
};
