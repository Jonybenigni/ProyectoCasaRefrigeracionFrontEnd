// expirationDate viaja como texto ISO (yyyy-MM-dd); la API lo convierte a DateTime
export interface TaskItemRequestDto {
  title: string;
  description: string;
  expirationDate: string;
  isCompleted: boolean;
}
