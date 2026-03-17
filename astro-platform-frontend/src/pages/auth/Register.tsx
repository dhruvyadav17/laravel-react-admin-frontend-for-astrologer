import RegisterForm from "../../auth/RegisterForm";

export default function Register() {
  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h4 className="mb-3 text-center">
        Create Account
      </h4>

      <RegisterForm />
    </div>
  );
}
