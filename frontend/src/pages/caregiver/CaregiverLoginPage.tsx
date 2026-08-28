import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api/auth";

export function CaregiverLoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await authApi.login(email, password);
        if (res.ok && res.data) {
          localStorage.setItem("caregiver_token", res.data.access_token);
          navigate("/caregiver");
        } else {
          setError(res.error || "Login failed");
        }
      } else {
        const regRes = await authApi.register({ email, password, name });
        if (regRes.ok) {
          // Auto login after register
          const loginRes = await authApi.login(email, password);
          if (loginRes.ok && loginRes.data) {
            localStorage.setItem("caregiver_token", loginRes.data.access_token);
            navigate("/caregiver");
          }
        } else {
          setError(regRes.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-elder-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-elder-ink">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-elder-muted text-sm mt-2">
            Caregiver Portal for Smriti
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-elder-ink mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-elder-primary focus:bg-white rounded-xl p-3 outline-none transition-colors"
                placeholder="Dr. John Doe"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-elder-ink mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-elder-primary focus:bg-white rounded-xl p-3 outline-none transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-elder-ink mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-elder-primary focus:bg-white rounded-xl p-3 outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-elder-primary text-white font-bold text-lg py-4 rounded-xl mt-2 disabled:opacity-50 hover:bg-elder-primary/90 transition-colors shadow-sm"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Register")}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium">
          <span className="text-elder-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          {" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-elder-primary hover:underline"
          >
            {isLogin ? "Register now" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
