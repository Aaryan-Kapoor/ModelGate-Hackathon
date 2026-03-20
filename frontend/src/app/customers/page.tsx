"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomers } from "@/lib/api";
import type { CustomerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customers</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/customers/new">
          <Button>+ New Customer</Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p className="text-lg mb-2">No customers yet</p>
            <p className="text-sm">Upload a contract to create your first customer profile.</p>
            <Link href="/customers/new">
              <Button className="mt-4">Create Customer</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <Link key={c.customer_id} href={`/customers/${c.customer_id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{c.customer_name}</CardTitle>
                  <p className="text-sm text-gray-500">{c.use_case.replace(/_/g, " ")}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline">{c.objective.replace(/_/g, " ")}</Badge>
                    <Badge
                      variant={c.constraints.region === "any" ? "outline" : "default"}
                      className={c.constraints.region !== "any" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
                    >
                      {c.constraints.region}
                    </Badge>
                    <Badge
                      className={
                        c.constraints.privacy_tier === "high"
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {c.constraints.privacy_tier} privacy
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    Latency target: {c.performance.latency_target_ms}ms
                  </div>
                  {c.constraints.forbidden_providers.length > 0 && (
                    <div className="text-xs text-red-500">
                      Blocked: {c.constraints.forbidden_providers.join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
