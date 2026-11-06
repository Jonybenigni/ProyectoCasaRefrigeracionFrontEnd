// Espejo de Refrigeracion.Application.DTOs.ProductSupplier.ProductSupplierResponseDto
// productName y supplierName los arma la API con los nombres de cada tabla
export interface ProductSupplierResponseDto {
  id: number;
  productId: number;
  productName: string;
  supplierId: number;
  supplierName: string;
}
