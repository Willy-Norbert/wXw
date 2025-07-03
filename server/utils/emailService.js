
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPaymentReceivedEmail = async ({ 
  customerEmail, 
  customerName, 
  orderNumber, 
  totalPrice, 
  items, 
  shippingAddress,
  paymentMethod 
}) => {
  const itemsList = items.map(item => 
    `• ${item.product.name} - Qty: ${item.quantity} - ${(item.price * item.quantity).toLocaleString()} Rwf`
  ).join('\n');

  const formatAddress = (address) => {
    if (typeof address === 'object' && address !== null) {
      const { street, city, district, sector } = address;
      return [street, city, district, sector].filter(Boolean).join(', ');
    }
    return String(address);
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Payment Received - Order #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #28a745; margin: 0;">✅ Payment Received!</h2>
          <p style="margin: 10px 0 0 0; color: #666;">Order #${orderNumber}</p>
        </div>
        
        <p>Dear ${customerName},</p>
        
        <p>Great news! We have received your payment for order #${orderNumber}.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> ${totalPrice.toLocaleString()} Rwf</p>
          <p><strong>Payment Method:</strong> ${paymentMethod === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : 
                                                  paymentMethod === 'MTN' ? 'MTN Mobile Money' : paymentMethod}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Items Ordered:</h3>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${itemsList}</pre>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Shipping Address:</h3>
          <p style="margin: 0;">${formatAddress(shippingAddress)}</p>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;"><strong>Next Steps:</strong></p>
          <p style="margin: 5px 0 0 0; color: #155724;">Your order is now being processed and will be prepared for delivery. You'll receive another email once your order has been shipped.</p>
        </div>
        
        <p>Thank you for your business!</p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; color: #666; font-size: 12px;">
          <p>If you have any questions about your order, please contact our customer service team.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendDeliveryConfirmationEmail = async ({ 
  customerEmail, 
  customerName, 
  orderNumber, 
  totalPrice, 
  items, 
  shippingAddress 
}) => {
  const itemsList = items.map(item => 
    `• ${item.product.name} - Qty: ${item.quantity} - ${(item.price * item.quantity).toLocaleString()} Rwf`
  ).join('\n');

  const formatAddress = (address) => {
    if (typeof address === 'object' && address !== null) {
      const { street, city, district, sector } = address;
      return [street, city, district, sector].filter(Boolean).join(', ');
    }
    return String(address);
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Delivered - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #28a745; margin: 0;">🚚 Order Delivered!</h2>
          <p style="margin: 10px 0 0 0; color: #666;">Order #${orderNumber}</p>
        </div>
        
        <p>Dear ${customerName},</p>
        
        <p>Great news! Your order #${orderNumber} has been successfully delivered.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> ${totalPrice.toLocaleString()} Rwf</p>
          <p><strong>Delivery Address:</strong> ${formatAddress(shippingAddress)}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Items Delivered:</h3>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${itemsList}</pre>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;"><strong>Thank you for your purchase!</strong></p>
          <p style="margin: 5px 0 0 0; color: #155724;">We hope you're satisfied with your order. If you have any questions or concerns, please don't hesitate to contact us.</p>
        </div>
        
        <p>We appreciate your business and look forward to serving you again!</p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; color: #666; font-size: 12px;">
          <p>If you have any questions about your delivered order, please contact our customer service team.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPaymentConfirmationEmail = async ({ 
  customerEmail, 
  customerName, 
  orderNumber, 
  totalPrice, 
  items, 
  shippingAddress,
  paymentCode 
}) => {
  const itemsList = items.map(item => 
    `• ${item.product.name} - Qty: ${item.quantity} - ${(item.price * item.quantity).toLocaleString()} Rwf`
  ).join('\n');

  const formatAddress = (address) => {
    if (typeof address === 'object' && address !== null) {
      const { street, city, district, sector } = address;
      return [street, city, district, sector].filter(Boolean).join(', ');
    }
    return String(address);
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Confirmed - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #007bff; margin: 0;">Order Confirmed!</h2>
          <p style="margin: 10px 0 0 0; color: #666;">Order #${orderNumber}</p>
        </div>
        
        <p>Dear ${customerName},</p>
        
        <p>Your order has been confirmed and is being processed.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> ${totalPrice.toLocaleString()} Rwf</p>
          ${paymentCode ? `<p><strong>Payment Code:</strong> ${paymentCode}</p>` : ''}
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Items Ordered:</h3>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${itemsList}</pre>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Shipping Address:</h3>
          <p style="margin: 0;">${formatAddress(shippingAddress)}</p>
        </div>
        
        <p>Thank you for your business!</p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; color: #666; font-size: 12px;">
          <p>If you have any questions about your order, please contact our customer service team.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
