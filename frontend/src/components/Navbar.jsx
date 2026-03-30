import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const getStoredUser = () => JSON.parse(localStorage.getItem("user") || "null");
const getStoredCartCount = () =>
  JSON.parse(localStorage.getItem("cart") || "[]").reduce((sum, item) => sum + item.quantity, 0);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState({
    token: localStorage.getItem("token"),
    isAdmin: localStorage.getItem("isAdmin") === "true",
    user: getStoredUser(),
    cartCount: getStoredCartCount(),
  });

  useEffect(() => {
    const syncSession = () => {
      setSession({
        token: localStorage.getItem("token"),
        isAdmin: localStorage.getItem("isAdmin") === "true",
        user: getStoredUser(),
        cartCount: getStoredCartCount(),
      });
    };

    window.addEventListener("storage", syncSession);
    window.addEventListener("cart-updated", syncSession);
    window.addEventListener("session-updated", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("cart-updated", syncSession);
      window.removeEventListener("session-updated", syncSession);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(
    () => [
      { href: "/#about", label: "About" },
      { href: "/#timing", label: "Shop Timing" },
      { href: "/#products", label: "Products" },
    ],
    []
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    localStorage.removeItem("checkoutNow");
    window.dispatchEvent(new Event("session-updated"));
    navigate("/login");
  };

  return (
    <header className="site-nav">
      <div className="site-brand">
        <Link to="/" className="brand-mark">
          <span className="brand-kicker">Salunkhe</span>
          <span className="brand-title">Poultry Market</span>
        </Link>
        <p className="brand-subtitle">Farm-fresh meat, eggs, and repeat-order convenience.</p>
      </div>

      <button
        type="button"
        className={`nav-toggle ${menuOpen ? "open" : ""}`}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-drawer ${menuOpen ? "open" : ""}`}>
        <nav className="site-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-actions">
          <Link to="/cart" className="nav-pill">
            Cart
            <span className="nav-pill-count">{session.cartCount}</span>
          </Link>

          {session.token ? (
            <>
              <Link to="/profile" className="nav-avatar">
                <span>{session.user?.name?.charAt(0) || "U"}</span>
                <small>{session.user?.name || "Profile"}</small>
              </Link>
              {session.isAdmin ? (
                <Link to="/admin" className="nav-button nav-button-secondary">
                  Admin Panel
                </Link>
              ) : null}
              <button type="button" className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button nav-button-secondary">
                Login
              </Link>
              <Link to="/register" className="nav-button">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
