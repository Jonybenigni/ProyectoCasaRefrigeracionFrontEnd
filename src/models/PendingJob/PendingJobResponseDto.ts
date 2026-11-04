// Espejo de Refrigeracion.Application.DTOs.PendingJob.PendingJobResponseDto
// customerName lo arma la API con el nombre del cliente; jobDate llega con hora (yyyy-MM-ddTHH:mm:ss)
export interface PendingJobResponseDto {
  id: number;
  customerId: number;
  customerName: string;
  description: string;
  amount: number;
  jobDate: string;
  isPaid: boolean;
}
