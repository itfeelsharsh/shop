import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";
import logger from "./logger";

/**
 * CouponService
 * A utility service for validating and applying discount coupons
 * 
 * Features:
 * - Coupon validation (existence, expiry, usage limits)
 * - Discount calculation for both general and product-specific coupons
 * - Coupon usage tracking
 */
class CouponService {
  /**
   * Validates a coupon code and returns discount information if valid
   * 
   * @param {string} code - The coupon code to validate
   * @param {Array} cartItems - The current cart items array with product info
   * @param {number} cartTotal - The current cart total
   * @param {string} userId - The ID of the current user
   * @returns {Promise<Object>} - Object containing validation result and discount info
   */
  static async validateCoupon(code, cartItems = [], cartTotal, userId) {
    try {
      // Normalize the coupon code to uppercase
      const normalizedCode = code.trim().toUpperCase();
      
      // Query Firestore for the coupon
      const couponsRef = collection(db, "coupons");
      const q = query(couponsRef, where("code", "==", normalizedCode));
      const querySnapshot = await getDocs(q);
      
      // If no coupon found
      if (querySnapshot.empty) {
        logger.info(`Coupon not found: ${normalizedCode}`, { userId });
        return {
          valid: false,
          message: "Invalid coupon code.",
          coupon: null
        };
      }
      
      // Get the first (and should be only) coupon
      const couponDoc = querySnapshot.docs[0];
      const coupon = {
        id: couponDoc.id,
        ...couponDoc.data()
      };
      
      // Check if coupon is active
      if (!coupon.isActive) {
        logger.info(`Inactive coupon used: ${normalizedCode}`, { userId });
        return {
          valid: false,
          message: "This coupon is no longer active.",
          coupon: null
        };
      }
      
      // Check date validity
      const now = new Date();
      const startDate = new Date(coupon.startDate);
      const endDate = new Date(coupon.endDate);
      
      if (now < startDate) {
        logger.info(`Coupon not yet valid: ${normalizedCode}`, { userId, startDate });
        return {
          valid: false,
          message: `This coupon will be valid from ${startDate.toLocaleDateString()}.`,
          coupon: null
        };
      }
      
      if (now > endDate) {
        logger.info(`Expired coupon used: ${normalizedCode}`, { userId, endDate });
        return {
          valid: false,
          message: "This coupon has expired.",
          coupon: null
        };
      }
      
      // Check usage limits
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        logger.info(`Maximum usage reached for coupon: ${normalizedCode}`, { userId });
        return {
          valid: false,
          message: "This coupon has reached its maximum usage limit.",
          coupon: null
        };
      }
      
      // Check if product-specific and if applicable to current cart
      const isProductSpecific = coupon.isProductSpecific || 
                               (coupon.applicableProducts && coupon.applicableProducts.length > 0);
      
      if (isProductSpecific) {
        // We need to validate if any product in the cart is eligible for this coupon
        const eligibleProductIds = coupon.applicableProducts || [];
        
        // Check if cart has any eligible products
        const eligibleCartItems = cartItems.filter(item => 
          eligibleProductIds.includes(item.productId)
        );
        
        if (eligibleCartItems.length === 0) {
          logger.info(`Coupon not applicable to any items in cart: ${normalizedCode}`, { userId });
          return {
            valid: false,
            message: "This coupon is not applicable to any items in your cart.",
            coupon: null
          };
        }
        
        // Calculate total value of eligible products
        const eligibleItemsTotal = eligibleCartItems.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
        
        // Check minimum order amount against eligible products total
        if (coupon.minOrderAmount > 0 && eligibleItemsTotal < coupon.minOrderAmount) {
          logger.info(`Minimum order amount not met for product-specific coupon: ${normalizedCode}`, { 
            userId, eligibleItemsTotal, minRequired: coupon.minOrderAmount 
          });
          return {
            valid: false,
            message: `This coupon requires eligible products total of ₹${coupon.minOrderAmount.toLocaleString()}.`,
            coupon: null
          };
        }
        
        // Calculate the discount amount only on eligible products
        let discountAmount = 0;
        
        if (coupon.discountType === "percentage") {
          discountAmount = (eligibleItemsTotal * coupon.discountValue) / 100;
          
          // Apply maximum discount limit if applicable
          if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          // Fixed amount discount
          discountAmount = coupon.discountValue;
          
          // Ensure discount doesn't exceed eligible items total
          if (discountAmount > eligibleItemsTotal) {
            discountAmount = eligibleItemsTotal;
          }
        }
        
        logger.info(`Valid product-specific coupon applied: ${normalizedCode}`, { 
          userId, eligibleItemsTotal, discountAmount, eligibleProducts: eligibleCartItems.length
        });
        
        // Return product-specific validation
        return {
          valid: true,
          message: "Coupon applied successfully to eligible products!",
          coupon,
          discountAmount,
          finalTotal: cartTotal - discountAmount,
          isProductSpecific: true,
          eligibleProductIds: eligibleProductIds,
          appliedToCartItems: eligibleCartItems.map(item => item.productId)
        };
      }
      
      // For non-product-specific coupons, continue with order total validation
      
      // Check minimum order amount for regular coupons
      if (coupon.minOrderAmount > 0 && cartTotal < coupon.minOrderAmount) {
        logger.info(`Minimum order amount not met for coupon: ${normalizedCode}`, { 
          userId, cartTotal, minRequired: coupon.minOrderAmount 
        });
        return {
          valid: false,
          message: `This coupon requires a minimum order of ₹${coupon.minOrderAmount.toLocaleString()}.`,
          coupon: null
        };
      }
      
      // Calculate the discount amount for regular coupons
      let discountAmount = 0;
      
      if (coupon.discountType === "percentage") {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        
        // Apply maximum discount limit if applicable
        if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        // Fixed amount discount
        discountAmount = coupon.discountValue;
        
        // Ensure discount doesn't exceed cart total
        if (discountAmount > cartTotal) {
          discountAmount = cartTotal;
        }
      }
      
      logger.info(`Valid coupon applied: ${normalizedCode}`, { 
        userId, cartTotal, discountAmount 
      });
      
      // Return the validation result with discount info
      return {
        valid: true,
        message: "Coupon applied successfully!",
        coupon,
        discountAmount,
        finalTotal: cartTotal - discountAmount,
        isProductSpecific: false
      };
    } catch (error) {
      logger.error(`Error validating coupon: ${code}`, error, "CouponService");
      return {
        valid: false,
        message: "An error occurred while validating the coupon.",
        coupon: null
      };
    }
  }
  
  /**
   * Records coupon usage in the database
   * Should be called after a successful order that used the coupon
   * 
   * @param {string} couponId - The ID of the used coupon
   * @returns {Promise<boolean>} - Success status
   */
  static async recordCouponUsage(couponId) {
    try {
      if (!couponId) return false;
      
      const couponRef = doc(db, "coupons", couponId);
      await updateDoc(couponRef, {
        usedCount: increment(1)
      });
      
      logger.info(`Coupon usage recorded: ${couponId}`);
      return true;
    } catch (error) {
      logger.error(`Error recording coupon usage: ${couponId}`, error, "CouponService");
      return false;
    }
  }
  
  /**
   * Formats a discount amount for display
   * 
   * @param {Object} coupon - The coupon object
   * @param {number} discountAmount - The calculated discount amount
   * @param {boolean} isProductSpecific - Whether the coupon is product-specific
   * @returns {string} - Formatted discount string
   */
  static formatDiscount(coupon, discountAmount, isProductSpecific = false) {
    if (!coupon) return "";
    
    const productText = isProductSpecific ? " on eligible items" : "";
    
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% OFF${productText} (₹${discountAmount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })})`;
    } else {
      return `₹${discountAmount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })} OFF${productText}`;
    }
  }
}

export default CouponService; 