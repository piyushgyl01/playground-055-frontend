import { useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../contexts/authContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const {
    data: postsData = { posts: [] },
    loading: postsLoading,
    error: postsError,
  } = useFetch(`${import.meta.env.VITE_API_URL}/posts`);

  const posts = postsData.posts || [];

  const { data: tagsData = { tags: [] }, loading: tagsLoading } = useFetch(
    `${import.meta.env.VITE_API_URL}/tags`
  );

  const tagsList = tagsData.tags || [];

  const [localposts, setLocalposts] = useState([]);

  useEffect(() => {
    if (posts.length > 0) {
      setLocalposts(posts);
    }
  }, [posts]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleFavorite = async (articleId, e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${articleId}/favorite`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();

        setLocalposts((currentposts) =>
          currentposts.map((post) =>
            post._id === articleId
              ? {
                  ...post,
                  favorited: result.post.favorited,
                  favouritesCount: result.post.favouritesCount,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const getposts = () => {
    return localposts.length > 0 ? localposts : posts;
  };

  const ArticlePreview = ({ post }) => {
    return (
      <div className="card mb-3 shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <img
                src={post.author?.image || "https://via.placeholder.com/40"}
                alt={post.author?.username}
                className="rounded-circle me-3"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div>
                <Link
                  to={`/profile/${post.author?.username}`}
                  className="text-decoration-none fw-bold text-dark"
                >
                  {post.author?.username}
                </Link>
                <div className="text-muted small">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            <button
              className={`btn ${
                post.favorited ? "btn-primary" : "btn-outline-primary"
              } btn-sm d-flex align-items-center rounded-pill px-3`}
              onClick={(e) => handleFavorite(post._id, e)}
              disabled={!isAuthenticated}
            >
              {post.favorited ? (
                <FaHeart className="me-2" />
              ) : (
                <FaRegHeart className="me-2" />
              )}
              {post.favouritesCount || 0}
            </button>
          </div>
          <Link
            to={`/post/${post._id}`}
            className="text-decoration-none text-dark"
          >
            <h5 className="card-title mb-3 fw-bold">{post.title}</h5>
            <p className="card-text text-muted mb-3">
              {post.description || post.body?.substring(0, 150)}...
            </p>
          </Link>
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Link
              to={`/post/${post._id}`}
              className="text-decoration-none text-primary"
            >
              Read more...
            </Link>
            <div>
              {post.tagList &&
                post.tagList.map((tag) => (
                  <span
                    key={tag}
                    className="badge bg-light text-secondary me-2 py-2 px-3 rounded-pill"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TagList = ({ tags }) => {
    if (!tags || tags.length === 0) {
      return <p className="text-muted">No tags available</p>;
    }

    return (
      <div className="tag-list">
        {tags.map((tag) => (
          <span
            key={tag}
            className="badge bg-light text-secondary me-2 mb-2 py-2 px-3 rounded-pill"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  if (postsLoading && posts.length === 0) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="py-5 bg-light text-center mb-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Postify</h1>
          <p className="lead text-secondary w-75 mx-auto">
            Postify! Post your heart out
          </p>
        </div>
      </div>

      <div className="container">
        <div className="row g-4">
          <div className="col-lg-8 col-md-7">
            {postsError && (
              <div className="alert alert-danger p-3 mb-4">{postsError}</div>
            )}

            <h3 className="mb-4 fw-bold">Posts</h3>

            {getposts().length > 0 ? (
              getposts().map((post) => (
                <ArticlePreview key={post._id} post={post} />
              ))
            ) : (
              <div className="text-center my-5 py-5">
                <p className="text-muted">No posts found.</p>
              </div>
            )}
          </div>

          <div className="col-lg-4 col-md-5">
            <div className="card p-4 mb-4 border-0 shadow-sm">
              <h5 className="card-title mb-3 fw-bold">Popular Tags</h5>
              {tagsLoading ? (
                <div className="text-center py-3">
                  <div
                    className="spinner-border spinner-border-sm text-secondary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <TagList tags={tagsList} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
