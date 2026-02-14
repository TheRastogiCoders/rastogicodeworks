import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const InvoiceSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, trim: true, lowercase: true },
    billingAddress: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    invoiceDate: { type: String, required: true },
    dueDate: { type: String },
    items: { type: [InvoiceItemSchema], default: [] },
    notes: { type: String, trim: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'overdue'],
      default: 'unpaid',
    },
  },
  { timestamps: true },
);

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

