// Espejo de Refrigeracion.Application.DTOs.Login.LoginUserResponseDto
export interface LoginUserResponseDto {
  login: boolean
  token: string | null
  userName: string | null
  mail: string | null
  errors: string[] | null
}