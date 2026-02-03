import axios from 'axios';

async function testOrderCreation() {
  try {
    console.log('🧪 Testing Order Creation Flow\n');

    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'aryansondharva25@gmail.com',
      password: 'Test@123' // You'll need to use the actual password
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received\n');

    // Step 2: Create order
    console.log('2️⃣ Creating order...');
    const orderData = {
      items: [
        {
          productId: 'test-product-1',
          productName: 'Test Product',
          productImage: 'https://example.com/image.jpg',
          productCategory: 'Electronics',
          quantity: 2,
          price: 999.99
        }
      ],
      subtotal: 1999.98,
      shippingCost: 50,
      tax: 359.996,
      total: 2409.976,
      shippingInfo: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+911234567890',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India'
      },
      paymentInfo: {
        method: 'card'
      }
    };

    const orderResponse = await axios.post(
      'http://localhost:3001/api/orders',
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Order created successfully!');
    console.log('📦 Order Number:', orderResponse.data.data.orderNumber);
    console.log('💰 Total:', orderResponse.data.data.total);
    console.log('📊 Items:', orderResponse.data.data.items.length);
    console.log('\n✅ Test completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testOrderCreation();
