// Espejo de Refrigeracion.Application.DTOs.TaskItem.TaskItemResponseDto
// expirationDate llega como texto ISO con hora (yyyy-MM-ddTHH:mm:ss)
export interface TaskItemResponseDto {
  id: number;
  title: string;
  description: string;
  expirationDate: string;
  isCompleted: boolean;
}
