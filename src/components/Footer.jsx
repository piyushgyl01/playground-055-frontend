import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-5 py-3 bg-light">
      <div className="container">
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <Link to="/" className="text-decoration-none">
              <h5 className="mb-0 text-success">Postify</h5>
            </Link>
            <p className="text-muted small mb-0">
              Post your heart out through content
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="text-muted small mb-0">
              &copy; {currentYear} Postify. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
