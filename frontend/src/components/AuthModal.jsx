
// import { useState } from "react";
// import {
//   GoogleAuthProvider,
//   signInWithPopup,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword
// } from "firebase/auth";

// import { auth } from "../firebase";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// export default function AuthModal({ onClose, onSuccess }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [tab, setTab] = useState("login");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // 🔥 Sync user to backend (MongoDB)
//   const syncUser = async (user) => {
//     await fetch(`${BACKEND_URL}/api/user/sync`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(user)
//     });
//   };

//   // 🔐 EMAIL AUTH
//   const handleEmailAuth = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let userCred;

//       if (tab === "register") {
//         userCred = await createUserWithEmailAndPassword(auth, email, password);
//       } else {
//         userCred = await signInWithEmailAndPassword(auth, email, password);
//       }

//       const user = userCred.user;

//       const userData = {
//         uid: user.uid,
//         email: user.email,
//         name: name || user.email
//       };

//       await syncUser(userData);
//       onSuccess(userData);
//     } catch (err) {
//       setError(err.message);
//     }

//     setLoading(false);
//   };

//   // 🔥 GOOGLE LOGIN
//   const handleGoogle = async () => {
//     setLoading(true);

//     try {
//       const provider = new GoogleAuthProvider();
//       const res = await signInWithPopup(auth, provider);

//       const user = res.user;

//       const userData = {
//         uid: user.uid,
//         email: user.email,
//         name: user.displayName
//       };

//       await syncUser(userData);
//       onSuccess(userData);
//     } catch (err) {
//       setError(err.message);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="auth-modal">
//       <h2>{tab === "login" ? "Login" : "Register"}</h2>

//       <button onClick={handleGoogle}>
//         Continue with Google
//       </button>

//       <form onSubmit={handleEmailAuth}>
//         {tab === "register" && (
//           <input
//             placeholder="Name"
//             onChange={(e) => setName(e.target.value)}
//           />
//         )}

//         <input
//           placeholder="Email"
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           placeholder="Password"
//           type="password"
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button type="submit">
//           {loading ? "Loading..." : tab}
//         </button>
//       </form>

//       {error && <p>{error}</p>}
//     </div>
//   );
// }


import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../firebase";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

export default function AuthModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const syncUser = async (user) => {
    try {
      await fetch(`${BACKEND_URL}/api/user/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
    } catch (err) {
      console.error("Backend user sync failed:", err);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCred;

      if (tab === "register") {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCred.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        name: name || user.email
      };

      await syncUser(userData);

      if (onSuccess) {
        onSuccess(userData);
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      const user = res.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email
      };

      await syncUser(userData);

      if (onSuccess) {
        onSuccess(userData);
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-box">
        <button className="auth-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="auth-header">
          <div className="auth-logo">🎙️</div>
          <h2>{tab === "login" ? "Login to Sarvbhasa" : "Create Account"}</h2>
          <p>
            {tab === "login"
              ? "Continue your multilingual AI journey"
              : "Join Sarvbhasa and save your translation history"}
          </p>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogle}
          disabled={loading}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          {tab === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Please wait..." : tab === "login" ? "Login" : "Register"}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-switch">
          {tab === "login" ? (
            <p>
              Don’t have an account?{" "}
              <button type="button" onClick={() => setTab("register")}>
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setTab("login")}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}