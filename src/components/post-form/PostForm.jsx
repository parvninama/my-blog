import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Loading from "../Loading";
import { createPost, updatePost } from "../../store/postsSlice";

export default function PostForm({ post }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const slugTransform = useCallback((value) => {
    if (!value) return "";
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z\d\s]+/g, "")
      .replace(/\s+/g, "-");
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") setValue("slug", slugTransform(value.title));
    });
    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  const submit = async (data) => {
    if (!user?.$id) return console.error("User not loaded");

    setLoading(true);
    try {
      let featuredImageId = post?.featuredImage || "";

      if (data.image?.[0]) {
        const uploadedFile = await appwriteService.uploadFile(data.image[0]);
        featuredImageId = uploadedFile?.$id || "";
        if (post?.featuredImage)
          await appwriteService.deleteFile(post.featuredImage).catch(() => {});
      }

      const postPayload = {
        title: data.title,
        content: data.content,
        featuredImage: featuredImageId,
        status: data.status || "active",
        userID: user.$id,
        slug: slugTransform(data.title),
      };

      const dbPost = post
        ? await dispatch(updatePost({ postId: post.$id, payload: postPayload })).unwrap()
        : await dispatch(createPost(postPayload)).unwrap();

      if (dbPost?.$id) navigate(`/post/${dbPost.$id}`);
    } catch (err) {
      console.error("Error submitting post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading user info...</p>;

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loading message="Submitting post..." />
        </div>
      )}
      <form
        onSubmit={handleSubmit(submit)}
        className="flex flex-col md:flex-row gap-6 w-full"
      >
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <Input
            label="Title:"
            placeholder="Enter post title"
            {...register("title", { required: true })}
          />
          <RTE label="Content:" name="content" control={control} />
        </div>

        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <Input
            label="Image:"
            type="file"
            accept="image/png, image/jpg, image/jpeg, image/gif"
            {...register("image", { required: !post })}
          />
          {post?.featuredImage && (
            <div className="w-full">
              <img
                src={appwriteService.getFilePreview(post.featuredImage)}
                alt={post.title}
                className="rounded-lg object-cover w-full h-40 sm:h-48"
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {post ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}