"use client";

import { Schedule } from "../../../src/services/api/schedule";
import { Input } from "../../../components/ui/input";
import { useClasses } from "../../../src/contexts/ClassContext";

interface ScheduleInfoFormProps {
  data: Schedule;
  onInputChange: (field: string, value: string | number | undefined) => void;
}

export function ScheduleInfoForm({ data, onInputChange }: ScheduleInfoFormProps) {
  const { classes, loading: classesLoading } = useClasses();
  const selectedClass = classes.find((c) => c.class_id === data.class_id);

  // helper để format time về HH:mm:ss
  const formatTime = (t: string) => t.split("T")[1]?.split(".")[0] ?? t;

  return (
    <div className="space-y-4">
      {/* Lớp */}
      <div className="flex flex-col">
        <label className="text-cyan-400 font-medium mb-1">Class</label>
        {classesLoading ? (
          <p className="text-gray-400">Loading class list...</p>
        ) : (
          <div className="flex gap-2 items-center">
            <select
              aria-label="Choose class"
              className="bg-gray-700 text-white rounded-md p-2 cursor-pointer flex-1"
              value={data.class_id}
              onChange={(e) => {
                const id = Number(e.target.value);
                const cls = classes.find((c) => c.class_id === id);
                onInputChange("class_id", id);
                onInputChange("class_name", cls?.class_name);
              }}
            >
              {/* Chỉ hiển thị placeholder khi chưa có class_id */}
              {data.class_id == null && (
                <option value="" className="text-black">-- Choose class --</option>
              )}
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id} className="text-black">
                  {c.class_name}
                </option>
              ))}
            </select>
            {selectedClass && (
              <span className="text-sm text-gray-300">({selectedClass.class_name})</span>
            )}
          </div>
        )}
      </div>

      {/* Phòng */}
      <div className="flex flex-col">
        <label className="text-cyan-400 font-medium mb-1">Room</label>
        <Input
          className="bg-gray-700 text-white rounded-md p-2"
          value={data.room ?? ""}
          onChange={(e) => onInputChange("room", e.target.value)}
        />
      </div>

      {/* Schedule type */}
      <div className="flex flex-col">
        <label className="text-cyan-400 font-medium mb-1">Schedule type</label>
        <select
          aria-label="Choose schedule type"
          className="bg-gray-700 text-white rounded-md p-2"
          value={data.schedule_type}
          onChange={(e) => onInputChange("schedule_type", e.target.value)}
        >
          <option value="WEEKLY" className="text-black">WEEKLY</option>
          <option value="ONCE" className="text-black">ONCE</option>
        </select>
      </div>

      {/* Thứ hoặc Ngày */}
      {data.schedule_type === "WEEKLY" && (
        <div className="flex flex-col">
          <label className="text-cyan-400 font-medium mb-1">Day of week</label>
          <select
            aria-label="Choose day of week"
            className="bg-gray-700 text-white rounded-md p-2"
            value={data.day_of_week ?? ""}
            onChange={(e) => onInputChange("day_of_week", e.target.value)}
          >
            {["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"].map((d) => (
              <option key={d} value={d} className="text-black">{d}</option>
            ))}
          </select>
        </div>
      )}

      {data.schedule_type === "ONCE" && (
        <div className="flex flex-col">
          <label className="text-cyan-400 font-medium mb-1">Date</label>
          <Input
            type="date"
            className="bg-gray-700 text-white rounded-md p-2"
            value={data.date ?? ""}
            onChange={(e) => onInputChange("date", e.target.value)}
          />
        </div>
      )}

      {/* Time */}
      <div className="flex flex-col">
        <label className="text-cyan-400 font-medium mb-1">Start time</label>
        <Input
          type="time"
          className="bg-gray-700 text-white rounded-md p-2"
          value={formatTime(data.start_time)}
          onChange={(e) => onInputChange("start_time", e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-cyan-400 font-medium mb-1">End time</label>
        <Input
          type="time"
          className="bg-gray-700 text-white rounded-md p-2"
          value={formatTime(data.end_time)}
          onChange={(e) => onInputChange("end_time", e.target.value)}
        />
      </div>
    </div>
  );
}
