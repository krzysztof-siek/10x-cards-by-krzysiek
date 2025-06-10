import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, resetPasswordSchema, newPasswordSchema } from "./auth.schema";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123!",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "invalid-email",
        password: "Password123!",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().email?._errors).toContain("Nieprawidłowy format adresu email");
      }
    });

    it("should require password field", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().password?._errors).toContain("Hasło jest wymagane");
      }
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().confirmPassword?._errors).toContain("Hasła muszą być identyczne");
      }
    });

    it("should reject passwords that are too short", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Pass1!",
        confirmPassword: "Pass1!",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().password?._errors).toContain("Hasło musi mieć minimum 8 znaków");
      }
    });

    it("should reject passwords without uppercase letters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123!",
        confirmPassword: "password123!",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().password?._errors).toContain(
          "Hasło musi zawierać przynajmniej jedną wielką literę"
        );
      }
    });

    it("should reject passwords without numbers", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password!",
        confirmPassword: "Password!",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().password?._errors).toContain("Hasło musi zawierać przynajmniej jedną cyfrę");
      }
    });

    it("should reject passwords without special characters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().password?._errors).toContain(
          "Hasło musi zawierać przynajmniej jeden znak specjalny"
        );
      }
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate correct reset password data", () => {
      const validData = {
        email: "test@example.com",
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "invalid-email",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().email?._errors).toContain("Nieprawidłowy format adresu email");
      }
    });
  });

  describe("newPasswordSchema", () => {
    it("should validate correct new password data", () => {
      const validData = {
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
        token: "valid-token",
      };

      const result = newPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const invalidData = {
        password: "NewPassword123!",
        confirmPassword: "DifferentPassword123!",
        token: "valid-token",
      };

      const result = newPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.format().confirmPassword?._errors).toContain("Hasła muszą być identyczne");
      }
    });

    it("should reject passwords without all required elements", () => {
      const invalidData = {
        password: "simple",
        confirmPassword: "simple",
        token: "valid-token",
      };

      const result = newPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.format().password?._errors || [];
        expect(errors.length).toBeGreaterThan(0);
        // Powinno zgłosić wszystkie problemy z hasłem
        expect(errors).toEqual(
          expect.arrayContaining([
            "Hasło musi mieć minimum 8 znaków",
            "Hasło musi zawierać przynajmniej jedną wielką literę",
            "Hasło musi zawierać przynajmniej jedną cyfrę",
            "Hasło musi zawierać przynajmniej jeden znak specjalny",
          ])
        );
      }
    });

    it("should accept token field even if empty", () => {
      const invalidData = {
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
        token: "",
      };

      const result = newPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(true); // Token może być pusty w schemacie
    });
  });
});
