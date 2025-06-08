
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, BookOpen, Star, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/dashboard-layout';
import CreateArticleForm from '@/components/knowledge-base/create-article-form';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  summary?: string;
  slug: string;
  status: string;
  viewCount: number;
  rating?: number;
  ratingCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  _count: {
    ratings: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count: {
    articles: number;
  };
  children: Array<{
    id: string;
    name: string;
    slug: string;
    _count: {
      articles: number;
    };
  }>;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Memoize the fetch functions to prevent infinite re-renders
  const fetchArticlesRef = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      if (searchQuery) {
        params.set('search', searchQuery);
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('categoryId', selectedCategory);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.set('status', selectedStatus);
      }

      const response = await fetch(`/api/knowledge-base/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Error fetching articles:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, selectedStatus]);

  const fetchCategoriesRef = useCallback(async () => {
    try {
      const response = await fetch('/api/knowledge-base/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Error fetching categories:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchArticlesRef();
    fetchCategoriesRef();
  }, [fetchArticlesRef, fetchCategoriesRef]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus })
      });

      const response = await fetch(`/api/knowledge-base/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/knowledge-base/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleArticleCreated = () => {
    setShowCreateDialog(false);
    fetchArticles();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground">
              Create and manage help articles and documentation
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
                <DialogDescription>
                  Create a new knowledge base article to help users find answers.
                </DialogDescription>
              </DialogHeader>
              <CreateArticleForm onSuccess={handleArticleCreated} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category._count.articles})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">All Status</SelectItem>
                  <SelectItem key="draft" value="DRAFT">Draft</SelectItem>
                  <SelectItem key="review" value="REVIEW">In Review</SelectItem>
                  <SelectItem key="published" value="PUBLISHED">Published</SelectItem>
                  <SelectItem key="archived" value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Categories Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {category._count.articles} articles
                  </span>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {category.children.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {category.children.slice(0, 3).map((child) => (
                      <div key={child.id} className="text-xs text-muted-foreground">
                        • {child.name} ({child._count.articles})
                      </div>
                    ))}
                    {category.children.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{category.children.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Articles Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Articles ({articles.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No articles found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  Create your first article
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => window.location.href = `/knowledge-base/${article.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {article.title}
                        </CardTitle>
                        {article.summary && (
                          <CardDescription className="line-clamp-2">
                            {article.summary}
                          </CardDescription>
                        )}
                      </div>
                      <Badge className={statusColors[article.status as keyof typeof statusColors]}>
                        {article.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Category and Tags */}
                      <div className="flex flex-wrap gap-1">
                        {article.category && (
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        )}
                        {article.tags.slice(0, 2).map((tag) => (
                          <Badge 
                            key={tag.id} 
                            variant="secondary" 
                            className="text-xs"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {article.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{article.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.viewCount}</span>
                          </div>
                          
                          {article.rating && (
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {renderStars(article.rating)}
                              </div>
                              <span>({article.ratingCount})</span>
                            </div>
                          )}
                        </div>
                        
                        <span>
                          {formatDistanceToNow(new Date(article.updatedAt))} ago
                        </span>
                      </div>
                      
                      {/* Author */}
                      <div className="text-xs text-muted-foreground">
                        by {article.author.name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
