import {render, screen, waitFor} from "@testing-library/react";
import {TextEncoder, TextDecoder} from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
import {MemoryRouter} from "react-router-dom";
import {expect, describe, it, jest, beforeEach} from "@jest/globals";
import {findRandomPage} from "../../../src/api/backend";
import RandomPage from "../../../src/routes/random/RandomPage";
import type * as backendApi from "../../../src/api/backend";
import HomePage from "@src/routes/home/HomePage";


jest.mock("../../../src/api/backend", () => ({
    findRandomPage: jest.fn(),
}));

const mockedFindRandomPage = findRandomPage as jest.MockedFunction<typeof backendApi.findRandomPage>;

describe("RandomPage Component", () => {
    beforeEach(() => {
        // Set up mock for getUserDiaries
        mockedFindRandomPage.mockResolvedValue({
            _id: "44",
            title: "Diary 1",
            date: "2025-01-02",
            body: "Today I hiked up a mountain."
        });
    });

    it("renders RandomPage component", async () => {
        render(
            <MemoryRouter>
                <RandomPage/>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText("Today I hiked up a mountain.")).toBeDefined();
            expect(screen.getByText("Comments")).toBeDefined();
        });
    });
    it("renders loading state initially", async () => {
        render(
            <MemoryRouter>
                <RandomPage/>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Loading...")).toBeDefined();
        });
    });
    it("RandomPage throw error failed fetch", async () => {
        mockedFindRandomPage.mockRejectedValue(new Error("Fetch failed"));
        render(<MemoryRouter>
            <RandomPage/>
        </MemoryRouter>)

        const errorMessage = await screen.findByText("Error: Failed to load page")

        expect(errorMessage).toBeDefined();
    });

});
