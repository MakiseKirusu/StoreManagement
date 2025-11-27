import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to JStore</h1>
          <p className="text-xl text-muted-foreground">
            Your one-stop shop for quality products
          </p>
        </div>

        {isAuthenticated && user ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome back, {user.username}!</CardTitle>
              <CardDescription>
                You are logged in as: {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Link to="/products">
                  <Button>Browse Products</Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline">My Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Login or create an account to start shopping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse our wide selection of quality products at great prices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fast Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get your orders delivered quickly with our reliable shipping
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Easy Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Not satisfied? Cancel your order hassle-free
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
