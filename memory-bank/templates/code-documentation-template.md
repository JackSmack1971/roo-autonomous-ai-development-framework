# Code Documentation Template

## Overview

This template provides guidelines and examples for comprehensive code documentation that meets quality gate requirements.

## Table of Contents

1. [Documentation Principles](#documentation-principles)
2. [Function Documentation](#function-documentation)
3. [Class Documentation](#class-documentation)
4. [Module Documentation](#module-documentation)
5. [Code Comments](#code-comments)
6. [Examples](#examples)

## Documentation Principles

### 1. Write for Humans First
Code is read more often than it's written. Documentation should help other developers understand your intent and reasoning.

### 2. Document Why, Not Just What
Explain the purpose and reasoning behind code decisions, not just what the code does.

### 3. Keep Documentation Current
Outdated documentation is worse than no documentation. Update docs when you change code.

### 4. Use Consistent Style
Follow language-specific conventions and project standards for documentation format.

### 5. Include Examples
Provide practical examples showing how to use your code correctly.

## Function Documentation

### JavaScript/TypeScript Functions

```javascript
/**
 * Calculates the total price including tax and discounts
 *
 * This function applies tax rates and discounts to a base price,
 * ensuring accurate financial calculations for e-commerce operations.
 * It handles multiple discount types and tax jurisdictions.
 *
 * @param {number} basePrice - The original price before tax/discounts
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param {Array<Object>} discounts - Array of discount objects
 * @param {string} taxJurisdiction - Tax jurisdiction identifier
 * @returns {Object} Calculation result with breakdown
 * @returns {number} result.total - Final total price
 * @returns {number} result.taxAmount - Calculated tax amount
 * @returns {number} result.discountAmount - Total discount applied
 * @returns {Array<Object>} result.appliedDiscounts - Discounts that were applied
 *
 * @example
 * ```javascript
 * const result = calculateTotal(100, 0.08, [
 *   { type: 'percentage', value: 10 },
 *   { type: 'fixed', value: 5 }
 * ], 'CA');
 *
 * console.log(result.total); // 86.48
 * console.log(result.taxAmount); // 7.83
 * console.log(result.discountAmount); // 15.00
 * ```
 *
 * @throws {ValidationError} When basePrice is negative or taxRate is invalid
 * @throws {TaxCalculationError} When tax jurisdiction is not supported
 */
function calculateTotal(basePrice, taxRate, discounts = [], taxJurisdiction = 'US') {
  // Input validation
  if (basePrice < 0) {
    throw new ValidationError('Base price cannot be negative');
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new ValidationError('Tax rate must be between 0 and 1');
  }

  // Apply discounts first
  let discountedPrice = basePrice;
  const appliedDiscounts = [];

  for (const discount of discounts) {
    if (discount.type === 'percentage') {
      const discountAmount = discountedPrice * (discount.value / 100);
      discountedPrice -= discountAmount;
      appliedDiscounts.push({
        ...discount,
        amount: discountAmount
      });
    } else if (discount.type === 'fixed') {
      discountedPrice -= discount.value;
      appliedDiscounts.push({
        ...discount,
        amount: discount.value
      });
    }
  }

  // Ensure price doesn't go below zero
  discountedPrice = Math.max(0, discountedPrice);

  // Calculate tax
  const taxAmount = calculateTax(discountedPrice, taxRate, taxJurisdiction);

  return {
    total: discountedPrice + taxAmount,
    taxAmount,
    discountAmount: basePrice - discountedPrice,
    appliedDiscounts
  };
}
```

### Python Functions

```python
def calculate_total(
    base_price: float,
    tax_rate: float,
    discounts: List[Dict[str, Any]] = None,
    tax_jurisdiction: str = "US"
) -> Dict[str, Any]:
    """
    Calculate total price including tax and discounts.

    This function applies tax rates and discounts to a base price,
    ensuring accurate financial calculations for e-commerce operations.
    It handles multiple discount types and tax jurisdictions with
    proper error handling and validation.

    Args:
        base_price (float): The original price before tax/discounts
        tax_rate (float): Tax rate as decimal (e.g., 0.08 for 8%)
        discounts (List[Dict[str, Any]], optional): Array of discount objects
        tax_jurisdiction (str, optional): Tax jurisdiction identifier

    Returns:
        Dict[str, Any]: Calculation result with breakdown
            - total (float): Final total price
            - tax_amount (float): Calculated tax amount
            - discount_amount (float): Total discount applied
            - applied_discounts (List[Dict]): Discounts that were applied

    Raises:
        ValidationError: When base_price is negative or tax_rate is invalid
        TaxCalculationError: When tax jurisdiction is not supported

    Example:
        >>> result = calculate_total(100, 0.08, [
        ...     {'type': 'percentage', 'value': 10},
        ...     {'type': 'fixed', 'value': 5}
        ... ], 'CA')
        >>> result['total']
        86.48
        >>> result['tax_amount']
        7.83
        >>> result['discount_amount']
        15.0

    Note:
        Discounts are applied before tax calculation.
        The final price is guaranteed to be non-negative.
    """
    # Input validation
    if base_price < 0:
        raise ValidationError("Base price cannot be negative")

    if not 0 <= tax_rate <= 1:
        raise ValidationError("Tax rate must be between 0 and 1")

    if discounts is None:
        discounts = []

    # Apply discounts first
    discounted_price = base_price
    applied_discounts = []

    for discount in discounts:
        if discount.get('type') == 'percentage':
            discount_amount = discounted_price * (discount['value'] / 100)
            discounted_price -= discount_amount
            applied_discounts.append({
                **discount,
                'amount': discount_amount
            })
        elif discount.get('type') == 'fixed':
            discount_amount = min(discount['value'], discounted_price)
            discounted_price -= discount_amount
            applied_discounts.append({
                **discount,
                'amount': discount_amount
            })

    # Ensure price doesn't go below zero
    discounted_price = max(0, discounted_price)

    # Calculate tax
    tax_amount = calculate_tax(discounted_price, tax_rate, tax_jurisdiction)

    return {
        'total': discounted_price + tax_amount,
        'tax_amount': tax_amount,
        'discount_amount': base_price - discounted_price,
        'applied_discounts': applied_discounts
    }
```

## Class Documentation

### JavaScript/TypeScript Classes

```javascript
/**
 * User authentication and session management service
 *
 * Handles user authentication, session creation, and token management
 * for web applications. Supports multiple authentication methods
 * including email/password, OAuth, and JWT tokens.
 *
 * @class
 * @example
 * ```javascript
 * const auth = new AuthService({
 *   jwtSecret: 'your-secret',
 *   sessionTimeout: 3600000
 * });
 *
 * // Authenticate user
 * const user = await auth.authenticate('user@example.com', 'password');
 * const token = await auth.createSession(user.id);
 * ```
 */
class AuthService {
  /**
   * Creates an authentication service instance
   *
   * @param {Object} config - Service configuration
   * @param {string} config.jwtSecret - Secret key for JWT signing
   * @param {number} config.sessionTimeout - Session timeout in milliseconds
   * @param {Object} config.database - Database connection configuration
   */
  constructor(config) {
    this.config = config;
    this.jwtSecret = config.jwtSecret;
    this.sessionTimeout = config.sessionTimeout || 3600000; // 1 hour
    this.db = config.database;
  }

  /**
   * Authenticates a user with email and password
   *
   * Validates user credentials against the database and returns
   * user information if authentication is successful.
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object|null>} User object or null if authentication fails
   * @throws {AuthenticationError} When authentication fails
   * @throws {DatabaseError} When database operation fails
   *
   * @example
   * ```javascript
   * try {
   *   const user = await auth.authenticate('user@example.com', 'password');
   *   console.log('Authenticated user:', user.name);
   * } catch (error) {
   *   console.error('Authentication failed:', error.message);
   * }
   * ```
   */
  async authenticate(email, password) {
    // Implementation here
  }

  /**
   * Creates a new session for authenticated user
   *
   * Generates a JWT token and stores session information
   * in the database for tracking and invalidation.
   *
   * @param {string} userId - ID of the authenticated user
   * @param {Object} metadata - Additional session metadata
   * @returns {Promise<string>} JWT token for the session
   * @throws {SessionError} When session creation fails
   */
  async createSession(userId, metadata = {}) {
    // Implementation here
  }

  /**
   * Validates a JWT token and returns session info
   *
   * @param {string} token - JWT token to validate
   * @returns {Promise<Object>} Session information including user data
   * @throws {TokenError} When token is invalid or expired
   */
  async validateToken(token) {
    // Implementation here
  }

  /**
   * Ends a user session
   *
   * Invalidates the session token and removes session data
   * from the database to prevent further use.
   *
   * @param {string} token - Session token to invalidate
   * @returns {Promise<boolean>} True if session was successfully ended
   */
  async endSession(token) {
    // Implementation here
  }
}
```

### Python Classes

```python
class AuthService:
    """
    User authentication and session management service.

    Handles user authentication, session creation, and token management
    for web applications. Supports multiple authentication methods
    including email/password, OAuth, and JWT tokens.

    Attributes:
        config (Dict[str, Any]): Service configuration
        jwt_secret (str): Secret key for JWT signing
        session_timeout (int): Session timeout in milliseconds
        db (Database): Database connection instance

    Example:
        >>> auth = AuthService({
        ...     'jwt_secret': 'your-secret',
        ...     'session_timeout': 3600000,
        ...     'database': db_connection
        ... })
        >>> user = await auth.authenticate('user@example.com', 'password')
        >>> token = await auth.create_session(user.id)
    """

    def __init__(self, config: Dict[str, Any]) -> None:
        """
        Initialize authentication service.

        Args:
            config (Dict[str, Any]): Service configuration containing:
                - jwt_secret (str): Secret key for JWT signing
                - session_timeout (int): Session timeout in milliseconds
                - database (Database): Database connection instance
        """
        self.config = config
        self.jwt_secret = config['jwt_secret']
        self.session_timeout = config.get('session_timeout', 3600000)  # 1 hour
        self.db = config['database']

    async def authenticate(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user with email and password.

        Validates user credentials against the database and returns
        user information if authentication is successful.

        Args:
            email (str): User's email address
            password (str): User's password

        Returns:
            Optional[Dict[str, Any]]: User object or None if authentication fails

        Raises:
            AuthenticationError: When authentication fails
            DatabaseError: When database operation fails

        Example:
            >>> user = await auth.authenticate('user@example.com', 'password')
            >>> if user:
            ...     print(f'Authenticated user: {user["name"]}')
            ... else:
            ...     print('Authentication failed')
        """
        # Implementation here
        pass

    async def create_session(self, user_id: str, metadata: Dict[str, Any] = None) -> str:
        """
        Create new session for authenticated user.

        Generates a JWT token and stores session information
        in the database for tracking and invalidation.

        Args:
            user_id (str): ID of the authenticated user
            metadata (Dict[str, Any], optional): Additional session metadata

        Returns:
            str: JWT token for the session

        Raises:
            SessionError: When session creation fails
        """
        # Implementation here
        pass

    async def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate JWT token and return session info.

        Args:
            token (str): JWT token to validate

        Returns:
            Dict[str, Any]: Session information including user data

        Raises:
            TokenError: When token is invalid or expired
        """
        # Implementation here
        pass

    async def end_session(self, token: str) -> bool:
        """
        End user session.

        Invalidates the session token and removes session data
        from the database to prevent further use.

        Args:
            token (str): Session token to invalidate

        Returns:
            bool: True if session was successfully ended
        """
        # Implementation here
        pass
```

## Module Documentation

### Module-Level Documentation

```javascript
/**
 * @module user-management
 * @description User management and authentication services
 *
 * This module provides comprehensive user management functionality including:
 * - User registration and authentication
 * - Profile management and updates
 * - Password reset and security features
 * - User session management
 * - Role-based access control
 *
 * @author Development Team
 * @version 2.1.0
 * @since 2023-01-15
 * @license MIT
 *
 * @example
 * ```javascript
 * import { AuthService, UserManager } from './user-management';
 *
 * const auth = new AuthService(config);
 * const userManager = new UserManager(config);
 *
 * // Authenticate user
 * const user = await auth.authenticate(email, password);
 *
 * // Update user profile
 * await userManager.updateProfile(user.id, profileData);
 * ```
 */

export { AuthService } from './auth-service';
export { UserManager } from './user-manager';
export { ProfileService } from './profile-service';
```

```python
"""
User management and authentication services.

This module provides comprehensive user management functionality including:
- User registration and authentication
- Profile management and updates
- Password reset and security features
- User session management
- Role-based access control

Classes:
    AuthService: Handles user authentication and sessions
    UserManager: Manages user profiles and data
    ProfileService: Handles profile updates and validation

Functions:
    create_user: Creates a new user account
    authenticate_user: Authenticates user credentials
    reset_password: Initiates password reset process

Examples:
    Basic usage:

    >>> from user_management import AuthService, UserManager
    >>> auth = AuthService(config)
    >>> user_manager = UserManager(config)
    >>>
    >>> # Authenticate user
    >>> user = await auth.authenticate(email, password)
    >>>
    >>> # Update user profile
    >>> await user_manager.update_profile(user.id, profile_data)

Author: Development Team
Version: 2.1.0
Since: 2023-01-15
License: MIT
"""

from .auth_service import AuthService
from .user_manager import UserManager
from .profile_service import ProfileService

__all__ = ['AuthService', 'UserManager', 'ProfileService']
__version__ = '2.1.0'
__author__ = 'Development Team'
```

## Code Comments

### Inline Comments

```javascript
// Good: Explains why, not just what
const user = await getUserById(id);
// Bad: Obvious from the function name
const user = await getUserById(id); // Gets user by ID

// Good: Explains business logic reasoning
if (user.status === 'active' && user.subscription.tier === 'premium') {
  // Premium users get extended trial period due to higher lifetime value
  trialDays = 30;
} else {
  trialDays = 14;
}

// Good: Explains complex algorithm or workaround
// Using binary search for O(log n) lookup in sorted user list
// Note: Array must be sorted by user.score for this to work correctly
const index = binarySearch(users, targetScore, (user) => user.score);
```

### Block Comments for Complex Logic

```javascript
/**
 * Calculates compound interest with monthly compounding
 *
 * Formula: A = P(1 + r/n)^(nt)
 * Where:
 *   A = Final amount
 *   P = Principal amount
 *   r = Annual interest rate (decimal)
 *   n = Number of times interest is compounded per year
 *   t = Time in years
 *
 * Monthly compounding (n=12) provides more accurate calculations
 * for short-term loans and investments.
 */
function calculateCompoundInterest(principal, rate, years, compoundingFrequency = 12) {
  // Input validation
  if (principal < 0 || rate < 0 || years < 0) {
    throw new Error('All parameters must be non-negative');
  }

  // Compound interest formula: A = P(1 + r/n)^(nt)
  const compoundRate = 1 + (rate / compoundingFrequency);
  const totalPeriods = compoundingFrequency * years;

  return principal * Math.pow(compoundRate, totalPeriods);
}
```

### TODO and FIXME Comments

```javascript
// TODO: Implement caching for frequently accessed user profiles
// This will improve performance for user dashboard loads
// Estimated effort: 2-3 hours
// Priority: High
// Related issue: #123

// FIXME: This temporary workaround should be replaced with proper OAuth flow
// Currently using API key for simplicity, but this is not secure for production
// Security risk: API key exposure
// Replace with: OAuth 2.0 authorization code flow
// Deadline: End of sprint

// HACK: Temporary fix for timezone handling
// The Date object is being converted manually due to library limitations
// Remove when we upgrade to date-fns v3.0 which has better timezone support
const userTimezone = new Date().toLocaleString('en-US', {
  timeZone: user.timezone
});
```

## Examples

### Well-Documented Code Example

```javascript
/**
 * E-commerce order processing system
 * @module order-processing
 */

const { EventEmitter } = require('events');
const { validateOrder } = require('./validators');
const { calculateTax } = require('./tax-calculator');
const { processPayment } = require('./payment-processor');

/**
 * Order processor that handles the complete order lifecycle
 *
 * Manages order validation, payment processing, inventory updates,
 * and notification dispatching through event-driven architecture.
 *
 * @class
 * @extends EventEmitter
 * @fires OrderProcessor#orderValidated
 * @fires OrderProcessor#paymentProcessed
 * @fires OrderProcessor#orderCompleted
 * @fires OrderProcessor#orderFailed
 */
class OrderProcessor extends EventEmitter {
  /**
   * @param {Object} config - Processor configuration
   * @param {Database} config.db - Database connection
   * @param {PaymentService} config.payment - Payment service
   * @param {NotificationService} config.notifications - Notification service
   */
  constructor(config) {
    super();
    this.db = config.db;
    this.payment = config.payment;
    this.notifications = config.notifications;
    this.processingOrders = new Set();
  }

  /**
   * Processes a customer order from start to finish
   *
   * This method orchestrates the entire order processing workflow:
   * 1. Validates order data and inventory availability
   * 2. Calculates taxes and final pricing
   * 3. Processes payment through payment gateway
   * 4. Updates inventory levels
   * 5. Sends order confirmation notifications
   *
   * @param {Object} orderData - Raw order data from client
   * @param {string} orderData.customerId - Customer identifier
   * @param {Array} orderData.items - Array of order items
   * @param {Object} orderData.shippingAddress - Shipping address
   * @param {Object} orderData.billingAddress - Billing address
   * @param {Object} orderData.paymentInfo - Payment information
   * @returns {Promise<Object>} Processed order result
   * @throws {ValidationError} When order data is invalid
   * @throws {PaymentError} When payment processing fails
   * @throws {InventoryError} When items are out of stock
   *
   * @example
   * ```javascript
   * const processor = new OrderProcessor(config);
   *
   * try {
   *   const result = await processor.processOrder({
   *     customerId: 'cust_123',
   *     items: [
   *       { productId: 'prod_456', quantity: 2 },
   *       { productId: 'prod_789', quantity: 1 }
   *     ],
   *     shippingAddress: { /* address data */ },
   *     billingAddress: { /* address data */ },
   *     paymentInfo: { /* payment data */ }
   *   });
   *
   *   console.log('Order processed:', result.orderId);
   * } catch (error) {
   *   console.error('Order processing failed:', error.message);
   * }
   * ```
   */
  async processOrder(orderData) {
    const orderId = this.generateOrderId();

    // Prevent duplicate processing
    if (this.processingOrders.has(orderId)) {
      throw new Error(`Order ${orderId} is already being processed`);
    }

    this.processingOrders.add(orderId);

    try {
      // Step 1: Validate order data
      const validatedOrder = await validateOrder(orderData);
      this.emit('orderValidated', { orderId, order: validatedOrder });

      // Step 2: Check inventory availability
      await this.checkInventoryAvailability(validatedOrder.items);

      // Step 3: Calculate taxes and totals
      const taxCalculation = await calculateTax(
        validatedOrder.items,
        validatedOrder.shippingAddress
      );

      const finalOrder = {
        ...validatedOrder,
        orderId,
        taxAmount: taxCalculation.taxAmount,
        totalAmount: taxCalculation.totalAmount,
        status: 'processing'
      };

      // Step 4: Process payment
      const paymentResult = await this.payment.processPayment({
        amount: finalOrder.totalAmount,
        paymentInfo: finalOrder.paymentInfo,
        orderId
      });

      this.emit('paymentProcessed', { orderId, payment: paymentResult });

      // Step 5: Update inventory
      await this.updateInventoryLevels(finalOrder.items);

      // Step 6: Save order to database
      await this.db.saveOrder(finalOrder);

      // Step 7: Send notifications
      await this.notifications.sendOrderConfirmation(finalOrder);

      finalOrder.status = 'completed';
      await this.db.updateOrderStatus(orderId, 'completed');

      this.emit('orderCompleted', { orderId, order: finalOrder });

      return {
        orderId,
        status: 'completed',
        totalAmount: finalOrder.totalAmount,
        estimatedDelivery: this.calculateDeliveryDate()
      };

    } catch (error) {
      // Handle different types of errors appropriately
      if (error.type === 'payment_failed') {
        await this.handlePaymentFailure(orderId, error);
      } else if (error.type === 'inventory_unavailable') {
        await this.handleInventoryFailure(orderId, error);
      } else {
        await this.handleGeneralFailure(orderId, error);
      }

      this.emit('orderFailed', { orderId, error: error.message });
      throw error;

    } finally {
      // Always clean up processing state
      this.processingOrders.delete(orderId);
    }
  }

  // ... additional private methods with appropriate documentation
}
```

---

## Best Practices Summary

### Documentation Quality Checklist

- [ ] **Purpose**: Does the documentation explain why the code exists?
- [ ] **Usage**: Are there clear examples of how to use the code?
- [ ] **Parameters**: Are all parameters documented with types and descriptions?
- [ ] **Return Values**: Are return values clearly specified?
- [ ] **Error Conditions**: Are exceptions/errors documented?
- [ ] **Edge Cases**: Are edge cases and special conditions covered?
- [ ] **Threading/Sync**: Are concurrency considerations documented?
- [ ] **Performance**: Are performance characteristics documented?
- [ ] **Examples**: Are there practical usage examples?
- [ ] **Maintenance**: Is contact information for questions provided?

### Automation Benefits

Using automated documentation generation tools:
- **Consistency**: Ensures uniform documentation style
- **Completeness**: Catches missing documentation
- **Maintenance**: Updates docs when code changes
- **Quality Gates**: Prevents deployment without proper docs

---

*This template ensures documentation meets quality standards. Last updated: {{timestamp}}*