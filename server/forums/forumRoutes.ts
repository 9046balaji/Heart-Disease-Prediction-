import { forumService } from "./forumService";
import { authenticateUser } from "../auth/authMiddleware";

export function setupForumRoutes(app: any) {
  // Get all forum categories
  app.get("/api/forum/categories", authenticateUser, async (req: any, res: any) => {
    try {
      const categories = await forumService.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get all forum posts (optionally filtered by category)
  app.get("/api/forum/posts", authenticateUser, async (req: any, res: any) => {
    try {
      const { categoryId } = req.query;
      const posts = await forumService.getPosts(categoryId);
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get a specific forum post
  app.get("/api/forum/posts/:postId", authenticateUser, async (req: any, res: any) => {
    try {
      const { postId } = req.params;
      const post = await forumService.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await forumService.incrementPostViewCount(postId);
      
      // Get replies for this post
      const replies = await forumService.getReplies(postId);
      
      res.status(200).json({ post, replies });
    } catch (error) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a new forum post
  app.post("/api/forum/posts", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const postData = req.body;
      
      // Validate required fields
      if (!postData.categoryId || !postData.title || !postData.content) {
        return res.status(400).json({ message: "Category ID, title, and content are required" });
      }
      
      const post = await forumService.createPost({
        categoryId: postData.categoryId,
        userId,
        title: postData.title,
        content: postData.content,
        isPinned: postData.isPinned || false,
        isLocked: postData.isLocked || false
      });
      
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating forum post:", error);
      res.status(400).json({ message: error.message || "Error creating forum post" });
    }
  });
  
  // Update a forum post
  app.put("/api/forum/posts/:postId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { postId } = req.params;
      const postData = req.body;
      
      // Check if post exists
      const existingPost = await forumService.getPostById(postId);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is the author of the post
      if (existingPost.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }
      
      const updatedPost = await forumService.updatePost(postId, postData);
      res.status(200).json(updatedPost);
    } catch (error: any) {
      console.error("Error updating forum post:", error);
      res.status(400).json({ message: error.message || "Error updating forum post" });
    }
  });
  
  // Delete a forum post
  app.delete("/api/forum/posts/:postId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { postId } = req.params;
      
      // Check if post exists
      const existingPost = await forumService.getPostById(postId);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is the author of the post
      if (existingPost.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      const result = await forumService.deletePost(postId);
      if (!result) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting forum post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a reply to a forum post
  app.post("/api/forum/posts/:postId/replies", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { postId } = req.params;
      const replyData = req.body;
      
      // Validate required fields
      if (!replyData.content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Check if post exists
      const existingPost = await forumService.getPostById(postId);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const reply = await forumService.createReply({
        postId,
        userId,
        content: replyData.content
      });
      
      res.status(201).json(reply);
    } catch (error: any) {
      console.error("Error creating forum reply:", error);
      res.status(400).json({ message: error.message || "Error creating forum reply" });
    }
  });
  
  // Update a forum reply
  app.put("/api/forum/replies/:replyId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { replyId } = req.params;
      const replyData = req.body;
      
      // Check if reply exists
      const existingReply = await forumService.getReplyById(replyId);
      if (!existingReply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      // Check if user is the author of the reply
      if (existingReply.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own replies" });
      }
      
      const updatedReply = await forumService.updateReply(replyId, replyData);
      res.status(200).json(updatedReply);
    } catch (error: any) {
      console.error("Error updating forum reply:", error);
      res.status(400).json({ message: error.message || "Error updating forum reply" });
    }
  });
  
  // Delete a forum reply
  app.delete("/api/forum/replies/:replyId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { replyId } = req.params;
      
      // Check if reply exists
      const existingReply = await forumService.getReplyById(replyId);
      if (!existingReply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      // Check if user is the author of the reply
      if (existingReply.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own replies" });
      }
      
      const result = await forumService.deleteReply(replyId);
      if (!result) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      res.status(200).json({ message: "Reply deleted successfully" });
    } catch (error) {
      console.error("Error deleting forum reply:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mark a reply as accepted answer
  app.post("/api/forum/replies/:replyId/accept", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { replyId } = req.params;
      
      // Check if reply exists
      const existingReply = await forumService.getReplyById(replyId);
      if (!existingReply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      // Check if user is the author of the post (only post author can accept answers)
      const post = await forumService.getPostById(existingReply.postId);
      if (!post || post.userId !== userId) {
        return res.status(403).json({ message: "Only the post author can accept answers" });
      }
      
      const updatedReply = await forumService.markReplyAsAccepted(replyId, true);
      res.status(200).json(updatedReply);
    } catch (error: any) {
      console.error("Error accepting forum reply:", error);
      res.status(400).json({ message: error.message || "Error accepting forum reply" });
    }
  });
  
  // Moderate a post (admin/moderator only)
  app.post("/api/forum/posts/:postId/moderate", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { postId } = req.params;
      const { approved } = req.body;
      
      // In a real implementation, check if user is admin/moderator
      // For now, we'll assume the user has moderation privileges
      
      // Check if post exists
      const existingPost = await forumService.getPostById(postId);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const updatedPost = await forumService.moderatePost(postId, approved, userId);
      res.status(200).json(updatedPost);
    } catch (error: any) {
      console.error("Error moderating forum post:", error);
      res.status(400).json({ message: error.message || "Error moderating forum post" });
    }
  });
  
  // Moderate a reply (admin/moderator only)
  app.post("/api/forum/replies/:replyId/moderate", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { replyId } = req.params;
      const { approved } = req.body;
      
      // In a real implementation, check if user is admin/moderator
      // For now, we'll assume the user has moderation privileges
      
      // Check if reply exists
      const existingReply = await forumService.getReplyById(replyId);
      if (!existingReply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      const updatedReply = await forumService.moderateReply(replyId, approved, userId);
      res.status(200).json(updatedReply);
    } catch (error: any) {
      console.error("Error moderating forum reply:", error);
      res.status(400).json({ message: error.message || "Error moderating forum reply" });
    }
  });
}