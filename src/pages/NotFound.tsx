
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Search } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          
          <p className="text-gray-600 mb-8">
            We couldn't find the page you were looking for. The link might be incorrect, or the page may have been moved or deleted.
          </p>
          
          <div className="space-y-4">
            <Link to="/">
              <Button className="mx-auto">Return to Homepage</Button>
            </Link>
            
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
