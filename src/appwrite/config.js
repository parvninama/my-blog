import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from "appwrite";
import conf from "../conf/conf.js";

class AuthService {
  client = new Client();
  account;
  database;
  storage;

  constructor() {
    this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
    this.database = new Databases(this.client);
    this.storage = new Storage(this.client);
  }

  async login({ email, password }) {
    try {
      await this.account.createEmailPasswordSession(email, password);
      return this.getCurrentUser();
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  }

  async loginWithGoogle() {
    try {
      const redirectURL = window.location.origin + "/";
      const failureURL = window.location.origin + "/signup";
      await this.account.createOAuth2Session("google", redirectURL, failureURL);
      const user = await this.getCurrentUser();

      if (!user) return null;
      const profile = await this.getProfile(user.$id);

      if (!profile) {
        const username = user.name?.toLowerCase().replace(/\s+/g, "") || "user" + user.$id;
        await this.database.createDocument(conf.appwriteDatabaseId, conf.appwriteProfileTableId, user.$id, {
          userId: user.$id,
          username,
          bio: "",
          dob: "",
          avatarUrl: ""
        });
      }

      return user;
    } catch (err) {
      console.error("Google login failed:", err);
      throw err;
    }
  }

  async logout() {
    try {
      await this.account.deleteSession("current");
    } catch (err) {
      if (err.code !== 401) console.error("Logout failed:", err);
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (err) {
      if (err.code === 401) return null; // no active session
      throw err;
    }
  }

  async getPosts() {
    try {
      return await this.database.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTableId,
        [Query.equal("status", "active")]
      );
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      throw err;
    }
  }

  async getPostById(postId) {
    try {
      return await this.database.getDocument(conf.appwriteDatabaseId, conf.appwriteTableId, postId);
    } catch (err) {
      console.error("Error fetching post by ID:", err);
      return null;
    }
  }

  async getPostBySlug(slug) {
    try {
      const res = await this.database.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTableId,
        [Query.equal("slug", slug)]
      );
      return res.documents[0] || null;
    } catch (err) {
      console.error("Error fetching post by slug:", err);
      throw err;
    }
  }

  async createPost({ title, content, slug, featuredImage, status, userID }) {
    try {
      if (!userID) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error("User not logged in");
        userID = user.$id;
      }

      return await this.database.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteTableId,
        ID.unique(),
        { title, content, slug, featuredImage, status, userID },
        [Permission.read(Role.any()), Permission.update(Role.user(userID)), Permission.delete(Role.user(userID))]
      );
    } catch (err) {
      console.error("Error creating post:", err);
      throw err;
    }
  }

  async updatePost(postId, data) {
    try {
      return await this.database.updateDocument(conf.appwriteDatabaseId, conf.appwriteTableId, postId, data);
    } catch (err) {
      console.error("Error updating post:", err);
      throw err;
    }
  }

  async deletePost(postId) {
    try {
      return await this.database.deleteDocument(conf.appwriteDatabaseId, conf.appwriteTableId, postId);
    } catch (err) {
      console.error("Error deleting post:", err);
      throw err;
    }
  }

  async uploadFile(file) {
    try {
      return await this.storage.createFile(conf.appwriteBucketId, ID.unique(), file, [Permission.read(Role.any())]);
    } catch (err) {
      console.error("File upload error:", err);
      throw err;
    }
  }

  async deleteFile(fileId) {
    try {
      return await this.storage.deleteFile(conf.appwriteBucketId, fileId);
    } catch (err) {
      console.error("File delete error:", err);
      throw err;
    }
  }

  getFilePreview(fileId) {
    if (!fileId) return null;
    return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
  }

  async getProfile(userId) {
    try {
      const res = await this.database.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProfileTableId,
        [Query.equal("userId", userId)]
      );
      return res.documents[0] || null;
    } catch (err) {
      console.error("Error fetching profile:", err);
      throw err;
    }
  }

  async updateProfile(userId, profileData) {
    try {
      const profile = await this.getProfile(userId);
      if (profile) {
        return await this.database.updateDocument(conf.appwriteDatabaseId, conf.appwriteProfileTableId, profile.$id, profileData);
      } else {
        return await this.database.createDocument(conf.appwriteDatabaseId, conf.appwriteProfileTableId, ID.unique(), { userId, ...profileData });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  }
}

const service = new AuthService();
export default service;