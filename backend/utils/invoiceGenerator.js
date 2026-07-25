exports.generateInvoiceHTML = (order) => {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name} (${item.unit || '1 unit'})</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>GroceryGo Invoice #${order.orderId}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; margin: 20px; }
        .invoice-box { max-width: 700px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 10px; }
        .logo { font-size: 24px; font-weight: bold; color: #059669; }
        .totals { margin-top: 20px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div class="logo">GroceryGo Invoice</div>
          <div>Order #${order.orderId}</div>
        </div>
        <p><strong>Customer:</strong> ${order.shippingAddress?.name || 'Valued Customer'}</p>
        <p><strong>Address:</strong> ${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f4f4f4;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: $${order.totals?.subtotal || 0}</p>
          <p>Tax (5%): $${order.totals?.tax || 0}</p>
          <p>Delivery: $${order.totals?.deliveryFee || 0}</p>
          <h3>Grand Total: $${order.totals?.grandTotal || 0}</h3>
        </div>
      </div>
    </body>
    </html>
  `;
};
