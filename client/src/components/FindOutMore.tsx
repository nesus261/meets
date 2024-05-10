import Button from "./Button";

const FindOutMore = () => {
  return (
    <div className="w-100">
      <center className="align-middle container-3">
        <div className="alert alert-info container-4">
          <div>
            <h3>Find out more</h3>
          </div>
          <div>
            <p>Find out more about our products.</p>
          </div>
          <Button
            style={{
              width: "50%",
              margin: "10px",
              height: "45px",
              fontSize: "20px",
            }}
          >
            Look
          </Button>
        </div>
      </center>
    </div>
  );
};

export default FindOutMore;
