import React, { useEffect, useState } from "react";
import { Container, Postcard, Popup } from "../components";
import appwriteService from "../appwrite/config";
import Loading from "../components/Loading";

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      try {
        const fetchedPostsResponse = await appwriteService.getPosts(); // Public posts
        const fetchedPosts = fetchedPostsResponse.documents || [];
        setPosts(fetchedPosts);

        // Fetch author profiles
        const userIds = [...new Set(fetchedPosts.map((p) => p.userId || p.userID))];
        const profilesData = await Promise.all(
          userIds.map(async (id) => {
            try {
              return await appwriteService.getProfile(id);
            } catch {
              return null;
            }
          })
        );

        const profilesMap = {};
        profilesData.forEach((profile) => {
          if (profile) profilesMap[profile.userId || profile.userID] = profile;
        });
        setProfiles(profilesMap);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPopup({ show: true, message: "Failed to load posts.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  if (loading) return <Loading message="Fetching posts..." />;

  return (
    <div className="w-full py-8 relative">
      {popup.show && (
        <Popup
          message={popup.message}
          type={popup.type}
          fade
          onClose={() => setPopup({ ...popup, show: false })}
        />
      )}
      <Container>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {posts.map((post) => {
              const author = profiles[post.userId || post.userID];
              const authorName = author?.username || "Unknown Author";
              const authorAvatar = author?.avatarFileId
                ? appwriteService.getFilePreview(author.avatarFileId)
                : null;

              return (
                <Postcard
                  key={post.$id}
                  post={post}
                  authorName={authorName}
                  authorAvatar={authorAvatar}
                  className="flex flex-col h-full"
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center w-full mt-10">No posts available.</p>
        )}
      </Container>
    </div>
  );
}

export default AllPosts;