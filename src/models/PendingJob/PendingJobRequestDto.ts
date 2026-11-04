// customerId arranca en null hasta que se elige un cliente en el formulario
// jobDate viaja como texto ISO (yyyy-MM-dd); la API lo convierte a DateTime
export interface PendingJobRequestDto {
  customerId: number | null;
  description: string;
  amount: number;
  jobDate: string;
  isPaid: boolean;
}
