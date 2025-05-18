import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaUserPlus, FaUserMinus, FaHeart } from "react-icons/fa";
import { useAuth } from "../contexts/authContext";

export default function Profile() {
  const { username } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setposts] = useState([]);
  const [favoriteposts, setFavoriteposts] = useState([]);
  const [activeTab, setActiveTab] = useState("authored");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postsLoading, setpostsLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/profile/${username}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setProfile({
              username,
              name: username,
              bio: "",
              image: null,
              following: false,
            });
          } else if (response.status === 404) {
            throw new Error("User not found");
          } else {
            throw new Error("Failed to load profile");
          }
        } else {
          const data = await response.json();
          setProfile(data.profile);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username]);

  useEffect(() => {
    async function fetchposts() {
      try {
        setpostsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/posts`
        );

        if (response.ok) {
          const data = await response.json();
          setposts(data.posts || []);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setpostsLoading(false);
      }
    }

    fetchposts();
  }, []);

  useEffect(() => {
    if (
      activeTab === "favorited" &&
      isAuthenticated &&
      username === user?.username
    ) {
      fetchFavoriteposts();
    }
  }, [activeTab, isAuthenticated, username, user]);

  const fetchFavoriteposts = async () => {
    if (!isAuthenticated || username !== user?.username) return;

    setFavoritesLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const favorites = posts.filter(
        (post) =>
          post.favorited ||
          (user.favouritePosts &&
            user.favouritePosts.includes(post._id))
      );

      setFavoriteposts(favorites);
    } catch (err) {
      console.error("Error fetching favorite posts:", err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || !profile) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile/${profile.username}/follow`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const getDisplayedposts = () => {
    if (!profile) return [];

    if (activeTab === "authored") {
      return posts.filter(
        (post) =>
          post.author && post.author.username === profile.username
      );
    } else if (activeTab === "favorited") {
      return favoriteposts;
    }

    return [];
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error || "Failed to load profile. Please try again."}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="py-5 bg-light mb-4">
        <div className="container text-center">
          <img
            src={profile.image || "https://via.placeholder.com/150"}
            alt={profile.username}
            className="rounded-circle mb-3"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
          <h2>{profile.name || profile.username}</h2>
          {profile.bio && <p className="text-muted">{profile.bio}</p>}

          {isAuthenticated && user?.username !== profile.username && (
            <button
              className={`btn ${
                profile.following ? "btn-secondary" : "btn-outline-secondary"
              } mt-2`}
              onClick={handleFollow}
            >
              {profile.following ? (
                <>
                  <FaUserMinus className="me-1" /> Unfollow
                </>
              ) : (
                <>
                  <FaUserPlus className="me-1" /> Follow
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="container">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "authored" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("authored");
              }}
            >
              Posts
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                activeTab === "favorited" ? "active" : ""
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("favorited");
              }}
            >
              Favorited posts
            </a>
          </li>
        </ul>

        <div className="row">
          <div className="col-md-12">
            {(postsLoading && activeTab === "authored") ||
            (favoritesLoading && activeTab === "favorited") ? (
              <div className="text-center my-4">
                <div
                  className="spinner-border spinner-border-sm text-secondary"
                  role="status"
                >
                  <span className="visually-hidden">Loading posts...</span>
                </div>
              </div>
            ) : (
              <>
                {getDisplayedposts().length > 0 ? (
                  getDisplayedposts().map((post) => (
                    <div
                      className="card mb-3 shadow-sm border-0"
                      key={post._id}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                post.author?.image ||
                                "https://via.placeholder.com/40"
                              }
                              alt={post.author?.username}
                              className="rounded-circle me-3"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
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
                          <span className="badge bg-primary rounded-pill px-3">
                            {post.favouritesCount || 0} ♥
                          </span>
                        </div>
                        <Link
                          to={`/post/${post._id}`}
                          className="text-decoration-none text-dark"
                        >
                          <h5 className="card-title mb-3 fw-bold">
                            {post.title}
                          </h5>
                          <p className="card-text text-muted mb-3">
                            {post.description ||
                              post.body?.substring(0, 150)}
                            ...
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
                  ))
                ) : (
                  <div className="text-center text-muted my-5 py-5">
                    {activeTab === "authored" ? (
                      <p>No posts found.</p>
                    ) : (
                      <>
                        {!isAuthenticated ? (
                          <div>
                            <p>Sign in to see favorited posts</p>
                            <Link
                              to="/login"
                              className="btn btn-outline-primary mt-2"
                            >
                              Sign in
                            </Link>
                          </div>
                        ) : username !== user?.username ? (
                          <p>You can only view your own favorite posts</p>
                        ) : (
                          <div className="mb-4">
                            <FaHeart
                              className="mb-3"
                              style={{ fontSize: "2rem", color: "#dc3545" }}
                            />
                            <p>No favorited posts yet</p>
                            <p className="small text-muted">
                              posts you favorite will show up here
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
