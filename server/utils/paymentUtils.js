export const generatePaymentCode = () => {
  return 'JMO-' + Math.floor(100000 + Math.random() * 900000);
};
