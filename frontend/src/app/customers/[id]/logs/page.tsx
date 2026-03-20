"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getLogs, getStats, getCustomer } from "@/lib/api";
import type { RequestLogEntry, CustomerStats, CustomerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CustomerLogsPage() {
  const params = useParams();
  const id = params.id as string;
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLogs(id), getStats(id), getCustomer(id)])
      .then(([l, s, c]) => {
        setLogs(l);
        setStats(s);
        setCustomer(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const modelChartData = stats
    ? Object.entries(stats.model_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const tierChartData = stats
    ? Object.entries(stats.requests_by_tier).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{customer?.customer_name} - Request Logs</h1>
          <p className="text-gray-500">{logs.length} requests logged</p>
        </div>
        <Link href={`/customers/${id}`}>
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>

      {/* Stats overview */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Model Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={modelChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {modelChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Requests by Complexity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tierChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request log table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {log.prompt_preview}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.classification === "simple"
                          ? "bg-green-50 text-green-700"
                          : log.classification === "complex"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                      }
                    >
                      {log.classification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.selected_model}</TableCell>
                  <TableCell className="text-sm">{log.latency_ms}ms</TableCell>
                  <TableCell className="text-sm">${log.estimated_cost.toFixed(5)}</TableCell>
                  <TableCell className="text-xs text-gray-500 max-w-xs truncate">
                    {log.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
