import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Loading from "../components/Loading";
import { logout as logoutAction } from "../store/authSlice";
import { Button, Input, Popup } from "../components";
import { CameraIcon, PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { fetchProfile, updateProfile as updateProfileAction } from "../store/profileSlice";
import appwriteService from "../appwrite/config";

export default function Profile() {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.userData);
  const profileState = useSelector((state) => state.profile);

  const [updating, setUpdating] = useState(false);
  const [editField, setEditField] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dob, setDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (reduxUser && reduxUser.$id) {
      dispatch(fetchProfile(reduxUser.$id));
    }
  }, [reduxUser, dispatch]);

  useEffect(() => {
    if (profileState.data) {
      setName(profileState.data.username || reduxUser?.name || "");
      setBio(profileState.data.bio || "");
      
      const rawDob = profileState.data.dob || "";
      setDob(rawDob ? rawDob.split("T")[0] : ""); 

      setAvatarPreview(
        profileState.data.avatarFileId
          ? appwriteService.getFilePreview(profileState.data.avatarFileId)
          : ""
      );
    }
  }, [profileState.data, reduxUser]);

  if (!reduxUser || profileState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loading message="Loading profile..." />
      </div>
    );
  }

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";

  const handleAvatarClick = () => document.getElementById("avatarInput").click();

  const handleAvatarChange = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    setAvatarPreview(URL.createObjectURL(file));

    try {
      setUpdating(true);
      const uploadedFile = await appwriteService.uploadFile(file);
      await dispatch(
        updateProfileAction({
          userId: reduxUser.$id,
          payload: {
            username: name || reduxUser.name || "",
            bio,
            dob,
            avatarFileId: uploadedFile.$id,
          },
        })
      );
      setPopup({ show: true, message: "Profile picture updated!", type: "success" });
    } catch (err) {
      console.error(err);
      setPopup({ show: true, message: "Failed to upload avatar.", type: "error" });
    } finally {
      setUpdating(false);
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await dispatch(
        updateProfileAction({
          userId: reduxUser.$id,
          payload: {
            username: name || reduxUser.name || "",
            bio,
            dob,
            avatarFileId: profileState.data?.avatarFileId || null,
          },
        })
      );
      setEditField(null);
      setPopup({ show: true, message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setPopup({ show: true, message: "Failed to update profile.", type: "error" });
    } finally {
      setUpdating(false);
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
    }
  };

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      dispatch(logoutAction());
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      {updating && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
          <Loading message="Updating profile..." />
        </div>
      )}

      {popup.show && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ show: false, message: "", type: "" })}
        />
      )}

      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full flex flex-col items-center gap-5">
        <div className="relative w-24 h-24">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 cursor-pointer"
              onClick={handleAvatarClick}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-bold text-white border-2 border-gray-300 cursor-pointer"
              onClick={handleAvatarClick}
            >
              {getInitials(name)}
            </div>
          )}
          <div
            className="absolute bottom-0 right-0 bg-gray-800 text-yellow-400 rounded-full p-1 cursor-pointer hover:bg-gray-700"
            onClick={handleAvatarClick}
          >
            <CameraIcon className="w-4 h-4" />
          </div>
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="w-full space-y-4">
          <EditableField
            label="Name"
            value={name}
            field="name"
            editField={editField}
            setEditField={setEditField}
            onChange={setName}
            onSave={handleUpdate}
          />

          <Input label="Email" value={reduxUser.email} disabled />

          <EditableField
            label="Bio"
            value={bio}
            field="bio"
            editField={editField}
            setEditField={setEditField}
            onChange={setBio}
            onSave={handleUpdate}
            placeholder="Tell something about yourself"
          />

          <EditableField
            label="Date of Birth"
            type="date"
            value={dob}
            field="dob"
            editField={editField}
            setEditField={setEditField}
            onChange={setDob}
            onSave={handleUpdate}
          />
        </div>

        <Button
          onClick={handleLogout}
          className="w-full bg-gray-700 hover:bg-gray-800"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  field,
  editField,
  setEditField,
  onChange,
  onSave,
  placeholder,
  type = "text",
}) {
  return (
    <div className="relative">
      <Input
        label={label}
        type={type}
        value={value}
        disabled={editField !== field}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {editField === field ? (
        <div className="absolute right-3 top-8 flex gap-2">
          <CheckIcon
            className="w-5 h-5 text-green-600 cursor-pointer"
            onClick={onSave}
          />
          <XIcon
            className="w-5 h-5 text-red-500 cursor-pointer"
            onClick={() => setEditField(null)}
          />
        </div>
      ) : (
        <PencilIcon
          className="w-5 h-5 text-gray-500 absolute right-3 top-8 cursor-pointer hover:text-gray-700"
          onClick={() => setEditField(field)}
        />
      )}
    </div>
  );
}