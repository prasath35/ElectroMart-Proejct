import React, { useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider, 
  Chip, 
  Step, 
  Stepper, 
  StepLabel,
  IconButton
} from "@mui/material";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckSquare, 
  Phone, 
  Clock, 
  Package, 
  Download,
  CalendarCheck
} from "lucide-react";
import { Order } from "../types";

interface DeliveryPortalProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: string, description: string) => void;
}

export default function DeliveryPortal({ orders, onUpdateOrderStatus }: DeliveryPortalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || "");
  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const stepsList = ["Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  const currentStepIndex = stepsList.indexOf(activeOrder?.status || "Placed");

  // Geographic coordinates simulation along SVG route.
  // We'll show a responsive SVG line representing the route from LA Warehouse to Malibu Point.
  const pathPoints = [
    { name: "Los Angeles Hub", lat: 34.0522, lng: -118.2437, completed: currentStepIndex >= 0 },
    { name: "Santa Monica Transit Lot", lat: 34.0194, lng: -118.4912, completed: currentStepIndex >= 2 },
    { name: "Pacific Palisades Depot", lat: 34.0450, lng: -118.5200, completed: currentStepIndex >= 3 },
    { name: "Stark Malibu Destination", lat: 34.0200, lng: -118.8000, completed: currentStepIndex >= 4 }
  ];

  // Active truck simulation point coordinate
  const getTruckPosition = () => {
    if (activeOrder?.status === "Delivered") return { x: 260, y: 110 };
    if (activeOrder?.status === "Out for Delivery") return { x: 190, y: 90 };
    if (activeOrder?.status === "Shipped") return { x: 110, y: 55 };
    if (activeOrder?.status === "Packed") return { x: 50, y: 40 };
    return { x: 30, y: 30 }; // Placed
  };

  const truckPos = getTruckPosition();

  // Print invoice helper link
  const triggerInvoiceDownload = (idStr: string) => {
    window.open(`/api/orders/${idStr}/invoice`, "_blank");
  };

  return (
    <Box className="space-y-6">
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <Typography variant="h6" className="font-extrabold flex items-center gap-2 text-base">
            <Truck className="w-5 h-5 text-indigo-400 animate-pulse" />
            Active Delivery & Logistics Tracking
          </Typography>
          <p className="text-[11px] text-slate-400 font-sans">Simulating real-time field status telemetry & delivery agent portal overrides.</p>
        </div>
        <div className="flex gap-2">
          {orders.map((ord) => (
            <Chip
              key={ord.id}
              label={`Order ID: ${ord.id}`}
              onClick={() => setSelectedOrderId(ord.id)}
              className={`cursor-pointer text-xs ${selectedOrderId === ord.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {!activeOrder ? (
        <Paper className="p-8 text-center text-slate-500 rounded-3xl">No orders currently dispatched. Fill cart and buy items first!</Paper>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Timeline & Maps visual */}
        <div className="md:col-span-7 space-y-4">
            {/* Visual Travel Tracking path MAP */}
            <Paper className="p-4 rounded-3xl border border-slate-100 bg-slate-950 text-white relative overflow-hidden shadow-md">
              <span className="absolute top-3 right-4 text-[9px] font-mono font-bold text-green-400 flex items-center gap-1 animate-pulse">
                ● GNSS LOGISTICS TELEMETRY FEED
              </span>
              <Typography variant="subtitle2" className="text-slate-400 font-mono text-xs mb-3">Live Fleet Route Visualizer (MAL-LA ROUTE 101)</Typography>

              {/* Map SVG */}
              <Box className="relative w-full h-44 bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-center">
                <svg viewBox="0 0 300 150" className="w-full h-full text-slate-700">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="100" y1="0" x2="100" y2="150" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="200" y1="0" x2="200" y2="150" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Route line path */}
                  <path 
                    d="M 30,30 L 70,50 Q 130,50 170,100 T 260,110" 
                    fill="none" 
                    stroke="#334155" 
                    strokeWidth="3" 
                  />
                  <path 
                    d="M 30,30 L 70,50 Q 130,50 170,100 T 260,110" 
                    fill="none" 
                    stroke="#4338ca" 
                    strokeWidth="3" 
                    strokeDasharray="5 5"
                    className="animate-pulse"
                  />

                  {/* Stops */}
                  <circle cx="30" cy="30" r="4.5" fill="#ef4444" />
                  <text x="35" y="25" className="text-[7px]" fill="#cbd5e1">LA Hub</text>
                  
                  <circle cx="110" cy="50" r="4.5" fill="#3b82f6" />
                  <text x="115" y="45" className="text-[7px]" fill="#cbd5e1">Transit Depot</text>

                  <circle cx="260" cy="110" r="5" fill="#22c55e" />
                  <text x="210" y="125" className="text-[7px] font-bold" fill="#22c55e">Malibu Residence</text>

                  {/* Truck movement marker */}
                  <g transform={`translate(${truckPos.x - 7}, ${truckPos.y - 7})`} className="cursor-pointer">
                    <rect width="14" height="14" rx="3" fill="#ef4444" className="shadow animate-bounce" />
                    <text x="3.5" y="10.5" fill="white" className="text-[8px] font-bold">🚛</text>
                  </g>
                </svg>
              </Box>

              <div className="flex justify-between items-center mt-3 text-caption text-[10px] text-slate-400">
                <span>Origin: LA Central Logistics Center</span>
                <span>Destination: {activeOrder.address.name}</span>
              </div>
            </Paper>

            {/* Stepper Timeline events */}
            <Paper className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-4">
              <Typography variant="subtitle2" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Milestone Chronology</Typography>
              <Stepper activeStep={currentStepIndex} orientation="vertical">
                {stepsList.map((stepLabel, i) => (
                  <Step key={i}>
                    <StepLabel>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">{stepLabel}</span>
                        {currentStepIndex === i ? (
                          <div className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full inline-block font-semibold mt-0.5">Active Level</div>
                        ) : null}
                      </div>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
        </div>

        {/* Delivery Actions & details */}
        <div className="md:col-span-5 space-y-4">
            {/* Shipment card metrics */}
            <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3 shadow-sm">
              <Typography variant="subtitle2" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Cart Contents</Typography>
              <div className="divide-y divide-slate-100">
                {activeOrder.items.map((it, i) => (
                  <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{it.product.name}</p>
                      <p className="text-slate-400 text-[10px]">Qty: {it.quantity} | Total value: ${it.product.price * it.quantity}</p>
                    </div>
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>Grand Paid Total:</span>
                <span className="font-mono text-indigo-600">${activeOrder.total}</span>
              </div>
              <Button 
                onClick={() => triggerInvoiceDownload(activeOrder.id)}
                size="small"
                fullWidth
                startIcon={<Download className="w-3.5 h-3.5" />}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold py-1.5 mt-2"
                sx={{ textTransform: 'none' }}
              >
                Print e-Invoice / Shipping Bill
              </Button>
            </Paper>

            {/* Delivery driver actions overrides */}
            <Paper className="p-4 rounded-3xl border border-indigo-100 bg-indigo-50/40 space-y-3 shadow-sm">
              <Typography variant="subtitle2" className="text-indigo-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Delivery Agent Controls (State Simulator)
              </Typography>
              <p className="text-[11px] text-indigo-800 leading-relaxed font-semibold">Change this shipment state below to see live map tracking transition!</p>
              
              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <Button 
                  size="small" 
                  onClick={() => onUpdateOrderStatus(activeOrder.id, "Packed", "Inventory packed and boxed inside Malibu Hub bins")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] rounded-lg py-1 px-2.5"
                  sx={{ textTransform: 'none' }}
                >
                  Mark Packed Box
                </Button>
                <Button 
                  size="small" 
                  onClick={() => onUpdateOrderStatus(activeOrder.id, "Shipped", "Dispatched from Transit warehouse via Delhivery Express tracker DL-8893")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] rounded-lg py-1 px-2.5"
                  sx={{ textTransform: 'none' }}
                >
                  Dispatched Shipped
                </Button>
                <Button 
                  size="small" 
                  onClick={() => onUpdateOrderStatus(activeOrder.id, "Out for Delivery", "Our dispatch courier pilot is arriving near Malibu residence")}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] rounded-lg py-1 px-2.5"
                  sx={{ textTransform: 'none' }}
                >
                  Out for Delivery
                </Button>
                <Button 
                  size="small" 
                  onClick={() => onUpdateOrderStatus(activeOrder.id, "Delivered", "Handed safely to Tony Stark under biometric confirmation")}
                  className="bg-green-600 hover:bg-green-700 text-white text-[10px] rounded-lg py-1 px-2.5"
                  sx={{ textTransform: 'none' }}
                >
                  Mark Delivered
                </Button>
              </div>

              {/* Courier service summary status card */}
              <div className="bg-white border rounded-xl p-3 flex justify-between items-center mt-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="p-1.5 bg-green-100 text-green-700 rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">Assign Pilot dispatcher:</h5>
                    <p className="text-[10px] text-slate-400">Delhivery Hub ID: DL-Santa-42</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <IconButton size="small" className="bg-slate-100 text-slate-700"><Phone className="w-3.5 h-3.5" /></IconButton>
                </div>
              </div>
            </Paper>
        </div>
      </div>
      )}
    </Box>
  );
}
