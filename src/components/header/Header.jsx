import React, { useState } from "react";
import { Container, Logo } from "../index";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTagline = () => {
    switch (location.pathname) {
      case "/":
        return "Discover, Share, and Write Stories";
      case "/all-posts":
        return "Explore All Posts from Our Community";
      case "/add-post":
        return "Share Your Thoughts with Everyone";
      case "/profile":
        return "Your Personal Space, Your Stories";
      case "/login":
        return "Welcome Back! Please Login";
      default:
        return "";
    }
  };

  const tagline = getPageTagline();

  const navItems = [
    { name: "Home", slug: "/", show: true },
    { name: "All Posts", slug: "/all-posts", show: true },
    { name: "Add Post", slug: "/add-post", show: authStatus },
    { name: "Login", slug: "/login", show: !authStatus },
    { name: "Profile", slug: "/profile", show: authStatus },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-yellow-300/90 backdrop-blur-md shadow-md border-b border-yellow-400">
      <Container>
        <nav className="flex flex-col md:flex-row md:items-center justify-between py-3 relative gap-2">
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <Logo width="80px" />
            </button>

            {tagline && (
              <p className="flex-1 text-gray-800 italic font-medium text-sm truncate md:hidden">
                {tagline}
              </p>
            )}

            <button
              className="md:hidden text-gray-800 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>

          {tagline && (
            <p className="hidden md:block text-gray-800 italic font-medium text-center md:text-left flex-1">
              {tagline}
            </p>
          )}

          <ul className="hidden md:flex items-center gap-2">
            {navItems.map(
              (item) =>
                item.show && (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.slug)}
                      className="px-4 py-2 rounded-full text-gray-800 font-medium hover:bg-black hover:text-yellow-300 transition duration-200"
                    >
                      {item.name}
                    </button>
                  </li>
                )
            )}
          </ul>

          {mobileMenuOpen && (
            <div className="md:hidden w-full bg-yellow-200 rounded-md shadow-lg overflow-hidden transition-all duration-300 mt-2">
              <ul className="flex flex-col p-2">
                {navItems.map(
                  (item, index) =>
                    item.show && (
                      <li
                        key={item.name}
                        style={{
                          transition: "all 0.3s ease",
                          transitionDelay: `${index * 0.05}s`,
                        }}
                      >
                        <button
                          onClick={() => {
                            navigate(item.slug);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 rounded hover:bg-black hover:text-yellow-300 transition"
                        >
                          {item.name}
                        </button>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </nav>
      </Container>
    </header>
  );
}

export default Header;