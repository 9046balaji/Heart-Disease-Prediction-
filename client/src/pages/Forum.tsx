import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MessageCircle, Eye, Clock, Pin, Lock, Plus, Search, Calendar, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import ScheduledAMAs from "@/components/ScheduledAMAs";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  createdAt: string;
}

interface ForumPost {
  id: string;
  categoryId: string;
  userId: string;
  title: string;
  content: string;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Forum() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate fetching categories
    const mockCategories: ForumCategory[] = [
      {
        id: "1",
        name: "General Discussion",
        description: "General heart health discussions and questions",
        icon: "💬",
        postCount: 24,
        createdAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "2",
        name: "Diet & Nutrition",
        description: "Share recipes, meal ideas, and nutrition tips",
        icon: "🥗",
        postCount: 18,
        createdAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "3",
        name: "Exercise & Fitness",
        description: "Workout routines, exercise tips, and fitness journeys",
        icon: "🏃",
        postCount: 15,
        createdAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "4",
        name: "Medication & Treatment",
        description: "Discuss medications, treatments, and medical procedures",
        icon: "💊",
        postCount: 12,
        createdAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "5",
        name: "Success Stories",
        description: "Share your heart health journey and inspire others",
        icon: "🌟",
        postCount: 9,
        createdAt: "2025-01-01T00:00:00Z"
      }
    ];
    
    // Simulate fetching posts
    const mockPosts: ForumPost[] = [
      {
        id: "1",
        categoryId: "1",
        userId: "user1",
        title: "New to heart health - where should I start?",
        content: "I was recently diagnosed with high blood pressure and want to make lifestyle changes...",
        replyCount: 12,
        viewCount: 85,
        isPinned: true,
        isLocked: false,
        createdAt: "2025-10-10T10:30:00Z",
        updatedAt: "2025-10-12T14:20:00Z"
      },
      {
        id: "2",
        categoryId: "2",
        userId: "user2",
        title: "Heart-healthy recipes for busy weeknights",
        content: "I'd love to share some quick and healthy recipes that have worked for me...",
        replyCount: 8,
        viewCount: 62,
        isPinned: false,
        isLocked: false,
        createdAt: "2025-10-11T09:15:00Z",
        updatedAt: "2025-10-12T16:45:00Z"
      },
      {
        id: "3",
        categoryId: "3",
        userId: "user3",
        title: "Best exercises for someone with heart conditions?",
        content: "I'm looking for safe exercise options that won't put too much strain on my heart...",
        replyCount: 15,
        viewCount: 93,
        isPinned: false,
        isLocked: false,
        createdAt: "2025-10-09T14:20:00Z",
        updatedAt: "2025-10-12T11:30:00Z"
      }
    ];
    
    setCategories(mockCategories);
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Community Forum</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-sans)]">
            Heart Health Community
          </h2>
          <p className="text-muted-foreground">
            Connect with others, share experiences, and get support on your heart health journey
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Categories sidebar */}
          <div className="md:w-1/4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  <span className="mr-2">All Topics</span>
                  <Badge variant="secondary">{posts.length}</Badge>
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="mr-2">{category.icon} {category.name}</span>
                    <Badge variant="secondary">{category.postCount}</Badge>
                  </Button>
                ))}
                
                {/* Moderated groups section */}
                <div className="pt-4 mt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Moderated Groups</h3>
                  </div>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Star className="h-4 w-4 mr-2" />
                    Premium Heart Health
                    <Badge variant="secondary" className="ml-auto">12</Badge>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Post-Surgery Support
                    <Badge variant="secondary" className="ml-auto">8</Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>New Post</CardTitle>
                <CardDescription>
                  Share your thoughts or ask questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:w-3/4 space-y-6">
            {/* Scheduled AMAs section */}
            <ScheduledAMAs />
            
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Posts list */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>No posts found</p>
                  <p className="text-sm mt-2">Try adjusting your search or category filter</p>
                </div>
              ) : (
                filteredPosts.map(post => {
                  const category = getCategoryById(post.categoryId);
                  return (
                    <Card key={post.id} className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                              {post.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                              <CardTitle className="text-lg">
                                <Link href={`/forum/post/${post.id}`} className="hover:underline">
                                  {post.title}
                                </Link>
                              </CardTitle>
                            </div>
                            {category && (
                              <Badge variant="outline">
                                {category.icon} {category.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.replyCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.viewCount}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/forum/post/${post.id}`}>
                              View Post
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
