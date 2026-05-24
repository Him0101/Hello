import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

function TestAuth() {

  const testSignup = async () => {
    const email = "test123@gmail.com";
    const password = "123456";

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ Firebase user created:", userCredential.user);
      alert("Signup working!");
    } catch (err) {
      console.log("❌ Error:", err.message);
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Firebase Test</h2>
      <button onClick={testSignup}>
        Test Signup
      </button>
    </div>
  );
}

export default TestAuth;
