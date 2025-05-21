import {Fragment, KeyboardEvent, ClipboardEvent, useRef, useState, useEffect} from "react";
import {useEditable} from "use-editable";
import {
    CaretDownIcon,
    CaretUpIcon,
    CloudArrowUpIcon,
    CloudCheckIcon,
    CloudExclamationIcon,
    SaveIcon
} from "../../assets/icons";
import Markdown from "../../components/Markdown";
import "./WritePage.css";
import {createPage, getPage, getUserDiaries} from "../../api/backend";
import {TextEncoder} from 'util';

global.TextEncoder = TextEncoder;

import {useParams, useNavigate, useSearchParams} from "react-router-dom";

enum Status {
    SAVED,
    CHANGED,
    ERROR
}

export default function WritePage() {
    // States
    const [text, setText] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [status, setStatus] = useState<{ id: number, msg?: string } | undefined>(undefined);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userDiaries, setUserDiaries] = useState<{ id: string, title: string }[]>(undefined);
    const [selectedDiary, setSelectedDiary] = useState<number>(null);
    // Refs
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    // Params
    // const {diaryId} = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    // Hooks
    const navigate = useNavigate();

    // Handlers
    const editorHandler = useEditable(editorRef, (text) => {
        setText(text);
        setStatus({id: Status.CHANGED});
    })

    const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
        const TAB_REPLACE = "&emsp;";

        if (e.key === "Tab") {
            e.preventDefault();
            editorHandler.insert(TAB_REPLACE)
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (typeof e.clipboardData === "string") {
            editorHandler.insert(e.clipboardData);
        }
    }

    const handleSubmit = async () => {
        const title = titleRef.current.value;
        const {text} = editorHandler.getState();

        const page = {
            title: title ?? "Untitled Page",
            date: date,
            body: text,
        };
        try {
            const diary = userDiaries ? userDiaries[selectedDiary] : null;
            if (!diary) {
                // Probably create new diary for page to go in.
                setStatus({
                    id: Status.ERROR,
                    msg: "No diary selected"
                });
                return;
            }
            await createPage(diary.id, page);
            setStatus({
                id: Status.SAVED,
                msg: "Saved!"
            });
            setErrorMsg(undefined);
        } catch (err) {
            setStatus({
                id: Status.ERROR,
                msg: err
            });
        }

    }

    const handleDiarySelect = (index: number) => {
        if (!userDiaries)
            return;

        setSelectedDiary(index);
    }


    // Lifecycle methods
    useEffect(() => {
        // Once on component mount

        // Load in page details
        const diaryId = searchParams.get("diary");
        const pageId = searchParams.get("page");

        console.log("diaryId:", diaryId);
        console.log("pageId:", pageId);

        // Load in user diaries
        const loadDiaries = async () => {
            const diaries = await getUserDiaries();

            if (diaries && diaries.length > 0) {
                const diaryObjs = diaries.map((d) => ({
                    id: d._id,
                    title: d.title
                }));
                setUserDiaries(diaryObjs);

                const selectedIndex = diaryObjs.findIndex((d) => d.id === diaryId);
                if (selectedIndex >= 0)
                    setSelectedDiary(selectedIndex);
            }
        }
        loadDiaries()
            .then(() => console.log("Diaries loaded"))
            .catch((err) => console.error(err));

        const loadPage = async () => {
            const page = await getPage(diaryId, pageId);

            console.log("Page retrieved:", page);
            // Set editor body
            editorRef.current.focus();
            editorHandler.update(page.body);
            // Set title
            titleRef.current.value = page.title;
            // Set date
            setDate(page.date);
        }

        if (diaryId && pageId)
            loadPage()
                .then(() => console.log("Page loaded"))
                .catch((err) => {
                    console.log(err);
                    if (err instanceof Error && err.message === "page not found") {
                        // Page not found
                    }
                });
    }, []);

    return (
        <div className="p-6 gap-6 flex flex-col bg-primary-600 h-full w-full">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 p-4">

                <div className="text-center">
                    <input
                        ref={titleRef}
                        id="title-input"
                        type="text"
                        placeholder="Untitled Page"
                        className="w-full text-4xl font-bold text-secondary-300 placeholder-primary-300 border-b border-secondary-400 focus:border-accent-500 focus:outline-none cursor-text text-center transition-colors"
                    />
                </div>

                <div className="flex justify-between items-center text-xl">
                    {/* Left buttons */}
                    <div className="flex flex-row gap-6 items-center">

                        <button
                            className="relative text-secondary-300 select-none cursor-pointer"
                            onClick={() => {
                                setDropdownOpen(!dropdownOpen)
                            }}
                        >
                            {/* Closed */}
                            <div className="flex flex-row items-center p-2 border-2 border-secondary-300 rounded-lg">
                                {typeof selectedDiary === "number" ? userDiaries[selectedDiary].title : "Choose diary"}
                                {dropdownOpen ? <CaretDownIcon className="icon-sm"/> :
                                    <CaretUpIcon className="icon-sm"/>}
                            </div>

                            {/* Opened */}
                            <ul className={`${!dropdownOpen && "hidden"} absolute top-0 left-0 bg-primary-600 flex flex-col items-center justify-center border-2 border-secondary-300 rounded-lg overflow-hidden`}>
                                {userDiaries?.map((diary, i) =>
                                    <Fragment key={i}>
                                        <li className={`${selectedDiary === i && "bg-primary-800"} hover:bg-primary-800 p-2 w-full text-nowrap`}
                                            onClick={() => handleDiarySelect(i)}>
                                            {diary.title}
                                        </li>
                                    </Fragment>)}
                            </ul>
                        </button>

                        <div className="text-secondary-300">
                            {date}
                        </div>
                    </div>
                    {/* Right buttons */}
                    <div className="flex justify-end items-center gap-6">
                        {/* Status */}
                        {status &&
                            <div
                                className={`${status.id === Status.ERROR ? "text-red-500 opacity-65" : "text-accent-500"} flex flex-row items-center gap-2`}>
                                {status.id === Status.SAVED && <CloudCheckIcon className="icon-sm"/>}
                                {status.id === Status.CHANGED && <CloudArrowUpIcon className="icon-sm"/>}
                                {status.id === Status.ERROR && <CloudExclamationIcon className="icon-sm"/>}
                                {status.msg && <p>{status.msg}</p>}
                            </div>
                        }
                        <button
                            className="btn flex items-center gap-2"
                            onClick={handleSubmit}
                        >
                            <SaveIcon className="icon-xs"/>
                            Save
                        </button>
                    </div>

                </div>


                <div className="flex justify-center items-center flex-1">

                </div>
            </div>

            <div className="bg-primary-900 py-4 flex flex-row justify-center items-center h-full w-full">
                {/* Input */}
                <div
                    id="md-editor"
                    data-testid="md-editor"
                    ref={editorRef}
                    // onInput={handleInput}
                    onKeyDown={handleKeyPress}
                    onPaste={handlePaste}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    className="py-2 px-6 h-full w-full md:border-r-2 border-secondary-400 flex-1">
                    {text.split(/\r?\n/).map((content, i, arr) => (
                        <Fragment key={i}>
                            {/* Split identifiers from text */}
                            {content.split(/(&[a-z]{4};)/).map((innerContent, i) => (
                                <Fragment key={i}>
                                    <span
                                        className={`${innerContent.match(/&[a-z]{4};/)?.length > 0 && 'text-gray-700'}`}>
                                        {innerContent}
                                    </span>
                                </Fragment>
                            ))}
                            {i < arr.length - 1 ? '\n' : null}
                        </Fragment>
                    ))}
                </div>

                {/* Preview */}
                <div className="content py-2 px-6 h-full w-full flex-1">
                    <Markdown source={text}/>
                </div>
            </div>
        </div>
    );
}