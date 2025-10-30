import React from "react";
import { Container, PostForm } from "../components";

export default function AddPost() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <Container>
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center underline">
            Create a New Post
          </h1>
          <PostForm />
          <p className="text-center text-gray-400 mt-6 text-sm">
            Share your thoughts with the world!
          </p>
        </div>
      </Container>
    </div>
  );
}