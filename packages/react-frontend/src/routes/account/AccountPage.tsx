import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {getUser, editPassword, editUser} from "../../../src/api/backend";
import {User} from "types/user";

export default function AccountsPage() {
    const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState("");

    const [isPicModalOpen, setIsPicModalOpen] = useState(false);

    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    const [imageUrl, setImageUrl] = useState("");


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUser();
                setUser(data);
                setProfilePicture(data.profilePicture ?? null);
            } catch (err) {
                setError("Failed to load user");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);
    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;


    const handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        if (newPassword) {
            setPassword(newPassword);
        }
    };

    const handleNewPassword = async () => {
        if (password && user?._id) {
            try {
                await editPassword(user._id, password);
                alert("Password changed successfully");
                setIsPasswordModalOpen(false);
                setPassword("");
            } catch (err) {
                console.error("Failed to change password", err);
                alert("Error changing password");
            }
        }
    };

    const handleCancelPassword = () => {
        setIsPasswordModalOpen(false);
        setPassword("");
    };
    const handleUpload = async () => {
        if (imageUrl && user) {
            try {
                const updatedUser = {
                    username: user.username,
                    email: user.email,
                    profilePicture: imageUrl,
                };
                await editUser(updatedUser, user._id);

                alert("Profile picture updated!");
                setProfilePicture(imageUrl);
                setIsPicModalOpen(false);
                setImageUrl("");
            } catch (err) {
                console.error("Failed to update profile picture", err);
                alert("Error changing profile picture");
            }
        }

    }

    const handleCancelUpload = () => {
        setIsPicModalOpen(false);
        setImageUrl("");
    };

    return (
        <div className="flex flex-col items-center gap-6 p-12">
            <h1 className="text-2xl font-bold ">Account Settings</h1>

            {/* Profile Section*/}
            <div className="flex flex-col items-center p-6 rounded-lg">
                {user && (
                    <div className="text-center text-lg">
                        <p className="font-semibold text-xl">Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                    </div>
                )}
                {profilePicture && (
                    <div className="rounded-full w-40 h-40 overflow-hidden border border-gray-300">
                        <img
                            alt="Profile Preview"
                            width="250px"
                            src={profilePicture}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <button onClick={() => setIsPicModalOpen(true)}
                        className="mt-2 p-2 rounded-lg text-accent-200 hover:underline"
                >
                    Change Profile Picture
                </button>
                <button onClick={() => setIsPasswordModalOpen(true)}
                        className="mt-2 p-2 rounded-lg text-accent-200 hover:underline">
                    Reset Password
                </button>
            </div>

            <Link
                to="/login"
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            >
                Log Out
            </Link>

            {isPicModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="flex flex-col bg-white items-center justify-center p-6 gap-5 rounded-lg w-96">
                        {/* File input*/}
                        <input type="text"
                               placeholder="Enter image URL"
                               value={imageUrl}
                               onChange={(e) => setImageUrl(e.target.value)}
                               className="w-full border p-2 rounded border-primary-100 text-gray-500"
                        />
                        {/* Live Preview */}
                        <div
                            className="rounded-full w-40 h-40 overflow-hidden bg-gray-200 border border-gray-400 flex items-center justify-center">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover"/>
                            ) : (
                                <span className="text-gray-500">No image URL</span>
                            )}
                        </div>


                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCancelUpload}
                                    className="px-4 py-2 bg-accent-50 text-black rounded-lg shadow hover:bg-accent-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!imageUrl}
                                aria-disabled={!imageUrl}
                                className={`px-4 py-2 text-white rounded ${
                                    imageUrl ? "bg-accent-900 hover:bg-accent-800" : "bg-gray-400 cursor-not-allowed"}`}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="flex flex-col bg-white items-center justify-center p-6 gap-5 rounded-lg w-96">
                        {/* Password input*/}
                        <input type="text"
                               placeholder="Enter new password"
                               value={password}
                               onChange={handlePasswordChange}
                               className="w-80 h-10 object-cover text-gray-800 rounded-2xl shadow focus:ring-2 focus:ring-accent-500 outline-none transition"
                        />


                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCancelPassword}
                                    className="px-4 py-2 bg-accent-50 text-black rounded-lg shadow hover:bg-accent-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNewPassword}
                                disabled={!password}
                                className={`px-4 py-2 text-white ${
                                    password ? "bg-accent-500 hover:bg-accent-400" : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>


    );
}