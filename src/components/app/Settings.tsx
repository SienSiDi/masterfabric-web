"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMe } from "@/hooks/useMe";
import { useSessions } from "@/hooks/useSessions";
import { useAuthStore } from "@/stores/useAuthStore";
import * as authApi from "@/lib/api/auth";
import { HttpError } from "@/lib/api/http";
import { useQueryClient } from "@tanstack/react-query";

export function Settings() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { data: meData } = useMe();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();

  const [email, setEmail] = useState(meData?.email ?? user?.email ?? "");
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function onUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || email === meData?.email) return;
    setEmailLoading(true);
    try {
      const updated = await authApi.updateMe(email);
      setUser(updated);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Email updated");
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.status === 409) toast.error("Email already taken");
        else toast.error(err.body?.message ?? "Update failed");
      } else {
        toast.error("Network error");
      }
    } finally {
      setEmailLoading(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword(currentPw, newPw);
      toast.success("Password changed");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.status === 401) toast.error("Current password is incorrect");
        else toast.error(err.body?.message ?? "Change failed");
      } else {
        toast.error("Network error");
      }
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profile</CardTitle>
          <CardDescription>Update your email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onUpdateEmail} className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailLoading}
              />
            </div>
            <Button type="submit" size="sm" disabled={emailLoading || email === meData?.email}>
              {emailLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-current-pw">Current password</Label>
              <Input
                id="settings-current-pw"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                disabled={pwLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-new-pw">New password</Label>
              <Input
                id="settings-new-pw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                disabled={pwLoading}
                placeholder="min 8 characters"
              />
            </div>
            <Button type="submit" size="sm" disabled={pwLoading || !currentPw || !newPw}>
              {pwLoading ? "Changing..." : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : sessionsData && sessionsData.sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsData.sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs">
                      {new Date(s.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(s.lastSeenAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.revokedAt
                            ? "bg-red-500/10 text-red-600"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {s.revokedAt ? "Revoked" : "Active"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-sm text-muted-foreground">No sessions recorded.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
