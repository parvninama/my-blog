import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { deletePost } from "../store/postsSlice";
import appwriteService from "../appwrite/config";

export default function Postcard({ post, isAuthor, authorName: propAuthorName, authorAvatar: propAuthorAvatar }) {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile.data);

  const [maxLength, setMaxLength] = useState(100);

  useEffect(() => {
    const updateLength = () => {
      if (window.innerWidth < 640) setMaxLength(80);
      else if (window.innerWidth < 1024) setMaxLength(120);
      else setMaxLength(150);
    };
    updateLength();
    window.addEventListener("resize", updateLength);
    return () => window.removeEventListener("resize", updateLength);
  }, []);

  const getPlainText = (html, maxLength) => {
    if (!html) return "";
    let text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&[^;\s]+;/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .trim();
    if (text.length > maxLength) text = text.substring(0, maxLength).trim() + "...";
    return text;
  };

  if (!post) return null;

  const hasImage = post.featuredImage?.trim() !== "";
  const cleanContent = getPlainText(post.content, maxLength);

  const authorName = propAuthorName || profile?.username || "User";
  const authorAvatar = propAuthorAvatar || (profile?.avatarFileId ? appwriteService.getFilePreview(profile.avatarFileId) : null);
  const authorInitial = authorName.charAt(0).toUpperCase();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(post.$id));
    }
  };

  return (
    <div className="bg-white border rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {hasImage && (
        <div className="relative w-full h-40 sm:h-48 md:h-52 overflow-hidden rounded-t-2xl">
          <img
            src={appwriteService.getFilePreview(post.featuredImage)}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {isAuthor && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Link to={`/edit-post/${post.$id}`}>
                <Button bgColor="bg-green-500" size="sm">Edit</Button>
              </Link>
              <Button bgColor="bg-red-500" size="sm" onClick={handleDelete}>Delete</Button>
            </div>
          )}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1 min-h-[200px]">
        <div className="flex items-center gap-3 mb-3">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
              {authorInitial}
            </div>
          )}
          <p className="text-sm sm:text-base font-medium text-gray-700 truncate">{authorName}</p>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h2>
        <p className="text-gray-600 flex-1 whitespace-pre-line line-clamp-4 sm:line-clamp-5">{cleanContent}</p>
        <Link
          to={`/post/${post.$id}`}
          className="text-blue-500 mt-3 inline-block text-sm sm:text-base font-medium hover:underline"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
