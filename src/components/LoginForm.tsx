"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Store, Key, Lock, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useToast } from "./Toast";

interface ValidationErrors {
  url?: string;
  key?: string;
  secret?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [credentials, setCredentials] = useState({
    url: "",
    key: "",
    secret: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSecret, setShowSecret] = useState(false);

  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case "url":
        if (!value) return "Store URL is required";
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          return "URL must start with http:// or https://";
        }
        try {
          new URL(value);
        } catch {
          return "Invalid URL format";
        }
        break;
      case "key":
        if (!value) return "Consumer key is required";
        if (!value.startsWith("ck_")) return "Key should start with ck_";
        if (value.length < 10) return "Key is too short";
        break;
      case "secret":
        if (!value) return "Consumer secret is required";
        if (!value.startsWith("cs_")) return "Secret should start with cs_";
        if (value.length < 10) return "Secret is too short";
        break;
    }
    return undefined;
  }, []);

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, credentials[name as keyof typeof credentials]);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    const urlError = validateField("url", credentials.url);
    const keyError = validateField("key", credentials.key);
    const secretError = validateField("secret", credentials.secret);

    if (urlError || keyError || secretError) {
      setFieldErrors({ url: urlError, key: keyError, secret: secretError });
      setTouched({ url: true, key: true, secret: true });
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || data.error || "Failed to connect";
        throw new Error(errorMsg);
      }

      showToast({
        type: "success",
        title: "Connected Successfully",
        message: "Redirecting to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setError(message);
      showToast({
        type: "error",
        title: "Connection Failed",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md animate-slideUp">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg mb-4 p-3">
              <img
                src="https://ci3.googleusercontent.com/meips/ADKq_NaE_oWXdD1JtInFmEcyVBj_2iUGqAxLkH0Puq4Ekzxkyax7RMFeP15ETdyAMHq5uOOPBgLceV0_auWlExOTyX-lgGdqQeIVkItlVKEtBkvGtzmTPczB_vJ5ZmQyow=s0-d-e1-ft#https://media.marka-img.com/2496c9ee/xtzZUEqs8oyai7SQP486DHaNA4VbUp.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              WooCommerce Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Connect your store to view real-time analytics
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store URL
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  required
                  placeholder="https://yourstore.com"
                  value={credentials.url}
                  onChange={(e) => handleChange("url", e.target.value)}
                  onBlur={() => handleBlur("url")}
                  className={`w-full pl-11 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                    fieldErrors.url && touched.url
                      ? "border-red-500 dark:border-red-500"
                      : touched.url && !fieldErrors.url
                      ? "border-green-500 dark:border-green-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {touched.url && !fieldErrors.url && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {fieldErrors.url && touched.url && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-fadeIn">{fieldErrors.url}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Consumer Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="ck_xxxxxxxxxxxxxxxx"
                  value={credentials.key}
                  onChange={(e) => handleChange("key", e.target.value)}
                  onBlur={() => handleBlur("key")}
                  className={`w-full pl-11 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                    fieldErrors.key && touched.key
                      ? "border-red-500 dark:border-red-500"
                      : touched.key && !fieldErrors.key
                      ? "border-green-500 dark:border-green-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {touched.key && !fieldErrors.key && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {fieldErrors.key && touched.key && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-fadeIn">{fieldErrors.key}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Consumer Secret
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showSecret ? "text" : "password"}
                  required
                  placeholder="cs_xxxxxxxxxxxxxxxx"
                  value={credentials.secret}
                  onChange={(e) => handleChange("secret", e.target.value)}
                  onBlur={() => handleBlur("secret")}
                  className={`w-full pl-11 pr-16 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                    fieldErrors.secret && touched.secret
                      ? "border-red-500 dark:border-red-500"
                      : touched.secret && !fieldErrors.secret
                      ? "border-green-500 dark:border-green-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {touched.secret && !fieldErrors.secret && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {fieldErrors.secret && touched.secret && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-fadeIn">{fieldErrors.secret}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Store"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700/50 dark:to-purple-900/20 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-gray-200">How to get your API keys:</strong>
              <br />
              <span className="mt-1 block">
                WooCommerce → Settings → Advanced → REST API → Add key
              </span>
              <span className="mt-1 block text-purple-600 dark:text-purple-400 font-medium">
                Set permissions to &quot;Read&quot; for analytics access.
              </span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Powered by WooCommerce REST API
        </p>
      </div>
    </div>
  );
}
