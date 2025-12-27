import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const loginRef = useRef(null);

  const handleCancel = () => {
    setIsAuthenticated(false);
    setIsFocusWithin(false);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleContainerFocus = () => {
    setIsFocusWithin(true);
  };

  const handleContainerBlur = () => {
    const next = e.relatedTarget;
    if (loginRef.current && next && loginRef.current.contains(next)) {
      return;
    }
    if (!isAuthenticated) {
      setIsFocusWithin(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const navigate = useNavigate();
  return (
    <div className="login-body w-full" dir="rtl">
      <div className={`box`}>
        <div
          className="login"
          ref={loginRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          aria-busy={isAuthenticated ? "true" : "false"}
          onFocus={handleContainerFocus}
          onBlur={handleContainerBlur}
          onKeyDown={handleKeyDown}
        >
          <div className="loginBx">
            <h2>
              <i className="fa-solid fa-right-to-bracket ml-2"></i>
              ورود
            </h2>
            {error && (
              <div role="alert" style={{ color: "#f87171", marginBottom: 8 }}>
                {error}
              </div>
            )}
            <form style={{ width: "100%" }}>
              <input
                type="text"
                name="email"
                placeholder="ایمیل خود را وارد کنید"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="رمز عبور"
                aria-label="رمز عبور"
                autoComplete="current-password"
                required
              />
              <div className="actions">
                {" "}
                <input
                  type="submit"
                  value={isAuthenticated ? "در حال ورود ..." : "ورود"}
                  disabled={isAuthenticated}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
