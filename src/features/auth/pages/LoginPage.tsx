import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "../types";
import { loginService } from "../../../api/auth/auth.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(data: LoginData) {
    try {
      setError("");

      const { token, user } = await loginService(data);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/reservas");
    } catch (err: any) {
      setError(err.response?.data?.message || "Credenciais inválidas");
    }
  }

  return (
    <div style={{
      maxWidth: "400px",
      margin: "80px auto",
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px"
    }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        
        <label>Email</label>
        <input
          type="email"
          {...register("email")}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

        <label>Senha</label>
        <input
          type="password"
          {...register("password")}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "10px",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
            borderRadius: "6px",
            marginTop: "10px"
          }}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
