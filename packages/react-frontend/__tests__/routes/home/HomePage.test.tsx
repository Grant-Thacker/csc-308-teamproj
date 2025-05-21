import {render, screen, waitFor} from "@testing-library/react";
import {TextEncoder} from 'util';

global.TextEncoder = TextEncoder;
import {MemoryRouter} from "react-router-dom";
import HomePage from "../../../src/routes/home/HomePage";
import {expect, describe, it, jest, beforeEach} from "@jest/globals";
import {getUserDiaries} from "../../../src/api/backend";

import type * as backendApi from "../../../src/api/backend";


// Mocking the getUserDiaries function (ensure it's correctly mocked)
jest.mock("../../../src/api/backend", () => ({
    getUserDiaries: jest.fn(),
}));

const mockedGetUserDiaries = getUserDiaries as jest.MockedFunction<typeof backendApi.getUserDiaries>;

describe("HomePage Component", () => {
    beforeEach(() => {
        // Set up mock for getUserDiaries
        mockedGetUserDiaries.mockResolvedValue([
            {
                _id: "1",
                title: "Diary 1",
                lastEntry: "12-02-2025",
                numEntries: 25,
                entries: [],
            },
            {
                _id: "2",
                title: "A Second Diary",
                lastEntry: "12-11-2025",
                numEntries: 1,
                entries: [],
            },
        ]);
    });

    it("renders HomeHeader component", async () => {
        render(
            <MemoryRouter>
                <HomePage/>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText("Welcome to Diary")).toBeDefined();
        });
    });

    it("renders loading state initially", async () => {
        render(
            <MemoryRouter>
                <HomePage/>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Loading...")).toBeDefined();
        });
    });

    it("renders Create Diary button", async () => {
        render(
            <MemoryRouter>
                <HomePage/>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText("Create Diary")).toBeDefined();
        });
    });
    it('renders Diary titles in user.ts is successful', async () => {
        render(<MemoryRouter>
            <HomePage/>
        </MemoryRouter>);

        // Ensure that the diary titles are rendered after data is fetched
        const diary1Title = await screen.findByText('Diary 1');
        const diary2Title = await screen.findByText('A Second Diary');

        expect(diary1Title).toBeDefined();
        expect(diary2Title).toBeDefined();


        // expect(await screen.findByText('Another Entry')).toBeInTheDocument();
    });
    it("should fail when component does not render a specific element", async () => {
        render(<MemoryRouter>
            <HomePage/>
        </MemoryRouter>);

        // This assertion will fail because "Non-existent button" doesn't exist
        await expect(screen.findByText('not exist')).rejects.toThrow();
    });

    it("should throw error failed fetch", async () => {
        mockedGetUserDiaries.mockRejectedValue(new Error("Fetch failed"));
        render(<MemoryRouter>
            <HomePage/>
        </MemoryRouter>)

        const errorMessage = await screen.findByText("Error: Failed to load diaries")

        expect(errorMessage).toBeDefined();
    });
});
