import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Timer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export const StaffAttendancePage = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchCurrentStatus();
      fetchMonthlyStats();
    }
  }, [user, selectedDate]);

  const fetchCurrentStatus = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/status/${user.id}`,
      );
      setIsCheckedIn(res.data.isCheckedIn);
      setCurrentAttendance(res.data.attendance);
    } catch (error) {
      console.error("Lỗi lấy trạng thái điểm danh:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/attendance/stats/${user.id}`,
        {
          params: {
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
          },
        },
      );
      setMonthlyStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy thống kê tháng:", error);
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/check-in",
        { userId: user.id },
      );
      setIsCheckedIn(true);
      setCurrentAttendance(res.data.data);
      toast.success("Check-in thành công!");
      fetchMonthlyStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi check-in");
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/check-out",
        { userId: user.id },
      );
      setIsCheckedIn(false);
      setCurrentAttendance(null);
      toast.success("Check-out thành công!");
      fetchMonthlyStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi check-out");
    }
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth();
  const totalHoursMonth = monthlyStats.reduce(
    (acc, curr) => acc + parseFloat(curr.total_hours || 0),
    0,
  );
  const completedDaysCount = monthlyStats.filter(
    (s) => s.total_hours >= 8,
  ).length;

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Lịch làm việc
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Quản lý thời gian và theo dõi hiệu suất công việc
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Actions & Summary */}
        <div className="space-y-8">
          {/* Check-in/Out Section */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner ${
                isCheckedIn
                  ? "bg-orange-50 text-orange-600 animate-pulse"
                  : "bg-blue-50 text-blue-600"
              }`}>
              <Clock size={40} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {isCheckedIn ? "Chào buổi làm việc!" : "Sẵn sàng làm việc?"}
            </h2>
            <p className="text-slate-400 text-sm mb-8 font-medium">
              {isCheckedIn
                ? `Bạn đã làm việc từ ${new Date(currentAttendance?.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Nhấn nút bên dưới để bắt đầu ghi nhận thời gian làm việc hôm nay."}
            </p>

            {isCheckedIn ? (
              <button
                onClick={handleCheckOut}
                className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-3xl font-black text-lg shadow-lg shadow-orange-600/30 transition-all active:scale-95 flex items-center justify-center gap-3">
                <Timer size={24} />
                Check Out
              </button>
            ) : (
              <button
                onClick={handleCheckIn}
                className="w-full py-5 bg-[#2b4c4f] hover:bg-[#1e3537] text-white rounded-3xl font-black text-lg shadow-lg shadow-[#2b4c4f]/30 transition-all active:scale-95 flex items-center justify-center gap-3">
                <MapPin size={24} />
                Check In
              </button>
            )}
          </div>

          {/* Monthly Stats Summary */}
          <div className="bg-[#2b4c4f] p-8 rounded-[2.5rem] text-white shadow-xl shadow-[#2b4c4f]/20">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp size={24} className="text-emerald-400" />
              <h3 className="font-bold uppercase tracking-widest text-xs">
                Thống kê tháng {selectedDate.getMonth() + 1}
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                  Tổng giờ làm
                </p>
                <p className="text-4xl font-black">
                  {totalHoursMonth.toFixed(1)}h
                </p>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                    Ngày hoàn thành
                  </p>
                  <p className="text-2xl font-black">
                    {completedDaysCount} ngày
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Calendar/List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Calendar Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">
                Chi tiết theo ngày
              </h3>
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                <button
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 shadow-sm">
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-sm text-slate-700 w-32 text-center uppercase tracking-widest">
                  Tháng {selectedDate.getMonth() + 1},{" "}
                  {selectedDate.getFullYear()}
                </span>
                <button
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 shadow-sm">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Attendance List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {days
                .map((date) => {
                  const dateString = date.toISOString().split("T")[0];
                  const stat = monthlyStats.find((s) => s.date === dateString);
                  const isCompleted = stat?.total_hours >= 8;
                  const isToday =
                    dateString === new Date().toISOString().split("T")[0];

                  return (
                    <div
                      key={dateString}
                      className={`p-5 rounded-3xl border transition-all flex items-center justify-between group ${
                        isCompleted
                          ? "bg-emerald-50/50 border-emerald-100"
                          : isToday
                            ? "bg-white border-blue-200 shadow-md ring-2 ring-blue-50"
                            : "bg-white border-slate-50 hover:border-slate-200"
                      }`}>
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                          }`}>
                          <span className="text-[10px] uppercase leading-none mb-1">
                            {date.toLocaleDateString("vi-VN", {
                              weekday: "short",
                            })}
                          </span>
                          <span className="text-lg leading-none">
                            {date.getDate()}
                          </span>
                        </div>

                        <div>
                          <p
                            className={`font-black text-sm ${isCompleted ? "text-emerald-900" : "text-slate-900"}`}>
                            {isCompleted
                              ? "Hoàn thành mục tiêu"
                              : stat
                                ? "Đã ghi nhận"
                                : "Chưa có dữ liệu"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {stat ? (
                              <span className="text-xs font-bold text-slate-400">
                                {stat.sessions.length} lượt điểm danh
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-300 italic">
                                Nghỉ / Không làm việc
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p
                            className={`text-xl font-black ${isCompleted ? "text-emerald-600" : stat ? "text-slate-900" : "text-slate-300"}`}>
                            {stat?.total_hours
                              ? `${stat.total_hours.toFixed(1)}h`
                              : "---"}
                          </p>
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                              <CheckCircle2 size={10} />
                              <span>Done</span>
                            </div>
                          )}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-slate-200" />
                      </div>
                    </div>
                  );
                })
                .reverse()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
