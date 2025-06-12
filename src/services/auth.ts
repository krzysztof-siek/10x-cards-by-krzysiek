import type { AuthResponseDTO } from "@/types";
import type {
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
  NewPasswordFormValues,
} from "@/schemas/auth";

class AuthService {
  private async request(endpoint: string, data: unknown): Promise<AuthResponseDTO> {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Wystąpił błąd podczas operacji");
    }

    return result;
  }

  async login(data: LoginFormValues): Promise<AuthResponseDTO> {
    return this.request("login", data);
  }

  async register(data: RegisterFormValues): Promise<AuthResponseDTO> {
    return this.request("register", data);
  }

  async resetPassword(data: ResetPasswordFormValues): Promise<AuthResponseDTO> {
    return this.request("reset-password", data);
  }

  async setNewPassword(data: NewPasswordFormValues): Promise<AuthResponseDTO> {
    return this.request("new-password", data);
  }
}

export const authService = new AuthService();
