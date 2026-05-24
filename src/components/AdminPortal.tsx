import React, { useState, useEffect } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider, 
  TextField, 
  Chip,
  IconButton
} from "@mui/material";
import { 
  Truck, 
  Users, 
  Lock, 
  Unlock, 
  BellRing, 
  Receipt, 
  Plus, 
  Briefcase, 
  TrendingUp,
  Coins,
  Megaphone,
  Check
} from "lucide-react";
import { Order, Coupon } from "../types";

interface AdminPortalProps {
  orders: Order[];
  onAddCoupon: (newCoupon: Coupon) => void;
  onSendAnnouncement: (message: string) => void;
  couponsList: Coupon[];
}

export default function AdminPortal({
  orders,
  onAddCoupon,
  onSendAnnouncement,
  couponsList
}: AdminPortalProps) {
  // Telemetry metrics
  const [metrics, setMetrics] = useState<any>({
    gmv: 348,
    activeUsers: 142,
    kycRequests: [
      { id: "kyc-1", sellerName: "Global Tech Inc", documentType: "GSTIN", documentCode: "22AAAAA0000A1Z5", status: "Approved" },
      { id: "kyc-2", sellerName: "Urban Threads Store", documentType: "PAN & GST", documentCode: "DL99182C", status: "Pending" }
    ]
  });

  // Fetch telemetry from helper APIs
  const loadAdminMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
  }, [orders]);

  // Coupon fields
  const [copCode, setCopCode] = useState("");
  const [copPercent, setCopPercent] = useState("");
  const [copValue, setCopValue] = useState("50");
  const [copMin, setCopMin] = useState("100");
  const [copDesc, setCopDesc] = useState("");

  const handleCreateCoupon = () => {
    if (!copCode || !copPercent) return;
    onAddCoupon({
      code: copCode.toUpperCase(),
      discountPercent: parseFloat(copPercent),
      maxDiscount: parseFloat(copValue) || 100,
      minCartValue: parseFloat(copMin) || 0,
      description: copDesc || `Save ${copPercent}% on orders above $${copMin}`
    });

    // Reset
    setCopCode("");
    setCopPercent("");
    setCopValue("50");
    setCopMin("100");
    setCopDesc("");
  };

  // Promotion Alert Push Campaign
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const handleTriggerCampaign = () => {
    if (!announcementMsg.trim()) return;
    onSendAnnouncement(announcementMsg);
    setAnnouncementMsg("");
  };

  // Moderate user lists (In-memory mock lists)
  const [moderationUsers, setModerationUsers] = useState([
    { id: "usr-1", name: "Sarah Connor", role: "Customer", status: "Active" },
    { id: "usr-2", name: "Peter Parker", role: "Customer", status: "Active" },
    { id: "usr-3", name: "Apex Tech Seller", role: "Seller", status: "Suspended" },
    { id: "usr-4", name: "Logan Wolverine", role: "DeliveryAgent", status: "Active" }
  ]);

  const toggleUserStatus = (id: string) => {
    setModerationUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === "Active" ? "Suspended" : "Active" };
      }
      return u;
    }));
  };

  const handleApproveKYC = (id: string) => {
    setMetrics((prev: any) => ({
      ...prev,
      recentKYC: prev.recentKYC.map((k: any) => k.id === id ? { ...k, status: "Approved" } : k)
    }));
  };

  return (
    <Box className="space-y-6">
      {/* Visual KPI indicators bento row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white relative overflow-hidden text-slate-800 space-y-1 shadow-sm">
          <TrendingUp className="w-4 h-4 text-slate-400 absolute top-4 right-4" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Gross Platform GMV</span>
          <p className="text-xl font-extrabold font-mono">${orders.reduce((sum, ord) => sum + ord.total, 0).toFixed(2)}</p>
          <span className="text-[9px] text-green-600 font-bold block">▲ +12% from last week</span>
        </Paper>

        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white relative overflow-hidden text-slate-800 space-y-1 shadow-sm">
          <Users className="w-4 h-4 text-slate-400 absolute top-4 right-4" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Active User Count</span>
          <p className="text-xl font-extrabold font-mono">{metrics.usersCount || 154}</p>
          <span className="text-[9px] text-indigo-500 font-bold block">14 sessions active now</span>
        </Paper>

        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white relative overflow-hidden text-slate-800 space-y-1 shadow-sm">
          <Receipt className="w-4 h-4 text-slate-400 absolute top-4 right-4" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Fulfilled Orders</span>
          <p className="text-xl font-extrabold font-mono">{orders.length}</p>
          <span className="text-[9px] text-green-600 font-bold block">100% Settle Delivery SLA</span>
        </Paper>

        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white relative overflow-hidden text-slate-800 space-y-1 shadow-sm">
          <Coins className="w-4 h-4 text-slate-400 absolute top-4 right-4" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Platform Coupons</span>
          <p className="text-xl font-extrabold font-mono">{couponsList.length}</p>
          <span className="text-[9px] text-slate-500 block italic leading-none">Codes active in gateway</span>
        </Paper>
      </div>      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Left side: KYC & Moderation lists */}
        <div className="md:col-span-7 space-y-4">
          {/* Moderation users board */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-3">
            <Typography variant="subtitle2" className="text-slate-800 font-extrabold text-xs uppercase tracking-wider">Platform Account Moderation & suspension</Typography>
            <div className="divide-y divide-slate-100">
              {moderationUsers.map((user) => {
                const active = user.status === "Active";
                return (
                  <div key={user.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{user.name} — <span className="text-[9px] text-slate-400 font-mono italic">{user.role}</span></p>
                      <span className={`text-[9px] font-bold ${active ? 'text-green-600' : 'text-red-500'}`}>{user.status}</span>
                    </div>
                    <Button 
                      size="small"
                      onClick={() => toggleUserStatus(user.id)}
                      startIcon={active ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      className={`text-[9px] font-bold py-1 px-3.5 rounded-lg ${active ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}
                      sx={{ textTransform: 'none' }}
                    >
                      {active ? "Block User" : "Activate"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Paper>

          {/* KYC Approvals Panel */}
          {metrics.recentKYC && (
            <Paper className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-3">
              <Typography variant="subtitle2" className="text-slate-800 font-extrabold text-xs uppercase tracking-wider">Seller KYC Approvals queue</Typography>
              <div className="divide-y divide-slate-100">
                {metrics.recentKYC.map((kyc: any, i: number) => {
                  const pending = kyc.status === "Pending";
                  return (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{kyc.sellerName}</p>
                        <p className="text-slate-400 text-[10px]">{kyc.documentType}: <b>{kyc.documentCode}</b></p>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className={`text-[10px] font-bold ${pending ? 'text-amber-500 animate-pulse' : 'text-green-600'}`}>{kyc.status}</span>
                        {pending && (
                          <Button 
                            onClick={() => handleApproveKYC(kyc.id)}
                            size="small" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] h-6 px-2.5 rounded-lg"
                          >
                            Approve GST
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Paper>
          )}
        </div>

        {/* Right side: Coupon Creation & Announcement Campaign broadcaster */}
        <div className="md:col-span-5 space-y-4">
          {/* Coupon Generator form */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3.5 shadow-sm">
            <Typography variant="subtitle2" className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
              <Plus className="w-4 h-4 text-indigo-500" />
              Generate Platform Coupons
            </Typography>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TextField fullWidth size="small" label="Coupon Code" placeholder="SALE20" value={copCode} onChange={(e) => setCopCode(e.target.value)} slotProps={{ input: { className: "text-xs font-mono font-bold" } }} />
                </div>
                <div>
                  <TextField fullWidth size="small" label="Discount %" placeholder="20" type="number" value={copPercent} onChange={(e) => setCopPercent(e.target.value)} slotProps={{ input: { className: "text-xs font-mono font-bold" } }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TextField fullWidth size="small" label="Max capped cap ($)" value={copValue} onChange={(e) => setCopValue(e.target.value)} slotProps={{ input: { className: "text-xs font-mono" } }} />
                </div>
                <div>
                  <TextField fullWidth size="small" label="Min Cart value ($)" value={copMin} onChange={(e) => setCopMin(e.target.value)} slotProps={{ input: { className: "text-xs font-mono" } }} />
                </div>
              </div>

              <TextField fullWidth size="small" label="Short Description" placeholder="Get 20% off up to $50 over $100 cart" value={copDesc} onChange={(e) => setCopDesc(e.target.value)} slotProps={{ input: { className: "text-xs" } }} />

              <Button
                disabled={!copCode || !copPercent}
                onClick={handleCreateCoupon}
                fullWidth
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-xl py-2"
              >
                Launch Coupon Code
              </Button>
            </div>
          </Paper>

          {/* Alert campaign broadcaster */}
          <Paper className="p-4 rounded-3xl border border-indigo-100 bg-indigo-50/30 space-y-3 shadow-sm">
            <Typography variant="subtitle2" className="text-indigo-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <Megaphone className="w-4 h-4 text-indigo-600 shrink-0" />
              Promotional banner Broadcaster
            </Typography>
            <p className="text-[11px] text-indigo-800 leading-normal font-sans">
              Broadcast visual alerts pushes system-wide. Displays instant notifications banners inside client browsers.
            </p>

            <div className="space-y-2 pt-1.5">
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Announcement Notification Statement"
                placeholder="Super Lightning Deals ending in 30 minutes! Grab Sony headphones now at 20% off!"
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                className="bg-white"
                slotProps={{ input: { className: "text-xs rounded-xl" } }}
              />
              <Button
                disabled={!announcementMsg.trim()}
                onClick={handleTriggerCampaign}
                fullWidth
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold rounded-xl py-2 flex items-center justify-center gap-1 text-xs"
              >
                Send Broadcaster
                <BellRing className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Paper>
        </div>
      </div>
    </Box>
  );
}
