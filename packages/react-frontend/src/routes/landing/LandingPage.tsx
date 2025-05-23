import {Link} from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center gap-6 p-12 min-h-screen">
            <h1 className="text-2xl font-bold ">Welcome to Diary</h1>
            <h2>In Diary you can store and create diary entries, just like any great diary!</h2>

            <div><Link to={'/login'} className="pl-6">

                <button className="flex p-4 rounded-2xl bg-accent-500 cursor-pointer hover:bg-accent-800">Login
                </button>
            </Link></div>

            <div><Link to={'/createprofile'} className="pl-6">

                <button className="flex p-4 rounded-2xl bg-accent-500 cursor-pointer hover:bg-accent-800">Create Profile
                </button>
            </Link></div>

        </div>
    );
}

