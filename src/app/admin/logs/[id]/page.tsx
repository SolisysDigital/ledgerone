"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLogger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Info, Bug, XCircle, Clock, User, FileText, Code } from "lucide-react";
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
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export default function LogDetailPage() {
  const params = useParams();
  const logId = params.id as string;
  const [log, setLog] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (logId) {
      loadLogDetail(logId);
    }
  }, [logId]);

  const loadLogDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the specific log entry
      const logData = await AppLogger.getLogById(id);
      
      if (!logData) {
        setError('Log entry not found');
        return;
      }

      // Map the database response to LogEntry structure
      const mappedLog: LogEntry = {
        id: logData.id || '',
        timestamp: logData.timestamp || logData.created_at || new Date().toISOString(),
        level: (logData.level || logData.log_level || 'INFO') as 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG',
        source: logData.source || logData.source_name || '',
        action: logData.action || logData.action_name || '',
        message: logData.message || logData.error_message || '',
        details: logData.details || logData.error_details || logData.metadata,
        stack_trace: logData.stack_trace || logData.error_stack || '',
        user_id: logData.user_id || logData.userId || undefined,
        session_id: logData.session_id || undefined,
        ip_address: logData.ip_address || undefined,
        user_agent: logData.user_agent || undefined
      };
      
      setLog(mappedLog);
    } catch (error) {
      console.error('Failed to load log detail:', error);
      setError('Failed to load log details');
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
      default: return <Info className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDetails = (details: any) => {
    if (typeof details === 'string') {
      return details;
    }
    if (typeof details === 'object') {
      return JSON.stringify(details, null, 2);
    }
    return String(details);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="flex h-screen">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8">
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive text-lg">{error || 'Log not found'}</p>
              <Button 
                onClick={() => window.history.back()} 
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.history.back()} 
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Logs
              </Button>
              <h1 className="text-3xl font-bold">Log Details</h1>
            </div>
            <Badge className={getLevelColor(log.level)}>
              <div className="flex items-center space-x-1">
                {getLevelIcon(log.level)}
                <span>{log.level}</span>
              </div>
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{log.message}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p className="text-sm mt-1">{log.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <p className="text-sm mt-1">{log.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <p className="text-sm mt-1 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Technical Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Log ID</label>
                  <p className="text-sm mt-1 font-mono bg-muted p-2 rounded">{log.id}</p>
                </div>
                {log.user_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm mt-1 font-mono bg-muted p-2 rounded">{log.user_id}</p>
                  </div>
                )}
                {log.session_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                    <p className="text-sm mt-1 font-mono bg-muted p-2 rounded">{log.session_id}</p>
                  </div>
                )}
                {log.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="text-sm mt-1 font-mono bg-muted p-2 rounded">{log.ip_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            {log.details && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Additional Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                    {formatDetails(log.details)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Stack Trace */}
            {log.stack_trace && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Stack Trace</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {log.stack_trace}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* User Agent */}
            {log.user_agent && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>User Agent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-muted p-3 rounded-md break-all">{log.user_agent}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
