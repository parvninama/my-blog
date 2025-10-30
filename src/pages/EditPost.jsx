import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, PostForm } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { fetchPostById, clearCurrentPost } from "../store/postsSlice";
import Loading from "../components/Loading";

export default function EditPost() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { currentPost: post, loading } = useSelector((state) => state.posts);

  useEffect(() => {
    if (postId) dispatch(fetchPostById(postId));
    return () => dispatch(clearCurrentPost());
  }, [dispatch, postId]);

  if (loading || !post) return <Loading message="Loading post for editing..." />;

  return (
    <div className="py-8">
      <Container>
        <PostForm post={post} />
      </Container>
    </div>
  );
}