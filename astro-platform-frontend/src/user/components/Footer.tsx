export default function Footer() {
  return (
    <footer className="bg-danger text-white pt-5 pb-3 mt-5">
      <div className="container">

        <div className="row">

          <div className="col-md-3">
            <h5>Horoscope</h5>
            <p>Daily / Weekly / Monthly</p>
          </div>

          <div className="col-md-3">
            <h5>Services</h5>
            <p>Panchang, Astrology</p>
          </div>

          <div className="col-md-3">
            <h5>Quick Links</h5>
            <p>About, Contact</p>
          </div>

          <div className="col-md-3">
            <h5>Newsletter</h5>
            <input className="form-control" placeholder="Email" />
          </div>

        </div>

        <hr />

        <p className="text-center m-0">
          © AstroPandit
        </p>
      </div>
    </footer>
  );
}