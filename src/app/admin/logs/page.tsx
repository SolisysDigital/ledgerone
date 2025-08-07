"use client";

import React, { useEffect, useState } from "react";
import { AppLogger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Info, Bug, XCircle, RefreshCw, Activity, Clock, User, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
  source: string;
  action: string;
  message: string;
  details?: any;
  stack_trace?: string;
  user_id?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    debug: 0
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const recentLogs = await AppLogger.getRecentErrors(100);
      setLogs(recentLogs || []);
      
      // Calculate stats
      const stats = {
        total: recentLogs?.length || 0,
        errors: recentLogs?.filter(log => log.level === 'ERROR').length || 0,
        warnings: recentLogs?.filter(log => log.level === 'WARNING').length || 0,
        info: recentLogs?.filter(log => log.level === 'INFO').length || 0,
        debug: recentLogs?.filter(log => log.level === 'DEBUG').length || 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'WARNING': return 'bg-warning/10 text-warning border-warning/20';
      case 'INFO': return 'bg-primary/10 text-primary border-primary/20';
      case 'DEBUG': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="h-4 w-4" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4" />;
      case 'INFO': return <Info className="h-4 w-4" />;
      case 'DEBUG': return <Bug className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - logTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredLogs = logs.filter(log => {
    if (activeTab === "all") return true;
    return log.level === activeTab;
  });

  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Logs</h1>
            <Button onClick={loadLogs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                    <p className="text-2xl font-bold text-warning">{stats.warnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Info</p>
                    <p className="text-2xl font-bold text-primary">{stats.info}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bug className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Debug</p>
                    <p className="text-2xl font-bold">{stats.debug}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all" className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>All ({stats.total})</span>
                  </TabsTrigger>
                  <TabsTrigger value="ERROR" className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4" />
                    <span>Errors ({stats.errors})</span>
                  </TabsTrigger>
                  <TabsTrigger value="WARNING" className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Warnings ({stats.warnings})</span>
                  </TabsTrigger>
                  <TabsTrigger value="INFO" className="flex items-center space-x-2">
                    <Info className="h-4 w-4" />
                    <span>Info ({stats.info})</span>
                  </TabsTrigger>
                  <TabsTrigger value="DEBUG" className="flex items-center space-x-2">
                    <Bug className="h-4 w-4" />
                    <span>Debug ({stats.debug})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No logs found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-500">
                        <TableRow>
                          <TableHead className="text-white">Level</TableHead>
                          <TableHead className="text-white">Time</TableHead>
                          <TableHead className="text-white">Source</TableHead>
                          <TableHead className="text-white">Action</TableHead>
                          <TableHead className="text-white">Message</TableHead>
                          <TableHead className="text-white">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow key={log.id} className="border-b border-teal-300">
                            <TableCell>
                              <Badge className={getLevelColor(log.level)}>
                                <div className="flex items-center space-x-1">
                                  {getLevelIcon(log.level)}
                                  <span>{log.level}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-teal-800">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">{formatTimestamp(log.timestamp)}</div>
                                <div className="text-xs text-muted-foreground">{getTimeAgo(log.timestamp)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-teal-800">{log.source}</TableCell>
                            <TableCell className="text-teal-800">{log.action}</TableCell>
                            <TableCell className="text-teal-800 max-w-md">
                              <div className="truncate" title={log.message}>
                                {log.message}
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.details && (
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 