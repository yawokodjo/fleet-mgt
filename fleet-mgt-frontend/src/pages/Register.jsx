import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // 🔹 Vérification des critères du mot de passe
  const getPasswordCriteria = (password) => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  };

  const criteria = getPasswordCriteria(form.password);
  const allCriteriaMet = Object.values(criteria).every(Boolean);

  // 🔹 Calcul de la force pour la barre
  const passwordStrength = allCriteriaMet
    ? { strength: 100, label: "Fort", color: "#28a745" }
    : {
      strength:
        Object.values(criteria).filter(Boolean).length * 20,
      label: "Faible",
      color: "#dc3545"
    };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!allCriteriaMet) {
      setError(
        "Le mot de passe doit avoir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      );
      return;
    }

    if (!form.role) {
      setError("Veuillez sélectionner un rôle.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
        role: form.role
      });

      const { user, access_token } = res.data;
      login(user, access_token);
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f2f2f2" }}>
      <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "450px", borderRadius: "1rem" }}>
        <div className="card-body">
          <h2 className="text-center mb-4 fw-bold">Créer un compte</h2>

          {error && (
            <div className="alert alert-danger text-center py-2" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <div>
              <label htmlFor="name" className="form-label fw-bold">Nom complet</label>
              <input
                type="text"
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Entrez votre nom complet"
                className="form-control"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="form-label fw-bold">Rôle</label>
              <select
                name="role"
                id="role"
                value={form.role}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
                required
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="form-label fw-bold">Adresse e-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder="exemple@mail.com"
                className="form-control"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label fw-bold">Mot de passe</label>
              <input
                type="password"
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                className="form-control"
                disabled={loading}
                required
              />

              {/* 🔹 Barre de force */}
              {form.password && (
                <>
                  <div className="mt-2 mb-1">
                    <div className="progress" style={{ height: "10px", borderRadius: "5px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color,
                          transition: "width 0.3s"
                        }}
                        aria-valuenow={passwordStrength.strength}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                    <small style={{ color: passwordStrength.color, fontWeight: "bold" }}>
                      {passwordStrength.label}
                    </small>
                  </div>

                  {/* 🔹 Liste des critères */}
                  <ul className="list-unstyled mb-0">
                    <li style={{ color: criteria.uppercase ? "#28a745" : "#dc3545" }}>
                      {criteria.uppercase ? "✔" : "✖"} Une majuscule
                    </li>
                    <li style={{ color: criteria.lowercase ? "#28a745" : "#dc3545" }}>
                      {criteria.lowercase ? "✔" : "✖"} Une minuscule
                    </li>
                    <li style={{ color: criteria.number ? "#28a745" : "#dc3545" }}>
                      {criteria.number ? "✔" : "✖"} Un chiffre
                    </li>
                    <li style={{ color: criteria.special ? "#28a745" : "#dc3545" }}>
                      {criteria.special ? "✔" : "✖"} Un caractère spécial
                    </li>
                    <li style={{ color: criteria.length ? "#28a745" : "#dc3545" }}>
                      {criteria.length ? "✔" : "✖"} Au moins 8 caractères
                    </li>
                  </ul>
                </>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label fw-bold">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                className="form-control"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success py-2 fw-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Inscription...
                </>
              ) : (
                '✅ S\'inscrire'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="fw-bold text-muted">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="text-success text-decoration-none fw-bold">
                Connectez-vous
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
