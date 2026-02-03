import { Pool } from 'pg';
import { Order, OrderItem, CreateOrderDTO, OrderWithItems } from '../models/order.model';

export class OrderRepository {
  constructor(private pool: Pool) {}

  async createOrder(userId: string, orderData: CreateOrderDTO): Promise<OrderWithItems> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, order_number, status, subtotal, shipping_cost, tax, total,
          shipping_full_name, shipping_email, shipping_phone, shipping_address,
          shipping_city, shipping_state, shipping_zip_code, shipping_country,
          payment_method, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          userId,
          orderNumber,
          'processing',
          orderData.subtotal,
          orderData.shippingCost,
          orderData.tax,
          orderData.total,
          orderData.shippingInfo.fullName,
          orderData.shippingInfo.email,
          orderData.shippingInfo.phone,
          orderData.shippingInfo.address,
          orderData.shippingInfo.city,
          orderData.shippingInfo.state,
          orderData.shippingInfo.zipCode,
          orderData.shippingInfo.country,
          orderData.paymentInfo.method,
          'completed'
        ]
      );

      const order = this.mapRowToOrder(orderResult.rows[0]);

      // Insert order items
      const items: OrderItem[] = [];
      for (const item of orderData.items) {
        const itemResult = await client.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_image, product_category,
            quantity, price, subtotal
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            order.id,
            item.productId,
            item.productName,
            item.productImage,
            item.productCategory,
            item.quantity,
            item.price,
            item.quantity * item.price
          ]
        );
        items.push(this.mapRowToOrderItem(itemResult.rows[0]));
      }

      await client.query('COMMIT');

      return { ...order, items };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
    const ordersResult = await this.pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const orders = ordersResult.rows.map(row => this.mapRowToOrder(row));

    // Get items for each order
    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
      const itemsResult = await this.pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      const items = itemsResult.rows.map(row => this.mapRowToOrderItem(row));
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderWithItems | null> {
    const orderResult = await this.pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = this.mapRowToOrder(orderResult.rows[0]);

    const itemsResult = await this.pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const items = itemsResult.rows.map(row => this.mapRowToOrderItem(row));

    return { ...order, items };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    const result = await this.pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToOrder(result.rows[0]);
  }

  // Admin methods
  async getAllOrders(): Promise<OrderWithItems[]> {
    const ordersResult = await this.pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    const orders = ordersResult.rows.map(row => this.mapRowToOrder(row));

    // Get items for each order
    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
      const itemsResult = await this.pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      const items = itemsResult.rows.map(row => this.mapRowToOrderItem(row));
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
  }

  async getOrderByIdAdmin(orderId: string): Promise<OrderWithItems | null> {
    const orderResult = await this.pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = this.mapRowToOrder(orderResult.rows[0]);

    const itemsResult = await this.pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const items = itemsResult.rows.map(row => this.mapRowToOrderItem(row));

    return { ...order, items };
  }

  async getOrderStats(): Promise<any> {
    const result = await this.pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(total) as total_revenue,
        AVG(total) as average_order_value
      FROM orders
    `);

    return {
      totalOrders: parseInt(result.rows[0].total_orders),
      processing: parseInt(result.rows[0].processing),
      confirmed: parseInt(result.rows[0].confirmed),
      shipped: parseInt(result.rows[0].shipped),
      delivered: parseInt(result.rows[0].delivered),
      cancelled: parseInt(result.rows[0].cancelled),
      totalRevenue: parseFloat(result.rows[0].total_revenue || 0),
      averageOrderValue: parseFloat(result.rows[0].average_order_value || 0)
    };
  }

  private mapRowToOrder(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      orderNumber: row.order_number,
      status: row.status,
      subtotal: parseFloat(row.subtotal),
      shippingCost: parseFloat(row.shipping_cost),
      tax: parseFloat(row.tax),
      total: parseFloat(row.total),
      shippingFullName: row.shipping_full_name,
      shippingEmail: row.shipping_email,
      shippingPhone: row.shipping_phone,
      shippingAddress: row.shipping_address,
      shippingCity: row.shipping_city,
      shippingState: row.shipping_state,
      shippingZipCode: row.shipping_zip_code,
      shippingCountry: row.shipping_country,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      productName: row.product_name,
      productImage: row.product_image,
      productCategory: row.product_category,
      quantity: row.quantity,
      price: parseFloat(row.price),
      subtotal: parseFloat(row.subtotal),
      createdAt: row.created_at
    };
  }
}
