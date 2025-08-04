"use client";

import React, { useEffect, useState } from "react";
import { AppLogger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Info, Bug, XCircle, RefreshCw, Activity, Clock, User, FileText } from "lucide-react";

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
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-border/50">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Application Logs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor application activity and debug issues
          </p>
        </div>
        <Button onClick={loadLogs} disabled={loading} className="shadow-sm hover:shadow-md transition-shadow">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-warning">{stats.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Info</p>
                <p className="text-2xl font-bold text-primary">{stats.info}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Bug className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Debug</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.debug}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Log Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-border/50 bg-muted/20">
              <TabsList className="grid w-full grid-cols-5 h-12 bg-transparent border-0">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="ERROR" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:shadow-md transition-all duration-200">
                  Errors ({stats.errors})
                </TabsTrigger>
                <TabsTrigger value="WARNING" className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground data-[state=active]:shadow-md transition-all duration-200">
                  Warnings ({stats.warnings})
                </TabsTrigger>
                <TabsTrigger value="INFO" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
                  Info ({stats.info})
                </TabsTrigger>
                <TabsTrigger value="DEBUG" className="data-[state=active]:bg-muted data-[state=active]:text-muted-foreground data-[state=active]:shadow-md transition-all duration-200">
                  Debug ({stats.debug})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading logs...</p>
                  </div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No logs found</h3>
                    <p className="text-muted-foreground">No log entries match the current filter.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg">
                  <Table className="table-modern">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider">Level</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider">Message</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider">Source</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider">Time</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/30 transition-colors duration-150 border-b border-slate-200">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Badge className={getLevelColor(log.level)}>
                                {getLevelIcon(log.level)}
                                <span className="ml-1">{log.level}</span>
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="max-w-md">
                              <p className="font-medium text-foreground mb-1">{log.message}</p>
                              {log.action && (
                                <p className="text-xs text-muted-foreground">Action: {log.action}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-muted/30 rounded flex items-center justify-center">
                                <User className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <span className="text-sm font-medium">{log.source}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{formatTimestamp(log.timestamp)}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(log.timestamp)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-2">
                              {log.details && (
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    Details
                                  </summary>
                                  <pre className="mt-2 p-2 bg-muted/20 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                              
                              {log.stack_trace && (
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-destructive hover:text-destructive">
                                    Stack Trace
                                  </summary>
                                  <pre className="mt-2 p-2 bg-destructive/10 rounded text-xs overflow-x-auto text-destructive">
                                    {log.stack_trace}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 