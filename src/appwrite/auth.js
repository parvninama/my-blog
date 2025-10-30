import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from "appwrite";
import conf from "../conf/conf.js";

class AppwriteService {
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

  async createAccount({ email, password, name, username, bio, dob }) {
    try {
      const account = await this.account.create(ID.unique(), email, password, name);
      await this.account.createEmailPasswordSession(email, password);

      const finalUsername = username?.trim() || name.toLowerCase().replace(/\s+/g, "") || "user" + account.$id;
      const profileData = { userId: account.$id, username: finalUsername, bio: bio || "", dob: dob || "" };

      const existingProfile = await this.getProfile(account.$id);
      if (existingProfile) {
        await this.updateProfile(account.$id, profileData);
      } else {
        await this.database.createDocument(conf.appwriteDatabaseId, conf.appwriteProfileTableId, account.$id, profileData);
      }

      return account;
    } catch (err) {
      if (err.code === 409) throw new Error("Email already registered.");
      console.error("Account creation failed:", err);
      throw err;
    }
  }

  async login({ email, password }) {
    await this.account.createEmailPasswordSession(email, password);
    return await this.getCurrentUser();
  }

  async loginWithGoogle() {
    const redirectURL = window.location.origin + "/";
    const failureURL = window.location.origin + "/login";
    await this.account.createOAuth2Session("google", redirectURL, failureURL);

    const user = await this.getCurrentUser();
    if (!user) return null;

    const profile = await this.getProfile(user.$id);
    if (!profile) {
      const username = user.name.toLowerCase().replace(/\s+/g, "") || "user" + user.$id;
      await this.database.createDocument(conf.appwriteDatabaseId, conf.appwriteProfileTableId, user.$id, {
        userId: user.$id,
        username,
        bio: "",
        dob: "",
        avatarUrl: ""
      });
    }

    return user;
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
      if (err.code === 401) return null;
      throw err;
    }
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

  async updateProfile(userId, data) {
    try {
      const profile = await this.getProfile(userId);
      const finalData = { userId, ...data };

      if (profile) {
        return await this.database.updateDocument(conf.appwriteDatabaseId, conf.appwriteProfileTableId, profile.$id, finalData);
      } else {
        return await this.database.createDocument(conf.appwriteDatabaseId, conf.appwriteProfileTableId, ID.unique(), finalData);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  }

  async getPosts() {
    try {
      const res = await this.database.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTableId,
        [Query.equal("status", "active")]
      );

      return res.documents || [];
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      return [];
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

  async createPost({ title, content, slug, featuredImage, status = "active", userID }) {
    try {
      // If no userID provided, check if logged-in user exists
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
        [
          Permission.read(Role.any()),          // ✅ anyone (guest) can read
          Permission.update(Role.user(userID)), // author can update
          Permission.delete(Role.user(userID))  // author can delete
        ]
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
}

const service = new AppwriteService();
export default service;