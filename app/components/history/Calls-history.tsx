"use client";

import { useState } from "react";
import { Phone, Clock, Calendar } from "lucide-react";

// Define the shape interfaces
interface Receiver {
  name: string;
}

interface CallLog {
  _id: string;
  receiver?: Receiver;
  createdAt: string;
  duration: number;
  status: string;
}

interface CallLogsProps {
  callLogs: CallLog[];
}

export default function CallLogs({ callLogs }: CallLogsProps) {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  if (!callLogs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Phone className="h-8 w-8 mb-3 text-gray-400" />
        <p className="text-base">No call history found</p>
      </div>
    );
  }

  const formatCallDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().substr(2);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      fullDate: `${day} ${month} ${year}, ${hours}:${minutes}`,
      formattedDate: `${day} ${month} ${year}`,
      formattedTime: `${hours}:${minutes}`
    };
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
      : `0:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {callLogs.map((log) => {
        const { formattedDate, formattedTime } = formatCallDate(log.createdAt);
        const durationFormatted = formatDuration(log.duration || 0);
        
        return (
          <div
            key={log._id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                log.status === "completed" ? "bg-green-100" : "bg-gray-100"
              }`}>
                <Phone className={`h-5 w-5 ${
                  log.status === "completed" ? "text-green-600" : "text-gray-600"
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {log.receiver?.name || "Unknown"}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="mr-3">{formattedDate}</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formattedTime}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      log.status === "completed" ? "text-green-600" : "text-gray-500"
                    }`}>
                      {log.status === "completed" ? "Completed" : "Missed"}
                    </span>
                    {log.status === "completed" && (
                      <p className="text-sm text-gray-500 mt-1">{durationFormatted}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}