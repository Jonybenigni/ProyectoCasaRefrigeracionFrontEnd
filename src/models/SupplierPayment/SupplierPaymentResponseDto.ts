// Espejo de Refrigeracion.Application.DTOs.SupplierPayment.SupplierPaymentResponseDto
// supplierName lo arma la API con el nombre del proveedor; paymentDate llega con hora (yyyy-MM-ddTHH:mm:ss)
export interface SupplierPaymentResponseDto {
  id: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  paymentDate: string;
  isPaid: boolean;
}
