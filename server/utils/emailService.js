import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'byiringirourban20@gmail.com',
    pass: 'zljw hslg rxpb mqpu',
  },
});

export const sendWelcomeEmail = async (userData) => {
  const { email, name } = userData;

  const mailOptions = {
    from: 'byiringirourban20@gmail.com',
    to: email,
    subject: 'Welcome to Our E-Commerce Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Store!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for joining our community</p>
        </div>
        
        <div style="background-color: white; padding: 40px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin-top: 0;">Hello ${name}!</h2>
          
          <p style="color: #6B7280; line-height: 1.6;">
            We're excited to have you as part of our e-commerce community! Your account has been successfully created.
          </p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
            <ul style="color: #6B7280; line-height: 1.8; padding-left: 20px;">
              <li>Browse our amazing product collection</li>
              <li>Add items to your cart and place orders</li>
              <li>Track your order status in real-time</li>
              <li>Enjoy secure payments with MoMo integration</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" 
               style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Start Shopping Now
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

export const sendSellerStatusEmail = async (sellerData, status) => {
  const { email, name, businessName } = sellerData;
  const isApproved = status === 'ACTIVE';

  const mailOptions = {
    from: 'byiringirourban20@gmail.com',
    to: email,
    subject: `Seller Account ${isApproved ? 'Approved' : 'Status Update'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${isApproved ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'}; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">
            ${isApproved ? '🎉 Congratulations!' : '⏳ Status Update'}
          </h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            ${isApproved ? 'Your seller account has been approved!' : 'Your seller account status has been updated'}
          </p>
        </div>
        
        <div style="background-color: white; padding: 40px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin-top: 0;">Hello ${name}!</h2>
          
          ${isApproved ? `
            <p style="color: #6B7280; line-height: 1.6;">
              Great news! Your seller account for <strong>${businessName}</strong> has been approved and activated. 
              You can now start selling on our platform!
            </p>
            
            <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10B981;">
              <h3 style="color: #065F46; margin-top: 0;">What You Can Do Now:</h3>
              <ul style="color: #047857; line-height: 1.8; padding-left: 20px;">
                <li>Access your seller dashboard</li>
                <li>Add and manage your products</li>
                <li>View and manage orders</li>
                <li>Track your sales performance</li>
                <li>Manage customer relationships</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Access Seller Dashboard
              </a>
            </div>
          ` : `
            <p style="color: #6B7280; line-height: 1.6;">
              Your seller account status for <strong>${businessName}</strong> has been updated to: <strong>${status}</strong>
            </p>
            
            <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #F59E0B;">
              <p style="color: #92400E; margin: 0;">
                ${status === 'INACTIVE' ? 'Your account is currently inactive. Please contact support for assistance.' : 'Please check your dashboard for more details.'}
              </p>
            </div>
          `}
          
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
            If you have any questions or need assistance, please contact our support team.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Seller status email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending seller status email:', error);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async (orderData) => {
  const { customerEmail, customerName, orderNumber, totalPrice, items, shippingAddress } = orderData;
  
  const itemsList = items.map(item => 
    `• ${item.product.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} Rwf`
  ).join('\n');

  const mailOptions = {
    from: 'byiringirourban20@gmail.com',
    to: customerEmail,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Order Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! We've received your order and are processing it now.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> ${totalPrice.toLocaleString()} Rwf</p>
          <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
          
          <h4>Items Ordered:</h4>
          <pre style="white-space: pre-line; font-family: Arial, sans-serif;">${itemsList}</pre>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2;">Payment Information</h3>
          <p><strong>Payment Method:</strong> MTN Mobile Money</p>
          <p><strong>Payment Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #1976d2;">0787778889</span></p>
          <p>Please use this number to complete your Mobile Money payment.</p>
        </div>
        
        <p>You will receive another email once your payment is confirmed by our admin.</p>
        <p>Thank you for shopping with us!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', customerEmail);
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    throw error;
  }
};

export const sendAdminOrderNotification = async (orderData, adminEmails = ['byiringirourban20@gmail.com']) => {
  const { customerEmail, customerName, orderNumber, totalPrice, items, shippingAddress } = orderData;
  
  const itemsList = items.map(item => 
    `• ${item.product.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} Rwf`
  ).join('\n');

  const mailOptions = {
    from: 'byiringirourban20@gmail.com',
    to: adminEmails.join(', '),
    subject: `New Order Received - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">New Order Received</h2>
        <p>A new order has been placed and requires your attention.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Customer Email:</strong> ${customerEmail}</p>
          <p><strong>Total Amount:</strong> ${totalPrice.toLocaleString()} Rwf</p>
          <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
          
          <h4>Items Ordered:</h4>
          <pre style="white-space: pre-line; font-family: Arial, sans-serif;">${itemsList}</pre>
        </div>
        
        <p><strong>Action Required:</strong> Please review and confirm the payment for this order.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated notification from your e-commerce system.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Admin order notification sent');
  } catch (error) {
    console.error('❌ Error sending admin order notification:', error);
    throw error;
  }
};

export const sendPaymentConfirmationEmail = async (orderData) => {
  const { customerEmail, customerName, orderNumber, totalPrice, items, shippingAddress, paymentCode } = orderData;
  
  const itemsList = items.map(item => 
    `• ${item.product.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} Rwf`
  ).join('\n');

  const mailOptions = {
    from: 'byiringirourban20@gmail.com',
    to: customerEmail,
    subject: `Payment Confirmed - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Payment Confirmed!</h2>
        <p>Dear ${customerName},</p>
        <p>Great news! Your payment has been confirmed and your order is now being processed.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> ${totalPrice.toLocaleString()} Rwf</p>
          <p><strong>Payment Code Used:</strong> ${paymentCode}</p>
          <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
          
          <h4>Items Ordered:</h4>
          <pre style="white-space: pre-line; font-family: Arial, sans-serif;">${itemsList}</pre>
        </div>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #155724;">✅ Payment Status: CONFIRMED</h3>
          <p>Your order is now being prepared for shipment. You will receive tracking information once your order has been dispatched.</p>
        </div>
        
        <p>Thank you for shopping with us!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Payment confirmation email sent to:', customerEmail);
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    throw error;
  }
};

export const sendOrderStatusUpdateEmail = async (toEmail, status, productName) => {
  const mailOptions = {
    from: 'byiringirourban20@gmail.com',
    to: toEmail,
    subject: `Order Status Updated - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Order Status Update</h2>
        <p>Dear customer,</p>
        <p>The status of your order for <strong>${productName}</strong> has been updated to:</p>
        <div style="margin: 20px 0; padding: 10px; background-color: #f3f4f6; border-radius: 8px;">
          <strong>${status}</strong>
        </div>
        <p>We will keep you posted on the next steps. Thank you for shopping with us!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Order status update email sent to:', toEmail);
  } catch (error) {
    console.error('❌ Error sending order status update email:', error);
    throw error;
  }
};
