'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet, RefreshCw, Download, CheckCircle } from 'lucide-react';

export default function DailyPnLPage({ params }: { params: { id: string } }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  async function handleGoogleSheetsSync() {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch(`/api/clients/${params.id}/google-sheets/sync`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncStatus(`✓ Synced ${data.rowsWritten} rows to Google Sheets`);
        // Open the Google Sheet in a new tab
        if (data.spreadsheetUrl) {
          window.open(data.spreadsheetUrl, '_blank');
        }
      } else {
        setSyncStatus(`✗ Error: ${data.error}`);
      }
    } catch (error: any) {
      setSyncStatus(`✗ Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleCreateSheet() {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch(`/api/clients/${params.id}/google-sheets/create`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncStatus(`✓ Google Sheet created successfully!`);
        // Open the Google Sheet in a new tab
        if (data.spreadsheetUrl) {
          window.open(data.spreadsheetUrl, '_blank');
        }
      } else {
        setSyncStatus(`✗ Error: ${data.error}`);
      }
    } catch (error: any) {
      setSyncStatus(`✗ Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily P&L</h2>
          <p className="text-muted-foreground">
            Track daily profit & loss with automated Google Sheets sync
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Google Sheets Integration Card */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Google Sheets Integration
          </CardTitle>
          <CardDescription>
            Sync your P&L data to Google Sheets for collaborative analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                One-click sync to Google Sheets
              </p>
              <p className="text-sm text-muted-foreground">
                Export daily metrics with pre-formatted templates and automatic color-coding
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateSheet}
                disabled={isSyncing}
                variant="outline"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Create Sheet
              </Button>
              <Button
                onClick={handleGoogleSheetsSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </div>
          {syncStatus && (
            <div className={`mt-4 p-3 rounded-md ${syncStatus.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="text-sm font-medium">{syncStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Last 30 Days</CardTitle>
          <CardDescription>
            Daily performance metrics across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">AOV</TableHead>
                <TableHead className="text-right">Ad Spend</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">CPA</TableHead>
                <TableHead className="text-right">Margin $</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                  No data available. Connect your platforms to start tracking metrics.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Auto-Formatted Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pre-built formulas, frozen headers, and professional formatting applied automatically
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color-Coded Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              🟢 Green, 🟡 Yellow, 🔴 Red indicators based on performance vs. targets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scheduled Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatic daily updates keep your sheets fresh without manual work
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
