import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';
import { OrderWithItems } from '../models/order.model';

export class NotificationService {
  private transporter!: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(order: OrderWithItems): Promise<void> {
    // In development mode, log to console
    if (process.env.NODE_ENV === 'development' && 
        (config.email.user === 'your_email@gmail.com' || !config.email.user)) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 ORDER CONFIRMATION EMAIL - DEVELOPMENT MODE');
      console.log('='.repeat(60));
      console.log(`To: ${order.shippingEmail}`);
      console.log(`Phone: ${order.shippingPhone}`);
      console.log(`Order Number: ${order.orderNumber}`);
      console.log(`Total: Rs. ${order.total.toFixed(2)}`);
      console.log(`Items: ${order.items.length}`);
      console.log('='.repeat(60) + '\n');
      return;
    }

    const itemsList = order.items.map(item => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.subtotal.toFixed(2)}</td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: config.email.user,
      to: order.shippingEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">AuraXpress</h1>
            <p style="margin: 5px 0 0 0;">Order Confirmation</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2>Thank you for your order!</h2>
            <p>Hi ${order.shippingFullName},</p>
            <p>Your order has been successfully placed and is being processed.</p>
            
            <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #3b82f6; font-weight: bold;">Processing</span></p>
            </div>

            <h3>Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <div style="background-color: white; padding: 15px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Subtotal:</span>
                <span>Rs. ${order.subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Shipping:</span>
                <span>${order.shippingCost === 0 ? 'Free' : `Rs. ${order.shippingCost.toFixed(2)}`}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Tax (GST):</span>
                <span>Rs. ${order.tax.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #3b82f6; margin-top: 10px; font-size: 18px; font-weight: bold;">
                <span>Total:</span>
                <span>Rs. ${order.total.toFixed(2)}</span>
              </div>
            </div>

            <h3>Shipping Address</h3>
            <div style="background-color: white; padding: 15px;">
              <p style="margin: 5px 0;">${order.shippingFullName}</p>
              <p style="margin: 5px 0;">${order.shippingAddress}</p>
              <p style="margin: 5px 0;">${order.shippingCity}, ${order.shippingState} ${order.shippingZipCode}</p>
              <p style="margin: 5px 0;">${order.shippingCountry}</p>
              <p style="margin: 5px 0;">Phone: ${order.shippingPhone}</p>
            </div>

            <p style="margin-top: 20px;">We'll send you another email when your order ships.</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Thank you for shopping with AuraXpress!</p>
            <p>For any queries, contact us at support@auraxpress.com</p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdateEmail(order: OrderWithItems, oldStatus: string): Promise<void> {
    const statusMessages = {
      confirmed: {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared for shipment.',
        color: '#10b981'
      },
      shipped: {
        title: 'Order Shipped',
        message: 'Your order has been shipped and is on its way to you!',
        color: '#3b82f6'
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered. We hope you enjoy your purchase!',
        color: '#059669'
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. Refund will be processed within 5-7 business days.',
        color: '#ef4444'
      },
      returned: {
        title: 'Return Request Received',
        message: 'Your return request has been received. Refund will be processed within 5-7 business days after we receive the item.',
        color: '#f97316'
      }
    };

    const statusInfo = statusMessages[order.status as keyof typeof statusMessages];

    // In development mode, log to console
    if (process.env.NODE_ENV === 'development' && 
        (config.email.user === 'your_email@gmail.com' || !config.email.user)) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 ORDER STATUS UPDATE EMAIL - DEVELOPMENT MODE');
      console.log('='.repeat(60));
      console.log(`To: ${order.shippingEmail}`);
      console.log(`Phone: ${order.shippingPhone}`);
      console.log(`Order Number: ${order.orderNumber}`);
      console.log(`Status: ${oldStatus} → ${order.status}`);
      console.log(`Message: ${statusInfo?.message || 'Status updated'}`);
      console.log('='.repeat(60) + '\n');
      return;
    }

    if (!statusInfo) return; // Don't send email for processing status

    const mailOptions = {
      from: config.email.user,
      to: order.shippingEmail,
      subject: `${statusInfo.title} - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${statusInfo.color}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">AuraXpress</h1>
            <p style="margin: 5px 0 0 0;">${statusInfo.title}</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2>Order Status Update</h2>
            <p>Hi ${order.shippingFullName},</p>
            <p>${statusInfo.message}</p>
            
            <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>
              <p style="margin: 5px 0;"><strong>Total:</strong> Rs. ${order.total.toFixed(2)}</p>
            </div>

            ${order.status === 'shipped' ? `
              <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p style="margin: 0;"><strong>Expected Delivery:</strong> ${new Date(new Date(order.updatedAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
            ` : ''}

            <p style="margin-top: 20px;">You can track your order status anytime by logging into your account.</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Thank you for shopping with AuraXpress!</p>
            <p>For any queries, contact us at support@auraxpress.com</p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send SMS notification (simulated - would integrate with SMS provider like Twilio)
   */
  async sendOrderSMS(phone: string, orderNumber: string, status: string): Promise<void> {
    // In development mode, log to console
    console.log('\n' + '='.repeat(60));
    console.log('📱 SMS NOTIFICATION - DEVELOPMENT MODE');
    console.log('='.repeat(60));
    console.log(`To: ${phone}`);
    console.log(`Message: Your AuraXpress order ${orderNumber} is now ${status}.`);
    console.log('='.repeat(60) + '\n');

    // In production, integrate with SMS provider:
    // - Twilio
    // - AWS SNS
    // - MSG91 (India)
    // - etc.
  }
}
