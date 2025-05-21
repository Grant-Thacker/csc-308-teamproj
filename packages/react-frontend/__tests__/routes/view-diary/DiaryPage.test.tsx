import {render, screen, waitFor} from "@testing-library/react";
import {TextEncoder} from 'util';

global.TextEncoder = TextEncoder;
import {MemoryRouter, Route, Routes} from "react-router-dom";
import DiaryPage from "../../../src/routes/view-diary/DiaryPage";
import {expect, describe, it, jest, beforeEach} from "@jest/globals";
import {getUserDiaries, getDiaryPages} from "../../../src/api/backend";
import type * as backendApi from "../../../src/api/backend";
import {Diary} from "types/diary";

// Mock the API
jest.mock("../../../src/api/backend", () => ({
    getUserDiaries: jest.fn(),
    getDiaryPages: jest.fn()
}));

const mockedGetUserDiaries = getUserDiaries as jest.MockedFunction<typeof backendApi.getUserDiaries>;
const mockedGetDiaryEntries = getDiaryPages as jest.MockedFunction<typeof backendApi.getDiaryPages>;

const mockDiaries: Diary[] = [
    {
        _id: "abc123",
        title: "Test Diary",
        lastEntry: "2025-05-01",
        numEntries: 1,
        entries: [
            {
                _id: "entry1",
                title: "Morning",
                date: "03-10-25",
                body: "Hello world!"
            }
        ]
    }
];

describe("DiaryPage Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    async function renderWithRoute(index = "0") {
        render(
            <MemoryRouter initialEntries={[`/diary/${index}`]}>
                <Routes>
                    <Route path="/diary/:index" element={<DiaryPage/>}/>
                </Routes>
            </MemoryRouter>
        );

    }

    it("shows loading message initially", async () => {
        mockedGetUserDiaries.mockResolvedValue([mockDiaries[0]]);
        mockedGetDiaryEntries.mockResolvedValue([]);
        renderWithRoute("0");

        await waitFor(() => {
            expect(screen.getByText("Loading entries...")).toBeDefined();
        });
    });

    it("renders entries for valid diary index", async () => {
        mockedGetUserDiaries.mockResolvedValue([mockDiaries[0]]);
        mockedGetDiaryEntries.mockResolvedValue([
            {
                _id: "13",
                title: "Morning",
                date: "03-10-25",
                body: "Hello world!"
            },
        ]);
        renderWithRoute("0");

        await waitFor(() => {
            expect(screen.getByText("Morning")).toBeDefined();
            expect(screen.getByText("03-10-25")).toBeDefined();
            expect(screen.getByText("Hello world!")).toBeDefined();

        });
    });
    it("renders pen icon", async () => {
        mockedGetUserDiaries.mockResolvedValue([mockDiaries[0]]);
        mockedGetDiaryEntries.mockResolvedValue([
            {
                _id: "13",
                title: "Morning",
                date: "03-10-25",
                body: "Hello world!"
            },
        ]);
        renderWithRoute("0");
        await waitFor(() => {
            expect(screen.getByTestId("icon")).toBeDefined();
        });
    });

    it("shows error if diary index is out of bounds", async () => {
        mockedGetUserDiaries.mockResolvedValue(mockDiaries);
        renderWithRoute("99");

        await waitFor(() => {
            expect(screen.getByText("Error: Diary not found.")).toBeDefined();
        });
    });


    it("shows error if diary is not found", async () => {
        mockedGetDiaryEntries.mockRejectedValue(new Error("Fetch failed"));
        renderWithRoute("0");

        const errorMessage = await screen.findByText((content) =>
            content.includes("Error: Failed to load diary.")
        );
        expect(errorMessage).toBeDefined();

    });
    it("shows error if diary pages fail to load", async () => {
        mockedGetUserDiaries.mockResolvedValue([mockDiaries[0]]);
        mockedGetDiaryEntries.mockRejectedValue(new Error("fail"));

        render(
            <MemoryRouter initialEntries={["/diary/0"]}>
                <Routes>
                    <Route path="/diary/:index" element={<DiaryPage/>}/>
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Error: Failed to load pages.")).toBeDefined();
    });
});