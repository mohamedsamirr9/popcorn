import React, { use, useState } from "react";
import ReactDOM from "react-dom/client";
import StarRating from "./StarRating";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/*<Test /> */}
  </React.StrictMode>
);
{
  /*function Test() {
  const [rating, setRating] = useState(0);
  return (
    <>
      <StarRating
        maxRating={6}
        messages={["poor", "fair", "good", "very good", "amazing"]}
        onSetRating={setRating}
      />
      <p>{rating}</p>
    </>
  );
}*/
}
