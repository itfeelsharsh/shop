import { onRequestPost as __api_razorpay_create_order_js_onRequestPost } from "/Users/harshbanker/Desktop/GitHub/shop/functions/api/razorpay/create-order.js"
import { onRequestPost as __api_razorpay_verify_payment_js_onRequestPost } from "/Users/harshbanker/Desktop/GitHub/shop/functions/api/razorpay/verify-payment.js"
import { onRequest as __api_send_email_js_onRequest } from "/Users/harshbanker/Desktop/GitHub/shop/functions/api/send-email.js"
import { onRequest as __api_send_notification_js_onRequest } from "/Users/harshbanker/Desktop/GitHub/shop/functions/api/send-notification.js"
import { onRequest as ___middleware_js_onRequest } from "/Users/harshbanker/Desktop/GitHub/shop/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/razorpay/create-order",
      mountPath: "/api/razorpay",
      method: "POST",
      middlewares: [],
      modules: [__api_razorpay_create_order_js_onRequestPost],
    },
  {
      routePath: "/api/razorpay/verify-payment",
      mountPath: "/api/razorpay",
      method: "POST",
      middlewares: [],
      modules: [__api_razorpay_verify_payment_js_onRequestPost],
    },
  {
      routePath: "/api/send-email",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_send_email_js_onRequest],
    },
  {
      routePath: "/api/send-notification",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_send_notification_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]