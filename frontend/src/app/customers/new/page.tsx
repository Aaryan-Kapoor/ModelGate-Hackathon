"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { extractProfile } from "@/lib/api";
import type { CustomerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function NewCustomerPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CustomerProfile | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleExtract = async () => {
    if (!file || !customerName.trim()) {
      setError("Please provide a customer name and upload a contract file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const profile = await extractProfile(file, customerName, customInstructions);
      setResult(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Onboard New Customer</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g., ACME Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contract Document</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {file ? (
                <div>
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Drop your contract file here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse (.txt files)</p>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept=".txt,.md,.doc,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Custom Instructions <span className="text-gray-400">(optional)</span>
            </label>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g., Prioritize response speed over quality. Only use EU data centers."
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleExtract}
            disabled={loading || !file || !customerName.trim()}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Analyzing contract...
              </span>
            ) : (
              "Extract Profile"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Profile Extracted
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Customer:</span> {result.customer_name}
              </div>
              <div>
                <span className="font-medium">Use Case:</span> {result.use_case.replace(/_/g, " ")}
              </div>
              <div>
                <span className="font-medium">Objective:</span>{" "}
                <Badge variant="outline">{result.objective.replace(/_/g, " ")}</Badge>
              </div>
              <div>
                <span className="font-medium">Region:</span>{" "}
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{result.constraints.region}</Badge>
              </div>
              <div>
                <span className="font-medium">Privacy:</span>{" "}
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{result.constraints.privacy_tier}</Badge>
              </div>
              <div>
                <span className="font-medium">Latency Target:</span> {result.performance.latency_target_ms}ms
              </div>
            </div>

            {result.constraints.allowed_providers.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Allowed Providers:</span>{" "}
                {result.constraints.allowed_providers.join(", ")}
              </div>
            )}
            {result.constraints.forbidden_providers.length > 0 && (
              <div className="text-sm text-red-600">
                <span className="font-medium">Blocked Providers:</span>{" "}
                {result.constraints.forbidden_providers.join(", ")}
              </div>
            )}

            <div className="text-sm">
              <span className="font-medium">Routing Preferences:</span>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {Object.entries(result.routing_preferences).map(([tier, models]) => (
                  <div key={tier} className="bg-white rounded p-2 border">
                    <div className="font-medium capitalize text-xs text-gray-500 mb-1">{tier}</div>
                    {models.map((m) => (
                      <div key={m} className="text-xs">{m}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Warnings:</span>
                <ul className="mt-1 list-disc list-inside text-yellow-700">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={() => router.push(`/customers/${result.customer_id}`)}>
                View Full Profile
              </Button>
              <Button variant="outline" onClick={() => router.push("/customers")}>
                Back to Customers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
