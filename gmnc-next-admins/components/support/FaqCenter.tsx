'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/context/AuthContext';
import { getFaq, listFaqCategories, searchFaqs, listFaqs } from '@/lib/api/support';
import type { FaqArticle } from '@/lib/api/types';

type Category = { id: string; name: string; slug: string; isActive: boolean };
type Article = FaqArticle;

export default function SupportFaqsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const { show } = useToast();
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [items, setItems] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setCategoriesError(null);
      const data = await listFaqCategories();
      setCategories(data.categories ?? []);
      const firstCategory = (data.categories ?? [])[0] ?? null;
      setSelectedCategoryId(firstCategory?.id ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      setCategoriesError(message);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadArticles = useCallback(
    async (categoryId: string | null, query: string) => {
      try {
        setLoadingArticles(true);
        setArticlesError(null);
        const trimmed = query.trim();
        const data = trimmed ? await searchFaqs(trimmed) : await listFaqs();
        const allItems = data.faqs ?? [];
        setItems(
          categoryId && !trimmed
            ? allItems.filter((item) => item.categoryId === categoryId)
            : allItems
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load articles';
        setArticlesError(message);
      } finally {
        setLoadingArticles(false);
      }
    },
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => clearTimeout(timeout);
  }, [loadCategories]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (selectedCategoryId) {
        void loadArticles(selectedCategoryId, searchQuery);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [selectedCategoryId, searchQuery, loadArticles]);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategoryId(category.id);
    setSelectedArticle(null);
    setArticleError(null);
  }, []);

  const handleSearch = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSelectedArticle(null);
      setArticleError(null);
      await loadArticles(selectedCategoryId, searchQuery);
    },
    [loadArticles, selectedCategoryId, searchQuery]
  );

  const loadArticle = useCallback(
    async (article: Article) => {
      try {
        setLoadingArticle(true);
        setArticleError(null);
        const data = await getFaq(article.id);
        setSelectedArticle(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load article';
        setArticleError(message);
        show({ type: 'error', title: 'Load failed', message, duration: 4000 });
      } finally {
        setLoadingArticle(false);
      }
    },
    [show]
  );

  const handleMarkHelpful = useCallback(async () => {
    if (!selectedArticle) return;
    try {
      setIsMarkingHelpful(true);
      const updated = await getFaq(selectedArticle.id);
      setSelectedArticle(updated);
      show({
        type: 'success',
        title: 'Thanks for your feedback',
        message: 'Your feedback has been recorded.',
        duration: 3000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record feedback';
      show({ type: 'error', title: 'Action failed', message, duration: 4000 });
    } finally {
      setIsMarkingHelpful(false);
    }
  }, [selectedArticle, show]);

  const hasActiveSearch = searchQuery.trim().length > 0;

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h1 className="text-[15px] font-semibold text-slate-900">FAQ Database</h1>
        <p className="mt-1 text-xs text-slate-500">
          Search answers or browse by category.
        </p>

        <form onSubmit={handleSearch} className="mt-3 flex items-end gap-2">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search help articles..."
            className="max-w-md"
          />
          <Button type="submit" className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white">
            Search
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedArticle(null);
              void loadArticles(selectedCategoryId, '');
            }}
            className="rounded-full bg-slate-50 px-5 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
          >
            Reset
          </Button>
        </form>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50">
          {loadingCategories ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-9 rounded-lg bg-white" />
              ))}
            </div>
          ) : categoriesError ? (
            <div className="p-3 text-xs text-red-600">{categoriesError}</div>
          ) : (
            <div className="space-y-1 p-2">
              <button
                type="button"
                onClick={() => handleCategorySelect({ id: '', name: 'All articles', slug: 'all', isActive: true })}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                  !selectedCategoryId ? 'bg-white text-slate-900' : 'text-slate-600 hover:bg-white'
                }`}
              >
                All articles
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                    selectedCategoryId === category.id
                      ? 'bg-white text-slate-900'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
            {!hasActiveSearch ? (
              <p className="text-xs text-slate-500">Select a category to browse articles.</p>
            ) : loadingArticles ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl border border-slate-200 bg-slate-50" />
                ))}
              </div>
            ) : articlesError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {articlesError}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                No articles found for this search.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => loadArticle(article)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedArticle?.id === article.id
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {article.question}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {article.answer}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                        {article.category?.name ?? 'FAQ'}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700">
                        Helpful {article.helpfulCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedArticle && (
            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <div className="mx-auto max-w-4xl">
                {articleError && (
                  <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {articleError}
                  </div>
                )}
                {loadingArticle ? (
                  <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedArticle.question}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {selectedArticle.answer}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="blue">{selectedArticle.category?.name ?? 'FAQ'}</Badge>
                      <Button
                        type="button"
                        onClick={handleMarkHelpful}
                        disabled={isMarkingHelpful}
                        className="rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
                      >
                        {isMarkingHelpful ? 'Recording...' : 'Mark as helpful'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
