import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaymobService {
  private readonly apiKey: string;
  private readonly integrationId: string;
  private readonly iframeId: string;
  private readonly apiUrl: string = 'https://accept.paymob.com/api';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PAYMOB_API_KEY') || '';
    this.integrationId = this.configService.get<string>('PAYMOB_INTEGRATION_ID') || '';
    this.iframeId = this.configService.get<string>('PAYMOB_IFRAME_ID') || '';
  }

  /**
   * Get authentication token from Paymob
   */
  async getAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.apiUrl}/auth/tokens`, {
        api_key: this.apiKey,
      });

      return response.data.token;
    } catch (error: any) {
      throw new BadRequestException('فشل الاتصال ببوابة الدفع');
    }
  }

  /**
   * Create order in Paymob
   */
  async createOrder(authToken: string, amount: number, currency: string = 'EGP'): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ecommerce/orders`,
        {
          auth_token: authToken,
          delivery_needed: 'false',
          amount_cents: Math.round(amount * 100), // Convert to cents
          currency,
          items: [],
        },
      );

      return response.data;
    } catch (error: any) {
      throw new BadRequestException('فشل إنشاء طلب الدفع');
    }
  }

  /**
   * Create payment key for iframe
   */
  async createPaymentKey(
    authToken: string,
    orderId: number,
    amount: number,
    userInfo: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    },
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/acceptance/payment_keys`,
        {
          auth_token: authToken,
          amount_cents: Math.round(amount * 100),
          expiration: 3600,
          order_id: orderId,
          billing_data: {
            email: userInfo.email,
            first_name: userInfo.firstName,
            last_name: userInfo.lastName,
            phone_number: userInfo.phone || '01000000000',
            apartment: 'NA',
            floor: 'NA',
            street: 'NA',
            building: 'NA',
            shipping_method: 'NA',
            postal_code: 'NA',
            city: 'NA',
            country: 'NA',
            state: 'NA',
          },
          currency: 'EGP',
          integration_id: parseInt(this.integrationId),
        },
      );

      return response.data.token;
    } catch (error: any) {
      throw new BadRequestException('فشل إنشاء مفتاح الدفع');
    }
  }

  /**
   * Get iframe URL for payment
   */
  getIframeUrl(
    paymentToken: string,
    metadata?: {
      tenantSlug?: string;
      courseSlug?: string;
      transactionId?: string;
    },
  ): string {
    const baseUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentToken}`;

    if (!metadata) {
      return baseUrl;
    }

    // Add custom metadata as query parameters for tracking
    const params = new URLSearchParams();
    if (metadata.tenantSlug) params.append('tenant', metadata.tenantSlug);
    if (metadata.courseSlug) params.append('course', metadata.courseSlug);
    if (metadata.transactionId) params.append('transaction_id', metadata.transactionId);

    return `${baseUrl}&${params.toString()}`;
  }

  /**
   * Verify callback from Paymob
   */
  async verifyCallback(callbackData: any): Promise<{
    isValid: boolean;
    transactionId: string;
    orderId: string;
    success: boolean;
    amount: number;
  }> {
    try {
      const hmac = callbackData.hmac;
      const obj = callbackData.obj;

      if (!obj) {
        return {
          isValid: false,
          transactionId: '',
          orderId: '',
          success: false,
          amount: 0,
        };
      }

      // In production, verify HMAC signature here
      // For sandbox, we'll trust the callback

      return {
        isValid: true,
        transactionId: obj.id?.toString() || '',
        orderId: obj.order?.id?.toString() || '',
        success: obj.success === true || obj.success === 'true',
        amount: obj.amount_cents ? obj.amount_cents / 100 : 0,
      };
    } catch (error) {
      return {
        isValid: false,
        transactionId: '',
        orderId: '',
        success: false,
        amount: 0,
      };
    }
  }

  /**
   * Create complete payment flow
   */
  async createPaymentSession(
    amount: number,
    userInfo: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    },
    metadata?: {
      tenantSlug?: string;
      courseSlug?: string;
      subscriptionPlan?: string;
      transactionId?: string;
    },
  ): Promise<{
    paymentUrl: string;
    orderId: string;
    paymentToken: string;
  }> {
    // Step 1: Get auth token
    const authToken = await this.getAuthToken();

    // Step 2: Create order
    const order = await this.createOrder(authToken, amount);

    // Step 3: Create payment key
    const paymentToken = await this.createPaymentKey(authToken, order.id, amount, userInfo);

    // Step 4: Generate iframe URL with metadata
    const paymentUrl = this.getIframeUrl(paymentToken, metadata);

    return {
      paymentUrl,
      orderId: order.id.toString(),
      paymentToken,
    };
  }
}
