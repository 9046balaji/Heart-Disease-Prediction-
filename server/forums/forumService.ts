import { storage } from "../storage";
import { ForumCategory, InsertForumCategory, ForumPost, InsertForumPost, ForumReply, InsertForumReply } from "@shared/schema";

export interface ForumServiceInterface {
  // Categories
  createCategory(categoryData: Omit<InsertForumCategory, "createdAt">): Promise<ForumCategory>;
  getCategories(): Promise<ForumCategory[]>;
  getCategoryById(id: string): Promise<ForumCategory | undefined>;
  
  // Posts
  createPost(postData: Omit<InsertForumPost, "createdAt" | "updatedAt">): Promise<ForumPost>;
  getPosts(categoryId?: string): Promise<ForumPost[]>;
  getPostById(id: string): Promise<ForumPost | undefined>;
  updatePost(id: string, postData: Partial<Omit<InsertForumPost, "createdAt" | "updatedAt">>): Promise<ForumPost | undefined>;
  deletePost(id: string): Promise<boolean>;
  incrementPostViewCount(id: string): Promise<void>;
  moderatePost(id: string, approved: boolean, moderatorId: string): Promise<ForumPost | undefined>;
  
  // Replies
  createReply(replyData: Omit<InsertForumReply, "createdAt" | "updatedAt">): Promise<ForumReply>;
  getReplies(postId: string): Promise<ForumReply[]>;
  getReplyById(id: string): Promise<ForumReply | undefined>;
  updateReply(id: string, replyData: Partial<Omit<InsertForumReply, "createdAt" | "updatedAt">>): Promise<ForumReply | undefined>;
  deleteReply(id: string): Promise<boolean>;
  markReplyAsAccepted(id: string, accepted: boolean): Promise<ForumReply | undefined>;
  moderateReply(id: string, approved: boolean, moderatorId: string): Promise<ForumReply | undefined>;
}

export class ForumService implements ForumServiceInterface {
  // Categories
  async createCategory(categoryData: Omit<InsertForumCategory, "createdAt">): Promise<ForumCategory> {
    const now = new Date();
    const category: InsertForumCategory = {
      ...categoryData,
      createdAt: now
    };
    
    return await storage.createForumCategory(category);
  }
  
  async getCategories(): Promise<ForumCategory[]> {
    return await storage.getForumCategories();
  }
  
  async getCategoryById(id: string): Promise<ForumCategory | undefined> {
    return await storage.getForumCategory(id);
  }
  
  // Posts
  async createPost(postData: Omit<InsertForumPost, "createdAt" | "updatedAt">): Promise<ForumPost> {
    const now = new Date();
    const post: InsertForumPost = {
      ...postData,
      createdAt: now,
      updatedAt: now
    };
    
    return await storage.createForumPost(post);
  }
  
  async getPosts(categoryId?: string): Promise<ForumPost[]> {
    return await storage.getForumPosts(categoryId);
  }
  
  async getPostById(id: string): Promise<ForumPost | undefined> {
    return await storage.getForumPost(id);
  }
  
  async updatePost(id: string, postData: Partial<Omit<InsertForumPost, "createdAt" | "updatedAt">>): Promise<ForumPost | undefined> {
    const updateData: any = { ...postData, updatedAt: new Date() };
    return await storage.updateForumPost(id, updateData);
  }
  
  async deletePost(id: string): Promise<boolean> {
    return await storage.deleteForumPost(id);
  }
  
  async incrementPostViewCount(id: string): Promise<void> {
    return await storage.incrementPostViewCount(id);
  }
  
  // Replies
  async createReply(replyData: Omit<InsertForumReply, "createdAt" | "updatedAt">): Promise<ForumReply> {
    const now = new Date();
    const reply: InsertForumReply = {
      ...replyData,
      createdAt: now,
      updatedAt: now
    };
    
    return await storage.createForumReply(reply);
  }
  
  async getReplies(postId: string): Promise<ForumReply[]> {
    return await storage.getForumReplies(postId);
  }
  
  async getReplyById(id: string): Promise<ForumReply | undefined> {
    return await storage.getForumReply(id);
  }
  
  async updateReply(id: string, replyData: Partial<Omit<InsertForumReply, "createdAt" | "updatedAt">>): Promise<ForumReply | undefined> {
    const updateData: any = { ...replyData, updatedAt: new Date() };
    return await storage.updateForumReply(id, updateData);
  }
  
  async deleteReply(id: string): Promise<boolean> {
    return await storage.deleteForumReply(id);
  }
  
  async markReplyAsAccepted(id: string, accepted: boolean): Promise<ForumReply | undefined> {
    return await storage.markReplyAsAccepted(id, accepted);
  }
  
  async moderatePost(id: string, approved: boolean, moderatorId: string): Promise<ForumPost | undefined> {
    const updateData: any = { 
      moderated: true, 
      approved, 
      moderatedBy: moderatorId, 
      moderatedAt: new Date() 
    };
    return await storage.updateForumPost(id, updateData);
  }
  
  async moderateReply(id: string, approved: boolean, moderatorId: string): Promise<ForumReply | undefined> {
    const updateData: any = { 
      moderated: true, 
      approved, 
      moderatedBy: moderatorId, 
      moderatedAt: new Date() 
    };
    return await storage.updateForumReply(id, updateData);
  }
}

// Initialize with some default categories if they don't exist
async function initializeDefaultCategories() {
  const forumService = new ForumService();
  const categories = await forumService.getCategories();
  
  // Add defensive check for undefined
  if (!Array.isArray(categories)) {
    console.error('getCategories returned non-array:', categories);
    return;
  }
  
  if (categories.length === 0) {
    // Create default categories
    await forumService.createCategory({
      name: "General Discussion",
      description: "General heart health discussions and questions",
      icon: "💬"
    });
    
    await forumService.createCategory({
      name: "Diet & Nutrition",
      description: "Share recipes, meal ideas, and nutrition tips",
      icon: "🥗"
    });
    
    await forumService.createCategory({
      name: "Exercise & Fitness",
      description: "Workout routines, exercise tips, and fitness journeys",
      icon: "🏃"
    });
    
    await forumService.createCategory({
      name: "Medication & Treatment",
      description: "Discuss medications, treatments, and medical procedures",
      icon: "💊"
    });
    
    await forumService.createCategory({
      name: "Success Stories",
      description: "Share your heart health journey and inspire others",
      icon: "🌟"
    });
  }
}

// Initialize default categories
initializeDefaultCategories().catch(console.error);

export const forumService = new ForumService();