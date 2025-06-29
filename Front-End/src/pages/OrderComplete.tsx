
import { CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { generatePaymentCode, confirmClientPayment } from '@/api/payments';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const OrderComplete = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentCode, setPaymentCode] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'code-generated' | 'confirmed'>('pending');
  const [orderId, setOrderId] = useState<number | null>(null);

  // Get order ID from navigation state or URL params
  useEffect(() => {
    const state = location.state as { orderId?: number };
    if (state?.orderId) {
      setOrderId(state.orderId);
    }
  }, [location.state]);

  const handleGeneratePaymentCode = async () => {
    if (!orderId) {
      toast({
        title: t('common.error'),
        description: t('order_complete.order_id_not_found'),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await generatePaymentCode(orderId);
      setPaymentCode(response.data.paymentCode);
      setPaymentStatus('code-generated');
      toast({
        title: t('common.success'),
        description: t('order_complete.code_generated_success'),
      });
    } catch (error: any) {
      console.error('Error generating payment code:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('order_complete.failed_generate_code'),
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId) {
      toast({
        title: t('common.error'),
        description: t('order_complete.order_id_not_found'),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await confirmClientPayment(orderId);
      setPaymentStatus('confirmed');
      toast({
        title: t('common.success'),
        description: t('order_complete.payment_confirmed'),
      });
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('order_complete.failed_confirm_payment'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('order_complete.title')}</h1>
          <p className="text-gray-600">
            {t('order_complete.message')}
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">{t('order_complete.order_id', { id: orderId })}</p>
          )}
        </div>

        
        <div className="space-y-3">
          <Link to="/orders" className="block">
            <Button variant="outline" className="w-full">
              {t('order_complete.view_orders')}
            </Button>
          </Link>
          <Link to="/" className="block">
            <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
              {t('order_complete.return_home')}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          {t('order_complete.secured')}
        </p>
      </div>
    </div>
  );
};

export default OrderComplete;
