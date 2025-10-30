import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { fetchPostById, deletePost } from "../store/postsSlice";
import parse, { domToReact } from "html-react-parser";
import appwriteService from "../appwrite/config";
import Loading from "../components/Loading";

export default function Post() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentPost: post, loading, error } = useSelector((state) => state.posts);
  const userData = useSelector((state) => state.auth.userData);

  const isAuthor = post && userData ? post.userID === userData.$id : false;

  useEffect(() => {
    if (postId) dispatch(fetchPostById(postId));
  }, [dispatch, postId]);

  const handleDelete = async () => {
    if (!post) return;
    await dispatch(deletePost(post.$id));
    navigate("/");
  };

  if (loading) return <Loading message="Loading post..." />;

  if (error || !post)
    return (
      <div className="text-center mt-10 text-red-500">
        <p>{error || "Post not found"}</p>
        <Button onClick={() => navigate("/")}>Go Back</Button>
      </div>
    );

  const renderPlainText = (htmlContent) =>
    parse(htmlContent, {
      replace: (domNode) => {
        if (domNode.type === "tag") return domToReact(domNode.children, { replace: () => null });
      },
    });

  return (
    <div className="py-8">
      <Container>
        <div className="mb-4">
          <button
            onClick={() => navigate("/all-posts")}
            className="flex items-center gap-2 text-black hover:text-yellow-500 transition"
          >
            ← Back to All Posts
          </button>
        </div>

        {post.featuredImage && (
          <div
            className="w-full mb-4 rounded-xl overflow-auto border"
            style={{ maxHeight: "400px" }}
          >
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="w-full object-cover rounded-xl"
              loading="lazy"
            />
          </div>
        )}

        {isAuthor && (
          <div className="flex justify-end gap-2 mb-4">
            <Button
              bgColor="bg-green-400"
              hoverColor="hover:bg-green-500 hover:text-white"
              onClick={() => navigate(`/edit-post/${post.$id}`)}
            >
              Edit
            </Button>
            <Button
              bgColor="bg-red-400"
              hoverColor="hover:bg-red-500 hover:text-white"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        )}

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-700">{renderPlainText(post.content)}</div>
      </Container>
    </div>
  );
}