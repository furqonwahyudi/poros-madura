import React, { useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import ArticleView from "../../components/ArticleView";
import { dummyArticles } from "../../data/dummyArticles";

interface PortalContext {
  lang: "ID" | "EN";
  onSelectArticle: (article: any) => void;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, onSelectArticle } = useOutletContext<PortalContext>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    // In a real app, you would fetch from API based on slug
    const found = dummyArticles.find(a => a.slug === slug);
    if (found) {
      setArticle(found);
    } else {
      // Handle 404
      navigate("/");
    }
  }, [slug, navigate]);

  if (!article) return null;

  return (
    <ArticleView
      article={article}
      onBack={() => navigate(-1)}
      lang={lang}
      onSelectArticle={onSelectArticle}
    />
  );
}
