import React from 'react';
import { Container, Button, Logo } from '../components';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.status); 

  return (
    <div className="w-full py-16 bg-linear-to-b from-gray-50 to-white">
      <Container>
        <div className="flex flex-col items-center text-center space-y-6">
          <Logo width="120px" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Welcome to <span className="text-yellow-400">MyBlog</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
            Discover insightful articles, engage with the community, and stay
            updated with the latest content. Connect with creators and explore ideas effortlessly.
          </p>

          <div className="flex gap-4 mt-6 flex-wrap justify-center">
            {!isLoggedIn && (
              <Button
                onClick={() => navigate('/login')}
                className="px-8 py-3 rounded-lg"
              >
                Get Started
              </Button>
            )}
            <Button
              onClick={() => navigate('/all-posts')}
              className="px-8 py-3 rounded-lg"
            >
              Explore Posts
            </Button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            {
              title: 'Easy to Use',
              description: 'Navigate and find content effortlessly with our intuitive interface.',
            },
            {
              title: 'Engaging Content',
              description: 'Explore a variety of posts and articles created by our community.',
            },
            {
              title: 'Community Driven',
              description: 'Join discussions, share your thoughts, and interact with other members.',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition"
            >
              <h2 className="text-2xl font-semibold mb-3">{feature.title}</h2>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default Home;