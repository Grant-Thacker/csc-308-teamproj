import {render, screen, waitFor} from "@testing-library/react";
import {TextEncoder} from 'util';

global.TextEncoder = TextEncoder;
import {MemoryRouter} from "react-router-dom";
import AccountPage from "../../../src/routes/account/AccountPage";
import {expect, describe, it, beforeEach, beforeAll} from "@jest/globals";
import userEvent from "@testing-library/user-event";
import type * as backendApi from "../../../src/api/backend";
import {jest} from "@jest/globals";
import {act} from "react";

jest.mock("../../../src/api/backend", () => ({
    getUser: jest.fn(),
    editUser: jest.fn(),
    editPassword: jest.fn(),
}));
// Dummy Data
const dummyUser = {
    _id: "1",
    username: "testuser",
    email: "testuser@example.com",
    password: "pass",
    diariesID: [],
    profilePicture: null,
};

const {getUser, editPassword, editUser} = require("../../../src/api/backend");
const mockedGetUser = getUser as jest.MockedFunction<typeof backendApi.getUser>;
const mockedEditPassword = editPassword as jest.MockedFunction<typeof backendApi.editPassword>;
const mockedEditUser = editUser as jest.MockedFunction<typeof backendApi.editUser>;


describe("AccountPage Component", () => {
    const user = userEvent.setup();

    async function renderWithRouter(component: React.ReactNode) {
        await act(async () => {
            render(<MemoryRouter>{component}</MemoryRouter>);
        });
    }

    beforeAll(() => {
        global.URL.createObjectURL = jest.fn(() => "mocked-preview-url");
    })
    beforeEach(() => {
        mockedGetUser.mockResolvedValue(dummyUser);
        mockedEditPassword.mockResolvedValue(dummyUser);
        mockedEditUser.mockResolvedValue({...dummyUser, profilePicture: dummyUser.profilePicture});
        window.alert = jest.fn();
    });

    it("renders AccountPage component", async () => {
        render(
            <MemoryRouter>
                <AccountPage/>
            </MemoryRouter>
        );
        await waitFor(() => {
            const heading = screen.getByText("Account Settings");
            expect(heading).toBeDefined();

            const profileBtn = screen.getByRole("button", {name: "Change Profile Picture"});
            const resetBtn = screen.getByRole("button", {name: "Reset Password"});

            expect(profileBtn).toBeDefined();
            expect(resetBtn).toBeDefined();

            const logoutBtn = screen.getByRole("link", {name: "Log Out"});
            expect(logoutBtn).toBeDefined();


            const username = screen.getByText("Username: testuser");
            expect(username).toBeDefined();

            const email = screen.getByText("Email: testuser@example.com");
            expect(email).toBeDefined();
        });
    });
    it("opens password modal and shows modal buttons", async () => {
        await renderWithRouter(<AccountPage/>);


        const resetBtn = screen.getByRole("button", {name: "Reset Password"});
        await user.click(resetBtn);

        const cancelModalBtn = await screen.getByRole("button", {name: "Cancel"});
        const changePwdBtn = await screen.getByRole("button", {name: "Change Password"});
        expect(cancelModalBtn).toBeDefined();
        expect(changePwdBtn).toBeTruthy();

        const newPwdInput = await screen.findByPlaceholderText("Enter new password");

        await user.type(newPwdInput, "newPassword");

        // click the "change password" button
        await user.click(changePwdBtn);

        await waitFor(() => {
            expect(mockedEditPassword).toBeCalledWith("1", "newPassword");
        })


    });

    it("opens profile picture modal and shows", async () => {
        await renderWithRouter(<AccountPage/>);

        const profileBtn = screen.getByRole("button", {name: "Change Profile Picture"});
        await user.click(profileBtn);

        const cancelModalBtn = await screen.getByRole("button", {name: "Cancel"});
        const uploadBtn = await screen.getByRole("button", {name: "Upload"});

        expect(cancelModalBtn).toBeDefined();
        expect(uploadBtn).toBeDefined();
        expect(uploadBtn.getAttribute("aria-disabled")).toBe("true");

        // Find the url input
        const urlInput = screen.getByPlaceholderText("Enter image URL");
        expect(urlInput).toBeDefined();

        const display = screen.getByText("No image URL");
        expect(display).toBeDefined();

        const url = "https://image"
        await user.type(urlInput, url);

        await waitFor(() => {
            expect(uploadBtn.getAttribute("aria-disabled")).toBe("false");
        })


        await user.click(uploadBtn);
        await waitFor(() => {
            expect(editUser).toHaveBeenCalledWith({
                email: "testuser@example.com",
                profilePicture: "https://image",
                username: "testuser",
            }, "1");
        })
        expect(window.alert).toHaveBeenCalledWith("Profile picture updated!");

    });


});