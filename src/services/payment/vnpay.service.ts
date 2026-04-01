import crypto from 'crypto'
import moment from 'moment'
import { vnpayConfig } from '../../config/vnpay.config'
import type { ParsedQs } from 'qs'

export class VNPayService {
  static verifyIPN(vnpParams: ParsedQs) {
    throw new Error('Method not implemented.')
  }
  static verifyReturnUrl(vnpParams: ParsedQs) {
    throw new Error('Method not implemented.')
  }
  static createPaymentUrl(orderId: any, amount: any, bankCode: any) {
    throw new Error('Method not implemented.')
  }
  private sortObject(obj: any) {
    const sorted: any = {}
    const keys = Object.keys(obj).sort()
    for (const key of keys) {
      sorted[key] = obj[key]
    }
    return sorted
  }

  createPaymentUrl(params: {
    amount: number;
    orderInfo: string;
    orderType: string;
    vnp_TxnRef: string;
    ipAddr: string;
  }) {
    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')

    const vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.vnp_TxnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: params.orderType,  
      vnp_Amount: params.amount * 100,
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: createDate,
    }

    const sortedParams = this.sortObject(vnpParams)
    const signData = new URLSearchParams(sortedParams).toString()
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    vnpParams.vnp_SecureHash = signed

    return `${vnpayConfig.vnp_Url}?${new URLSearchParams(
      vnpParams,
    ).toString()}`
  }

  verifyReturnUrl(vnpParams: any) {
    const secureHash = vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHashType']

    const sortedParams = this.sortObject(vnpParams)
    const signData = new URLSearchParams(sortedParams).toString()
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    return secureHash === signed
  }

  verifyIPN(vnpParams: any) {
    return this.verifyReturnUrl(vnpParams)
  }
}
