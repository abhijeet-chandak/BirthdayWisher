import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the landing page", () => {
  render(<App />);
  expect(
    screen.getByRole("button", { name: /get started/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/a unique birthday song for everyone/i)
  ).toBeInTheDocument();
});
