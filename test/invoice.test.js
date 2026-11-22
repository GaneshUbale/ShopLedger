'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

var cases = [
  {
    name: 'CURRENT BEHAVIOUR: #1001 mixed 5% and 12% invoice totals full item tax',
    order: {
      id: 1001,
      coupon: '',
      items: [
        { id: 'rice', name: 'Rice', price: 100, qty: 2, hsn: '1006', gstRate: 5 },
        { id: 'ghee', name: 'Ghee', price: 200, qty: 1, hsn: '0405', gstRate: 12 }
      ]
    },
    invoiceExpected: { subtotal: 400, discount: 0, tax: 34, cgst: 17, sgst: 17, total: 434 },
    pricingExpected: { subtotal: 400, discount: 0, taxable: 400, tax: 34, cgst: 17, sgst: 17, total: 434 }
  },
  {
    name: '#1002 SAVE10 invoice matches checkout discount and tax',
    order: {
      id: 1002,
      coupon: 'SAVE10',
      items: [
        { id: 'rice', name: 'Rice', price: 600, qty: 1, hsn: '1006', gstRate: 5 },
        { id: 'ghee', name: 'Ghee', price: 400, qty: 1, hsn: '0405', gstRate: 12 }
      ]
    },
    invoiceExpected: { subtotal: 1000, discount: 100, tax: 70.2, cgst: 35.1, sgst: 35.1, total: 970.2 },
    pricingExpected: { subtotal: 1000, discount: 100, taxable: 900, tax: 70.2, cgst: 35.1, sgst: 35.1, total: 970.2 }
  },
  {
    name: '#1004 SAVE10 invoice applies the ₹150 coupon cap before tax',
    order: {
      id: 1004,
      coupon: 'SAVE10',
      items: [
        { id: 'bulk', name: 'Bulk goods', price: 2240, qty: 1, hsn: '2106', gstRate: 18 }
      ]
    },
    invoiceExpected: { subtotal: 2240, discount: 150, tax: 376.2, cgst: 188.1, sgst: 188.1, total: 2466.2 },
    pricingExpected: { subtotal: 2240, discount: 150, taxable: 2090, tax: 376.2, cgst: 188.1, sgst: 188.1, total: 2466.2 }
  },
  {
    name: 'CURRENT BEHAVIOUR: #1008 all 18% invoice matches pricing without a coupon',
    order: {
      id: 1008,
      coupon: '',
      items: [
        { id: 'tea', name: 'Tea', price: 500, qty: 2, hsn: '0902', gstRate: 18 }
      ]
    },
    invoiceExpected: { subtotal: 1000, discount: 0, tax: 180, cgst: 90, sgst: 90, total: 1180 },
    pricingExpected: { subtotal: 1000, discount: 0, taxable: 1000, tax: 180, cgst: 90, sgst: 90, total: 1180 }
  }
];

cases.forEach(function (entry) {
  test(entry.name, function () {
    var figures = invoice.computeInvoiceFigures(entry.order);
    var totals = pricing.computeTotals(entry.order.items, entry.order.coupon);

    assert.deepEqual({
      subtotal: figures.subtotal,
      discount: figures.discount,
      tax: figures.tax,
      cgst: figures.cgst,
      sgst: figures.sgst,
      total: figures.total
    }, entry.invoiceExpected);
    assert.deepEqual({
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxable: totals.taxable,
      tax: totals.tax,
      cgst: totals.cgst,
      sgst: totals.sgst,
      total: totals.total
    }, entry.pricingExpected);
  });
});

test('invoice matches checkout for HSN slabs and capped coupons', function () {
  var checkoutOrders = [
    {
      id: 1001,
      coupon: '',
      total: 676.9,
      items: [
        { id: 8, name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', price: 140, qty: 2, hsn: '0902' },
        { id: 2, name: 'Unpolished Toor Dal 1kg', sku: 'GRN-002', price: 165, qty: 2, hsn: '0713' }
      ]
    },
    {
      id: 1002,
      coupon: 'SAVE10',
      total: 963.9,
      items: [
        { id: 1, name: 'Indrayani Basmati Rice 5kg', sku: 'GRN-001', price: 640, qty: 1, hsn: '1006' },
        { id: 4, name: 'Cold-Pressed Sunflower Oil 1L', sku: 'OIL-001', price: 190, qty: 2, hsn: '1512' }
      ]
    },
    {
      id: 1004,
      coupon: 'SAVE10',
      total: 2194.5,
      items: [
        { id: 5, name: 'Cold-Pressed Groundnut Oil 5L', sku: 'OIL-002', price: 1120, qty: 2, hsn: '1508' }
      ]
    },
    {
      id: 1008,
      coupon: '',
      total: 590,
      items: [
        { id: 8, name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', price: 140, qty: 1, hsn: '0902' },
        { id: 12, name: 'Kokum Sherbet Concentrate 750ml', sku: 'BEV-003', price: 180, qty: 2, hsn: '2106' }
      ]
    }
  ];

  checkoutOrders.forEach(function (order) {
    var figures = invoice.computeInvoiceFigures(order);
    var totals = pricing.computeTotals(order.items, order.coupon);

    assert.equal(totals.total, order.total, 'checkout fixture total for #' + order.id);
    assert.deepEqual({
      subtotal: figures.subtotal,
      discount: figures.discount,
      tax: figures.tax,
      cgst: figures.cgst,
      sgst: figures.sgst,
      total: figures.total
    }, {
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      cgst: totals.cgst,
      sgst: totals.sgst,
      total: totals.total
    }, 'invoice totals for #' + order.id);
    assert.deepEqual(figures.rows.map(function (row) {
      return { gstPercent: row.gstPercent, lineTax: row.lineTax };
    }), totals.lines.map(function (line) {
      return { gstPercent: line.gstPercent, lineTax: line.tax };
    }), 'invoice line GST for #' + order.id);
  });
});
