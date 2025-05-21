import {render, screen, waitFor} from "@testing-library/react";
import {TextEncoder} from 'util';

global.TextEncoder = TextEncoder;
import {MemoryRouter, Route, Routes} from "react-router-dom";
import LoginPage from "../../../src/routes/login/LoginPage";
import {expect, describe, it} from "@jest/globals";

describe("LoginPage Component", () => {

    it("renders LoginPage component", async () => {
        render(
            <MemoryRouter>
                <LoginPage/>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText("Login to your diaries")).toBeDefined();
            expect(screen.getByText("Username")).toBeDefined();
            expect(screen.getByText("Password")).toBeDefined();

            const button = screen.getByRole("button");
            expect(button).toBeDefined();
            expect(button.textContent).toBe("Login");
        });
    });


});