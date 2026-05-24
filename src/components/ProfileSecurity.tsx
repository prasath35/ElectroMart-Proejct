import React, { useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Button, 
  Switch, 
  FormControlLabel, 
  IconButton,
  TextField,
  Chip
} from "@mui/material";
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Trash2, 
  LogOut, 
  Smartphone, 
  Monitor,
  Plus
} from "lucide-react";
import { Address } from "../types";

interface ProfileSecurityProps {
  savedAddresses: Address[];
  onAddAddress: (newAddr: any) => void;
  onDeleteAddress?: (id: string) => void;
}

export default function ProfileSecurity({
  savedAddresses,
  onAddAddress,
  onDeleteAddress
}: ProfileSecurityProps) {
  // Multi Address Form Dialog
  const [addMode, setAddMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [addrType, setAddrType] = useState<"Home" | "Work" | "Other">("Home");

  const [tfa, setTfa] = useState(false);
  const [devices, setDevices] = useState<Array<{ id: string; name: string; active: boolean; loginTime: string }>>([
    { id: "dev-1", name: "Chrome on macOS Catalina (Current IP: 192.168.1.1)", active: true, loginTime: "2026-05-24T13:39:57Z" },
    { id: "dev-2", name: "Safari on Apple iPhone 15 Pro", active: false, loginTime: "2026-05-22T08:42:00Z" }
  ]);

  const handleToggle2FA = async (checked: boolean) => {
    setTfa(checked);
    try {
      await fetch("/api/profile/session/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFA: checked })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutOthers = async () => {
    setDevices(prev => prev.filter(d => d.active));
    try {
      await fetch("/api/profile/session/logout-others", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddr = () => {
    if (!name || !phone || !street || !city || !pincode) return;
    onAddAddress({
      name, phone, street, city, state: stateName, pincode, type: addrType
    });

    // Reset
    setName("");
    setPhone("");
    setStreet("");
    setCity("");
    setStateName("");
    setPincode("");
    setAddrType("Home");
    setAddMode(false);
  };

  return (
    <Box className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Addresses list Column */}
        <div className="md:col-span-7 space-y-4">
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <Typography variant="subtitle2" className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Shipping Addresses Directory
              </Typography>
              {!addMode && (
                <Button
                  size="small"
                  onClick={() => setAddMode(true)}
                  startIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg"
                >
                  Create Shipping Point
                </Button>
              )}
            </div>

            {/* Address additive form overlay */}
            {addMode && (
              <Paper className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5">
                <Typography className="text-xs font-bold text-slate-700">New Physical Destination Specifications</Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <TextField fullWidth size="small" label="Recipient Name" value={name} onChange={(e) => setName(e.target.value)} slotProps={{ input: { className: "text-xs rounded-xl" } }} />
                  </div>
                  <div>
                    <TextField fullWidth size="small" label="Receiver phone" value={phone} onChange={(e) => setPhone(e.target.value)} slotProps={{ input: { className: "text-xs rounded-xl" } }} />
                  </div>
                </div>
                <TextField fullWidth size="small" label="Street Details / Suite No." value={street} onChange={(e) => setStreet(e.target.value)} slotProps={{ input: { className: "text-xs rounded-xl" } }} />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <TextField fullWidth size="small" label="City" value={city} onChange={(e) => setCity(e.target.value)} slotProps={{ input: { className: "text-xs rounded-xl" } }} />
                  </div>
                  <div>
                    <TextField fullWidth size="small" label="State Code" value={stateName} onChange={(e) => setStateName(e.target.value)} slotProps={{ input: { className: "text-xs rounded-xl" } }} />
                  </div>
                  <div>
                    <TextField fullWidth size="small" label="Postal Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} slotProps={{ input: { className: "text-xs rounded-xl" } }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-2 self-center">Destination tag:</span>
                  {["Home", "Work", "Other"].map((tagStr) => (
                    <Button
                      key={tagStr}
                      size="small"
                      onClick={() => setAddrType(tagStr as any)}
                      className={`text-[9px] font-bold rounded-lg px-3 py-1 ${addrType === tagStr ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-700 border border-slate-100'}`}
                    >
                      {tagStr}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-1.5 justify-end mt-2">
                  <Button size="small" onClick={() => setAddMode(false)} className="text-slate-500 font-bold text-xs">Dismiss</Button>
                  <Button size="small" onClick={handleSaveAddr} className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 font-bold text-xs">Append Destination</Button>
                </div>
              </Paper>
            )}

            <div className="space-y-2.5">
              {savedAddresses.map((addr) => (
                <Paper key={addr.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                  <div className="space-y-0.5 leading-tight">
                    <p className="font-extrabold text-slate-800">{addr.name} — <span className="text-[10px] text-indigo-600 font-bold font-mono uppercase bg-indigo-50 px-2 py-0.5 rounded-full">{addr.type}</span></p>
                    <p className="text-slate-500">{addr.street}, {addr.city}, {addr.state} — <b>{addr.pincode}</b></p>
                    <p className="text-slate-400 font-semibold font-sans">Phone: {addr.phone}</p>
                  </div>
                  {savedAddresses.length > 1 && onDeleteAddress && (
                    <IconButton size="small" color="error" onClick={() => onDeleteAddress(addr.id)}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  )}
                </Paper>
              ))}
            </div>
          </Paper>
        </div>

        {/* Multi-Factor 2FA toggler & Devices sessions column */}
        <div className="md:col-span-5 space-y-4">
          {/* 2FA Toggler Card */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-3">
            <Typography variant="subtitle2" className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Platform 2FA Multi-Factor Authenticator
            </Typography>
            <p className="text-[11px] text-slate-500 leading-normal font-sans">
              Adds an extra tier of identity check validation on card payments by broadcasting instant OTP verification requests to registered handsets.
            </p>
            <FormControlLabel
              control={
                <Switch 
                  color="primary" 
                  checked={tfa} 
                  onChange={(e) => handleToggle2FA(e.target.checked)} 
                />
              }
              label={
                <span className="text-xs font-bold text-slate-800">
                  Enable secure OTP 2FA authorization
                </span>
              }
            />
          </Paper>

          {/* Active logins sessions listed */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <Typography variant="subtitle2" className="text-slate-800 font-extrabold text-xs uppercase tracking-wider">Device Session logs</Typography>
              {devices.length > 1 && (
                <Button 
                  size="small" 
                  onClick={handleLogoutOthers}
                  startIcon={<LogOut className="w-3.5 h-3.5" />}
                  className="text-red-500 text-[10px] font-bold hover:underline"
                >
                  Logout Others
                </Button>
              )}
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {devices.map((dev) => (
                <div key={dev.id} className="py-2.5 flex justify-between items-center">
                   <div className="flex gap-2.5 items-center">
                    {dev.name.toLowerCase().includes("iphone") ? <Smartphone className="w-4 h-4 text-slate-400" /> : <Monitor className="w-4 h-4 text-slate-400" />}
                    <div>
                      <p className="font-bold text-slate-700 leading-tight">{dev.name}</p>
                      <p className="text-[10px] text-slate-400">Created: {new Date(dev.loginTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Chip 
                    label={dev.active ? "CURRENT" : "STANDBY"} 
                    className={`h-4.5 text-[8px] font-bold ${dev.active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`} 
                  />
                </div>
              ))}
            </div>
          </Paper>
        </div>
      </div>
    </Box>
  );
}
