import { Module } from '@nestjs/common';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { PurchaseInvoiceModule } from './purchase-invoice/purchase-invoice.module';

@Module({
  imports: [PurchaseOrderModule, PurchaseInvoiceModule],
  exports: [PurchaseOrderModule, PurchaseInvoiceModule],
})
export class PurchaseModule {}
