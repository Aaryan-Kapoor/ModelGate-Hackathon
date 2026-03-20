"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCustomer, getStats } from "@/lib/api";
import type { CustomerProfile, CustomerStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCustomer(id), getStats(id)])
      .then(([p, s]) => {
        setProfile(p);
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!profile) {
    return <div className="text-center py-12 text-gray-500">Customer not found</div>;
  }

  const endpointUrl = `http://localhost:8000/v1/${profile.customer_id}/chat/completions`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{profile.customer_name}</h1>
          <p className="text-gray-500">{profile.use_case.replace(/_/g, " ")}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${id}/logs`}>
            <Button variant="outline">View Logs</Button>
          </Link>
          <Link href={`/playground?customer=${id}`}>
            <Button>Open Playground</Button>
          </Link>
        </div>
      </div>

      {/* Endpoint URL */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="py-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Customer API Endpoint</div>
          <code className="text-sm bg-white px-3 py-1.5 rounded border block overflow-x-auto">
            POST {endpointUrl}
          </code>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Region</span>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{profile.constraints.region}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Privacy Tier</span>
              <Badge className={profile.constraints.privacy_tier === "high" ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                {profile.constraints.privacy_tier}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Objective</span>
              <Badge variant="outline">{profile.objective.replace(/_/g, " ")}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Latency Target</span>
              <span className="text-sm font-medium">{profile.performance.latency_target_ms}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost Sensitivity</span>
              <span className="text-sm font-medium capitalize">{profile.performance.cost_sensitivity}</span>
            </div>
            {profile.constraints.allowed_providers.length > 0 && (
              <div>
                <span className="text-sm text-gray-600">Allowed Providers</span>
                <div className="flex gap-1 mt-1">
                  {profile.constraints.allowed_providers.map((p) => (
                    <Badge key={p} variant="outline" className="bg-green-50 text-green-700">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.constraints.forbidden_providers.length > 0 && (
              <div>
                <span className="text-sm text-gray-600">Blocked Providers</span>
                <div className="flex gap-1 mt-1">
                  {profile.constraints.forbidden_providers.map((p) => (
                    <Badge key={p} variant="outline" className="bg-red-50 text-red-700">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {stats && stats.total_requests > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{stats.total_requests}</div>
                    <div className="text-xs text-gray-500">Total Requests</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{stats.avg_latency_ms.toFixed(0)}ms</div>
                    <div className="text-xs text-gray-500">Avg Latency</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold">${stats.total_cost.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">Total Cost</div>
                  </div>
                  <div className={`rounded-lg p-3 ${stats.cost_savings_vs_premium > 0 ? "bg-green-50" : "bg-gray-50"}`}>
                    <div className={`text-2xl font-bold ${stats.cost_savings_vs_premium > 0 ? "text-green-700" : ""}`}>
                      ${Math.abs(stats.cost_savings_vs_premium).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.cost_savings_vs_premium > 0 ? "Cost Savings" : "vs Premium"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Model Distribution</div>
                  {Object.entries(stats.model_distribution).map(([model, count]) => (
                    <div key={model} className="flex items-center justify-between text-sm py-1">
                      <span>{model}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No requests yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Routing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Routing Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complexity Tier</TableHead>
                <TableHead>Preferred Models</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(profile.routing_preferences).map(([tier, models]) => (
                <TableRow key={tier}>
                  <TableCell className="font-medium capitalize">{tier}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {models.map((m, i) => (
                        <Badge key={m} variant={i === 0 ? "default" : "outline"}>{m}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Warnings */}
      {profile.warnings.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-800">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {profile.warnings.map((w, i) => (
                <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                  <span className="mt-0.5">&#9888;</span>
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
