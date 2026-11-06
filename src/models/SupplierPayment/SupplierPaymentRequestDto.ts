// supplierId arranca en null hasta que se elige un proveedor en el formulario
// paymentDate viaja como texto ISO (yyyy-MM-dd); la API lo convierte a DateTime
export interface SupplierPaymentRequestDto {
  supplierId: number | null;
  amount: number;
  paymentDate: string;
  isPaid: boolean;
}
