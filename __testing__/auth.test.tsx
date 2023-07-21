import { render, screen } from "@testing-library/react";
import LoginPage from "pages/index";

import "@testing-library/jest-dom";

jest.mock("next/router", () => require("next-router-mock"));

describe("Login Page", () => {
  it("should render the login page", () => {
    render(<LoginPage />);
    const header = screen.getByRole("heading", { level: 3, name: "Login" });
    const formLogin = screen.getByRole("form", { name: "login" });

    expect(header).toBeInTheDocument();
    expect(formLogin).toBeInTheDocument();
  });
});
