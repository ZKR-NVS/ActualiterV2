
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ArticleList } from "@/components/ArticleList";
import { mockArticles } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Article } from "@/components/ArticleCard";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Simulate API call
    const fetchArticles = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setArticles(mockArticles);
      setIsLoading(false);
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    if (activeTab === "all") return true;
    return article.verificationStatus === activeTab;
  });

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Separating Fact from Fiction
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            TruthBeacon is dedicated to verifying news claims and helping you identify what's true, what's false, and what's somewhere in between.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="secondary">
              How It Works
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white">
              Join Us
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Latest Verified Articles</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="true">True</TabsTrigger>
              <TabsTrigger value="partial">Partial</TabsTrigger>
              <TabsTrigger value="false">False</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ArticleList articles={filteredArticles} isLoading={isLoading} />

        {!isLoading && articles.length > 6 && (
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        )}
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">How We Verify Facts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Research</h3>
              <p className="text-gray-600">Our team of researchers gathers information from primary sources, experts, and credible publications.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Analysis</h3>
              <p className="text-gray-600">We carefully analyze the evidence, checking for consistency, credibility, and scientific validity.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Verification</h3>
              <p className="text-gray-600">Our editorial team reviews the findings and assigns a verification status based on the evidence.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
